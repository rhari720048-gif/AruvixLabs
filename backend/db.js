const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();

    const rolesTable = `
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            permissions JSON NOT NULL
        );
    `;
    const usersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
            role_id INT,
            permissions JSON,
            status VARCHAR(20) DEFAULT 'Active',
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
        );
    `;
    const customersTable = `
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            district VARCHAR(100),
            taluk VARCHAR(100),
            car_brand VARCHAR(100),
            car_model VARCHAR(100),
            registration_number VARCHAR(50),
            source VARCHAR(100),
            notes TEXT,
            status VARCHAR(100) DEFAULT 'Pending',
            assigned_to VARCHAR(255) DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    const callLogsTable = `
        CREATE TABLE IF NOT EXISTS call_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT,
            employee_id INT,
            status VARCHAR(100),
            notes TEXT,
            callback_time DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    try {
        await pool.query(rolesTable);
        await pool.query(usersTable);
        await pool.query(customersTable);
        await pool.query(callLogsTable);

        // Custom roles & user profile migrations
        try {
            await pool.query("ALTER TABLE users MODIFY COLUMN role VARCHAR(255) DEFAULT 'employee'");
        } catch (e) {
            console.log("Migration users.role alteration failed/skipped:", e.message);
        }
        try {
            await pool.query("ALTER TABLE users ADD COLUMN bio TEXT");
        } catch (e) { }
        try {
            await pool.query("ALTER TABLE users ADD COLUMN location VARCHAR(255)");
        } catch (e) { }
        try {
            await pool.query("ALTER TABLE users ADD COLUMN department VARCHAR(255)");
        } catch (e) { }
        try {
            await pool.query("ALTER TABLE users ADD COLUMN permissions JSON");
        } catch (e) { }
        try {
            await pool.query("UPDATE users SET permissions = '{}' WHERE permissions IS NULL");
        } catch (e) { }

        // Try to add role_id column if it doesn't exist (for existing DBs)
        try {
            await pool.query("ALTER TABLE users ADD COLUMN role_id INT");
            await pool.query("ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL");
        } catch (e) {
            // Column might already exist, ignore error
        }

        try {
            await pool.query("ALTER TABLE customers ADD COLUMN last_dial_date TIMESTAMP NULL");
        } catch (e) { }

        try {
            await pool.query("ALTER TABLE customers ADD COLUMN converted_at DATETIME NULL");
        } catch (e) { }
        try {
            await pool.query("ALTER TABLE customers ADD COLUMN converted_by INT NULL");
        } catch (e) { }

        // Indexes for fast call_logs query synchronization
        try {
            await pool.query("CREATE INDEX idx_call_logs_customer ON call_logs(customer_id)");
        } catch (e) { }
        try {
            await pool.query("CREATE INDEX idx_call_logs_employee ON call_logs(employee_id)");
        } catch (e) { }
        try {
            await pool.query("CREATE INDEX idx_call_logs_created ON call_logs(created_at)");
        } catch (e) { }

        // Seed default roles if roles table is empty
        const [rolesCount] = await pool.query('SELECT COUNT(*) as count FROM roles');
        if (rolesCount[0].count === 0) {
            const allPermissions = {
                dashboard: { view: true },
                profile: { view: true },
                mail: { view: true },
                projects: { view: true, create: true, edit: true, delete: true },
                tasks: { view: true, create: true, edit: true, delete: true },
                files: { view: true, create: true, edit: true, delete: true },
                calendar: { view: true, create: true, edit: true, delete: true },
                meetings: { view: true, create: true, edit: true, delete: true },
                accounting: { view: true, create: true, edit: true, delete: true },
                invoices: { view: true, create: true, edit: true, delete: true },
                quotes: { view: true, create: true, edit: true, delete: true },
                leads: { view: true, create: true, edit: true, delete: true },
                clients: { view: true, create: true, edit: true, delete: true },
                appointments: { view: true, create: true, edit: true, delete: true },
                call_later: { view: true, create: true, edit: true, delete: true },
                ni_box: { view: true, create: true, edit: true, delete: true },
                call_history: { view: true, create: true, edit: true, delete: true },
                staff_attendance: { view: true, create: true, edit: true, delete: true },
                my_attendance: { view: true, create: true, edit: true, delete: true },
                user_notes: { view: true, create: true, edit: true, delete: true },
                user_management: { view: true, create: true, edit: true, delete: true },
                leaves: { view: true, create: true, edit: true, delete: true },
                client_reports: { view: true, create: true, edit: true, delete: true },
                team_chat: { view: true, create: true, edit: true, delete: true },
                support: { view: true, create: true, edit: true, delete: true },
                settings: { view: true, create: true, edit: true, delete: true }
            };

            const employeePermissions = {
                dashboard: { view: true },
                profile: { view: true },
                my_attendance: { view: true, create: true },
                tasks: { view: true, edit: true },
                team_chat: { view: true, create: true },
                leads: { view: true, create: true, edit: true, delete: false },
                clients: { view: true, create: true, edit: true, delete: false },
                appointments: { view: true, create: true, edit: true, delete: false },
                call_later: { view: true, create: true, edit: true, delete: false },
                ni_box: { view: true, create: true, edit: true, delete: false },
                call_history: { view: true, delete: false }
            };

            await pool.query('INSERT INTO roles (name, permissions) VALUES (?, ?)', ['Admin', JSON.stringify(allPermissions)]);
            await pool.query('INSERT INTO roles (name, permissions) VALUES (?, ?)', ['Employee', JSON.stringify(employeePermissions)]);
        }

        // Migrate existing users to have role_id based on their old 'role' enum, and also set default permissions
        try {
            await pool.query("ALTER TABLE users ADD COLUMN permissions JSON");
        } catch (e) {
            // Column might already exist, ignore error
        }

        try {
            await pool.query(`UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Admin'), permissions = (SELECT permissions FROM roles WHERE name = 'Admin') WHERE role IN ('admin', 'manager') AND role_id IS NULL`);
            await pool.query(`UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Employee'), permissions = (SELECT permissions FROM roles WHERE name = 'Employee') WHERE role = 'employee' AND role_id IS NULL`);
            // Give all users admin permissions if they are 'admin' role but permissions is NULL
            await pool.query(`UPDATE users SET permissions = (SELECT permissions FROM roles WHERE name = 'Admin') WHERE role = 'admin' AND permissions IS NULL`);
            // Give all users employee permissions if they are 'employee' role but permissions is NULL
            await pool.query(`UPDATE users SET permissions = (SELECT permissions FROM roles WHERE name = 'Employee') WHERE role = 'employee' AND permissions IS NULL`);

            // Ensure existing Admin role has all new modules
            const [existingAdmin] = await pool.query("SELECT id, permissions FROM roles WHERE name = 'Admin'");
            if (existingAdmin.length > 0) {
                let currentPerms = typeof existingAdmin[0].permissions === 'string' ? JSON.parse(existingAdmin[0].permissions) : existingAdmin[0].permissions;
                const keysToAdd = ['appointments', 'call_later', 'ni_box', 'call_history'];
                let modified = false;
                keysToAdd.forEach(k => {
                    if (!currentPerms[k]) {
                        currentPerms[k] = { view: true, create: true, edit: true, delete: true };
                        modified = true;
                    }
                });
                if (modified) {
                    await pool.query("UPDATE roles SET permissions = ? WHERE id = ?", [JSON.stringify(currentPerms), existingAdmin[0].id]);
                }
            }

            // Ensure existing Employee role has all CRM modules
            const [existingEmp] = await pool.query("SELECT id, permissions FROM roles WHERE name = 'Employee'");
            if (existingEmp.length > 0) {
                let currentPerms = typeof existingEmp[0].permissions === 'string' ? JSON.parse(existingEmp[0].permissions) : existingEmp[0].permissions;
                const empDefaultKeys = {
                    leads: { view: true, create: true, edit: true, delete: false },
                    clients: { view: true, create: true, edit: true, delete: false },
                    appointments: { view: true, create: true, edit: true, delete: false },
                    call_later: { view: true, create: true, edit: true, delete: false },
                    ni_box: { view: true, create: true, edit: true, delete: false },
                    call_history: { view: true, delete: false }
                };
                let modified = false;
                Object.keys(empDefaultKeys).forEach(k => {
                    if (!currentPerms[k]) {
                        currentPerms[k] = empDefaultKeys[k];
                        modified = true;
                    }
                });
                if (modified) {
                    await pool.query("UPDATE roles SET permissions = ? WHERE id = ?", [JSON.stringify(currentPerms), existingEmp[0].id]);
                }
            }
            
            // Sync user permissions based on their role
            await pool.query(`UPDATE users u JOIN roles r ON u.role_id = r.id SET u.permissions = r.permissions`);
        } catch (e) {
            console.log("Migration users role_id and permissions set failed/skipped:", e.message);
        }

        await pool.query(customersTable);

        // ── Attendance tables ──────────────────────────────────────────────────
        const attendanceTable = `
        CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date DATE NOT NULL,
            check_in DATETIME DEFAULT NULL,
            check_out DATETIME DEFAULT NULL,
            status VARCHAR(50) DEFAULT 'Present',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;
        const passesTable = `
        CREATE TABLE IF NOT EXISTS attendance_passes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            attendance_id INT NOT NULL,
            reason TEXT NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            request_time DATETIME NOT NULL,
            pass_start DATETIME DEFAULT NULL,
            pass_end DATETIME DEFAULT NULL,
            FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE
        );
    `;
        await pool.query(attendanceTable);
        await pool.query(passesTable);

        // ── Projects & Tasks tables ────────────────────────────────────────────
        const projectsTable = `
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            tags VARCHAR(255),
            client VARCHAR(255),
            status VARCHAR(50) DEFAULT 'Pending',
            priority VARCHAR(50) DEFAULT 'Medium',
            progress INT DEFAULT 0,
            start_date DATE,
            end_date DATE,
            description TEXT,
            assigned_to VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
        const tasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            project_id INT DEFAULT NULL,
            assigned_to INT DEFAULT NULL,
            status VARCHAR(50) DEFAULT 'To Do',
            priority VARCHAR(50) DEFAULT 'Medium',
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        );
    `;
        const notesTable = `
        CREATE TABLE IF NOT EXISTS user_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            color VARCHAR(20) DEFAULT 'yellow',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

        await pool.query(projectsTable);
        await pool.query(tasksTable);
        await pool.query(notesTable);

        // ── Phase 2: Finance & Operations tables ──────────────────────────────
        const accountingTable = `
        CREATE TABLE IF NOT EXISTS accounting (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type ENUM('Income', 'Expense') NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            reason VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            assigned_to VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
        const invoicesTable = `
        CREATE TABLE IF NOT EXISTS invoices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_no VARCHAR(100) UNIQUE NOT NULL,
            client_id INT NOT NULL,
            items JSON NOT NULL,
            total_amount DECIMAL(12,2) NOT NULL,
            paid_amount DECIMAL(12,2) DEFAULT 0.00,
            payment_method VARCHAR(50),
            notes TEXT,
            date DATE NOT NULL,
            status ENUM('Unpaid', 'Partially Paid', 'Paid') DEFAULT 'Unpaid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE RESTRICT
        );
    `;
        const quotationsTable = `
        CREATE TABLE IF NOT EXISTS quotations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            quote_no VARCHAR(100) UNIQUE NOT NULL,
            client_id INT NOT NULL,
            items JSON NOT NULL,
            total_amount DECIMAL(12,2) NOT NULL,
            validity DATE,
            notes TEXT,
            date DATE NOT NULL,
            status ENUM('Draft', 'Sent', 'Accepted', 'Rejected') DEFAULT 'Draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE RESTRICT
        );
    `;

        await pool.query(accountingTable);
        await pool.query(invoicesTable);
        await pool.query(quotationsTable);

        // ── Phase 3: Operations & Communication ────────────────────────────────
        const internalMailTable = `
        CREATE TABLE IF NOT EXISTS internal_mail (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT,
            status ENUM('Unread', 'Read') DEFAULT 'Unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;
        const leavesTable = `
        CREATE TABLE IF NOT EXISTS leaves (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(100) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;
        const meetingsTable = `
        CREATE TABLE IF NOT EXISTS meetings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            time VARCHAR(50),
            link VARCHAR(255),
            assigned_to INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
        );
    `;
        const filesTable = `
        CREATE TABLE IF NOT EXISTS files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            size VARCHAR(50) NOT NULL,
            url VARCHAR(255) NOT NULL,
            uploaded_by INT,
            folder VARCHAR(100) DEFAULT 'General',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        );
    `;
        const chatTable = `
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            channel VARCHAR(100) NOT NULL,
            user_id INT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

        await pool.query(internalMailTable);
        await pool.query(leavesTable);
        await pool.query(meetingsTable);
        await pool.query(filesTable);
        await pool.query(chatTable);

        // ── Phase 4: Support & Reports ────────────────────────────────────────
        const supportTicketsTable = `
        CREATE TABLE IF NOT EXISTS support_tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id VARCHAR(50) UNIQUE NOT NULL,
            subject VARCHAR(255) NOT NULL,
            client_id INT,
            status ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open',
            priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL
        );
    `;
        const supportTicketMessagesTable = `
        CREATE TABLE IF NOT EXISTS support_ticket_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            sender_name VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
        );
    `;
        const clientReportsTable = `
        CREATE TABLE IF NOT EXISTS client_reports (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100) NOT NULL,
            file_url VARCHAR(255),
            notes TEXT,
            status VARCHAR(50) DEFAULT 'Delivered',
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE CASCADE
        );
    `;

        await pool.query(supportTicketsTable);
        await pool.query(supportTicketMessagesTable);
        await pool.query(clientReportsTable);


        // ── SMTP settings table ────────────────────────────────────────────────
        await pool.query(`
        CREATE TABLE IF NOT EXISTS smtp_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mail_host       VARCHAR(255) NOT NULL DEFAULT 'smtp.gmail.com',
            mail_port       INT          NOT NULL DEFAULT 587,
            mail_secure     TINYINT(1)   NOT NULL DEFAULT 0,
            mail_user       VARCHAR(255) NOT NULL DEFAULT '',
            mail_pass       VARCHAR(500) NOT NULL DEFAULT '',
            mail_from_name  VARCHAR(255) NOT NULL DEFAULT 'AruvixLabs CRM',
            mail_from_email VARCHAR(255) NOT NULL DEFAULT '',
            updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);
        // Seed defaults from .env if table is empty
        const [smtpRows] = await pool.query('SELECT id FROM smtp_settings LIMIT 1');
        if (smtpRows.length === 0) {
            await pool.query(
                'INSERT INTO smtp_settings (mail_host, mail_port, mail_secure, mail_user, mail_pass, mail_from_name, mail_from_email) VALUES (?,?,?,?,?,?,?)',
                [
                    process.env.MAIL_HOST || 'smtp.gmail.com',
                    parseInt(process.env.MAIL_PORT || '587'),
                    process.env.MAIL_SECURE === 'true' ? 1 : 0,
                    process.env.MAIL_USER || '',
                    process.env.MAIL_PASS || '',
                    process.env.MAIL_FROM_NAME || 'AruvixLabs CRM',
                    process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER || '',
                ]
            );
        }

        // Create default admin user
        const adminEmail = 'admin@aruvixcrm.com';
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [adminEmail]);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin@123', 10);

            // Try to get admin role ID
            const [adminRole] = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
            const adminRoleId = adminRole.length > 0 ? adminRole[0].id : null;

            // Full permissions for all modules
            const allModules = ['dashboard', 'profile', 'mail', 'projects', 'tasks', 'files', 'calendar', 'meetings', 'accounting', 'invoices', 'quotes', 'leads', 'clients', 'staff_attendance', 'my_attendance', 'user_notes', 'user_management', 'leaves', 'client_reports', 'team_chat', 'support', 'settings'];
            const adminPerms = {};
            allModules.forEach(m => adminPerms[m] = { view: true, create: true, edit: true, delete: true });

            await pool.query('INSERT INTO users (name, email, password, role, role_id, permissions) VALUES (?, ?, ?, ?, ?, ?)', ['Admin', adminEmail, hashedPassword, 'admin', adminRoleId, JSON.stringify(adminPerms)]);
            console.log("Default admin user created with full permissions");
        } else {
            // Ensure existing admin user has full permissions and password is correct
            const existing = rows[0];
            const hashedPassword = await bcrypt.hash('admin@123', 10);
            const allModules = ['dashboard', 'profile', 'mail', 'projects', 'tasks', 'files', 'calendar', 'meetings', 'accounting', 'invoices', 'quotes', 'leads', 'clients', 'staff_attendance', 'my_attendance', 'user_notes', 'user_management', 'leaves', 'client_reports', 'team_chat', 'support', 'settings'];
            const adminPerms = {};
            allModules.forEach(m => adminPerms[m] = { view: true, create: true, edit: true, delete: true });
            await pool.query('UPDATE users SET permissions = ?, password = ? WHERE email = ?', [JSON.stringify(adminPerms), hashedPassword, adminEmail]);
            console.log("Existing admin user permissions and password updated");
        }

    } catch (err) {
        console.error("Database Init Error:", err);
    }
    console.log("Database initialized");
}

module.exports = { pool, initDB };
