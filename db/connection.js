const mysql = require('mysql2');
require('dotenv').config();

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employee_tracker_db'
});
connection.connect(function (err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
});

module.exports = connection;