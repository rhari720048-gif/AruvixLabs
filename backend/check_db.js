const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  const query = `
            SELECT c.*, l.notes as last_note, l.callback_time 
            FROM customers c
            LEFT JOIN (
                SELECT customer_id, MAX(id) as max_id
                FROM call_logs
                GROUP BY customer_id
            ) l_max ON c.id = l_max.customer_id
            LEFT JOIN call_logs l ON l_max.max_id = l.id
            WHERE c.status = 'Appointment'
            ORDER BY l.callback_time ASC
        `;
  const [rows] = await pool.query(query);
  console.log('Test success!', rows);
  
  process.exit(0);
}
run();
