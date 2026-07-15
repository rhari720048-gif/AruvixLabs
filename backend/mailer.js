const nodemailer = require('nodemailer');
require('dotenv').config();

// pool is passed in to avoid circular dependency
let _pool = null;
const setPool = (pool) => { _pool = pool; };

// ── Load SMTP config from DB (falls back to .env) ──────────────────────────
const loadSmtpConfig = async () => {
    if (_pool) {
        try {
            const [rows] = await _pool.query('SELECT * FROM smtp_settings LIMIT 1');
            if (rows.length > 0) {
                const r = rows[0];
                return {
                    host:       r.mail_host,
                    port:       r.mail_port,
                    secure:     r.mail_secure === 1,
                    user:       r.mail_user,
                    pass:       r.mail_pass,
                    fromName:   r.mail_from_name,
                    fromEmail:  r.mail_from_email || r.mail_user,
                };
            }
        } catch (e) {
            console.warn('Could not load SMTP from DB, using .env fallback:', e.message);
        }
    }
    // .env fallback
    return {
        host:      process.env.MAIL_HOST      || 'smtp.gmail.com',
        port:      parseInt(process.env.MAIL_PORT || '587'),
        secure:    process.env.MAIL_SECURE === 'true',
        user:      process.env.MAIL_USER      || '',
        pass:      process.env.MAIL_PASS      || '',
        fromName:  process.env.MAIL_FROM_NAME || 'AruvixLabs CRM',
        fromEmail: process.env.MAIL_FROM_EMAIL || process.env.MAIL_USER || '',
    };
};

// ── Create transporter from live DB config ──────────────────────────────────
const createTransporter = async () => {
    const cfg = await loadSmtpConfig();
    return {
        transporter: nodemailer.createTransport({
            host:   cfg.host,
            port:   cfg.port,
            secure: cfg.secure,
            auth:   { user: cfg.user, pass: cfg.pass },
        }),
        from: `"${cfg.fromName}" <${cfg.fromEmail}>`,
    };
};

// ── Welcome Email ────────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ name, email, password, role }) => {
    const { transporter, from } = await createTransporter();

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        body { margin:0; padding:0; background:#f4f4f7; font-family:'Segoe UI',Arial,sans-serif; }
        .wrapper { max-width:600px; margin:40px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
        .header { background:linear-gradient(135deg,#6366f1,#8b5cf6); padding:40px 40px 30px; text-align:center; }
        .header h1 { color:white; margin:0; font-size:26px; letter-spacing:-0.5px; }
        .header p  { color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:15px; }
        .body { padding:36px 40px; }
        .greeting { font-size:20px; font-weight:700; color:#111827; margin:0 0 12px; }
        .text { color:#4b5563; font-size:15px; line-height:1.7; margin:0 0 24px; }
        .creds-box { background:#f5f3ff; border:1.5px solid #ede9fe; border-radius:12px; padding:24px; margin:24px 0; }
        .creds-row { margin-bottom:16px; }
        .creds-row:last-child { margin-bottom:0; }
        .label { font-size:12px; font-weight:700; color:#7c3aed; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
        .value { font-size:16px; font-weight:600; color:#1f2937; font-family:monospace; word-break:break-all; }
        .badge { display:inline-block; background:#ede9fe; color:#6d28d9; font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; text-transform:capitalize; }
        .btn-wrap { text-align:center; margin:28px 0; }
        .btn { display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; text-decoration:none; padding:14px 36px; border-radius:10px; font-weight:700; font-size:15px; }
        .warning { background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px 18px; font-size:13px; color:#92400e; margin:20px 0; }
        .footer { background:#f9fafb; padding:24px 40px; text-align:center; color:#9ca3af; font-size:13px; border-top:1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>🎉 Welcome to AruvixLabs CRM</h1>
          <p>Your account has been created by the Admin</p>
        </div>
        <div class="body">
          <p class="greeting">Hello, ${name}! 👋</p>
          <p class="text">You have been added to <strong>AruvixLabs CRM</strong>. Below are your login credentials. Please log in and change your password immediately.</p>
          <div class="creds-box">
            <div class="creds-row"><div class="label">Login URL</div><div class="value">http://localhost:5173/login</div></div>
            <div class="creds-row"><div class="label">Email Address</div><div class="value">${email}</div></div>
            <div class="creds-row"><div class="label">Temporary Password</div><div class="value">${password}</div></div>
            <div class="creds-row"><div class="label">Your Role</div><div class="value"><span class="badge">${role}</span></div></div>
          </div>
          <div class="warning">⚠️ <strong>Important:</strong> Please change your password after your first login.</div>
          <div class="btn-wrap"><a href="http://localhost:5173/login" class="btn">Login to CRM →</a></div>
          <p class="text" style="margin:0;">If you have any issues, please contact your administrator.</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} AruvixLabs CRM &nbsp;·&nbsp; This is an automated message.</div>
      </div>
    </body>
    </html>`;

    return await transporter.sendMail({ from, to: email, subject: `🎉 Welcome to AruvixLabs CRM — Your Login Details`, html });
};

// ── Test SMTP connection ─────────────────────────────────────────────────────
const testConnection = async () => {
    const { transporter } = await createTransporter();
    await transporter.verify();
    return true;
};

module.exports = { sendWelcomeEmail, testConnection, setPool };
