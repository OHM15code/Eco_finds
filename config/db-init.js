const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  // Create connection to MySQL server (without database selected)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@Snr@1920',
  });

  try {
    // Check if database exists
    const [databases] = await connection.query(
      "SHOW DATABASES LIKE ?", 
      [process.env.DB_NAME || 'ecofinds']
    );

    if (databases.length === 0) {
      console.log('Database does not exist, creating...');
      
      // Read the schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Split the SQL file into separate statements
      const statements = schemaSql
        .split(';')
        .filter(statement => statement.trim() !== '');

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(`${statement};`);
        }
      }

      console.log('Database initialized successfully!');
    } else {
      console.log('Database already exists, skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { initializeDatabase };