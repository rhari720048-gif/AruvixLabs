import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, FileText, CheckCircle, Upload, Shield, Trash2, Mail, Server, LayoutTemplate, Bell, Send, Eye, EyeOff, Wifi, Pencil, UserPlus, ShieldCheck, Search, RefreshCw, Plus, Minus, User, X, Phone, Briefcase, MessageSquare, LayoutDashboard, ChevronDown } from 'lucide-react';
import { getPerms } from './permissions';

const getModulePermsFields = (moduleKey) => {
  if (moduleKey === 'leads') {
    return [
      { key: 'view',       lbl: 'View Page' },
      { key: 'add_leads',  lbl: 'Add Leads Tab' },
      { key: 'all_leads',  lbl: 'All Leads Tab' },
      { key: 'my_leads',   lbl: 'My Leads Tab' },
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
      { key: 'my_clients',  lbl: 'My Clients Tab' },
      { key: 'create',      lbl: 'Create' },
      { key: 'edit',        lbl: 'Edit' },
      { key: 'delete',      lbl: 'Delete' }
    ];
  }
  if (['appointments', 'call_later', 'ni_box', 'call_history'].includes(moduleKey)) {
    return [
      { key: 'view',   lbl: 'View Page' },
      { key: 'create', lbl: 'Create / Manual Entry' },
      { key: 'edit',   lbl: 'Edit' },
      { key: 'delete', lbl: 'Delete' }
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

const DragDropPermissions = ({ permissions, setPermissions, canEdit, moduleGroups }) => {
  const [draggedModule, setDraggedModule] = useState(null);

  const handleDragStart = (e, moduleKey) => {
    if (!canEdit) return;
    setDraggedModule(moduleKey);
    e.dataTransfer.setData('moduleKey', moduleKey);
  };

  const handleAction = (targetZone, moduleKeyOverride) => {
    if (!canEdit) return;
    const moduleKey = moduleKeyOverride || draggedModule;
    if (!moduleKey) return;
    
    const isAssigning = targetZone === 'assigned';
    
    setPermissions(prev => {
      const newPerms = { ...prev };
      newPerms[moduleKey] = {};
      const fields = getModulePermsFields(moduleKey);
      
      fields.forEach(f => {
        newPerms[moduleKey][f.key] = isAssigning;
      });
      return newPerms;
    });
    setDraggedModule(null);
  };

  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    handleAction(targetZone);
  };

  const availableModules = [];
  const assignedModules = [];

  moduleGroups.forEach(g => {
    g.modules.forEach(m => {
      const isAssigned = (permissions[m.key] || {}).view;
      const modWithContext = { ...m, groupColor: g.color, groupLabel: g.groupLabel };
      if (isAssigned) {
        assignedModules.push(modWithContext);
      } else {
        availableModules.push(modWithContext);
      }
    });
  });

  return (
    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Available Column */}
      <div 
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDrop={e => handleDrop(e, 'available')}
        style={{ background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: '12px', padding: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}
      >
        <h4 style={{ margin: '0 0 16px', color: '#4b5563', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Available Modules
          <span style={{ background: '#e5e7eb', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{availableModules.length}</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {availableModules.map(m => (
            <div 
              key={m.key} 
              draggable={canEdit} 
              onDragStart={e => handleDragStart(e, m.key)}
              style={{ background: 'white', border: `1px solid ${m.groupColor}40`, borderLeft: `4px solid ${m.groupColor}`, borderRadius: '6px', padding: '12px', cursor: canEdit ? 'grab' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{m.label}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{m.groupLabel}</div>
              </div>
              {canEdit && (
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleAction('assigned', m.key); }} 
                  style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Grant Access"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          ))}
          {availableModules.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: '13px', border: '1px dashed #d1d5db', borderRadius: '8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              All modules assigned
            </div>
          )}
        </div>
      </div>

      {/* Assigned Column */}
      <div 
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDrop={e => handleDrop(e, 'assigned')}
        style={{ background: '#f0fdf4', border: '2px dashed #86efac', borderRadius: '12px', padding: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}
      >
        <h4 style={{ margin: '0 0 16px', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Assigned Modules (Full Access)
          <span style={{ background: '#bbf7d0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{assignedModules.length}</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {assignedModules.map(m => (
            <div 
              key={m.key} 
              draggable={canEdit} 
              onDragStart={e => handleDragStart(e, m.key)}
              style={{ background: 'white', border: `1px solid ${m.groupColor}40`, borderLeft: `4px solid ${m.groupColor}`, borderRadius: '6px', padding: '12px', cursor: canEdit ? 'grab' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{m.label}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>{m.groupLabel}</div>
              </div>
              {canEdit && (
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleAction('available', m.key); }} 
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Revoke Access"
                >
                  <Minus size={16} />
                </button>
              )}
            </div>
          ))}
          {assignedModules.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: '13px', border: '1px dashed #86efac', borderRadius: '8px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Drag modules here to grant access
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
        { key: 'settings',        label: 'Settings'         },
      ]
    },
    {
      groupLabel: 'CRM',
      color: '#0ea5e9',
      modules: [
        { key: 'leads',           label: 'Leads'            },
        { key: 'clients',         label: 'Clients'          },
        { key: 'appointments',    label: 'Appointments'     },
        { key: 'call_later',      label: 'Call Later'       },
        { key: 'ni_box',          label: 'NI Box'           },
        { key: 'call_history',    label: 'Call History'     },
      ]
    },
    {
      groupLabel: 'HR & Attendance',
      color: '#f59e0b',
      modules: [
        { key: 'user_management', label: 'User Management'  },
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
          onClick={() => setActiveTab('permissions')}
          style={{ padding: '12px 24px', background: activeTab === 'permissions' ? 'var(--primary)' : 'transparent', color: activeTab === 'permissions' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <Shield size={18} /> User Permissions
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

              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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

        {activeTab === 'permissions' && (
          <div>


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
                            <td data-label="User" style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${(u.id * 80) % 360},60%,60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '600', color: '#111827' }}>{u.name}</span>
                              </div>
                            </td>
                            <td data-label="Email" style={{ padding: '12px 18px', color: '#4b5563' }}>{u.email}</td>
                            <td data-label="Role" style={{ padding: '12px 18px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', background: isUserAdmin ? '#ede9fe' : '#e0f2fe', color: isUserAdmin ? '#6d28d9' : '#0369a1', textTransform: 'uppercase' }}>
                                {u.role}
                              </span>
                            </td>
                            <td data-label="Allowed Modules" style={{ padding: '12px 18px' }}>
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
                            <td data-label="Actions" style={{ padding: '12px 18px' }}>
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


            {/* B. Add User Modal */}

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

                  <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
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
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
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

                      <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '6px' }}>
                        {moduleGroups.map(group => {
                          const allGroupChecked = group.modules.every(m => getModulePermsFields(m.key).every(f => (editUserPermissions[m.key] || {})[f.key]));
                          return (
                            <div key={group.groupLabel} style={{ background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {renderGroupIcon(group.groupLabel, group.color, 18)}
                                  <h4 style={{ margin: 0, fontSize: '14px', color: '#1f2937' }}>{group.groupLabel}</h4>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#4b5563', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={allGroupChecked}
                                    onChange={e => {
                                      const updated = { ...editUserPermissions };
                                      group.modules.forEach(m => {
                                        updated[m.key] = {};
                                        getModulePermsFields(m.key).forEach(f => { updated[m.key][f.key] = e.target.checked; });
                                      });
                                      setEditUserPermissions(updated);
                                    }}
                                    style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: group.color }}
                                  />
                                  Select All
                                </label>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
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
                                    <div key={module} style={{ background: 'white', border: `1px solid ${allChecked ? group.color + '60' : '#e5e7eb'}`, borderRadius: '6px', padding: '12px', transition: '0.15s' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#4b5563' }}>{label}</span>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '500', color: '#6b7280', cursor: 'pointer' }}>
                                          <input
                                            type="checkbox"
                                            checked={!!allChecked}
                                            onChange={e => {
                                              const updatedModule = {};
                                              fields.forEach(f => { updatedModule[f.key] = e.target.checked; });
                                              setEditUserPermissions(prev => ({
                                                ...prev,
                                                [module]: updatedModule
                                              }));
                                            }}
                                            style={{ cursor: 'pointer', width: '12px', height: '12px', accentColor: group.color }}
                                          />
                                          All
                                        </label>
                                      </div>
                                      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {fields.map(p => (
                                          <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: perms[p.key] ? '#111827' : '#6b7280', cursor: 'pointer' }}>
                                            <input
                                              type="checkbox"
                                              checked={!!perms[p.key]}
                                              onChange={e => updatePerm(p.key, e.target.checked)}
                                              style={{ cursor: 'pointer', accentColor: group.color }}
                                            />
                                            {p.lbl}
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
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


      </div>
    </div>
  );
};



export default SettingsPage;

