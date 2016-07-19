var mysql = require('mysql');
var inquirer = require('inquirer');
var accounting = require('accounting');
var chalk = require('chalk');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root", //Your username
  password: "", //Your password
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

var max;

var start = function() {
  // Select all rows of columns desired and print
  var col = ['Item ID', 'Product Name', 'Price'];
  selectColumns(col);
};

var selectColumns = function(col) {
  var query = 'SELECT ';
  for (var i = 0; i < col.length; i++) {
    query += col[i].split(' ').join('') + ' AS "' + col[i] + '"';
    if (i !== col.length-1) {
      query += ', ';
    } else {
      query += ' ';
    }
  }
  query += 'FROM Products';
  connection.query(query, function(err, res) {
    handleQuery(res,col);
  });
};

var handleQuery = function(res,col) {
  console.log(chalk.bold.blue('\nCurrent Items on Sale\n'));
  printData(res,col);
  max = res[res.length - 1]['Item ID'];
  chooseItem(max);
};

var chooseItem = function(max) {
  inquirer.prompt([{
    name: "id",
    type: "input",
    message: "What is the item ID of the product you would like to buy?",
    validate: function(value) {
      if (value >= 0 && value <= max && value%1 === 0 && value.indexOf(' ') < 0 && value.indexOf('.') < 0) {
        return true;
      } else {
        return 'Please type a whole number between 1 and ' + max + ' without a period or extra spaces';
      }
    }
  } , {
    name: "quantity",
    type: "input",
    message: "How many would you like to buy?",
    validate: function(value) {
      if (value > 0 && value%1 === 0 && value.indexOf(' ') < 0 && value.indexOf('.') < 0) {
        return true;
      } else {
        return 'Please type a whole number greater than 0 without a period or extra spaces';
      }
    }
  }]).then(function(answer) {
    checkQuantity(answer);
  })
};

var checkQuantity = function(answer) {
  connection.query('SELECT StockQuantity, Price FROM Products WHERE ItemID = ?', answer.id, function(err, res) {
    if (res[0].StockQuantity < answer.quantity) {
      console.log(chalk.bold.red('Insufficient quantity.  Please select a quantity equal to or below ' + res[0].StockQuantity) + '.');
      chooseItem(max);
    } else {
      var total = answer.quantity * res[0].Price;
      var newQuantity = res[0].StockQuantity-answer.quantity;
      updateQuantity(answer.id,total,newQuantity);
    }
  });
};

var updateQuantity = function(id,total,newQuantity) {
  connection.query('UPDATE Products SET StockQuantity = ? WHERE ItemID = ?', [newQuantity,id], function(err, results) {
    console.log(chalk.bold.blue('Total cost: ') + chalk.bold.yellow(accounting.formatMoney(total)));
    console.log(chalk.bold.blue('Thank you come again!')); 
  });
};

var printData = function(res, col) {
  // Get length of column header
  var colLengths = [];
  for (var h = 0; h < col.length; h++) {
    colLengths.push(col[h].split('').length);
  }
  // Loop through each row
  for (var i = 0; i < res.length; i++) {
    // Loop through each column
    for (var j = 0; j < col.length; j++) {
      var length;
      // Check to see if datatype is number, if so turn to string
      if (typeof res[i][col[j]] === 'number') {
        // If price, add $
        if (col[j] === 'Price') res[i][col[j]] = '$'.concat(res[i][col[j]]);
        length = res[i][col[j]].toString().split('').length;
      } else {
        length = res[i][col[j]].split('').length;
      }
      // Find the longest string length
      if (colLengths[j] < length) colLengths[j] = length;
    }
  }
  // Loop through each row
  for (var k = 0; k < res.length; k++) {
    var header = '| ';
    var divider = '+';
    var row = '| ';
    // Loop through each column
    for (var l = 0; l < col.length; l++) {
      var spacerHeader = '';
      var spacer = '';
      for (var m = 0; m < colLengths[l]; m++) {
        // Add beginning dashed space
        if (m === 0) divider += '-';
        // Fill in divider
        divider += '-';
        // Check to see if datatype is number, if so turn to string
        var length;
        if (typeof res[k][col[l]] === 'number') {
          length = res[k][col[l]].toString().split('').length;
        } else {
          length = res[k][col[l]].split('').length;
        }
        // Fill in spaces
        if (m >= col[l].split('').length && k === 0) spacerHeader += ' ';
        if (m >= length) spacer += ' ';
        // Add ending corner
        if (m === colLengths[l] - 1) divider += '-+';
      }
      if (k === 0) {
        // Add header
        header += chalk.bold.cyan(col[l]);
        // Add header spacing, end and beginning of new one
        header += spacerHeader + ' | ';
      }
      // Add row
      row += chalk.yellow(res[k][col[l]]);
      // Add row spacing, end and beginning of new one
      row += spacer + ' | ';
    }
    // Add header
    if (k === 0) {
      console.log(divider);
      console.log(header);
      console.log(divider);
    }
    // Add rows
    console.log(row);
    console.log(divider);
  }
  console.log('');
};