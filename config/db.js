const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '@Snr@1920',
  database: process.env.DB_NAME || 'ecofinds',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the promise-based version of the pool
const promisePool = pool.promise();

module.exports = promisePool;