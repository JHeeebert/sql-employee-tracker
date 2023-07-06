const connection = require('./db/connection')
const inquirer = require('inquirer')
const chalk = require('chalk')
const figlet = require('figlet')
const validate = require('./db/validate')

connection.connect((err) => {
    if (err) throw err
    console.log(chalk.green(figlet.textSync('Employee Tracker', { horizontalLayout: 'full' })))
    console.log(chalk.green('Connected to the database.'))
    mainMenu()
}
)

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'mainMenu',
            message: 'What would you like to do?',
            choices: ['View all employees', 'View all employees by department', 'View all employees by manager', 'Add employee', 'Remove employee', 'Update employee role', 'Update employee manager', 'View all roles', 'Add role', 'Remove role', 'View all departments', 'Add department', 'Remove department', 'Exit']
        }
    ]).then((answer) => {
        switch (answer.mainMenu) {
            case 'View all employees':
                viewAllEmployees()
                break
            case 'View all employees by department':
                viewAllEmployeesByDepartment()
                break
            case 'View all employees by manager':
                viewAllEmployeesByManager()
                break
            case 'Add employee':
                addEmployee()
                break
            case 'Remove employee':
                removeEmployee()
                break
            case 'Update employee role':
                updateEmployeeRole()
                break
            case 'Update employee manager':
                updateEmployeeManager()
                break
            case 'View all roles':
                viewAllRoles()
                break
            case 'Add role':
                addRole()
                break
            case 'Remove role':
                removeRole()
                break
            case 'View all departments':
                viewAllDepartments()
                break
            case 'Add department':
                addDepartment()
                break
            case 'Remove department':
                removeDepartment()
                break
            case 'Exit':
                connection.end()
                break
        }
    })
}

function viewAllEmployees() {
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id', (err, res) => {
        if (err) throw err
        console.table(res)
        mainMenu()
    })
}

function viewAllEmployeesByDepartment() {
    connection.query('SELECT department.id, department.name FROM department', (err, res) => {
        if (err) throw err
        inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: 'Which department would you like to view?',
                choices: res.map(department => department.name)
            }
        ]).then((answer) => {
            connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id WHERE department.name = ?', [answer.department], (err, res) => {
                if (err) throw err
                console.table(res)
                mainMenu()
            })
        })
    })
}

function viewAllEmployeesByManager() {
    connection.query('SELECT CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN employee manager ON employee.manager_id = manager.id GROUP BY manager', (err, res) => {
        if (err) throw err
        inquirer.prompt([
            {
                type: 'list',
                name: 'manager',
                message: 'Which manager would you like to view?',
                choices: res.map(manager => manager.manager)
            }
        ]).then((answer) => {
            connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id WHERE CONCAT(manager.first_name, " ", manager.last_name) = ?', [answer.manager], (err, res) => {
                if (err) throw err
                console.table(res)
                mainMenu()
            })
        })
    })
}

function addEmployee() {
    connection.query('SELECT role.id, role.title FROM role', (err, res) => {
        if (err) throw err
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'What is the employee\'s first name?',
                validate: validate.validateString
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'What is the employee\'s last name?',
                validate: validate.validateString
            },
            {
                type: 'list',
                name: 'role',
                message: 'What is the employee\'s role?',
                choices: res.map(role => role.title)
            }
        ]).then((answer) => {
            let roleId
            for (let i = 0; i < res.length; i++) {
                if (res[i].title === answer.role) {
                    roleId = res[i].id
                }
            }
            connection.query('SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee FROM employee', (err, res) => {
                if (err) throw err
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Who is the employee\'s manager?',
                        choices: res.map(employee => employee.employee)
                    }
                ]).then((answer2) => {
                    let managerId
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].employee === answer2.manager) {
                            managerId = res[i].id
                        }
                    }
                    connection.query('INSERT INTO employee SET ?', {
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: roleId,
                        manager_id: managerId
                    }, (err, res) => {
                        if (err) throw err
                        console.log(chalk.green('Employee added.'))
                        mainMenu()
                    })
                })
            })
        })
    })
}

function removeEmployee() {
    connection.query('SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee FROM employee', (err, res) => {
        if (err) throw err
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee would you like to remove?',
                choices: res.map(employee => employee.employee)
            }
        ]).then((answer) => {
            let employeeId
            for (let i = 0; i < res.length; i++) {
                if (res[i].employee === answer.employee) {
                    employeeId = res[i].id
                }
            }
            connection.query('DELETE FROM employee WHERE id = ?', [employeeId], (err, res) => {
                if (err) throw err
                console.log(chalk.green('Employee removed.'))
                mainMenu()
            })
        })
    })
}

function updateEmployeeRole() {
    connection.query('SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee FROM employee', (err, res) => {
        if (err) throw err
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee would you like to update?',
                choices: res.map(employee => employee.employee)
            }
        ]).then((answer) => {
            let employeeId
            for (let i = 0; i < res.length; i++) {
                if (res[i].employee === answer.employee) {
                    employeeId = res[i].id
                }
            }
            connection.query('SELECT role.id, role.title FROM role', (err, res) => {
                if (err) throw err
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is the employee\'s new role?',
                        choices: res.map(role => role.title)
                    }
                ]).then((answer2) => {
                    let roleId
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].title === answer2.role) {
                            roleId = res[i].id
                        }
                    }
                    connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId], (err, res) => {
                        if (err) throw err
                        console.log(chalk.green('Employee role updated.'))
                        mainMenu()
                    })
                })
            })
        })
    })
}

function updateEmployeeManager() {
    connection.query('SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee FROM employee', (err, res) => {
        if (err) throw err
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee would you like to update?',
                choices: res.map(employee => employee.employee)
            }
        ]).then((answer) => {
            let employeeId
            for (let i = 0; i < res.length; i++) {
                if (res[i].employee === answer.employee) {
                    employeeId = res[i].id
                }
            }
            connection.query('SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee FROM employee', (err, res) => {
                if (err) throw err
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: 'Who is the employee\'s new manager?',
                        choices: res.map(employee => employee.employee)
                    }
                ]).then((answer2) => {
                    let managerId
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].employee === answer2.manager) {
                            managerId = res[i].id
                        }
                    }
                    connection.query('UPDATE employee SET manager_id = ? WHERE id = ?', [managerId, employeeId], (err, res) => {
                        if (err) throw err
                        console.log(chalk.green('Employee manager updated.'))
                        mainMenu()
                    })
                })
            })
        })
    })
}
