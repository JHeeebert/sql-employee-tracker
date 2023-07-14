// impoort dependencies
const connection = require('./db/connection');
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
                    'Update Employee Role',
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
                case 'Update Employee Role':
                    updateEmployeeRole();
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
                    console.log(chalk.yellow.bold(`=============================================`));
                    console.log(chalk.green.bold('Thank you for using the Employee Tracker!'));
                    console.log(chalk.yellow.bold(`=============================================`));
                    connection.end();
                    break;
            }
        });
};
// Function to view all employees
const viewAllEmployees = () => {
    const info = 'SELECT *, employee.first_name, employee.last_name, role.title AS title, department.name AS department FROM employees INNER JOIN roles ON employee.role_id = role.id INNER JOIN departments ON roles.department_id = department.id';
    connection.query(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`====================================`));
        console.log('                       ' + chalk.green.bold('All Employees'));
        console.log(chalk.yellow.bold(`====================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};


// View all departments
const viewAllDepartments = () => {
    connection.query('SELECT * FROM departments', (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`====================================`));
        console.log('                      ' + chalk.green.bold('All Departments'));
        console.log(chalk.yellow.bold(`====================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};

// View all roles
const viewAllRoles = () => {
    const info = 'SELECT roles.id, roles.title, roles.salary, departments.name AS department FROM roles INNER JOIN departments ON roles.department_id = departments.id';
    connection.query(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`====================================`));
        console.log('                          ' + chalk.green.bold('All Roles'));
        console.log(chalk.yellow.bold(`====================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`====================================`));
        promptUser();
    });
};

// Update employee role
const updateEmployeeRole = () => {
    const infoEmployees = `SELECT id, concat(first_name, ' ', last_name) AS name FROM employees`;
    const infoRoles = `SELECT id, title FROM roles`;
    Promise.all([connection.query(infoEmployees), connection.query(infoRoles)])
        .then(([employeesRes, rolesRes]) => {
            const employees = employeesRes[0];
            const roles = rolesRes[0];
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee\'s role would you like to update?',
                    choices: employees.map((employee) => { ({ name: employee.name, value: employee.id }) })
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What is the employee\'s new role?',
                    choices: roles.map((role) => { ({ name: role.title, value: role.id }) })
                }
            ])
                .then((answers) => {
                    const { employee, role } = answers;
                    const info = `UPDATE employees SET role_id = ? WHERE id = ?`;
                    connection.query(info, [role, employee], (err, res) => {
                        if (err) throw err;
                        console.log(chalk.green.bold('Employee role updated successfully!'));
                        promptUser();
                    });
                })
                .catch((err) => {
                    throw err;
                });
        })
};

// Add employee
const addEmployee = () => {
    const infoRoles = `SELECT id, FROM roles`;
    const infoManagers = `SELECT id, concat(first_name, ' ', last_name) AS name FROM employees`;

    promise.all([connection.query(infoRoles), connection.query(infoManagers)])
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
                        const info = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
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
                const info = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                connection.query(info, [firstName, lastName, role, managerId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.green.bold('Employee added successfully!'));
                    promptUser();
                });
            };
        })
};
// Add role
const addRole = () => {
    const info = 'SELECT * FROM departments';
    connection.query(info, (err, res) => {
        if (err) throw err;
        const departments = res.map((departments) => {
            return {
                name: departments.name,
                value: departments.id
            }
        });
        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the role\'s title?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the role\'s salary?'
            },
            {
                name: 'department',
                type: 'list',
                message: 'Which department does the role belong to?',
                choices: departments
            }
        ])
            .then((answers) => {
                const { title, salary, departments } = answers;
                const info = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;
                connection.query(info, [title, salary, departments], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.green.bold('Role added successfully!'));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// Add department
const addDepartment = () => {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'What is the department\'s name?'
        }
    ])
        .then((answers) => {
            const { name } = answers;
            const info = `INSERT INTO departments (name) VALUES (?)`;
            connection.query(info, [name], (err, res) => {
                if (err) throw err;
                console.log(chalk.green.bold('Department added successfully!'));
                promptUser();
            });
        })
        .catch((err) => {
            throw err;
        });
};

// Update employee manager


// Remove employee

// Remove role

// Remove department
