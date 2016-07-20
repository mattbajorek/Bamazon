var mysql = require('mysql');
var inquirer = require('inquirer');
var accounting = require('accounting');
var chalk = require('chalk');
var Bamazon = require('./BamazonTools');

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

var max, col = ['Item ID', 'Product Name', 'Price'];

var start = function() {
  // Select all rows of columns desired and print
  var query = Bamazon.createQuery(col);
  connection.query(query, function(err, res) {
    handleQuery(res);
  });
};

var handleQuery = function(res) {
  Bamazon.printData(res,col);
  max = res[res.length - 1]['Item ID'];
  chooseItem(max);
};

var chooseItem = function(max) {
  inquirer.prompt([{
    name: "id",
    type: "input",
    message: "What is the item ID of the product you would like to buy?",
    validate: function(value) {
      if (value>=0 && value<=max && value%1 === 0 && value.indexOf(' ')<0 && value.indexOf('.')<0) {
        return true;
      } else {
        return 'Please type a whole number between 1 and ' + max + ' without a period or extra spaces';
      }
    }
  } , {
    name: "quantity",
    type: "input",
    message: "How many would you like to buy?",
    validate: Bamazon.validateQuantity
  }]).then(function(answer) {
    checkQuantity(answer);
  });
};

var checkQuantity = function(answer) {
  var query = 'SELECT StockQuantity, Price, DepartmentName FROM Products WHERE ItemID = ?';
  var params = answer.id;
  connection.query(query, params, function(err, res) {
    if (res[0].StockQuantity < answer.quantity) {
      console.log(chalk.bold.red('Insufficient quantity.  Please select a quantity equal to or below ' + res[0].StockQuantity) + '.');
      chooseItem(max);
    } else {
      var total = answer.quantity * res[0].Price;
      var newQuantity = res[0].StockQuantity-answer.quantity;
      updateQuantity(answer.id,total,newQuantity);
      queryTotal(res[0].DepartmentName,total);
    }
  });
};

var updateQuantity = function(id,total,newQuantity) {
  var query = 'UPDATE Products SET StockQuantity = ? WHERE ItemID = ?';
  var params = [newQuantity,id];
  connection.query(query, params, function(err, res) {
    console.log(chalk.bold.blue('\nTotal cost: ') + chalk.bold.yellow(accounting.formatMoney(total)));
    console.log(chalk.bold.blue('Thank you come again!'));
  });
};

var queryTotal = function(deptName,total) {
  var query = 'SELECT ProductSales FROM Departments WHERE DepartmentName = ?';
  var params = deptName;
  connection.query(query, params, function(err, res) {
    updateTotal(res,deptName,total);
  });
};

var updateTotal = function(res,deptName,total) {
  var prodSales = res[0].ProductSales + total;
  var query = 'UPDATE Departments SET ProductSales = ? WHERE DepartmentName = ?';
  var params = [prodSales,deptName];
  connection.query(query, params, function(err, res) {
    connection.end();
  });
};