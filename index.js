const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // TODO: Add MySQL password here
    password: 'R@ckyDude1',
    database: 'staff_db'
  },
  console.log(`Connected to the staff_db database.`)
);

const promptUser = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'action',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role'
            ]
        },
    ])
    .then((response) => {
        console.log(response.action);
        //viewAllDepartments();
        viewAllRoles();
        //viewAllEmployees();
        //addDepartment();
        //addRole();
        //addEmployee();
        //updateEmployee();
    });
}

promptUser();

const viewAllDepartments = () => {
    db.query('SELECT id AS ID, name AS Department FROM departments;', function (err, results){
        console.log(err);
        console.table(results);
        promptUser();
    })
}

const viewAllRoles = () => {
    const viewRolesSQL = 'SELECT roles.id as ID, roles.title as Title, departments.name AS Department, roles.salary AS Salary FROM roles JOIN departments ON roles.department_id = departments.id;'
    db.query(viewRolesSQL, function (err, results){
        console.table(results);
        promptUser();
    })
}

const viewAllEmployees = () => {
    db.query('SELECT * FROM employees', function (err, results){
        console.table(results);
        promptUser();
    })
}

const addDepartment = () => {
    
}

const addRole = () => {

}

const addEmployee = () => {

}

const updateEmployee = () => {

}