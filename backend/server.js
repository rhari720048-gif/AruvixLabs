const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, initDB } = require('./db');
const { sendWelcomeEmail, testConnection, setPool } = require('./mailer');

dotenv.config();

const app = express();
app.use(cors({
    origin: ['https://aruvix-labs.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

// Initialize DB and inject pool into mailer
initDB()
    .then(() => setPool(pool))
    .catch(console.error);

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh role and permissions from DB
        const [rows] = await pool.query('SELECT role, permissions FROM users WHERE id = ?', [decoded.id]);
        if (rows.length > 0) {
            let permissions = {};
            if (rows[0].permissions) {
                try {
                    permissions = typeof rows[0].permissions === 'string' ? JSON.parse(rows[0].permissions) : rows[0].permissions;
                } catch (e) { }
            }
            req.user = {
                ...decoded,
                role: rows[0].role,
                permissions: permissions
            };
        } else {
            req.user = decoded;
        }
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query(`
            SELECT u.*
            FROM users u 
            WHERE u.email = ?
        `, [email]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        let permissions = {};
        if (user.permissions) {
            try { permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions; } catch (e) { }
        }

        const token = jwt.sign({ id: user.id, name: user.name, role: user.role, permissions }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role, permissions } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch current logged-in user's fresh data (for permission refresh)
app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, phone, bio, location, department, permissions FROM users WHERE id = ?', [req.user.id]);
        if (!rows[0]) return res.status(404).json({ error: 'User not found' });
        const user = rows[0];
        let permissions = {};
        if (user.permissions) {
            try { permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions; } catch (e) { }
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            bio: user.bio || '',
            location: user.location || '',
            department: user.department || '',
            permissions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update own profile details
app.put('/api/auth/profile', authenticate, async (req, res) => {
    const { name, phone, bio, location, department } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, phone = ?, bio = ?, location = ?, department = ? WHERE id = ?',
            [name, phone, bio, location, department, req.user.id]
        );
        res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/customers', authenticate, async (req, res) => {
    try {
        let query = 'SELECT c.* FROM customers c ORDER BY c.created_at DESC';
        let params = [];
        if (req.user.role !== 'admin') {
            query = `
                SELECT c.* 
                FROM customers c 
                WHERE JSON_CONTAINS(c.assigned_to, CAST(? AS JSON), '$')
                ORDER BY c.created_at DESC
            `;
            params = [req.user.id];
        }
        const [rows] = await pool.query(query, params);

        const [users] = await pool.query('SELECT id, name FROM users');
        const userMap = {};
        users.forEach(u => userMap[u.id] = u.name);

        const formattedRows = rows.map(row => {
            let assigneeNames = [];
            let assigneeArray = [];
            try {
                if (row.assigned_to && row.assigned_to.startsWith('[')) {
                    assigneeArray = JSON.parse(row.assigned_to);
                    if (Array.isArray(assigneeArray)) {
                        assigneeNames = assigneeArray.map(id => userMap[id]).filter(Boolean);
                    }
                }
            } catch (e) {}
            return {
                ...row,
                assignee_name: assigneeNames.join(', '),
                assignedToId: assigneeArray // Added for frontend backward/forward compatibility
            };
        });

        res.json(formattedRows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/customers/:id', authenticate, async (req, res) => {
    const { status, notes, name, phone, district, source, assigned_to, car_model, registration_number } = req.body;
    try {
        if (name) {
            // Full update
            let assignedToStr = '[]';
            if (Array.isArray(assigned_to)) {
                assignedToStr = JSON.stringify(assigned_to.map(id => parseInt(id, 10)).filter(id => !isNaN(id)));
            } else if (assigned_to) {
                assignedToStr = JSON.stringify([parseInt(assigned_to, 10)]);
            }
            await pool.query(
                'UPDATE customers SET name=?, phone=?, district=?, source=?, notes=?, status=?, assigned_to=?, car_model=?, registration_number=? WHERE id=?',
                [name, phone, district, source, notes, status, assignedToStr, car_model || '', registration_number || '', req.params.id]
            );
        } else {
            // Partial update (just status/notes)
            await pool.query('UPDATE customers SET status = ?, notes = ? WHERE id = ?', [status, notes, req.params.id]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/customers/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/customers/bulk-delete', authenticate, async (req, res) => {
    const { ids } = req.body;
    try {
        if (!ids || ids.length === 0) return res.json({ success: true });
        // Create placeholders ?,?,?
        const placeholders = ids.map(() => '?').join(',');
        await pool.query(`DELETE FROM customers WHERE id IN (${placeholders})`, ids);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/customers', authenticate, async (req, res) => {
    const { customer_id, name, phone, district, source, notes, assigned_to, car_model, registration_number } = req.body;
    let assignedToStr = '[]';
    if (Array.isArray(assigned_to)) {
        assignedToStr = JSON.stringify(assigned_to.map(id => parseInt(id, 10)).filter(id => !isNaN(id)));
    } else if (assigned_to) {
        assignedToStr = JSON.stringify([parseInt(assigned_to, 10)]);
    }
    
    try {
        await pool.query(
            'INSERT INTO customers (customer_id, name, phone, district, source, notes, status, assigned_to, car_model, registration_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_id, name, phone, district, source, notes, 'Pending', assignedToStr, car_model || '', registration_number || '']
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── User Management Routes ─────────────────────────────────────────────────

// GET all users
app.get('/api/users', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, u.role, u.permissions, u.bio, u.location, u.department
            FROM users u
            ORDER BY u.id ASC
        `);
        const users = rows.map(u => ({
            ...u,
            permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || {})
        }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new user
app.post('/api/users', authenticate, async (req, res) => {
    const canCreate = req.user.role === 'admin' || req.user.permissions?.user_management?.create;
    if (!canCreate) return res.status(403).json({ error: 'Access denied: You do not have create permissions for user management.' });
    const { name, email, phone, role, password, status } = req.body;
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

        // Validate that the role exists in the roles database table
        const [dbRoles] = await pool.query('SELECT permissions FROM roles WHERE LOWER(name) = LOWER(?)', [role]);
        if (dbRoles.length === 0) {
            return res.status(400).json({ error: `Role '${role}' does not exist. Please add it first in Settings -> User Permissions.` });
        }

        const defaultPerms = typeof dbRoles[0].permissions === 'string' ? JSON.parse(dbRoles[0].permissions) : dbRoles[0].permissions;
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (name, email, phone, role, password, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, role, hashedPassword, status, JSON.stringify(defaultPerms)]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Edit User
app.put('/api/users/:id', authenticate, async (req, res) => {
    const canEdit = req.user.role === 'admin' || req.user.permissions?.user_management?.edit;
    if (!canEdit) return res.status(403).json({ error: 'Access denied: You do not have edit permissions for user management.' });
    const { name, email, phone, role, password, status, permissions } = req.body;
    try {
        const [existing] = await pool.query('SELECT role, permissions FROM users WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'User not found' });

        let finalPerms = existing[0].permissions;

        if (role) {
            const [dbRoles] = await pool.query('SELECT permissions FROM roles WHERE LOWER(name) = LOWER(?)', [role]);
            if (dbRoles.length === 0) {
                return res.status(400).json({ error: `Role '${role}' does not exist. Please add it first in Settings -> User Permissions.` });
            }

            if (permissions) {
                finalPerms = JSON.stringify(permissions);
            } else if ((existing[0].role || '').toLowerCase() !== role.toLowerCase()) {
                finalPerms = JSON.stringify(dbRoles[0].permissions);
            }
        } else if (permissions) {
            finalPerms = JSON.stringify(permissions);
        }

        const queryParams = [name, email, phone, role || existing[0].role, status, finalPerms];
        let queryStr = 'UPDATE users SET name=?, email=?, phone=?, role=?, status=?, permissions=?';

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            queryStr += ', password=?';
            queryParams.push(hashedPassword);
        }

        queryStr += ' WHERE id=?';
        queryParams.push(req.params.id);

        await pool.query(queryStr, queryParams);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE user
app.delete('/api/users/:id', authenticate, async (req, res) => {
    const canDelete = req.user.role === 'admin' || req.user.permissions?.user_management?.delete;
    if (!canDelete) return res.status(403).json({ error: 'Access denied: You do not have delete permissions for user management.' });
    const userId = req.params.id;
    try {
        // Set assigned_to to NULL in customers table first to avoid FK constraint failures
        await pool.query('UPDATE customers SET assigned_to = NULL WHERE assigned_to = ?', [userId]);
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User Permissions
app.put('/api/users/:id/permissions', authenticate, async (req, res) => {
    const canEditSettings = req.user.role === 'admin' || req.user.permissions?.settings?.edit;
    if (!canEditSettings) return res.status(403).json({ error: 'Access denied: You do not have permission to edit settings.' });
    const { permissions } = req.body;
    try {
        await pool.query('UPDATE users SET permissions=? WHERE id=?', [JSON.stringify(permissions), req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST send welcome email to a user
app.post('/api/users/:id/send-welcome', authenticate, async (req, res) => {
    const { password } = req.body; // plain-text password to show in email
    try {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        const user = rows[0];
        await sendWelcomeEmail({
            name: user.name,
            email: user.email,
            role: user.role,
            password: password || '(contact your admin for password)',
        });
        res.json({ success: true, message: `Welcome email sent to ${user.email}` });
    } catch (error) {
        console.error('Mail error:', error.message);
        res.status(500).json({ error: 'Failed to send email: ' + error.message });
    }
});

app.post('/api/config/email/test', authenticate, async (req, res) => {
    const canEditSettings = req.user.role === 'admin' || req.user.permissions?.settings?.edit;
    if (!canEditSettings) return res.status(403).json({ error: 'Access denied: You do not have permission to edit settings.' });
    try {
        await testConnection();
        res.json({ success: true, message: 'SMTP connection successful!' });
    } catch (error) {
        res.status(500).json({ error: 'SMTP connection failed: ' + error.message });
    }
});

app.get('/api/config/email', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');
        if (!rows.length) return res.json({});
        const r = rows[0];
        res.json({
            host: r.mail_host,
            port: r.mail_port,
            secure: r.mail_secure === 1,
            username: r.mail_user,
            password: r.mail_pass ? '••••••••' : '',   // mask real password
            senderName: r.mail_from_name,
            senderEmail: r.mail_from_email,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/config/email', authenticate, async (req, res) => {
    const canEditSettings = req.user.role === 'admin' || req.user.permissions?.settings?.edit;
    if (!canEditSettings) return res.status(403).json({ error: 'Access denied: You do not have permission to edit settings.' });
    const { host, port, secure, username, password, senderName, senderEmail } = req.body;
    try {
        const [rows] = await pool.query('SELECT id FROM smtp_settings LIMIT 1');
        if (rows.length > 0) {
            // Update existing row — only update password if a real value is provided (not masked)
            if (password && password !== '••••••••') {
                await pool.query(
                    'UPDATE smtp_settings SET mail_host=?, mail_port=?, mail_secure=?, mail_user=?, mail_pass=?, mail_from_name=?, mail_from_email=? WHERE id=?',
                    [host, parseInt(port), secure ? 1 : 0, username, password, senderName, senderEmail, rows[0].id]
                );
            } else {
                await pool.query(
                    'UPDATE smtp_settings SET mail_host=?, mail_port=?, mail_secure=?, mail_user=?, mail_from_name=?, mail_from_email=? WHERE id=?',
                    [host, parseInt(port), secure ? 1 : 0, username, senderName, senderEmail, rows[0].id]
                );
            }
        } else {
            await pool.query(
                'INSERT INTO smtp_settings (mail_host, mail_port, mail_secure, mail_user, mail_pass, mail_from_name, mail_from_email) VALUES (?,?,?,?,?,?,?)',
                [host, parseInt(port), secure ? 1 : 0, username, password || '', senderName, senderEmail]
            );
        }
        res.json({ success: true, message: 'SMTP settings saved to database!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/verify', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, r.name as role_name, r.permissions 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.id = ?
        `, [req.user.id]);

        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];
        let permissions = {};
        if (user.permissions) {
            try { permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions; } catch (e) { }
        }

        res.json({ valid: true, user: { id: user.id, name: user.name, role: user.role_name, permissions } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROLES Endpoints
app.get('/api/roles', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM roles');
        res.json(rows.map(r => ({ ...r, permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/roles', authenticate, async (req, res) => {
    const canEditSettings = req.user.role === 'admin' || req.user.permissions?.settings?.edit;
    if (!canEditSettings) return res.status(403).json({ error: 'Access denied: You do not have permission to edit settings.' });
    const { name, permissions } = req.body;
    try {
        const result = await pool.query('INSERT INTO roles (name, permissions) VALUES (?, ?)', [name, JSON.stringify(permissions)]);
        res.json({ success: true, id: result[0].insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/roles/:id', authenticate, async (req, res) => {
    const canEditSettings = req.user.role === 'admin' || req.user.permissions?.settings?.edit;
    if (!canEditSettings) return res.status(403).json({ error: 'Access denied: You do not have permission to edit settings.' });
    const { name, permissions } = req.body;
    try {
        await pool.query('UPDATE roles SET name=?, permissions=? WHERE id=?', [name, JSON.stringify(permissions), req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/roles/:id', authenticate, async (req, res) => {
    const canEditSettings = req.user.role === 'admin' || req.user.permissions?.settings?.edit;
    if (!canEditSettings) return res.status(403).json({ error: 'Access denied: You do not have permission to edit settings.' });
    try {
        await pool.query('DELETE FROM roles WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Attendance Routes ────────────────────────────────────────────────────────
app.post('/api/attendance/check-in', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        // Check if already checked in today
        const [existing] = await pool.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
        if (existing.length > 0) return res.status(400).json({ error: 'Already checked in today' });

        const [result] = await pool.query(
            'INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, NOW(), ?)',
            [userId, today, 'Present']
        );
        res.json({ success: true, attendanceId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/attendance/check-out', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        await pool.query(
            'UPDATE attendance SET check_out = NOW() WHERE user_id = ? AND date = ? AND check_out IS NULL',
            [userId, today]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/attendance/pass/request', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const { reason } = req.body;

        const [att] = await pool.query('SELECT id FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
        if (att.length === 0) return res.status(400).json({ error: 'Must check in first' });

        const [result] = await pool.query(
            'INSERT INTO attendance_passes (attendance_id, reason, status, request_time, pass_start) VALUES (?, ?, ?, NOW(), NOW())',
            [att[0].id, reason, 'approved']
        );
        res.json({ success: true, passId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/attendance/pass/resume', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const [att] = await pool.query('SELECT id FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
        if (att.length === 0) return res.status(400).json({ error: 'No attendance found' });

        await pool.query(
            'UPDATE attendance_passes SET pass_end = NOW() WHERE attendance_id = ? AND status = "approved" AND pass_start IS NOT NULL AND pass_end IS NULL',
            [att[0].id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/attendance/admin/passes/:id/action', authenticate, async (req, res) => {
    try {
        const canEditAttendance = req.user.permissions?.staff_attendance?.edit;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canEditAttendance) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const { action } = req.body; // 'approve' or 'reject'
        const passId = req.params.id;

        if (action === 'approve') {
            await pool.query('UPDATE attendance_passes SET status = "approved", pass_start = NOW() WHERE id = ?', [passId]);
        } else {
            await pool.query('UPDATE attendance_passes SET status = "rejected" WHERE id = ?', [passId]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin edit attendance record
app.put('/api/attendance/admin/:id', authenticate, async (req, res) => {
    try {
        const canEditAttendance = req.user.permissions?.staff_attendance?.edit;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canEditAttendance) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const { check_in, check_out, status } = req.body;
        // Parse dates or set to NULL
        const ci = check_in ? new Date(check_in) : null;
        const co = check_out ? new Date(check_out) : null;
        await pool.query(
            'UPDATE attendance SET check_in = ?, check_out = ?, status = ? WHERE id = ?',
            [ci, co, status, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin delete attendance record
app.delete('/api/attendance/admin/:id', authenticate, async (req, res) => {
    try {
        const canDeleteAttendance = req.user.permissions?.staff_attendance?.delete;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canDeleteAttendance) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await pool.query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/attendance/today', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const [att] = await pool.query('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);

        if (att.length === 0) return res.json({ status: 'not_checked_in' });

        const attendance = att[0];
        if (attendance.check_out) return res.json({ status: 'checked_out', attendance });

        // check for pending or active passes
        const [passes] = await pool.query(
            'SELECT * FROM attendance_passes WHERE attendance_id = ? ORDER BY id DESC LIMIT 1',
            [attendance.id]
        );

        let currentState = 'checked_in';
        let currentPass = null;

        if (passes.length > 0) {
            currentPass = passes[0];
            if (currentPass.status === 'pending') currentState = 'pass_pending';
            else if (currentPass.status === 'approved' && !currentPass.pass_end) currentState = 'on_pass';
            else if (currentPass.status === 'rejected') currentState = 'pass_rejected';
        }

        res.json({ status: currentState, attendance, currentPass });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/attendance/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.query('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/attendance/admin/pending', authenticate, async (req, res) => {
    try {
        const canViewAttendance = req.user.permissions?.staff_attendance?.view;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canViewAttendance) return res.status(403).json({ error: 'Unauthorized' });

        const query = `
            SELECT p.*, u.name as user_name, u.role as user_role 
            FROM attendance_passes p
            JOIN attendance a ON p.attendance_id = a.id
            JOIN users u ON a.user_id = u.id
            WHERE p.status = 'pending'
            ORDER BY p.request_time ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/attendance/admin/report', authenticate, async (req, res) => {
    try {
        const canViewAttendance = req.user.permissions?.staff_attendance?.view;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canViewAttendance) return res.status(403).json({ error: 'Unauthorized' });

        const date = req.query.date || new Date().toISOString().split('T')[0];

        const query = `
            SELECT u.id as user_id, u.name, u.role, a.id as attendance_id, a.check_in, a.check_out, a.status 
            FROM users u
            LEFT JOIN attendance a ON u.id = a.user_id AND a.date = ?
            ORDER BY u.name ASC
        `;
        const [usersWithAtt] = await pool.query(query, [date]);

        for (let user of usersWithAtt) {
            if (user.attendance_id) {
                const [passes] = await pool.query(
                    'SELECT id, reason, status, request_time, pass_start, pass_end FROM attendance_passes WHERE attendance_id = ? ORDER BY id ASC',
                    [user.attendance_id]
                );
                user.passes = passes;
            } else {
                user.passes = [];
            }
        }

        res.json(usersWithAtt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Projects API ───────────────────────────────────────────────────────
app.get('/api/projects', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/projects', authenticate, async (req, res) => {
    try {
        const { name, category, tags, client, assigned_to, status, priority, progress, start_date, end_date, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO projects (name, category, tags, client, assigned_to, status, priority, progress, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, category || '', tags || '', client || '', assigned_to || '', status || 'Pending', priority || 'Medium', progress || 0, start_date || null, end_date || null, description || '']
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
    try {
        const { name, category, tags, client, assigned_to, status, priority, progress, start_date, end_date, description } = req.body;
        await pool.query(
            'UPDATE projects SET name=?, category=?, tags=?, client=?, assigned_to=?, status=?, priority=?, progress=?, start_date=?, end_date=?, description=? WHERE id=?',
            [name, category, tags, client, assigned_to, status, priority, progress, start_date, end_date, description, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Tasks API ──────────────────────────────────────────────────────────
app.get('/api/tasks', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT t.*, p.name as project_name, u.name as assigned_to_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN users u ON t.assigned_to = u.id
            ORDER BY t.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/tasks', authenticate, async (req, res) => {
    try {
        const { title, description, project_id, assigned_to, status, priority, due_date } = req.body;
        const [result] = await pool.query(
            'INSERT INTO tasks (title, description, project_id, assigned_to, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', project_id || null, assigned_to || null, status || 'To Do', priority || 'Medium', due_date || null]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
    try {
        const { title, description, project_id, assigned_to, status, priority, due_date } = req.body;
        await pool.query(
            'UPDATE tasks SET title=?, description=?, project_id=?, assigned_to=?, status=?, priority=?, due_date=? WHERE id=?',
            [title, description, project_id, assigned_to, status, priority, due_date, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── User Notes API ─────────────────────────────────────────────────────
app.get('/api/notes/all', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT user_notes.*, users.name as user_name 
            FROM user_notes 
            LEFT JOIN users ON user_notes.user_id = users.id 
            ORDER BY user_notes.created_at DESC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/notes', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM user_notes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/notes', authenticate, async (req, res) => {
    try {
        const { title, content, color } = req.body;
        const [result] = await pool.query(
            'INSERT INTO user_notes (user_id, title, content, color) VALUES (?, ?, ?, ?)',
            [req.user.id, title, content || '', color || 'yellow']
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/notes/:id', authenticate, async (req, res) => {
    try {
        const { title, content, color } = req.body;
        await pool.query(
            'UPDATE user_notes SET title=?, content=?, color=? WHERE id=? AND user_id=?',
            [title, content, color, req.params.id, req.user.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/notes/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM user_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 2: Accounting API ────────────────────────────────────────────
app.get('/api/accounting', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM accounting ORDER BY date DESC, created_at DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/accounting', authenticate, async (req, res) => {
    try {
        const { type, amount, reason, date, assignedTo } = req.body;
        const [result] = await pool.query(
            'INSERT INTO accounting (type, amount, reason, date, assigned_to) VALUES (?, ?, ?, ?, ?)',
            [type, amount, reason, date, assignedTo || 'Everyone']
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/accounting/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM accounting WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 2: Invoices API ──────────────────────────────────────────────
app.get('/api/invoices', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT i.*, c.name as client_name 
            FROM invoices i 
            JOIN customers c ON i.client_id = c.id 
            ORDER BY i.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/invoices', authenticate, async (req, res) => {
    try {
        const { invoiceNo, client_id, items, totalAmount, paidAmount, paymentMethod, notes, date, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO invoices (invoice_no, client_id, items, total_amount, paid_amount, payment_method, notes, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [invoiceNo, client_id, JSON.stringify(items), totalAmount, paidAmount || 0, paymentMethod, notes || '', date, status]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/invoices/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 2: Quotations API ────────────────────────────────────────────
app.get('/api/quotations', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT q.*, c.name as client_name 
            FROM quotations q 
            JOIN customers c ON q.client_id = c.id 
            ORDER BY q.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/quotations', authenticate, async (req, res) => {
    try {
        const { quoteNo, client_id, items, totalAmount, validity, notes, date, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO quotations (quote_no, client_id, items, total_amount, validity, notes, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [quoteNo, client_id, JSON.stringify(items), totalAmount, validity || null, notes || '', date, status]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/quotations/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM quotations WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 3: Mail Box API ──────────────────────────────────────────────
app.get('/api/mail', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT m.*, u.name as sender_name 
            FROM internal_mail m 
            JOIN users u ON m.sender_id = u.id 
            WHERE m.receiver_id = ? 
            ORDER BY m.created_at DESC
        `;
        const [rows] = await pool.query(query, [req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/mail', authenticate, async (req, res) => {
    try {
        const { receiver_id, subject, body } = req.body;
        const [result] = await pool.query(
            'INSERT INTO internal_mail (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)',
            [req.user.id, receiver_id, subject, body]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/mail/:id/read', authenticate, async (req, res) => {
    try {
        await pool.query('UPDATE internal_mail SET status = "Read" WHERE id = ? AND receiver_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 3: Leaves API ────────────────────────────────────────────────
app.get('/api/leaves/my', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/leaves/admin', authenticate, async (req, res) => {
    try {
        const canViewLeaves = req.user.permissions?.leaves?.view;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canViewLeaves) return res.status(403).json({ error: 'Unauthorized' });
        const query = `
            SELECT l.*, u.name as user_name, u.role as user_role 
            FROM leaves l 
            JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/leaves', authenticate, async (req, res) => {
    try {
        const { type, start_date, end_date, reason } = req.body;
        const [result] = await pool.query(
            'INSERT INTO leaves (user_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, type, start_date, end_date, reason]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/leaves/:id/action', authenticate, async (req, res) => {
    try {
        const canEditLeaves = req.user.permissions?.leaves?.edit;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canEditLeaves) return res.status(403).json({ error: 'Unauthorized' });
        const { action } = req.body; // 'Approved' or 'Rejected'
        await pool.query('UPDATE leaves SET status = ? WHERE id = ?', [action, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/leaves/:id', authenticate, async (req, res) => {
    try {
        const canDeleteLeaves = req.user.permissions?.leaves?.delete;
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && !canDeleteLeaves) return res.status(403).json({ error: 'Unauthorized' });
        await pool.query('DELETE FROM leaves WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 3: Meetings API ──────────────────────────────────────────────
app.get('/api/meetings', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT m.*, u.name as assigned_to_name 
            FROM meetings m 
            LEFT JOIN users u ON m.assigned_to = u.id 
            ORDER BY m.date ASC, m.time ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/meetings', authenticate, async (req, res) => {
    try {
        const { title, description, date, time, link, assigned_to } = req.body;
        const [result] = await pool.query(
            'INSERT INTO meetings (title, description, date, time, link, assigned_to) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || '', date, time || '', link || '', assigned_to || null]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/meetings/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM meetings WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 3: File Manager API ──────────────────────────────────────────
app.get('/api/files', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT f.*, u.name as uploaded_by_name 
            FROM files f 
            LEFT JOIN users u ON f.uploaded_by = u.id 
            ORDER BY f.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/files', authenticate, async (req, res) => {
    try {
        const { name, type, size, url, folder } = req.body;
        const [result] = await pool.query(
            'INSERT INTO files (name, type, size, url, uploaded_by, folder) VALUES (?, ?, ?, ?, ?, ?)',
            [name, type, size, url, req.user.id, folder || 'General']
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/files/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM files WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 3: Team Chat API ─────────────────────────────────────────────
app.get('/api/chat/:channel', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT c.*, u.name as user_name 
            FROM chat_messages c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.channel = ? 
            ORDER BY c.created_at ASC
        `;
        const [rows] = await pool.query(query, [req.params.channel]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/chat', authenticate, async (req, res) => {
    try {
        const { channel, message } = req.body;
        const [result] = await pool.query(
            'INSERT INTO chat_messages (channel, user_id, message) VALUES (?, ?, ?)',
            [channel, req.user.id, message]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 4: Support Tickets API ───────────────────────────────────────
app.get('/api/support-tickets', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT t.*, c.name as client_name 
            FROM support_tickets t 
            LEFT JOIN customers c ON t.client_id = c.id 
            ORDER BY t.created_at DESC
        `;
        const [rows] = await pool.query(query);

        // Fetch messages for each ticket
        for (let t of rows) {
            const [msgs] = await pool.query('SELECT * FROM support_ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC', [t.id]);
            t.messages = msgs;
        }
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/support-tickets', authenticate, async (req, res) => {
    try {
        const { ticket_id, subject, client_id, priority } = req.body;
        const [result] = await pool.query(
            'INSERT INTO support_tickets (ticket_id, subject, client_id, priority) VALUES (?, ?, ?, ?)',
            [ticket_id, subject, client_id, priority]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/support-tickets/:id/messages', authenticate, async (req, res) => {
    try {
        const { sender_name, message } = req.body;
        const [result] = await pool.query(
            'INSERT INTO support_ticket_messages (ticket_id, sender_name, message) VALUES (?, ?, ?)',
            [req.params.id, sender_name, message]
        );
        // Also update ticket updated_at and status if needed (simulate activity)
        await pool.query('UPDATE support_tickets SET status = "In Progress" WHERE id = ? AND status = "Open"', [req.params.id]);
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/support-tickets/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE support_tickets SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Phase 4: Client Reports API ────────────────────────────────────────
app.get('/api/client-reports', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT r.*, c.name as client_name 
            FROM client_reports r 
            LEFT JOIN customers c ON r.client_id = c.id 
            ORDER BY r.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/client-reports', authenticate, async (req, res) => {
    try {
        const { client_id, title, category, file_url, notes, date } = req.body;
        const [result] = await pool.query(
            'INSERT INTO client_reports (client_id, title, category, file_url, notes, date) VALUES (?, ?, ?, ?, ?, ?)',
            [client_id, title, category, file_url || '', notes || '', date]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/client-reports/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM client_reports WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── Telecalling API Endpoints ────────────────────────────────────────

app.get('/api/telecalling/assigned', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT * FROM customers 
            WHERE JSON_CONTAINS(assigned_to, CAST(? AS JSON), '$') AND status NOT IN ('Converted', 'Not Interested', 'NI', 'Appointment', 'Callback') 
            ORDER BY last_dial_date ASC, created_at DESC
        `;
        const [rows] = await pool.query(query, [req.user.id]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/telecalling/bulk-assign', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const { lead_ids, employee_id } = req.body;
        if (!lead_ids || !lead_ids.length || !employee_id) return res.status(400).json({ error: 'Missing parameters' });
        
        let assignedToStr = '[]';
        if (Array.isArray(employee_id)) {
            assignedToStr = JSON.stringify(employee_id.map(id => parseInt(id, 10)).filter(id => !isNaN(id)));
        } else {
            assignedToStr = JSON.stringify([parseInt(employee_id, 10)]);
        }
        await pool.query(
            'UPDATE customers SET assigned_to = ? WHERE id IN (?)',
            [assignedToStr, lead_ids]
        );
        res.json({ success: true, message: 'Leads assigned successfully' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/telecalling/feedback', authenticate, async (req, res) => {
    try {
        const { customer_id, status, notes, callback_time, duration } = req.body;
        
        await pool.query(
            'INSERT INTO call_logs (customer_id, employee_id, status, notes, callback_time, duration) VALUES (?, ?, ?, ?, ?, ?)',
            [customer_id, req.user.id, status, notes, callback_time || null, duration || 0]
        );
        
        await pool.query(
            'UPDATE customers SET status = ?, last_dial_date = NOW() WHERE id = ?',
            [status, customer_id]
        );
        
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/telecalling/reports', authenticate, async (req, res) => {
    try {
        const [totalLeads] = await pool.query("SELECT COUNT(*) as count FROM customers WHERE status != 'Converted'");
        const [totalCalls] = await pool.query("SELECT COUNT(*) as count FROM call_logs");
        const [appointments] = await pool.query("SELECT COUNT(*) as count FROM customers WHERE status = 'Appointment'");
        const [notInterested] = await pool.query("SELECT COUNT(*) as count FROM customers WHERE status IN ('Not Interested', 'NI')");
        
        res.json({
            totalLeads: totalLeads[0].count,
            totalCalls: totalCalls[0].count,
            appointments: appointments[0].count,
            notInterested: notInterested[0].count
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/telecalling/callbacks', authenticate, async (req, res) => {
    try {
        let query = `
            SELECT c.*, l.notes as last_note, l.callback_time 
            FROM customers c
            LEFT JOIN (
                SELECT customer_id, MAX(id) as max_id
                FROM call_logs
                GROUP BY customer_id
            ) l_max ON c.id = l_max.customer_id
            LEFT JOIN call_logs l ON l_max.max_id = l.id
            WHERE c.status = 'Call Later'
            ORDER BY l.callback_time ASC
        `;
        let params = [];
        if (req.user.role !== 'admin') {
            query = `
                SELECT c.*, l.notes as last_note, l.callback_time 
                FROM customers c
                LEFT JOIN (
                    SELECT customer_id, MAX(id) as max_id
                    FROM call_logs
                    GROUP BY customer_id
                ) l_max ON c.id = l_max.customer_id
                LEFT JOIN call_logs l ON l_max.max_id = l.id
                WHERE JSON_CONTAINS(c.assigned_to, CAST(? AS JSON), '$') AND c.status = 'Call Later'
                ORDER BY l.callback_time ASC
            `;
            params = [req.user.id];
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/telecalling/appointments', authenticate, async (req, res) => {
    try {
        let query = `
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
        let params = [];
        if (req.user.role !== 'admin') {
            query = `
                SELECT c.*, l.notes as last_note, l.callback_time 
                FROM customers c
                LEFT JOIN (
                    SELECT customer_id, MAX(id) as max_id
                    FROM call_logs
                    GROUP BY customer_id
                ) l_max ON c.id = l_max.customer_id
                LEFT JOIN call_logs l ON l_max.max_id = l.id
                WHERE JSON_CONTAINS(c.assigned_to, CAST(? AS JSON), '$') AND c.status = 'Appointment'
                ORDER BY l.callback_time ASC
            `;
            params = [req.user.id];
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/telecalling/nibox', authenticate, async (req, res) => {
    try {
        let query = `
            SELECT * FROM customers 
            WHERE status IN ('Not Interested', 'NI')
            ORDER BY last_dial_date DESC
        `;
        let params = [];
        if (req.user.role !== 'admin') {
            query = `
                SELECT * FROM customers 
                WHERE JSON_CONTAINS(assigned_to, CAST(? AS JSON), '$') AND status IN ('Not Interested', 'NI')
                ORDER BY last_dial_date DESC
            `;
            params = [req.user.id];
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Get Call History for a Lead
app.get('/api/customers/:id/history', authenticate, async (req, res) => {
  try {
    const [logs] = await pool.query('SELECT * FROM call_logs WHERE customer_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Global Call History
app.get('/api/telecalling/history/all', authenticate, async (req, res) => {
    try {
        const query = `
            SELECT l.*, c.name as customer_name, c.phone, u.name as employee_name
            FROM call_logs l
            LEFT JOIN customers c ON l.customer_id = c.id
            LEFT JOIN users u ON l.employee_id = u.id
            ORDER BY l.created_at DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

