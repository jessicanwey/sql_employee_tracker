const express = require("express");
const mysql = require("mysql2");
const inquirer = require("inquirer");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // TODO: Add MySQL password here
    password: "",
    database: "staff_db",
  },
  console.log(`Connected to the staff_db database.`)
);

//This prompts the user to find out what action they want to take on the staff database
function promptUser() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "action",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee Role",
          "Quit",
        ],
      },
    ])
    .then((response) => {
      console.log(response.action);

      switch (response.action) {
        case "View All Departments":
          viewAllDepartments();
          break;
        case "View All Roles":
          viewAllRoles();
          break;
        case "View All Employees":
          viewAllEmployees();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Update an Employee Role":
          updateEmployee();
          break;
        case "Quit":
          quitTracker();
          break;
      }
    });
}

//Initializes the prompts
promptUser();

//This function gets all of the departments
function viewAllDepartments() {
  db.query(
    "SELECT id AS ID, name AS Department FROM departments;",
    function (err, results) {
      if(err) throw err;
      console.log("\n");
      console.log(results);
      console.table(results);
      promptUser();
    }
  );
}

//This function gets all of the roles
function viewAllRoles() {
  const viewRolesSQL = `SELECT roles.id as ID, 
     roles.title as Title, 
     departments.name AS Department, 
     roles.salary AS Salary 
     FROM roles 
     JOIN departments 
     ON roles.department_id = departments.id;`;
  db.query(viewRolesSQL, function (err, results) {
    if(err) throw err;
    console.log("\n");
    console.table(results);
    promptUser();
  });
}

//This function gets all the employees
function viewAllEmployees() {
  db.query(
    `SELECT employees.id AS ID, 
     employees.first_name AS FirstName, 
     employees.last_name AS LastName, 
     roles.title AS Title, 
     departments.name AS Department, 
     roles.salary AS Salary 
     FROM employees 
     JOIN roles 
     ON employees.role_id = roles.id 
     JOIN departments 
     ON roles.department_id = departments.id;`,
    function (err, results) {
      if(err) throw err;
      console.log("\n");
      console.table(results);
      promptUser();
    }
  );
}

//This function allows the user to enter a new department and adds it to the database
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "What is the name of the new department?",
      name: "deptName",
    })
    .then(function (response) {
      db.query(
        "INSERT INTO departments (name) VALUES (?);",
        [response.deptName],
        function (err, results) {
          if(err) throw err;
          console.log("Added " + response.deptName + " to the database");
          promptUser();
        }
      );
    });
}

//This function allows the user to input a new role, input a salary for that role and select a department to assign the role too
function addRole() {
  const deptChoices = [];

  //This gets all of the departments from the database and populates and array with the values and IDs 
  //This array is later used for the choices in the list that is prompted to the user
  db.query("SELECT * FROM departments;", function (err, results) {
    if(err) throw err;
    results.forEach((dept) => {
      let deptChoice = {
        name: dept.name,
        value: dept.id,
      };
      deptChoices.push(deptChoice);
    });

    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the title of the new role?",
          name: "roleTitle",
        },
        {
          type: "input",
          message: "What is the salary for this role?",
          name: "salary",
        },
        {
          type: "list",
          message: "What department does this role belong to?",
          name: "department",
          choices: deptChoices,
        },
      ])
      .then(function (response) {
        console.log("who knows " + response.department);
        db.query(
          `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?);`,
          [response.roleTitle, response.salary, response.department],
          function (err, results) {
            console.log("Added " + response.roleTitle + " to the database");
            promptUser();
          }
        );
      });
  });
}

//This function lets the user add a new employee. They can input a first name and last name. 
//They are presented with a list of roles and managers as well to assign to the new employee.
function addEmployee() {
  const roleChoices = [];
  const managerChoices = [{name: 'None', value: 0}];

  //This gets all of the roles from the database and populates and array with the values and IDs 
  //This array is later used for the choices in the list that is prompted to the user
  db.query("SELECT * FROM roles;", function (err, results) {
    if(err) throw err;
    results.forEach(({ title, id }) => {
      let roleChoice = {
        name: title,
        value: id,
      };
      roleChoices.push(roleChoice);
    });

    //This gets all of the employees from the database and populates and array with the values and IDs 
    //This array is later used for the choices in the list of manager options that is prompted to the user
    db.query("SELECT * FROM employees;", function (err, results) {
      if(err) throw err;
      results.forEach(({ first_name, last_name, id }) => {
        let managerChoice = {
          name: first_name + " " + last_name,
          value: id,
        };
        managerChoices.push(managerChoice);
      });

      inquirer
        .prompt([
          {
            type: "input",
            message: "What is the first name of the new employee?",
            name: "empFirstName",
          },
          {
            type: "input",
            message: "What is the last name of the new employee?",
            name: "empLastName",
          },
          {
            type: "list",
            message: "What is title does this employee have?",
            name: "role",
            choices: roleChoices,
          },
          {
            type: "list",
            message:
              "Who is the manager for this employee? Choose 'None' if there is no manager.",
            name: "managerID",
            choices: managerChoices,
          },
        ])
        .then(function (response) {
          db.query(
            "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);",
            [
              response.empFirstName,
              response.empLastName,
              response.role,
              response.managerID,
            ],
            function (err, results) {
              if(err) throw err;
              console.log("Added " + response.empFirstName + " " + response.empLastName + " to the database");
              promptUser();
            }
          );
        });
    });
  });
}

//This function lets the user update an employee role. They can choose an employee from a list of employees. 
//They are then presented with a list of roles to select a new role for that employee.
function updateEmployee() {
  const roleChoices = [];
  const employeeChoices = [];

  //This gets all of the employees from the database and populates and array with the values and IDs 
  //This array is later used for the choices in the list of employees that is prompted to the user to update
  db.query("SELECT * FROM employees;", function (err, results) {
    if(err) throw err;
    results.forEach(({ first_name, last_name, id }) => {
      let employeeChoice = {
        name: first_name + " " + last_name,
        value: id,
      };
      employeeChoices.push(employeeChoice);
    });

    //This gets all of the roles from the database and populates and array with the values and IDs 
    //This array is later used for the choices in the list that is prompted to the user
    db.query("SELECT * FROM roles;", function (err, results) {
      if(err) throw err;
      results.forEach(({ title, id }) => {
        let roleChoice = {
          name: title,
          value: id,
        };
        roleChoices.push(roleChoice);
      });

      inquirer
        .prompt([
          {
            type: "list",
            message: "Which employee's role do you want to update?",
            name: "name",
            choices: employeeChoices,
          },
          {
            type: "list",
            message: "Which role do you want to assign the selected employee?",
            name: "title",
            choices: roleChoices,
          },
        ])
        .then(function (response) {
          db.query(
            "UPDATE employees SET role_id = ? WHERE id = ?;",
            [response.title, response.name],
            function (err, results) {
              if(err) throw err;
              console.log("Updated " + response.empFirstName + " " + response.empLastName + " in the database");
              promptUser();
            }
          );
        });
    });
  });
}

function quitTracker() {
  db.end();
  process.exit();
}
