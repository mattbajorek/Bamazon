CREATE DATABASE Bamazon;
USE Bamazon;

CREATE TABLE Products (
	ItemID INT(10) UNSIGNED AUTO_INCREMENT NOT NULL,
    ProductName VARCHAR(255) NOT NULL,
    DepartmentName VARCHAR(255) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    StockQuantity SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY(ItemID)
);
INSERT INTO Products 
	(ProductName,DepartmentName,Price,StockQuantity)
VALUES
	('iPhone 6S','Cell Phones',399.99,1000),
    ('Galaxy S7','Cell Phones',499.99,5000),
    ('Cargo Shorts','Clothing',29.99,200),
    ('Bandana','Clothing',9.99,300),
    ('Samsung Washing Machine','Appliances',699.99,50),
    ('Wirlwind Dish Washer','Appliances',599.99,20),
    ('Acoustic Guitar','Instruments',199.99,10),
    ('Electric Violin','Instruments',199.99,12),
    ('XBOX One','Electronics',399.99,10000),
    ('Playstation 4','Electronics',399.99,20000);
    
CREATE TABLE Departments (
	DepartmentID INT(10) UNSIGNED AUTO_INCREMENT NOT NULL,
    DepartmentName VARCHAR(255) NOT NULL,
    OverheadCosts DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    ProductSales DECIMAL(10,2) DEFAULT 0.00,
    PRIMARY KEY(DepartmentID)
);
INSERT INTO Departments 
	(DepartmentName,OverHeadCosts)
VALUES
	('Cell Phones',1000),
    ('Clothing',200),
    ('Appliances',50),
    ('Instruments',10),
    ('Electronics',100);