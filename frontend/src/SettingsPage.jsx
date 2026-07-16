import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, FileText, CheckCircle, Upload, Shield, Trash2, Mail, Server, LayoutTemplate, Bell, Send, Eye, EyeOff, Wifi, Pencil, UserPlus, ShieldCheck, Search, RefreshCw, Plus, User, X, Phone, Briefcase, MessageSquare, LayoutDashboard, ChevronDown } from 'lucide-react';
import { getPerms } from './permissions';

const getModulePermsFields = (moduleKey) => {
  if (moduleKey === 'mail') {
    return [
      { key: 'view',    lbl: 'View' },
      { key: 'inbox',   lbl: 'Inbox Tab' },
      { key: 'compose', lbl: 'Compose Tab' }
    ];
  }
  if (moduleKey === 'projects') {
    return [
      { key: 'view',           lbl: 'View Page' },
      { key: 'add_projects',   lbl: 'Add Projects Tab' },
      { key: 'all_projects',   lbl: 'All Projects Tab' },
      { key: 'assigned_to_me', lbl: 'Assign to me Tab' },
      { key: 'create',         lbl: 'Create' },
      { key: 'edit',           lbl: 'Edit' },
      { key: 'delete',         lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'tasks') {
    return [
      { key: 'view',           lbl: 'View Page' },
      { key: 'add_tasks',      lbl: 'Add Tasks Tab' },
      { key: 'all_tasks',      lbl: 'All Tasks Tab' },
      { key: 'assigned_to_me', lbl: 'Assign to me Tab' },
      { key: 'create',         lbl: 'Create' },
      { key: 'edit',           lbl: 'Edit' },
      { key: 'delete',         lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'leads') {
    return [
      { key: 'view',       lbl: 'View Page' },
      { key: 'add_leads',  lbl: 'Add Leads Tab' },
      { key: 'all_leads',  lbl: 'All Leads Tab' },
      { key: 'create',     lbl: 'Create' },
      { key: 'edit',       lbl: 'Edit' },
      { key: 'delete',     lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'clients') {
    return [
      { key: 'view',        lbl: 'View Page' },
      { key: 'add_clients', lbl: 'Add Clients Tab' },
      { key: 'all_clients', lbl: 'All Clients Tab' },
      { key: 'create',      lbl: 'Create' },
      { key: 'edit',        lbl: 'Edit' },
      { key: 'delete',      lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'meetings') {
    return [
      { key: 'view',             lbl: 'View Page' },
      { key: 'schedule_meeting', lbl: 'Schedule Meeting Tab' },
      { key: 'my_meetings',      lbl: 'My Meetings Tab' },
      { key: 'create',           lbl: 'Create' },
      { key: 'edit',             lbl: 'Edit' },
      { key: 'delete',           lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'accounting') {
    return [
      { key: 'view',             lbl: 'View Page' },
      { key: 'add_transaction',  lbl: 'Add Transaction Tab' },
      { key: 'transactions_list', lbl: 'Transactions List Tab' },
      { key: 'create',           lbl: 'Create' },
      { key: 'edit',             lbl: 'Edit' },
      { key: 'delete',           lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'invoices') {
    return [
      { key: 'view',           lbl: 'View Page' },
      { key: 'create_invoice', lbl: 'Create Invoice Tab' },
      { key: 'all_invoices',   lbl: 'All Invoices Tab' },
      { key: 'create',         lbl: 'Create' },
      { key: 'edit',           lbl: 'Edit' },
      { key: 'delete',         lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'quotes') {
    return [
      { key: 'view',         lbl: 'View Page' },
      { key: 'create_quote', lbl: 'Create Quote Tab' },
      { key: 'all_quotes',   lbl: 'All Quotes Tab' },
      { key: 'create',       lbl: 'Create' },
      { key: 'edit',         lbl: 'Edit' },
      { key: 'delete',       lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'leaves') {
    return [
      { key: 'view',            lbl: 'View Page' },
      { key: 'my_leaves',       lbl: 'My Leaves Tab' },
      { key: 'request_leave',   lbl: 'Request Leave Tab' },
      { key: 'manage_requests', lbl: 'Manage Requests Tab' },
      { key: 'create',          lbl: 'Create' },
      { key: 'edit',            lbl: 'Edit' },
      { key: 'delete',          lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'staff_attendance') {
    return [
      { key: 'view',              lbl: 'View Page' },
      { key: 'daily_logs',        lbl: 'Daily Log Tab' },
      { key: 'attendance_report', lbl: 'Attendance Report Tab' },
      { key: 'edit',              lbl: 'Edit' },
      { key: 'delete',            lbl: 'Delete' }
    ];
  }
  if (moduleKey === 'user_notes') {
    return [
      { key: 'view',        lbl: 'View Page' },
      { key: 'add_notes',   lbl: 'Add Notes Tab' },
      { key: 'all_notes',   lbl: 'All Notes Tab' },
      { key: 'my_notes',    lbl: 'My Notes Tab' },
      { key: 'create',      lbl: 'Create' },
      { key: 'edit',        lbl: 'Edit' },
      { key: 'delete',      lbl: 'Delete' }
    ];
  }
  return [
    { key: 'view',   lbl: 'View' },
    { key: 'create', lbl: 'Create' },
    { key: 'edit',   lbl: 'Edit' },
    { key: 'delete', lbl: 'Delete' }
  ];
};

const ToggleSwitch = ({ checked, onChange, disabled, color = '#6366f1' }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      disabled={disabled}
      style={{ opacity: 0, width: 0, height: 0 }} 
    />
    <span style={{
      position: 'absolute', cursor: disabled ? 'not-allowed' : 'pointer', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: checked ? color : '#e5e7eb', transition: '.2s', borderRadius: '20px', opacity: disabled ? 0.6 : 1
    }}>
      <span style={{
        position: 'absolute', height: '14px', width: '14px', left: checked ? '18px' : '3px', bottom: '3px',
        backgroundColor: 'white', transition: '.2s', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}></span>
    </span>
  </label>
);

const SettingsPage = () => {
  const { canEdit: canEditSettings } = getPerms('settings');
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'invoice', 'permissions', 'mail'
  const [successMessage, setSuccessMessage] = useState('');

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // ── Grouped module definitions ──────────────────────────────────────────
  const renderGroupIcon = (label, color, size = 16) => {
    switch (label) {
      case 'General':
        return <LayoutDashboard size={size} color={color} />;
      case 'CRM':
        return <UserPlus size={size} color={color} />;
      case 'Work Management':
        return <Briefcase size={size} color={color} />;
      case 'Finance':
        return <Building size={size} color={color} />;
      case 'HR & Attendance':
        return <ShieldCheck size={size} color={color} />;
      case 'Communication':
        return <MessageSquare size={size} color={color} />;
      default:
        return <Shield size={size} color={color} />;
    }
  };

  const moduleGroups = [
    {
      groupLabel: 'General',
      color: '#6366f1',
      modules: [
        { key: 'dashboard',       label: 'Dashboard'        },
        { key: 'profile',         label: 'My Profile'       },
        { key: 'mail',            label: 'Mail Box'         },
        { key: 'user_notes',      label: 'User Notes'       },
        { key: 'settings',        label: 'Settings'         },
      ]
    },
    {
      groupLabel: 'CRM',
      color: '#0ea5e9',
      modules: [
        { key: 'leads',           label: 'Leads'            },
        { key: 'clients',         label: 'Clients'          },
        { key: 'client_reports',  label: 'Client Reports'   },
      ]
    },
    {
      groupLabel: 'Work Management',
      color: '#8b5cf6',
      modules: [
        { key: 'projects',        label: 'Projects'         },
        { key: 'tasks',           label: 'Tasks'            },
        { key: 'meetings',        label: 'Meetings'         },
        { key: 'calendar',        label: 'Calendar'         },
        { key: 'files',           label: 'File Manager'     },
      ]
    },
    {
      groupLabel: 'Finance',
      color: '#10b981',
      modules: [
        { key: 'accounting',      label: 'Accounting'       },
        { key: 'invoices',        label: 'Invoices'         },
        { key: 'quotes',          label: 'Quotations'       },
      ]
    },
    {
      groupLabel: 'HR & Attendance',
      color: '#f59e0b',
      modules: [
        { key: 'staff_attendance',label: 'Staff Attendance' },
        { key: 'my_attendance',   label: 'My Attendance'    },
        { key: 'leaves',          label: 'Leave Management' },
        { key: 'user_management', label: 'User Management'  },
      ]
    },
    {
      groupLabel: 'Communication',
      color: '#ef4444',
      modules: [
        { key: 'team_chat',       label: 'Team Chat'        },
        { key: 'support',         label: 'Support Tickets'  },
      ]
    },
  ];

  const allModuleKeys = moduleGroups.flatMap(g => g.modules.map(m => m.key));
  const defaultPerms = {};
  allModuleKeys.forEach(m => {
    defaultPerms[m] = {};
    getModulePermsFields(m).forEach(f => {
      defaultPerms[m][f.key] = false;
    });
  });
  const [userPermissions, setUserPermissions] = useState(defaultPerms);

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(defaultPerms);
  const [expandedRoleGroup, setExpandedRoleGroup] = useState(null);
  
  // Add role state
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  
  // User modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', phone: '', role: '', password: '', status: 'Active' });
  const [editUserPermissions, setEditUserPermissions] = useState(defaultPerms);
  const [expandedEditUserGroup, setExpandedEditUserGroup] = useState(null);
  
  // Add User modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', phone: '', role: '', password: '', status: 'Active' });

  const [deleteUserId, setDeleteUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsersAndRoles = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const [usersRes, rolesRes] = await Promise.all([
        fetch('https://aruvixlabs.onrender.com/api/users', { headers }),
        fetch('https://aruvixlabs.onrender.com/api/roles', { headers }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

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

  const handleRolePermsSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedRole) return;
    
    // Validate role in DB
    const roleExists = roles.some(r => r.id === selectedRole.id);
    if (!roleExists) {
      alert(`Error: Role '${selectedRole.name}' does not exist in the database!`);
      return;
    }

    try {
      const res = await fetch(`https://aruvixlabs.onrender.com/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: selectedRole.name, permissions: rolePermissions })
      });
      if (res.ok) {
        setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions: rolePermissions } : r));
        showSuccess('Role permissions saved successfully!');
      } else {
        alert('Failed to save role permissions');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const res = await fetch('https://aruvixlabs.onrender.com/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newRoleName, permissions: defaultPerms })
      });
      if (res.ok) {
        const data = await res.json();
        const createdRole = { id: data.id, name: newRoleName, permissions: defaultPerms };
        setRoles([...roles, createdRole]);
        setSelectedRole(createdRole);
        setRolePermissions(defaultPerms);
        setShowAddRoleModal(false);
        setNewRoleName('');
        showSuccess(`Role '${newRoleName}' added successfully!`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create role');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`https://aruvixlabs.onrender.com/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editUserForm.name,
          email: editUserForm.email,
          phone: editUserForm.phone,
          role: editUserForm.role,
          status: editUserForm.status,
          password: editUserForm.password,
          permissions: editUserPermissions
        })
      });
      if (res.ok) {
        fetchUsersAndRoles();
        setShowEditModal(false);
        showSuccess('User details and permissions updated successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://aruvixlabs.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: addUserForm.name,
          email: addUserForm.email,
          phone: addUserForm.phone,
          role: addUserForm.role,
          password: addUserForm.password,
          status: addUserForm.status
        })
      });
      if (res.ok) {
        fetchUsersAndRoles();
        setShowAddUserModal(false);
        setAddUserForm({ name: '', email: '', phone: '', role: '', password: '', status: 'Active' });
        showSuccess('User created successfully!');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserDelete = async () => {
    if (!deleteUserId) return;
    try {
      const res = await fetch(`https://aruvixlabs.onrender.com/api/users/${deleteUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchUsersAndRoles();
        setDeleteUserId(null);
        showSuccess('User deleted successfully!');
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      console.error(err);
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
          <Shield size={18} /> User Permissions
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
                  {canEditSettings ? (
                    <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={14} /> Upload New Logo
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                        if (e.target.files[0]) {
                           // Mocking upload by creating a local URL for preview
                           setCompanyForm({...companyForm, logo: URL.createObjectURL(e.target.files[0])});
                        }
                      }} />
                    </label>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>Upload disabled</span>
                  )}
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

              {canEditSettings && (
                <div style={{ marginTop: '10px' }}>
                  <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} /> Save Company Details
                  </button>
                </div>
              )}
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
                  {canEditSettings ? (
                    <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Upload size={14} /> Upload Watermark
                      <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                        if (e.target.files[0]) {
                           setInvoiceForm({...invoiceForm, watermark: URL.createObjectURL(e.target.files[0])});
                        }
                      }} />
                    </label>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '500' }}>Upload disabled</span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Default Terms and Conditions</label>
                <textarea value={invoiceForm.terms} onChange={e => setInvoiceForm({...invoiceForm, terms: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '120px' }} required></textarea>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>These terms will be automatically attached to the bottom of new invoices.</p>
              </div>

              {canEditSettings && (
                <div style={{ marginTop: '10px' }}>
                  <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={18} /> Save Settings
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div>
            {/* ── 1. Roles & Default Permissions Section ── */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Manage Roles & Default Permissions</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Add custom roles and define their default page permissions</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select
                    value={selectedRole?.id || ''}
                    onChange={e => {
                      const roleObj = roles.find(r => String(r.id) === e.target.value);
                      if (roleObj) {
                        setSelectedRole(roleObj);
                        const loadedPerms = roleObj.permissions
                          ? (typeof roleObj.permissions === 'string' ? JSON.parse(roleObj.permissions) : roleObj.permissions)
                          : {};
                        const merged = {};
                        allModuleKeys.forEach(k => {
                          merged[k] = { ...(defaultPerms[k] || {}), ...(loadedPerms[k] || {}) };
                        });
                        setRolePermissions(merged);
                      } else {
                        setSelectedRole(null);
                        setRolePermissions(defaultPerms);
                      }
                    }}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', color: '#1f2937', background: 'white', minWidth: '220px', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="">— Select a role —</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  {canEditSettings && (
                    <button
                      type="button"
                      onClick={() => setShowAddRoleModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#c7d2fe'}
                      onMouseLeave={e => e.currentTarget.style.background = '#e0e7ff'}
                    >
                      <Plus size={16} /> Add Role
                    </button>
                  )}
                </div>
              </div>

              {selectedRole ? (
                <div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    {canEditSettings && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const all = {};
                            allModuleKeys.forEach(k => {
                              all[k] = {};
                              getModulePermsFields(k).forEach(f => { all[k][f.key] = true; });
                            });
                            setRolePermissions(all);
                          }}
                          style={{ padding: '8px 14px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ✓ Grant All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const all = {};
                            allModuleKeys.forEach(k => {
                              all[k] = {};
                              getModulePermsFields(k).forEach(f => { all[k][f.key] = false; });
                            });
                            setRolePermissions(all);
                          }}
                          style={{ padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ✕ Clear All
                        </button>
                        <button
                          onClick={handleRolePermsSubmit}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '12px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(99,102,241,0.3)' }}
                        >
                          <CheckCircle size={14} /> Save Role Permissions
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {moduleGroups.map(group => {
                      const isExpanded = expandedRoleGroup === group.groupLabel;
                      return (
                        <div key={group.groupLabel} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                          <div 
                            onClick={() => setExpandedRoleGroup(isExpanded ? null : group.groupLabel)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', background: isExpanded ? group.color + '10' : '#f9fafb', cursor: 'pointer', transition: '0.2s' }}
                          >
                            {renderGroupIcon(group.groupLabel, group.color, 18)}
                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#374151', flex: 1 }}>{group.groupLabel}</span>
                            
                            {canEditSettings && (
                              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginRight: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Category Toggle:</span>
                                <ToggleSwitch 
                                  checked={group.modules.every(m => getModulePermsFields(m.key).every(f => (rolePermissions[m.key] || {})[f.key]))}
                                  onChange={e => {
                                    const updated = { ...rolePermissions };
                                    group.modules.forEach(m => {
                                      updated[m.key] = {};
                                      getModulePermsFields(m.key).forEach(f => { updated[m.key][f.key] = e.target.checked; });
                                    });
                                    setRolePermissions(updated);
                                  }}
                                  color={group.color}
                                />
                              </div>
                            )}
                            <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', display: 'flex' }}>
                              <ChevronDown size={18} color="#6b7280" />
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div style={{ padding: '24px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {group.modules.map(({ key: module, label }) => {
                                  const perms = rolePermissions[module] || {};
                                  const fields = getModulePermsFields(module);
                                  const allChecked = fields.every(f => perms[f.key]);
                                  const updatePerm = (pKey, val) => {
                                    setRolePermissions(prev => ({
                                      ...prev,
                                      [module]: { ...(prev[module] || {}), [pKey]: val }
                                    }));
                                  };
                                  return (
                                    <div
                                      key={module}
                                      style={{ background: '#f9fafb', borderRadius: '8px', border: `1px solid ${allChecked ? group.color + '60' : '#e5e7eb'}`, padding: '16px', transition: '0.15s' }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#4b5563' }}>{label}</span>
                                        <ToggleSwitch 
                                          checked={!!allChecked}
                                          disabled={!canEditSettings}
                                          onChange={e => {
                                            const updatedModule = {};
                                            fields.forEach(f => { updatedModule[f.key] = e.target.checked; });
                                            setRolePermissions(prev => ({
                                              ...prev,
                                              [module]: updatedModule
                                            }));
                                          }}
                                          color={group.color}
                                        />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {fields.map(p => (
                                          <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '13px', color: perms[p.key] ? '#111827' : '#9ca3af', fontWeight: perms[p.key] ? '600' : '500' }}>{p.lbl}</span>
                                            <ToggleSwitch 
                                              checked={!!perms[p.key]}
                                              disabled={!canEditSettings}
                                              onChange={e => updatePerm(p.key, e.target.checked)}
                                              color={group.color}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                  <ShieldCheck size={36} style={{ opacity: 0.3, color: '#6366f1', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Select a role from the dropdown above to manage default access levels, or create a new custom role.</p>
                </div>
              )}
            </div>

            {/* ── 2. Unified User Permissions Table ── */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Team Member Access Control</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>View, update, or revoke access permissions for individual team members</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', width: '200px' }}
                    />
                  </div>

                  {canEditSettings && (
                    <button
                      onClick={() => setShowAddUserModal(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
                    >
                      <UserPlus size={15} /> Add User
                    </button>
                  )}
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['User', 'Email', 'Role', 'Allowed Modules', 'Actions'].map(col => (
                        <th key={col} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: '600', color: '#4b5563', fontSize: '12px', textTransform: 'uppercase' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((u, index) => {
                        const isUserAdmin = u.role?.toLowerCase() === 'admin';
                        const allowedKeys = Object.keys(u.permissions || {}).filter(k => u.permissions[k]?.view);
                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${(u.id * 80) % 360},60%,60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '600', color: '#111827' }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 18px', color: '#4b5563' }}>{u.email}</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', background: isUserAdmin ? '#ede9fe' : '#e0f2fe', color: isUserAdmin ? '#6d28d9' : '#0369a1', textTransform: 'uppercase' }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              {isUserAdmin ? (
                                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '12px' }}>Full Administrator Access</span>
                              ) : allowedKeys.length === 0 ? (
                                <span style={{ color: '#9ca3af', fontSize: '12px' }}>Dashboard & Profile Only</span>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '340px' }}>
                                  {allowedKeys.slice(0, 3).map(k => (
                                    <span key={k} style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', textTransform: 'capitalize' }}>
                                      {k.replace('_', ' ')}
                                    </span>
                                  ))}
                                  {allowedKeys.length > 3 && (
                                    <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: '700', alignSelf: 'center' }}>
                                      +{allowedKeys.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => {
                                    setViewingUser(u);
                                    setShowViewModal(true);
                                  }}
                                  title="View Access"
                                  style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#f3f4f6', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Eye size={14} />
                                </button>
                                {canEditSettings && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingUser(u);
                                        setEditUserForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role || 'employee', password: '', status: u.status || 'Active' });
                                        
                                        const loaded = u.permissions || {};
                                        const merged = {};
                                        allModuleKeys.forEach(k => {
                                          merged[k] = { ...(defaultPerms[k] || {}), ...(loaded[k] || {}) };
                                        });
                                        setEditUserPermissions(merged);
                                        setShowEditModal(true);
                                      }}
                                      title="Edit Permissions"
                                      style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#eef2ff', color: '#4338ca', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      <Pencil size={14} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteUserId(u.id)}
                                      title="Delete User"
                                      style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 3. MODALS ── */}

            {/* A. Add Role Modal */}
            {showAddRoleModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>Add Custom Role</h3>
                    <button onClick={() => setShowAddRoleModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleAddRoleSubmit}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Role Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CTO, Developer, Sales Executive"
                      value={newRoleName}
                      onChange={e => setNewRoleName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setShowAddRoleModal(false)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Create Role</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* B. Add User Modal */}
            {showAddUserModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>Add New Team Member</h3>
                    <button onClick={() => setShowAddUserModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
                  </div>
                  <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Full Name *</label>
                      <input type="text" required value={addUserForm.name} onChange={e => setAddUserForm({ ...addUserForm, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="John Doe" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Email Address *</label>
                      <input type="email" required value={addUserForm.email} onChange={e => setAddUserForm({ ...addUserForm, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="john@company.com" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Phone Number</label>
                      <input type="text" value={addUserForm.phone} onChange={e => setAddUserForm({ ...addUserForm, phone: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="+91 9876543210" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Role *</label>
                      <select required value={addUserForm.role} onChange={e => setAddUserForm({ ...addUserForm, role: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                        <option value="">Select Role</option>
                        {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password *</label>
                      <input type="password" required value={addUserForm.password} onChange={e => setAddUserForm({ ...addUserForm, password: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="Min 6 characters" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Status</label>
                      <select value={addUserForm.status} onChange={e => setAddUserForm({ ...addUserForm, status: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="button" onClick={() => setShowAddUserModal(false)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                      <button type="submit" style={{ flex: 1, padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Create User</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* C. View User Modal */}
            {showViewModal && viewingUser && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                        {viewingUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>{viewingUser.name}</h3>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6d28d9', background: '#ede9fe', padding: '2px 8px', borderRadius: '10px' }}>{viewingUser.role}</span>
                      </div>
                    </div>
                    <button onClick={() => setShowViewModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div><strong>Email:</strong> <span style={{ color: '#4b5563' }}>{viewingUser.email}</span></div>
                    <div><strong>Phone:</strong> <span style={{ color: '#4b5563' }}>{viewingUser.phone || '—'}</span></div>
                    <div><strong>Department:</strong> <span style={{ color: '#4b5563' }}>{viewingUser.department || '—'}</span></div>
                    <div><strong>Location:</strong> <span style={{ color: '#4b5563' }}>{viewingUser.location || '—'}</span></div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Bio:</strong> <span style={{ color: '#4b5563' }}>{viewingUser.bio || '—'}</span></div>
                  </div>

                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '700', color: '#374151' }}>Granted Module Permissions:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {moduleGroups.flatMap(g => g.modules).map(m => {
                      const perms = viewingUser.permissions?.[m.key] || {};
                      const fields = getModulePermsFields(m.key);
                      const act = [];
                      fields.forEach(f => {
                        if (perms[f.key]) act.push(f.lbl);
                      });
                      if (act.length === 0) return null;
                      return (
                        <div key={m.key} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' }}>
                          <strong>{m.label}:</strong> <span style={{ color: '#4f46e5', fontWeight: 600 }}>{act.join(', ')}</span>
                        </div>
                      );
                    })}
                    {Object.keys(viewingUser.permissions || {}).filter(k => viewingUser.permissions[k]?.view).length === 0 && (
                      <div style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic' }}>Dashboard and Profile access only. No other modules allowed.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* D. Edit User Modal */}
            {showEditModal && editingUser && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 700 }}>Edit User Details & Access</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Modify {editingUser.name}'s info and override role permissions</p>
                    </div>
                    <button onClick={() => setShowEditModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleUserUpdate}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Full Name *</label>
                        <input type="text" required value={editUserForm.name} onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Email *</label>
                        <input type="email" required value={editUserForm.email} onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Phone</label>
                        <input type="text" value={editUserForm.phone} onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Role *</label>
                        <select
                          required
                          value={editUserForm.role}
                          onChange={e => {
                            const newRole = e.target.value;
                            setEditUserForm({ ...editUserForm, role: newRole });
                            // Auto default user permissions to the new role permissions
                            const roleObj = roles.find(r => r.name.toLowerCase() === newRole.toLowerCase());
                            if (roleObj) {
                              const rPerms = roleObj.permissions
                                ? (typeof roleObj.permissions === 'string' ? JSON.parse(roleObj.permissions) : roleObj.permissions)
                                : {};
                              const merged = {};
                              allModuleKeys.forEach(k => {
                                merged[k] = { ...(defaultPerms[k] || {}), ...(rPerms[k] || {}) };
                              });
                              setEditUserPermissions(merged);
                            }
                          }}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
                        >
                          {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>New Password (optional)</label>
                        <input type="password" value={editUserForm.password} onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} placeholder="Leave blank to keep current" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Status</label>
                        <select value={editUserForm.status} onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #d1d5db', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: 'white' }}>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#374151' }}>Customize Permissions (Overrides Role)</h4>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const all = {};
                              allModuleKeys.forEach(k => {
                                all[k] = {};
                                getModulePermsFields(k).forEach(f => { all[k][f.key] = true; });
                              });
                              setEditUserPermissions(all);
                            }}
                            style={{ padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✓ Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const all = {};
                              allModuleKeys.forEach(k => {
                                all[k] = {};
                                getModulePermsFields(k).forEach(f => { all[k][f.key] = false; });
                              });
                              setEditUserPermissions(all);
                            }}
                            style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            ✕ Clear All
                          </button>
                        </div>
                      </div>

                      <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
                        {moduleGroups.map(group => {
                          const isExpanded = expandedEditUserGroup === group.groupLabel;
                          return (
                            <div key={group.groupLabel} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                              <div 
                                onClick={() => setExpandedEditUserGroup(isExpanded ? null : group.groupLabel)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: isExpanded ? group.color + '10' : '#f9fafb', cursor: 'pointer', transition: '0.2s' }}
                              >
                                {renderGroupIcon(group.groupLabel, group.color, 16)}
                                <span style={{ fontWeight: '700', fontSize: '13px', color: '#374151', flex: 1 }}>{group.groupLabel}</span>
                                
                                <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '12px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Category Toggle:</span>
                                  <ToggleSwitch 
                                    checked={group.modules.every(m => getModulePermsFields(m.key).every(f => (editUserPermissions[m.key] || {})[f.key]))}
                                    onChange={e => {
                                      const updated = { ...editUserPermissions };
                                      group.modules.forEach(m => {
                                        updated[m.key] = {};
                                        getModulePermsFields(m.key).forEach(f => { updated[m.key][f.key] = e.target.checked; });
                                      });
                                      setEditUserPermissions(updated);
                                    }}
                                    color={group.color}
                                  />
                                </div>
                                <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', display: 'flex' }}>
                                  <ChevronDown size={16} color="#6b7280" />
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #e5e7eb' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    {group.modules.map(({ key: module, label }) => {
                                      const perms = editUserPermissions[module] || {};
                                      const fields = getModulePermsFields(module);
                                      const allChecked = fields.every(f => perms[f.key]);
                                      const updatePerm = (pKey, val) => {
                                        setEditUserPermissions(prev => ({
                                          ...prev,
                                          [module]: { ...(prev[module] || {}), [pKey]: val }
                                        }));
                                      };
                                      return (
                                        <div
                                          key={module}
                                          style={{ background: '#f9fafb', borderRadius: '8px', border: `1px solid ${allChecked ? group.color + '60' : '#e5e7eb'}`, padding: '12px', transition: '0.15s' }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '12px', color: '#4b5563' }}>{label}</span>
                                            <ToggleSwitch 
                                              checked={!!allChecked}
                                              onChange={e => {
                                                const updatedModule = {};
                                                fields.forEach(f => { updatedModule[f.key] = e.target.checked; });
                                                setEditUserPermissions(prev => ({
                                                  ...prev,
                                                  [module]: updatedModule
                                                }));
                                              }}
                                              color={group.color}
                                            />
                                          </div>
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            {fields.map(p => (
                                              <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '11px', color: perms[p.key] ? '#111827' : '#9ca3af', fontWeight: perms[p.key] ? '600' : '500' }}>{p.lbl}</span>
                                                <ToggleSwitch 
                                                  checked={!!perms[p.key]}
                                                  onChange={e => updatePerm(p.key, e.target.checked)}
                                                  color={group.color}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '11px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                      <button type="submit" style={{ flex: 1, padding: '11px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* E. Delete User Modal */}
            {deleteUserId && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', width: '100%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Trash2 size={24} />
                  </div>
                  <h3 style={{ margin: '0 0 8px', color: '#1f2937', fontWeight: 700 }}>Delete User</h3>
                  <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280' }}>Are you sure you want to delete this user? This action is permanent and cannot be undone.</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setDeleteUserId(null)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={handleUserDelete} style={{ flex: 1, padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Yes, Delete</button>
                  </div>
                </div>
              </div>
            )}
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

  const API = 'https://aruvixlabs.onrender.com/api';
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
      if (res.ok) showSuccess('SMTP settings saved to database!');
      else showSuccess('Error: ' + data.error);
    } catch (error) { console.error('FETCH ERROR:', error);
      showSuccess('Could not connect to backend.');
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
                <X size={16} /> Connection failed. Please check your credentials.
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

