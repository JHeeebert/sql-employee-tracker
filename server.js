// impoort dependencies
const connection = require('./db/connection');
const validate = require('./db/validate');
const inquirer = require('inquirer');
const cTable = require('console.table');
const chalk = require('chalk');

// Start the app and use chalk to send welcome message
console.log(chalk.yellow.bold(`====================================`));
console.log(chalk.bold.red('Welcome to the Employee Tracker!'));
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
                    console.log(chalk.green.bold('Goodbye!' + '\n'));
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

// View all employees by department
const viewAllEmployeesByDepartment = () => {
    const info = `SELECT employee.first_name, employee.last_name, department.name AS department FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id ORDER BY employee.id ASC`;
    connection.query()(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`====================================`));
        console.log('                      ' + chalk.green.bold('All Employees By Department'));
        console.log(chalk.yellow.bold(`====================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};

// View all department via budget
const viewDepartmentBudgets = () => {
    console.log(chalk.yellow.bold(`====================================`));
    console.log('                      ' + chalk.green.bold('All Department Budgets'));
    console.log(chalk.yellow.bold(`====================================`));
    const info = 'SELECT departmen.id, AS id department.department_name AS department, SUM(salary) AS budget FROM role INNER JOIN department ON role.department_id = department.id GROUP BY role.department_id';
    connection.query()(info, (err, res) => {
        if (err) throw err;
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};

// Add employee
const addEmployee = () => {
    const infoRoles = `SELECT id, FROM role`;
    const infoManagers = `SELECT id, concat(first_name, ' ', last_name) AS name FROM employee`;

    promise.all([connection.promise().query(infoRoles), connection.promise().query(infoManagers)])
        .then(([rolesRes, managersRes]) => {
            const roles = rolesRes[0];
            const managers = managersRes[0];

            inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'What is the employee\'s first name?'
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: 'What is the employee\'s last name?'
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What is the employee\'s role?',
                    choices: roles.map((role) => { ({ name: role.title, value: role.id }) })
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: 'Who is the employee\'s manager?',
                    choices: [
                        { name: "Yes, Select Manager", value: "existing" },
                        { name: "No, Select New Manager", value: "new" },
                        { name: "No Manager", value: null },
                    ],
                },
                {
                    name: 'managerId',
                    type: 'list',
                    message: 'Select a manager for the employee',
                    choices: managers.map((manager) => { ({ name: manager.name, value: manager.id }) }),
                    when: (answers) => answers.manager === "existing",
                },
                {
                    name: newManagerFirstName,
                    type: 'input',
                    message: 'What is the manager\'s first name?',
                    when: (answers) => answers.manager === "new",
                }
            ])
                .then((answers) => {
                    const { firstName, lastName, role, manager, managerId, newManagerFirstName } = answers;
                    if (manager === "new") {
                        const info = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                        connection.query(info, [newManagerFirstName, managerLastName, role], (err, res) => {
                            if (err) throw err;
                            console.log(chalk.green.bold('Employee added successfully!'));
                            promptUser();
                        });
                    }
                    else {
                        createEmployee(firstName, lastName, role, managerId);
                    }
                })
                .catch((err) => {
                    throw err;
                });
                const createEmployee = (firstName, lastName, role, managerId) => {
                    const info = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                    connection.query(info, [firstName, lastName, role, managerId], (err, res) => {
                        if (err) throw err;
                        console.log(chalk.green.bold('Employee added successfully!'));
                        promptUser();
                    } );
                };
        })
};
// Add role

// Add department

// Update employee role

// Update employee manager

// Remove employee

// Remove role

// Remove department



// Exit
function exit() {
    console.log(chalk.green.bold('Goodbye!' + '\n'));
    process.exit();
}