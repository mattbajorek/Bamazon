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

// Allow user to choose from menu options
var start = function() {
  console.log('');
	inquirer.prompt([
	  {
	    type: 'list',
	    name: 'menu',
	    message: 'What would you like to do?',
	    choices: [
	    	'1) View Products for Sale',
	    	'2) View Low Inventory',
	    	'3) Add to Inventory',
	    	'4) Add New Product'
	    ]
	  }
	]).then(function (answers) {
	  switch(answers.menu) {
	  	case '1) View Products for Sale': viewProducts(); break;
	  	case '2) View Low Inventory': viewLowInvent(); break;
	  	case '3) Add to Inventory': addInvent(); break;
	  	case '4) Add New Product': addProducts(); break;
	  }
	});
};

// Select columns you want to show
var col = ['Item ID', 'Product Name', 'Price', 'Stock Quantity'];

// Query
var sendQuery = function(query,callback,params) {
	connection.query(query, params, function(err, res) {
    callback(res);
  });
}

// Prints the data and restarts after receiving data from query
var printStart = function(res) {
	Bamazon.printData(res,col);
  // Reshow menu
	start();
}

// Function for handling view products option
var viewProducts = function() {
	// Query for selecting all rows of certain columns
	var query = Bamazon.createQuery(col);
	sendQuery(query,printStart);
};

// Function for handling view low inventory option
var viewLowInvent = function() {
	var query = Bamazon.createQuery(col);
	query += ' WHERE StockQuantity < 5';
	sendQuery(query,printStart);
};

// Function for handling view add inventory option
var addInvent = function() {
	var inputQuantity;
	var searchID = function(answer) {
  	var query = Bamazon.createQuery(col);
		query += ' WHERE ItemID = ?';
		inputQuantity = Number(answer.quantity);
		sendQuery(query,updateQuantity,answer.id);
  };
	var updateQuantity = function(res) {
		var quantity = res[0]['Stock Quantity'] + inputQuantity;
		var query = 'UPDATE Products SET StockQuantity = ? WHERE ItemID = ?';
		var params = [quantity,res[0]['Item ID']];
		sendQuery(query,confirmed,params);
	};
	var confirmed = function(res) {
		console.log(chalk.bold.blue('\nCompleted adding additional items!'));
		// Reshow menu
		start();
	}
	// Questions that call the functions listed above
	inquirer.prompt([{
    name: "id",
    type: "input",
    message: "What is the item ID of the product you would like to add?",
    validate: Bamazon.validate
  } , {
    name: "quantity",
    type: "input",
    message: "How many would you like to add?",
    validate: Bamazon.validate
  }]).then(searchID);
};

// Function for handling add products option
var addProducts = function() {
	
};