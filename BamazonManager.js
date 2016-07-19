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
  var menu = [
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
	];
	inquirer.prompt(menu).then(function (answers) {
	  switch(answers.menu) {
	  	case '1) View Products for Sale': viewProducts(); break;
	  	case '2) View Low Inventory': viewLowInvent(); break;
	  	case '3) Add to Inventory': addInvent(); break;
	  	case '4) Add New Product': addProducts(); break;
	  }
	});
};

// Select columns you want to show
var col = ['Item ID', 'Product Name', 'Price', 'StockQuantity'];

// Query
var sendQuery = function(query) {
	connection.query(query, function(err, res) {
    Bamazon.printData(res,col);
    // Reshow menu
		start();
  });
}

// Function for handling view products option
var viewProducts = function() {
	// Query for selecting all rows of certain columns
	var query = Bamazon.createQuery(col);
	sendQuery(query);
};

// Function for handling view low inventory option
var viewLowInvent = function() {
	var query = Bamazon.createQuery(col);
	query += ' WHERE StockQuantity < 5';
	sendQuery(query);
};

// Function for handling view add inventory option
var addInvent = function() {

};

// Function for handling add products option
var addProducts = function() {

};