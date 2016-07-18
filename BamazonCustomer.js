var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root", //Your username
  password: "", //Your password
  database: "bamazon"
})

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  //start();
})

var start = function() {
  inquirer.prompt({
    name: "postOrBid",
    type: "rawlist",
    message: "Would you like to [POST] an auction or [BID] on an auction?",
    choices: ["POST", "BID"]
  }).then(function(answer) {
    if (answer.postOrBid.toUpperCase() == "POST") {
      postAuction();
    } else {
      bidAuction();
    }
  })
}

var postAuction = function() {
  inquirer.prompt([{
    name: "item",
    type: "input",
    message: "What is the item you would like to submit?"
  }, {
    name: "category",
    type: "input",
    message: "What category would you like to place your auction in?"
  }, {
    name: "startingBid",
    type: "input",
    message: "What would you like your starting bid to be?",
    validate: function(value) {
      if (isNaN(value) == false) {
        return true;
      } else {
        return false;
      }
    }
  }]).then(function(answer) {
    connection.query("INSERT INTO auctions SET ?", {
      itemname: answer.item,
      category: answer.category,
      startingbid: answer.startingBid,
      highestbid: answer.startingBid
    }, function(err, res) {
      console.log("Your auction was created successfully!");
      start();
    });
  })
}

var bidAuction = function() {
  connection.query('SELECT * FROM Products', function(err, res) {
    printData(res);
    /*inquirer.prompt({
      name: "choice",
      type: "rawlist",
      choices: function(value) {
        var choiceArray = [];
        for (var i = 0; i < res.length; i++) {
          choiceArray.push(res[i].itemname);
        }
        return choiceArray;
      },
      message: "What auction would you like to place a bid in?"
    }).then(function(answer) {
      for (var i = 0; i < res.length; i++) {
        if (res[i].itemname == answer.choice) {
          var chosenItem = res[i];
          inquirer.prompt({
            name: "bid",
            type: "input",
            message: "How much would you like to bid?"
          }).then(function(answer) {
            if (chosenItem.highestbid < parseInt(answer.bid)) {
              connection.query("UPDATE auctions SET ? WHERE ?", [{
                highestbid: answer.bid
              }, {
                id: chosenItem.id
              }], function(err, res) {
                console.log("Bid placed successfully!");
                start();
              });
            } else {
              console.log("Your bid was too low. Try again...");
              start();
            }
          })
        }
      }
    })*/
  })
}

var printData = function(res) {
  var colHeader = ['Item ID','Product Name','Department Name','Price','Stock Quantity'];
  var col = ['ItemID','ProductName','DepartmentName','Price','StockQuantity'];
  // Get length of column header
  var colLengths = [];
  for (var h = 0; h < colHeader.length; h++) {
    colLengths.push(colHeader[h].split('').length);
  }
  // Loop through each row
  for (var i = 0; i < res.length; i++) {
    // Loop through each column
    for (var j = 0; j < col.length; j++) {
      var length;
      // Check to see if datatype is number, if so turn to string
      if (typeof res[i][col[j]] === 'number') {
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
    for (var l = 0; l < colHeader.length; l++) {
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
        if (m >= colHeader[l].split('').length && k === 0) spacerHeader += ' ';
        if (m >= length) spacer += ' ';
        // Add ending corner
        if (m === colLengths[l]-1) divider += '-+';
      }
      if (k === 0) {
        // Add header
        header += colHeader[l];
        // Add header spacing, end and beginning of new one
        header += spacerHeader + ' | ';
      }
      // Add row
      row += res[k][col[l]];
      // Add row spacing, end and beginning of new one
      row += spacer + ' | ';
    }
    // Add header
    if (k===0) {
      console.log(divider);
      console.log(header);
      console.log(divider);
    }
    // Add rows
    console.log(row);
    console.log(divider);
  }
}

bidAuction();
//start();