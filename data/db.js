const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'sawney',
  password: 'sawney123',
  database: 'hospital_system'
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL as ID', connection.threadId);
});

module.exports = connection;
