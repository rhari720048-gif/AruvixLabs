const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        });

        await connection.query('ALTER TABLE call_logs ADD COLUMN duration INT DEFAULT 0');
        console.log('Migration successful');
        await connection.end();
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column duration already exists. Skipped.');
            process.exit(0);
        } else {
            console.error('Migration failed:', error.message);
            process.exit(1);
        }
    }
}
migrate();
