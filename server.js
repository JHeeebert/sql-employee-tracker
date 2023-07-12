// impoort dependencies
const connection = require('./connect/connection');
const validate = require('./js/validate');
const inquirer = require('inquirer');
const cTable = require('console.table');
const chalk = require('chalk');
const e = require('express');

// Start the app and use chalk to send welcome message
console.log(chalk.yellow.bold(`====================================`));
console.log(chalk.blue.bold('Welcome to the Employee Tracker!'));
console.log(chalk.yellow.bold(`====================================`));
connection.connect((err) => {
    if (err) throw err;
    promptUser();
});

// Prompt user for what they want to do
const promptUser = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: [
                    'View All Employees',
                    'View All Roles',
                    'View All Departments',
                    'View All Employees By Department',
                    'View Department Budgets',
                    'Update Employee Role',
                    'Update Employee Manager',
                    'Add Employee',
                    'Add Role',
                    'Add Department',
                    'Remove Employee',
                    'Remove Role',
                    'Remove Department',
                    'Exit'
                ]
            }
        ])
        // Use switch statement to call functions based on user choice
        .then((answer) => {
            switch (answer.choice) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;
                case 'View All Roles':
                    viewAllRoles();
                    break;
                case 'View All Departments':
                    viewAllDepartments();
                    break;
                case 'View All Employees By Department':
                    viewAllEmployeesByDepartment();
                    break;
                case 'View Department Budgets':
                    viewDepartmentBudgets();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRole();
                    break;
                case 'Update Employee Manager':
                    updateEmployeeManager();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Remove Employee':
                    removeEmployee();
                    break;
                case 'Remove Role':
                    removeRole();
                    break;
                case 'Remove Department':
                    removeDepartment();
                    break;
                case 'Exit':
                    connection.end();
                    break;
            }
        });
};

// View all employees
const viewAllEmployees = () => {
    let info = `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS department, 
    role.salary, 
FROM employee, role, department
WHERE department.id = role.department_id
AND role.id = employee.role_id
ORDER BY employee.id ASC`;
    connection.promise().query(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`====================================`));
        console.log('                       ' + chalk.green.bold('All Employees'));
        console.log(chalk.yellow.bold(`====================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};

// View all roles
const viewAllRoles = () => {
    console.log(chalk.yellow.bold(`====================================`));
    console.log('                       ' + chalk.green.bold('All Roles'));
    console.log(chalk.yellow.bold(`====================================`));
    const info = `SELECT role.id, role.title, department.department_name AS department FROM role INNER JOIN department ON role.department_id = department.id ORDER BY role.id ASC`;
    connection.promise().query(info, (err, res) => {
        if (err) throw err;
        res.forEach(role => {
            console.log(role.id + " | " + role.title + " | " + role.department);
            console.log(chalk.yellow.bold(`====================================`));
            promptUser();
        });
    });
};

// View all departments
const viewAllDepartments = () => {
    const info = `SELECT department.id, department.department_name AS department FROM department ORDER BY department.id ASC`;
    connection.promise().query(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`====================================`));
        console.log('                       ' + chalk.green.bold('All Departments'));
        console.log(chalk.yellow.bold(`====================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};
