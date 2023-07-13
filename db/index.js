const db = require("./connection");

class DB {
    constructor(db) {
        this.db = db;
            }
// View all employees
    viewAllEmployees() {
        return this.db.promise().query(
            `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON manager.id = employee.manager_id;`
        );
        }
// View all roles

// View all departments

// View all employees by department

// View department budgets

// Update employee role

// Update employee manager

// Add employee

// Add role

// Add department

// Remove employee

// Remove role

// Remove department
};
        module.exports = new DB(db);