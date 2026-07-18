const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
  });
  try {
    const [rows] = await pool.query("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'assigned_to' AND REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = DATABASE()");
    for (let row of rows) {
      await pool.query("ALTER TABLE customers DROP FOREIGN KEY " + row.CONSTRAINT_NAME);
      console.log('Dropped FK: ' + row.CONSTRAINT_NAME);
    }
    await pool.query("ALTER TABLE customers MODIFY COLUMN assigned_to VARCHAR(255) DEFAULT '[]'");
    console.log('Altered assigned_to column to VARCHAR');
    
    // Convert existing integer values to JSON array strings
    const [customers] = await pool.query('SELECT id, assigned_to FROM customers');
    for (let c of customers) {
        if (c.assigned_to && !c.assigned_to.startsWith('[')) {
            const num = parseInt(c.assigned_to);
            if (!isNaN(num)) {
                await pool.query('UPDATE customers SET assigned_to = ? WHERE id = ?', [JSON.stringify([num]), c.id]);
            }
        }
    }
    console.log('Migrated existing assigned_to data.');
    
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
run();
