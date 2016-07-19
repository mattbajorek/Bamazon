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

var col = ['Item ID', 'Product Name', 'Price'];

var handleQuery = function(res) {
  Bamazon.printData(res,col);
};

var viewProducts = function() {
	Bamazon.selectColumns(col,handleQuery);
};

var viewLowInvent = function() {

};

var addInvent = function() {

};

var addProducts = function() {

};

var start = function() {
  // Allow user to choose from menu options
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