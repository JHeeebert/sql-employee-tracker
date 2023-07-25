// impoort dependencies
const connection = require('./db/connection');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
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
                    'View Employees By Manager',
                    'View Employees By Department',
                    'View Combined Salaries By Department',
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
                case 'View Employees By Manager':
                    viewEmployeesByManager();
                    break;
                case 'View Employees By Department':
                    viewEmployeesByDepartment();
                    break;
                case 'View Combined Salaries By Department':
                    viewCombinedSalariesByDepartment();
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
                    console.log(chalk.yellow.bold(`=================================================================================`));
                    console.log(chalk.green.bold('                    Thank you for using the Employee Tracker!'));
                    console.log(chalk.yellow.bold(`=================================================================================`));
                    connection.end();
                    break;
            }
        });
};
// Function to view all employees
const viewAllEmployees = () => {
    const info = `
    SELECT
    e.id AS id,
    e.first_name,
    e.last_name,
    r.title AS title,
    d.name AS department,
    r.salary,
    CONCAT(m.first_name, m.last_name) AS manager
    FROM employee AS e
    INNER JOIN role AS r ON e.role_id = r.id
    INNER JOIN department AS d ON r.department_id = d.id
    LEFT JOIN employee AS m ON e.manager_id = m.id
`;
    connection.query(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`=====================================================================`));
        console.log('                       ' + chalk.green.bold('All Employees'));
        console.log(chalk.yellow.bold(`=====================================================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`=====================================================================`));
        promptUser();
    });
};
// View all departments
const viewAllDepartments = () => {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`=====================================================================`));
        console.log('                      ' + chalk.green.bold('All Departments'));
        console.log(chalk.yellow.bold(`=====================================================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`=====================================================================`));
        promptUser();
    });
};
// View all roles
const viewAllRoles = () => {
    const info = `
    SELECT r.id AS id, r.title, d.name AS department, r.salary 
    FROM role AS r
    INNER JOIN department AS d ON r.department_id = d.id
  `;
    connection.query(info, (err, res) => {
        if (err) throw err;
        console.log(chalk.yellow.bold(`=====================================================================`));
        console.log('                          ' + chalk.green.bold('All Roles'));
        console.log(chalk.yellow.bold(`=====================================================================`));
        console.table(res);
        console.log(chalk.yellow.bold(`=====================================================================`));
        promptUser();
    });
};
// View employees by manager
const viewEmployeesByManager = () => {
    const info = `
    SELECT DISTINCT CONCAT(m.first_name, ' ', m.last_name) AS manager_name, m.id AS manager_id
    FROM employee AS e
    LEFT JOIN employee AS m ON e.manager_id = m.id
    WHERE m.id IS NOT NULL
  `;
    connection.query(info, (err, employees) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'manager',
                type: 'list',
                message: 'Which manager\'s employees would you like to view?',
                choices: employees.map((employee) => ({ name: employee.manager_name, value: employee.id }))
            }
        ])
            .then((answers) => {
                const { managerId } = answers;
                const info = `
                SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                FROM employee AS e
                INNER JOIN role AS r ON e.role_id = r.id
                INNER JOIN department AS d ON r.department_id = d.id
                LEFT JOIN employee AS m ON e.manager_id = m.id
                WHERE e.manager_id = ?
                `;
                connection.query(info, [managerId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.log('                     ' + chalk.green.bold('Employees By Manager'));
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.table(res);
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// View employees by department
const viewEmployeesByDepartment = () => {
    const info = `
    SELECT d.id, d.name
    FROM department AS d
    `;
    connection.query(info, (err, departments) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'department',
                type: 'list',
                message: 'Which department\'s employees would you like to view?',
                choices: departments.map((department) => ({ name: department.name, value: department.id }))
            }
        ])
            .then((answers) => {
                const { departmentId } = answers;
                const info = `
                SELECT
                e.id AS id,
                e.first_name,
                e.last_name,
                r.title AS title,
                d.name AS department,
                r.salary,
                CONCAT(m.first_name, ' ', m.last_name) AS manager
                FROM employee AS e
                INNER JOIN role AS r ON e.role_id = r.id
                INNER JOIN department AS d ON r.department_id = d.id
                LEFT JOIN employee AS m ON e.manager_id = m.id
                WHERE d.id = ?
            `;
                connection.query(info, [departmentId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.log('                    ' + chalk.green.bold('Employees By Department'));
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.table(res);
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// View combined salaries by department
const viewCombinedSalariesByDepartment = () => {
    const departmentInfo = `
    SELECT d.id, d.name FROM department AS d
    `;
    connection.query(departmentInfo, (err, departments) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'department',
                type: 'list',
                message: 'Which department\'s combined salaries would you like to view?',
                choices: departments.map((department) => ({ name: department.name, value: department.id }))
            }
        ])
            .then((answers) => {
                const { departmentId } = answers;
                const info = `
                SELECT d.name AS department, SUM(r.salary) AS combined_salaries
                FROM employee AS e
                INNER JOIN role AS r ON e.role_id = r.id
                INNER JOIN department AS d ON r.department_id = d.id
                WHERE d.id = ?
                `;
                connection.query(info, [departmentId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.log('                  ' + chalk.green.bold('Combined Salaries By Department'));
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.table(res);
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// Update employee role
const updateEmployeeRole = () => {
    // Return an array of employee names and roles
    const infoEmployee = `
    SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, r.title AS role
    FROM employee AS e
    INNER JOIN role AS r ON e.role_id = r.id
`;
    connection.query(infoEmployee, (err, employee) => {
        if (err) throw err;
        // Return an array of role titles
        const infoRole = `SELECT id, title FROM role`;
        connection.query(infoRole, (err, role) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee\'s role would you like to update?',
                    choices: employee.map((employee) => ({ name: employee.employee_name, value: employee.id }))
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What is the employee\'s new role?',
                    choices: role.map((role) => ({ name: role.title, value: role.id }))
                }
            ])
                .then((answers) => {
                    const { employeeId, roleId } = answers;
                    const info = `UPDATE employee SET role_id = ? WHERE id = ?`;
                    connection.query(info, [roleId, employeeId], (err, res) => {
                        if (err) throw err;
                        console.log(chalk.green.bold('Employee role updated successfully!'));
                        promptUser();
                    });
                })
                .catch((err) => {
                    throw err;
                });
        })
    })
};

// Add employee
const addEmployee = () => {
    const infoRole = "SELECT id, title FROM role";
    connection.query(infoRole, (err, roles) => {
        if (err) throw err;
        const infoManager = `SELECT id, concat(first_name, ' ', last_name) AS name FROM employee`;
        connection.query(infoManager, (err, managers) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'What is the employee\'s first name?',
                    validate: (input) => {
                        if (input.trim() === '') {
                            return 'Please enter a valid first name';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is the employee\'s last name?',
                    validate: (input) => {
                        if (input.trim() === '') {
                            return 'Please enter a valid last name';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'roleId',
                    message: 'What is the employee\'s role?',
                    choices: roles.map((role) => ({
                        name: role.title,
                        value: role.id
                    }))
                },
                {
                    type: 'list',
                    name: 'managerId',
                    message: 'Who is the employee\'s manager?',
                    choices: managers.map((manager) => ({
                        name: manager.name,
                        value: manager.id
                    }))
                }
            ])
                .then((answers) => {
                    const { firstName, lastName, roleId, managerId } = answers;
                    const info = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                    connection.query(info, [firstName, lastName, roleId, managerId], (err, res) => {
                        if (err) throw err;
                        console.log(chalk.yellow.bold(`=====================================================================`));
                        console.log(chalk.green.bold('Employee added successfully!'));
                        console.log(chalk.yellow.bold(`=====================================================================`));
                        promptUser();
                    });
                })
                .catch((err) => {
                    throw err;
                });
        });
    });
};
// Add role
const addRole = () => {
    const info = 'SELECT id, name FROM department';
    connection.query(info, (err, departments) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What is the role\'s title?',
                validate: (input) => {
                    if (input.trim() === '') {
                        return 'Please enter a valid title';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the role\'s salary?',
                validate: (input) => {
                    if (isNaN(input)) {
                        return 'Please enter a valid salary';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department does the role belong to?',
                choices: departments.map((department) => ({
                    name: department.name,
                    value: department.id
                }))
            },
        ])
            .then((answers) => {
                const { title, salary, departmentId } = answers;
                const info = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                connection.query(info, [title, salary, departmentId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.yellow.bold(`=====================================================================`));
                    console.log(chalk.green.bold('Role added successfully!'));
                    console.log(chalk.yellow.bold(`=====================================================================`));
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
            const info = `INSERT INTO department (name) VALUES (?)`;
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
const updateEmployeeManager = () => {
    // Return an array of employee names and managers
    const infoEmployee = `
    SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee AS e
    LEFT JOIN employee AS m ON e.manager_id = m.id
    `;
    connection.query(infoEmployee, (err, employee) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Which employee\'s manager would you like to update?',
                choices: employee.map((employee) => ({ name: employee.employee_name, value: employee.id }))
            },
            {
                name: 'manager',
                type: 'list',
                message: 'Who is the employee\'s new manager?',
                choices: employee.map((employee) => ({ name: employee.manager_name, value: employee.id }))
            }
        ])
            .then((answers) => {
                const { employeeId, managerId } = answers;
                const info = `UPDATE employee SET manager_id = ? WHERE id = ?`;
                connection.query(info, [managerId, employeeId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.green.bold('Employee manager updated successfully!'));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// Remove employee
const removeEmployee = () => {
    const info = `
    SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
    FROM employee AS e
`;
    connection.query(info, (err, employees) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee would you like to remove?',
                choices: employees.map((employee) => ({
                    name: employee.employee_name,
                    value: employee.employee_id
                }))
            },
        ])
            .then((answers) => {
                const { employeeId } = answers;
                const info = `DELETE FROM employee WHERE id = ?`;
                connection.query(info, [employeeId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.red.bold(`=====================================================================`));
                    console.log(chalk.green.bold('                   Employee removed successfully!'));
                    console.log(chalk.red.bold(`=====================================================================`));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// Remove role
const removeRole = () => {
    const info = `SELECT id, title FROM role`;
    connection.query(info, (err, roles) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Which role would you like to remove?',
                choices: roles.map((role) => ({
                    name: role.title,
                    value: role.id
                }))
            },
        ])
            .then((answers) => {
                const { roleId } = answers;
                const info = `DELETE FROM role WHERE id = ?`;
                connection.query(info, [roleId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.red.bold(`=====================================================================`));
                    console.log(chalk.green.bold('                       Role removed successfully!'));
                    console.log(chalk.red.bold(`=====================================================================`));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
};
// Remove department
const removeDepartment = () => {
    const info = `SELECT id, name FROM department`;
    connection.query(info, (err, departments) => {
        if (err) throw err;
        inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department would you like to remove?',
                choices: departments.map((department) => ({
                    name: department.name,
                    value: department.id
                }))
            },
        ])
            .then((answers) => {
                const { departmentId } = answers;
                const info = `DELETE FROM department WHERE id = ?`;
                connection.query(info, [departmentId], (err, res) => {
                    if (err) throw err;
                    console.log(chalk.red.bold(`=====================================================================`));
                    console.log(chalk.green.bold('                  Department removed successfully!'));
                    console.log(chalk.red.bold(`=====================================================================`));
                    promptUser();
                });
            })
            .catch((err) => {
                throw err;
            });
    });
}
