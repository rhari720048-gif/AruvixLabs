import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Pencil, Trash2, X,
  ShieldCheck, User, Eye, EyeOff, RefreshCw, Mail, Phone, CheckCircle, Lock, LayoutDashboard, Calendar, Clock, Archive, PhoneCall, Settings, CheckSquare, Download
} from 'lucide-react';
import { getPerms } from './permissions';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';

import { API } from './apiConfig';
const token = () => localStorage.getItem('token');

const ROLES = ['admin', 'employee', 'manager'];
const ROLE_COLORS = {
  admin:    { bg: '#ede9fe', color: '#6d28d9' },
  manager:  { bg: '#dbeafe', color: '#1d4ed8' },
  employee: { bg: '#d1fae5', color: '#065f46' },
};

const getRoleColor = (roleName) => {
  const normalized = (roleName || '').toLowerCase();
  if (ROLE_COLORS[normalized]) return ROLE_COLORS[normalized];
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return { bg: `hsl(${h}, 70%, 95%)`, color: `hsl(${h}, 70%, 35%)` };
};

const MODULE_LIST = [
  { key: 'dashboard',       label: 'Dashboard',             desc: 'Access main analytics dashboard' },
  { key: 'leads',           label: 'Leads & Management',    desc: 'Access lead pipeline & customer leads' },
  { key: 'appointments',    label: 'Appointments',          desc: 'Access scheduled appointments' },
  { key: 'call_later',      label: 'Call Later',            desc: 'Access follow-ups & callbacks' },
  { key: 'ni_box',          label: 'Not Interested (NI)',   desc: 'Access NI lead archive' },
  { key: 'call_history',    label: 'Call History',          desc: 'Access interaction & call logs' },
  { key: 'clients',         label: 'Clients / Customers',   desc: 'Access customer directory' },
  { key: 'completed_work',  label: 'Completed Work',        desc: 'Access completed deals' },
  { key: 'user_management', label: 'Staff Management',      desc: 'Access staff management & team permissions' },
  { key: 'settings',        label: 'Settings',              desc: 'Access global app & SMTP settings' }
];

const defaultForm = { name: '', email: '', phone: '', role: 'employee', password: '', status: 'Active' };

export default function UserManagement() {
  const { canCreate, canEdit, canDelete } = getPerms('user_management');
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser]   = useState(null);   // null = add mode
  const [form, setForm]           = useState(defaultForm);
  const [showPass, setShowPass]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleteId, setDeleteId]   = useState(null);
  const [dbRoles, setDbRoles]     = useState([]);

  // Permission Modal States
  const [permUser, setPermUser]           = useState(null);
  const [showPermModal, setShowPermModal] = useState(false);
  const [userPermsState, setUserPermsState] = useState({});
  const [savingPerms, setSavingPerms]     = useState(false);

  const handleExportCSV = () => {
    if (filtered.length === 0) return toast.error('No staff members to export.');
    
    const exportRows = filtered.map(u => ({
      'Staff Name': u.name || '',
      'Email': u.email || '',
      'Phone': u.phone || '',
      'Role': u.role || 'employee',
      'Account Status': u.status || 'Active',
      'Created Date': u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
    }));

    const headers = Object.keys(exportRows[0]);
    const csvRows = [headers.join(',')];
    for (const row of exportRows) {
      const values = headers.map(h => `"${('' + (row[h] || '')).replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Staff_Team_Members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Staff members exported to CSV!');
  };

  // ── helpers ──────────────────────────────────────────────────────────

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/roles`, { headers })
      ]);
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(Array.isArray(uData) ? uData : []);
      } else {
        setUsers([]);
      }
      if (rolesRes.ok) {
        const rolesList = await rolesRes.json();
        const rawList = Array.isArray(rolesList) ? rolesList : [];
        const normalized = rawList.length
          ? rawList.map((r, idx) => typeof r === 'string' ? { id: idx, name: r } : { id: r?.id || idx, name: r?.name || String(r || 'employee') })
          : ROLES.map((r, idx) => ({ id: idx, name: r }));
        setDbRoles(normalized);
      } else {
        setDbRoles(ROLES.map((r, idx) => ({ id: idx, name: r })));
      }
    } catch (e) {
      console.error(e);
      setUsers([]);
      setDbRoles(ROLES.map((r, idx) => ({ id: idx, name: r })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsersAndRoles(); }, []);

  // ── filtered list ─────────────────────────────────────────────────
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRoles = Array.isArray(dbRoles) ? dbRoles : [];

  // Only show role tabs for roles that actually have assigned users
  const roleTabsMap = new Map();
  safeUsers.forEach(u => {
    const r = (u.role || 'employee').trim();
    if (r) {
      const key = r.toLowerCase();
      if (!roleTabsMap.has(key)) {
        roleTabsMap.set(key, r);
      }
    }
  });
  const activeRoleTabs = Array.from(roleTabsMap.values());

  const filtered = safeUsers.filter(u => {
    if (!u) return false;
    const q = (search || '').trim().toLowerCase();
    const matchSearch = !q || (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
    const userRole = (u.role || '').trim().toLowerCase();
    const targetFilter = (roleFilter || '').trim().toLowerCase();
    const matchRole = targetFilter === 'all' || userRole === targetFilter;
    return matchSearch && matchRole;
  });

  // ── open modal ────────────────────────────────────────────────────
  const openAdd = () => {
    setEditUser(null);
    const firstRole = safeRoles.length > 0 ? (typeof safeRoles[0] === 'string' ? safeRoles[0] : (safeRoles[0]?.name || 'employee')) : 'employee';
    setForm({ ...defaultForm, role: firstRole });
    setShowPass(false);
    setShowModal(true);
  };

  const openEdit = (u) => {
    if (!u) return;
    setEditUser(u);
    const matchedRole = safeRoles.find(r => {
      const rName = typeof r === 'string' ? r : (r?.name || '');
      return rName.toLowerCase() === (u.role || '').toLowerCase();
    });
    const matchedRoleName = matchedRole ? (typeof matchedRole === 'string' ? matchedRole : matchedRole.name) : (u.role || 'employee');
    setForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: matchedRoleName,
      password: '',
      status: u.status || 'Active'
    });
    setShowPass(false);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditUser(null); };

  // ── Permission Modal Open & Save ──────────────────────────────────
  const openPermModal = (u) => {
    setPermUser(u);
    const rawPerms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || {});
    setUserPermsState(rawPerms);
    setShowPermModal(true);
  };

  const toggleModulePerm = (modKey) => {
    setUserPermsState(prev => {
      const curr = prev[modKey];
      let currentVal = false;
      if (typeof curr === 'boolean') currentVal = curr;
      else if (typeof curr === 'object' && curr !== null) currentVal = !!(curr.view || curr.canView);
      
      const newVal = !currentVal;
      return {
        ...prev,
        [modKey]: {
          view: newVal,
          create: newVal,
          edit: newVal,
          delete: newVal
        }
      };
    });
  };

  const handleSavePerms = async () => {
    if (!permUser) return;
    setSavingPerms(true);
    try {
      const res = await fetch(`${API}/users/${permUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ permissions: userPermsState })
      });
      if (res.ok) {
        toast.success(`Page permissions updated for ${permUser.name}!`);
        fetchUsersAndRoles();
        setShowPermModal(false);
      } else {
        toast.error('Failed to update permissions');
      }
    } catch {
      toast.error('Error saving permissions');
    }
    setSavingPerms(false);
  };

  // ── save (add / edit) ─────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        // PUT /api/users/:id
        const res = await fetch(`${API}/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, role: form.role, status: form.status, ...(form.password ? { password: form.password } : {}) }),
        });
        if (res.ok) {
          fetchUsersAndRoles();
          toast.success('User updated successfully!');
          if (form.role) setRoleFilter(form.role);
          let currentLogged = {};
          try { currentLogged = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
          if (currentLogged.id === editUser.id) {
            const updated = { ...currentLogged, name: form.name, role: form.role };
            localStorage.setItem('role', form.role.toLowerCase());
            localStorage.setItem('user_name', form.name);
            localStorage.setItem('user', JSON.stringify(updated));
            window.dispatchEvent(new Event('user-updated'));
          }
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to update user.');
        }
      } else {
        // POST /api/users
        const res = await fetch(`${API}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, role: form.role, password: form.password, status: form.status }),
        });
        if (res.ok) {
          fetchUsersAndRoles();
          toast.success('User added successfully!');
          if (form.role) setRoleFilter(form.role);
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to add user');
        }
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving user');
    }
    setSaving(false);
    closeModal();
  };

  // ── delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        toast.success('User deleted successfully!');
      } else {
        toast.error('Failed to delete user.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting user');
    }
    setDeleteId(null);
  };

  // ── toggle status ─────────────────────────────────────────────────
  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        toast.success('Status updated!');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── styles ─────────────────────────────────────────────────────────
  const inp = {
    width: '100%',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingRight: '12px',
    paddingLeft: '12px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    outline: 'none',
    fontSize: '14px',
    color: '#1f2937',
    background: '#fafafa',
    boxSizing: 'border-box',
  };
  const lbl = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#374151' };

  return (
    <div style={{ maxWidth: 1100, animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header & Actions */}
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <Users size={28} color="var(--primary)" />
            Staff & Team Management
          </h1>
          <p>Manage staff members, system access roles, and page permission levels</p>
        </div>
        <div className="crm-page-actions">
          <button onClick={handleExportCSV} className="btn-export-csv">
            <Download size={18} /> Export CSV
          </button>
          <button onClick={fetchUsersAndRoles} className="btn btn-secondary">
            <RefreshCw size={15} /> Refresh
          </button>
          {canCreate && (
            <button onClick={openAdd} id="add-user-btn" className="btn btn-primary">
              <UserPlus size={16} /> Add Team Member
            </button>
          )}
        </div>
      </div>

      {/* Modern Dashboard-Style KPI Cards */}
      <div className="modern-stats-grid">
        <div className="modern-stat-card grad-total">
          <div className="modern-stat-header">
            <span>Total Team Members</span>
            <Users size={20} />
          </div>
          <div className="modern-stat-value">{users.length}</div>
          <Users size={90} className="bg-icon" />
        </div>

        <div className="modern-stat-card grad-converted">
          <div className="modern-stat-header">
            <span>Active Staff</span>
            <ShieldCheck size={20} />
          </div>
          <div className="modern-stat-value">{users.filter(u => u.status === 'Active').length}</div>
          <ShieldCheck size={90} className="bg-icon" />
        </div>

        <div className="modern-stat-card grad-appointments">
          <div className="modern-stat-header">
            <span>System Admins</span>
            <UserPlus size={20} />
          </div>
          <div className="modern-stat-value">{users.filter(u => (u.role || '').toLowerCase() === 'admin').length}</div>
          <UserPlus size={90} className="bg-icon" />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-container" style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#9ca3af', zIndex: 2 }}>
            <Search size={16} />
          </div>
          <input
            className="has-icon-left"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ ...inp, background: '#f9fafb' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setRoleFilter('all')}
            style={{ padding: '8px 16px', background: (roleFilter || '').trim().toLowerCase() === 'all' ? '#4f46e5' : '#f3f4f6', color: (roleFilter || '').trim().toLowerCase() === 'all' ? 'white' : '#6b7280', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: '0.2s' }}>
            All Roles
          </button>
          {activeRoleTabs.map(rName => {
            const count = safeUsers.filter(u => (u.role || '').trim().toLowerCase() === rName.trim().toLowerCase()).length;
            const isSel = (roleFilter || '').trim().toLowerCase() === rName.trim().toLowerCase();
            return (
              <button key={rName} onClick={() => setRoleFilter(rName)}
                style={{ padding: '8px 16px', background: isSel ? '#4f46e5' : '#f3f4f6', color: isSel ? 'white' : '#6b7280', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: '0.2s' }}>
                {rName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <div>Loading users...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontWeight: 600 }}>No users found</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa', transition: '0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafafa'}>

                  {/* Avatar + Name */}
                  <td data-label="User" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `hsl(${(u.id * 60) % 360},60%,60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{u.name}</span>
                    </div>
                  </td>

                  <td data-label="Email" style={{ padding: '14px 18px', color: '#6b7280', fontSize: 14 }}>{u.email}</td>
                  <td data-label="Phone" style={{ padding: '14px 18px', color: '#6b7280', fontSize: 14 }}>{u.phone || '—'}</td>

                  {/* Role Badge */}
                  <td data-label="Role" style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: getRoleColor(u.role).bg, color: getRoleColor(u.role).color, textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={11} /> {u.role}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td data-label="Status" style={{ padding: '14px 18px' }}>
                    <button onClick={() => canEdit && toggleStatus(u.id)}
                      disabled={!canEdit}
                      style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20, background: u.status === 'Active' ? '#d1fae5' : '#fee2e2', color: u.status === 'Active' ? '#065f46' : '#dc2626', border: 'none', cursor: canEdit ? 'pointer' : 'default', opacity: canEdit ? 1 : 0.7, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {u.status === 'Active' ? <><span className="status-dot-pulse"></span> Active</> : '○ Inactive'}
                    </button>
                  </td>

                  <td data-label="Joined" style={{ padding: '14px 18px', color: '#9ca3af', fontSize: 13 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>

                  {/* Actions */}
                  <td data-label="Actions" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canEdit && (
                        <>
                          <button onClick={() => openPermModal(u)} title="Manage Page Permissions"
                            style={{ width: 34, height: 34, borderRadius: 8, background: '#ede9fe', color: '#6d28d9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={15} />
                          </button>
                          <button onClick={() => openEdit(u)} title="Edit User"
                            style={{ width: 34, height: 34, borderRadius: 8, background: '#eef2ff', color: '#6366f1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pencil size={15} />
                          </button>
                        </>
                      )}
                      {canDelete && (
                        <button onClick={() => setDeleteId(u.id)} title="Delete User"
                          style={{ width: 34, height: 34, borderRadius: 8, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6', color: '#9ca3af', fontSize: 13 }}>
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div className="modal-content-wrapper" style={{ background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#6b7280' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editUser ? <Pencil size={20} color="white" /> : <UserPlus size={20} color="white" />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{editUser ? `Editing: ${editUser.name}` : 'Fill in the credentials below'}</p>
              </div>
            </div>

            <form onSubmit={handleSave} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Full Name *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none', color: '#6b7280' }}>
                      <User size={18} />
                    </div>
                    <input required className="has-icon-left" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inp }} placeholder="John Doe" autoComplete="off" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Email Address *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none', color: '#6b7280' }}>
                      <Mail size={18} />
                    </div>
                    <input required className="has-icon-left" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inp }} placeholder="user@company.com" autoComplete="new-password" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Phone Number (10 digits only)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none', color: '#6b7280' }}>
                      <Phone size={18} />
                    </div>
                    <input className="has-icon-left" type="tel" maxLength={10} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} style={{ ...inp }} placeholder="9876543210" autoComplete="off" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Role *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none', color: '#6b7280' }}>
                      <ShieldCheck size={18} />
                    </div>
                    <input 
                      required 
                      className="has-icon-left" 
                      type="text" 
                      value={form.role} 
                      onChange={e => setForm({ ...form, role: e.target.value })} 
                      style={{ ...inp }} 
                      placeholder="Enter role (e.g. Telecaller, Sales Manager)" 
                      autoComplete="off" 
                    />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Status</label>
                  <SearchableSelect 
                    options={[
                      { label: 'Active', value: 'Active' },
                      { label: 'Inactive', value: 'Inactive' }
                    ]}
                    value={form.status}
                    onChange={val => setForm({ ...form, status: val })}
                    placeholder="Select Status..."
                  />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>{editUser ? 'New Password (optional)' : 'Password *'}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none', color: '#6b7280' }}>
                      <Lock size={18} />
                    </div>
                    <input
                      className="has-icon-left"
                      type={showPass ? 'text' : 'password'}
                      required={!editUser}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ ...inp, paddingRight: '48px' }}
                      placeholder={editUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', zIndex: 3 }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={closeModal}
                  style={{ flex: 1, padding: '11px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', background: saving ? '#a5b4fc' : '#6366f1', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}>
                  <CheckCircle size={16} /> {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Page Permissions Matrix Modal ────────────────────────────── */}
      {showPermModal && permUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content-wrapper" style={{ background: 'white', borderRadius: 18, padding: '28px 32px', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 70px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={() => setShowPermModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#6b7280' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 800 }}>Page Access & Permissions</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                  Managing allowed pages for: <strong style={{ color: '#4338ca' }}>{permUser.name}</strong> ({permUser.email})
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid #e2e8f0', fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
              💡 <strong>Default Permission Rule:</strong> New team members get access to all operational CRM pages by default. Admin can restrict specific pages below. Pages turned <strong>OFF</strong> will be hidden from their sidebar and access will be restricted.
            </div>

            {/* Permission Toggle List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {MODULE_LIST.map(mod => {
                const curr = userPermsState[mod.key];
                let isAllowed = false;
                if ((permUser.role || '').toLowerCase() === 'admin') {
                  isAllowed = true;
                } else if (typeof curr === 'boolean') {
                  isAllowed = curr;
                } else if (typeof curr === 'object' && curr !== null) {
                  isAllowed = !!(curr.view || curr.canView);
                } else {
                  // Default fallback for new users: allowed for all except user_management & settings
                  isAllowed = mod.key !== 'user_management' && mod.key !== 'settings';
                }

                const isAdminRole = (permUser.role || '').toLowerCase() === 'admin';

                return (
                  <div key={mod.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: isAllowed ? '#f5f3ff' : '#fafafa', border: `1.5px solid ${isAllowed ? '#c7d2fe' : '#e5e7eb'}`, transition: 'all 0.2s' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: isAllowed ? '#3730a3' : '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {mod.label}
                        {isAllowed ? <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>GRANTED</span> : <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>RESTRICTED</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{mod.desc}</div>
                    </div>

                    <button
                      type="button"
                      disabled={isAdminRole}
                      onClick={() => toggleModulePerm(mod.key)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 800,
                        border: 'none',
                        cursor: isAdminRole ? 'not-allowed' : 'pointer',
                        background: isAllowed ? '#4f46e5' : '#e2e8f0',
                        color: isAllowed ? '#ffffff' : '#64748b',
                        boxShadow: isAllowed ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isAllowed ? 'ALLOWED ✓' : 'OFF ✕'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowPermModal(false)}
                style={{ flex: 1, padding: '11px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleSavePerms} disabled={savingPerms}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', background: savingPerms ? '#a5b4fc' : '#4f46e5', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: savingPerms ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                <CheckCircle size={16} /> {savingPerms ? 'Saving Permissions...' : 'Save Page Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─────────────────────────────────── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div className="modal-content-wrapper" style={{ background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={26} color="#dc2626" />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#111827' }}>Delete User?</h3>
            <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14 }}>
              This action cannot be undone. The user will lose all access.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: '11px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                style={{ flex: 1, padding: '11px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(220,38,38,0.3)' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
