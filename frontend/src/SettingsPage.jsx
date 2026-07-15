import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, FileText, CheckCircle, Upload, Shield, Trash2, Mail, Server, LayoutTemplate, Bell, Send, Eye, EyeOff, Wifi } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'invoice', 'permissions', 'mail'
  const [successMessage, setSuccessMessage] = useState('');

  const [roles, setRoles] = useState([
    { id: 1, name: 'Admin', permissions: { leads: true, clients: true, invoices: true, files: true, calendar: true, settings: true } },
    { id: 2, name: 'Employee', permissions: { leads: true, clients: false, invoices: false, files: true, calendar: true, settings: false } }
  ]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState({ leads: false, clients: false, invoices: false, files: false, calendar: false, settings: false });

  const [companyForm, setCompanyForm] = useState({
    companyName: 'AruvixLabs',
    address: '123 Tech Park, Chennai, India',
    phone: '+91 9876543210',
    email: 'contact@aruvixlabs.com',
    logo: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    prefix: 'INV-',
    watermark: '',
    terms: '1. Please pay within 15 days of receiving this invoice.\n2. Late payment is subject to a 2% monthly fee.'
  });

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    showSuccess('Company details updated successfully!');
  };

  const handleInvoiceSubmit = (e) => {
    e.preventDefault();
    showSuccess('Invoice settings updated successfully!');
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    if (!newRoleName) return;
    setRoles([...roles, { id: Date.now(), name: newRoleName, permissions: newRolePermissions }]);
    showSuccess('Role created successfully!');
    setNewRoleName('');
    setNewRolePermissions({ leads: false, clients: false, invoices: false, files: false, calendar: false, settings: false });
  };

  const handleDeleteRole = (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== id));
      showSuccess('Role deleted successfully!');
    }
  };

  return (
    <div className="settings-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('company')}
          style={{ padding: '12px 24px', background: activeTab === 'company' ? 'var(--primary)' : 'transparent', color: activeTab === 'company' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <Building size={18} /> Company Details
        </button>
        <button 
          onClick={() => setActiveTab('invoice')}
          style={{ padding: '12px 24px', background: activeTab === 'invoice' ? 'var(--primary)' : 'transparent', color: activeTab === 'invoice' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <FileText size={18} /> Invoice Settings
        </button>
        <button 
          onClick={() => setActiveTab('permissions')}
          style={{ padding: '12px 24px', background: activeTab === 'permissions' ? 'var(--primary)' : 'transparent', color: activeTab === 'permissions' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <Shield size={18} /> Permissions & Roles
        </button>
        <button 
          onClick={() => setActiveTab('mail')}
          style={{ padding: '12px 24px', background: activeTab === 'mail' ? 'var(--primary)' : 'transparent', color: activeTab === 'mail' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <Mail size={18} /> Mail
        </button>
      </div>

      <div className="page-content">
        {successMessage && (
          <div style={{ maxWidth: '600px', padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}

        {activeTab === 'company' && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Company Details</h2>
            
            <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Company Name</label>
                <input type="text" value={companyForm.companyName} onChange={e => setCompanyForm({...companyForm, companyName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Company Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f3f4f6', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {companyForm.logo ? <img src={companyForm.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <Building size={24} color="#9ca3af" />}
                  </div>
                  <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} /> Upload New Logo
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                      if (e.target.files[0]) {
                         // Mocking upload by creating a local URL for preview
                         setCompanyForm({...companyForm, logo: URL.createObjectURL(e.target.files[0])});
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Business Address</label>
                <textarea value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '60px' }} required></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Phone Number</label>
                  <input type="tel" value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email Address</label>
                  <input type="email" value={companyForm.email} onChange={e => setCompanyForm({...companyForm, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Save Company Details
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Invoice Settings</h2>
            
            <form onSubmit={handleInvoiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Invoice Prefix</label>
                <input type="text" value={invoiceForm.prefix} onChange={e => setInvoiceForm({...invoiceForm, prefix: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. INV-" required />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Invoices will be generated as {invoiceForm.prefix}001, {invoiceForm.prefix}002, etc.</p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Watermark Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f3f4f6', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {invoiceForm.watermark ? <img src={invoiceForm.watermark} alt="Watermark" style={{ maxWidth: '100%', maxHeight: '100%', opacity: 0.5 }} /> : <FileText size={24} color="#9ca3af" />}
                  </div>
                  <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} /> Upload Watermark
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                      if (e.target.files[0]) {
                         setInvoiceForm({...invoiceForm, watermark: URL.createObjectURL(e.target.files[0])});
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Default Terms and Conditions</label>
                <textarea value={invoiceForm.terms} onChange={e => setInvoiceForm({...invoiceForm, terms: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '120px' }} required></textarea>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>These terms will be automatically attached to the bottom of new invoices.</p>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Create New Role</h2>
              
              <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Role Name</label>
                  <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. Sales Manager" required />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Permissions</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.keys(newRolePermissions).map(perm => (
                      <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#4b5563' }}>
                        <input 
                          type="checkbox" 
                          checked={newRolePermissions[perm]} 
                          onChange={(e) => setNewRolePermissions({...newRolePermissions, [perm]: e.target.checked})}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} /> Create Role
                  </button>
                </div>
              </form>
            </div>
            
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Existing Roles</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {roles.map(role => (
                  <div key={role.id} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{role.name}</span>
                      <button onClick={() => handleDeleteRole(role.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete Role"><Trash2 size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {Object.entries(role.permissions).map(([perm, hasPerm]) => hasPerm && (
                        <span key={perm} style={{ fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mail' && <MailSettingsPanel showSuccess={showSuccess} />}
      </div>
    </div>
  );
};

// ─── Mail Settings Panel ───────────────────────────────────────────────────
const MailSettingsPanel = ({ showSuccess }) => {
  const [mailTab, setMailTab] = useState('smtp');
  const [showPass, setShowPass] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [smtp, setSmtp] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    username: '',
    password: '',
    encryption: 'TLS',
    senderName: 'AruvixLabs CRM',
    senderEmail: 'noreply@aruvixlabs.com',
  });

  const [templates, setTemplates] = useState([
    { id: 1, name: 'Welcome Email', subject: 'Welcome to AruvixLabs CRM!', body: 'Hi {{name}},\n\nWelcome aboard! Your account is ready.\n\nBest regards,\nAruvixLabs Team', active: true },
    { id: 2, name: 'Invoice Sent',  subject: 'Invoice {{invoice_no}} from AruvixLabs', body: 'Dear {{client_name}},\n\nPlease find attached invoice {{invoice_no}} for {{amount}}.\n\nDue Date: {{due_date}}\n\nThank you!', active: true },
    { id: 3, name: 'Follow-up Reminder', subject: 'Following up on your enquiry', body: 'Hi {{name}},\n\nJust checking in to see if you had a chance to review our proposal.\n\nPlease feel free to reach out!\n\nBest,\nAruvixLabs Team', active: false },
  ]);
  const [editingTpl, setEditingTpl] = useState(null);

  const [notifications, setNotifications] = useState([
    { id: 'lead_assigned',    label: 'Lead Assigned',          desc: 'Notify when a lead is assigned to an employee',    enabled: true  },
    { id: 'invoice_sent',     label: 'Invoice Sent',           desc: 'Notify client when an invoice is emailed',         enabled: true  },
    { id: 'ticket_created',   label: 'Support Ticket Created', desc: 'Notify admin when a new support ticket is raised', enabled: true  },
    { id: 'ticket_resolved',  label: 'Support Ticket Resolved',desc: 'Notify client when their ticket is resolved',      enabled: false },
    { id: 'daily_digest',     label: 'Daily Digest Email',     desc: 'Send a daily summary to admin every morning',      enabled: false },
    { id: 'weekly_report',    label: 'Weekly Report',          desc: 'Send a weekly performance report to admin',        enabled: true  },
    { id: 'payment_received', label: 'Payment Received',       desc: 'Notify admin when a payment is logged',           enabled: true  },
    { id: 'project_deadline', label: 'Project Deadline Alert', desc: 'Remind team 2 days before a project deadline',    enabled: false },
  ]);

  const card = { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', padding: '28px' };
  const inp  = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '14px', color: '#1f2937', background: '#fafafa', boxSizing: 'border-box' };
  const label= { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' };

  const mailSubTabs = [
    { key: 'smtp',          label: 'SMTP Configuration', icon: <Server size={16} />      },
    { key: 'templates',     label: 'Email Templates',    icon: <LayoutTemplate size={16} /> },
    { key: 'notifications', label: 'Notification Rules', icon: <Bell size={16} />         },
  ];

  const API = 'http://localhost:5000/api';
  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  // Load SMTP settings from backend on mount
  useEffect(() => {
    fetch(`${API}/config/email`, { headers: authHeader })
      .then(r => r.json())
      .then(data => {
        if (data.host) {
          setSmtp({
            host:        data.host        || 'smtp.gmail.com',
            port:        String(data.port || '587'),
            username:    data.username    || '',
            password:    data.password    || '',   // will be '••••••••' if set
            encryption:  data.secure ? 'SSL' : 'TLS',
            senderName:  data.senderName  || 'AruvixLabs CRM',
            senderEmail: data.senderEmail || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSmtpSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/config/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          host:        smtp.host,
          port:        smtp.port,
          secure:      smtp.encryption === 'SSL',
          username:    smtp.username,
          password:    smtp.password,
          senderName:  smtp.senderName,
          senderEmail: smtp.senderEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) showSuccess('✅ SMTP settings saved to database!');
      else showSuccess('❌ Error: ' + data.error);
    } catch (error) { console.error('FETCH ERROR:', error);
      showSuccess('❌ Could not connect to backend.');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API}/config/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
      });
      setTestResult(res.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    }
    setTesting(false);
  };

  const handleToggleNotif = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
  };
  const handleSaveNotifications = () => showSuccess('Notification rules saved!');

  const handleSaveTemplate = () => {
    setTemplates(templates.map(t => t.id === editingTpl.id ? editingTpl : t));
    setEditingTpl(null);
    showSuccess('Email template saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '780px' }}>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: '10px', background: '#f3f4f6', padding: '6px', borderRadius: '10px', width: 'fit-content' }}>
        {mailSubTabs.map(t => (
          <button key={t.key} onClick={() => setMailTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: mailTab === t.key ? 'white' : 'transparent', color: mailTab === t.key ? '#6366f1' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: mailTab === t.key ? '700' : '500', fontSize: '14px', cursor: 'pointer', boxShadow: mailTab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: '0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── SMTP Tab ── */}
      {mailTab === 'smtp' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '17px' }}>SMTP Configuration</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Configure your outgoing mail server</p>
            </div>
          </div>

          <form onSubmit={handleSmtpSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={label}>SMTP Host</label>
                <input value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} style={inp} placeholder="e.g. smtp.gmail.com" />
              </div>
              <div>
                <label style={label}>Port</label>
                <select value={smtp.port} onChange={e => setSmtp({ ...smtp, port: e.target.value })} style={inp}>
                  <option value="25">25 (SMTP)</option>
                  <option value="465">465 (SSL)</option>
                  <option value="587">587 (TLS)</option>
                  <option value="2525">2525 (Alt)</option>
                </select>
              </div>
              <div>
                <label style={label}>Encryption</label>
                <select value={smtp.encryption} onChange={e => setSmtp({ ...smtp, encryption: e.target.value })} style={inp}>
                  <option value="TLS">TLS / STARTTLS</option>
                  <option value="SSL">SSL</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label style={label}>Username / Email</label>
                <input value={smtp.username} onChange={e => setSmtp({ ...smtp, username: e.target.value })} style={inp} placeholder="your@email.com" />
              </div>
              <div>
                <label style={label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={smtp.password} onChange={e => setSmtp({ ...smtp, password: e.target.value })} autoComplete="new-password" style={{ ...inp, paddingRight: '40px' }} placeholder="App password or SMTP password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={label}>Sender Name</label>
                <input value={smtp.senderName} onChange={e => setSmtp({ ...smtp, senderName: e.target.value })} style={inp} placeholder="AruvixLabs CRM" />
              </div>
              <div>
                <label style={label}>Sender Email</label>
                <input type="email" value={smtp.senderEmail} onChange={e => setSmtp({ ...smtp, senderEmail: e.target.value })} style={inp} placeholder="noreply@yourcompany.com" />
              </div>
            </div>

            {/* Test connection result */}
            {testResult === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', color: '#065f46', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                <CheckCircle size={16} /> Connection successful! SMTP is working correctly.
              </div>
            )}
            {testResult === 'error' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', color: '#dc2626', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                ✕ Connection failed. Please check your credentials.
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button type="button" onClick={handleTestConnection} disabled={testing}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: testing ? '#e0e7ff' : '#eef2ff', color: '#4f46e5', border: '1.5px solid #c7d2fe', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: testing ? 'not-allowed' : 'pointer' }}>
                <Wifi size={16} /> {testing ? 'Testing...' : 'Test Connection'}
              </button>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
                <CheckCircle size={16} /> Save SMTP Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Templates Tab ── */}
      {mailTab === 'templates' && (
        <div>
          {editingTpl ? (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#111827' }}>Edit: {editingTpl.name}</h3>
                <button onClick={() => setEditingTpl(null)} style={{ background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}>✕ Cancel</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={label}>Subject Line</label>
                  <input value={editingTpl.subject} onChange={e => setEditingTpl({ ...editingTpl, subject: e.target.value })} style={inp} />
                  <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#9ca3af' }}>Use {'{{name}}'}, {'{{invoice_no}}'}, {'{{amount}}'}, {'{{due_date}}'}, {'{{client_name}}'} as variables</p>
                </div>
                <div>
                  <label style={label}>Email Body</label>
                  <textarea value={editingTpl.body} onChange={e => setEditingTpl({ ...editingTpl, body: e.target.value })} rows={10} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="tpl-active" checked={editingTpl.active} onChange={e => setEditingTpl({ ...editingTpl, active: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                  <label htmlFor="tpl-active" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>Active (send this template automatically)</label>
                </div>
                <div>
                  <button onClick={handleSaveTemplate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                    <CheckCircle size={16} /> Save Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutTemplate size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#111827', fontSize: '17px' }}>Email Templates</h3>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Manage auto-sent email templates</p>
                </div>
              </div>
              {templates.map(tpl => (
                <div key={tpl.id} style={{ ...card, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '10px', background: tpl.active ? '#eef2ff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={20} color={tpl.active ? '#6366f1' : '#9ca3af'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>{tpl.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>{tpl.subject}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', background: tpl.active ? '#d1fae5' : '#f3f4f6', color: tpl.active ? '#065f46' : '#9ca3af' }}>
                      {tpl.active ? '● Active' : '○ Inactive'}
                    </span>
                    <button onClick={() => setEditingTpl({ ...tpl })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {mailTab === 'notifications' && (
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '17px' }}>Notification Rules</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Control which email notifications are sent automatically</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: n.enabled ? '#fafeff' : '#f9fafb', border: `1.5px solid ${n.enabled ? '#c7d2fe' : '#e5e7eb'}`, borderRadius: '10px', transition: '0.2s' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{n.label}</div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>{n.desc}</div>
                </div>
                {/* Toggle Switch */}
                <button onClick={() => handleToggleNotif(n.id)}
                  style={{ position: 'relative', width: '48px', height: '26px', borderRadius: '13px', background: n.enabled ? '#6366f1' : '#d1d5db', border: 'none', cursor: 'pointer', transition: '0.3s', flexShrink: 0 }}>
                  <span style={{ position: 'absolute', top: '3px', left: n.enabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: '0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '22px' }}>
            <button onClick={handleSaveNotifications} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
              <CheckCircle size={16} /> Save Notification Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

