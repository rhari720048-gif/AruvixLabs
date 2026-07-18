import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Pencil, Trash2, X, CheckCircle,
  ShieldCheck, User, Eye, EyeOff, RefreshCw, Mail, Phone
} from 'lucide-react';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';
const token = () => localStorage.getItem('token');

const ROLES = ['admin', 'employee', 'manager']; // Fallback
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
  const [toast, setToast]         = useState('');
  const [deleteId, setDeleteId]   = useState(null);
  const [dbRoles, setDbRoles]     = useState([]);

  // ── helpers ──────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/roles`, { headers })
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) {
        const rolesList = await rolesRes.json();
        setDbRoles(Array.isArray(rolesList) && rolesList.length ? rolesList : ROLES.map((r, index) => ({ id: index, name: r })));
      } else {
        setDbRoles(ROLES.map((r, index) => ({ id: index, name: r })));
      }
    } catch (e) {
      console.error(e);
      setDbRoles(ROLES.map((r, index) => ({ id: index, name: r })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsersAndRoles(); }, []);

  // ── filtered list ─────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── open modal ────────────────────────────────────────────────────
  const openAdd = () => {
    setEditUser(null);
    setForm(defaultForm);
    setShowPass(false);
    setShowModal(true);
  };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', role: u.role || 'employee', password: '', status: u.status || 'Active' });
    setShowPass(false);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditUser(null); };

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
          showToast('User updated successfully!');
        } else {
          showToast('Failed to update user.');
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
          showToast('User added successfully!');
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to add user');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving user');
    }
    setSaving(false);
    closeModal();
  };

  // ── delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/users/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (res.ok) {
        fetchUsersAndRoles();
        showToast('User deleted successfully!');
      }
    } catch {}
    setDeleteId(null);
  };

  // ── toggle status ─────────────────────────────────────────────────
  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    showToast('Status updated!');
  };

  // ── styles ─────────────────────────────────────────────────────────
  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '14px',
    color: '#1f2937', background: '#fafafa', boxSizing: 'border-box',
  };
  const lbl = { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#374151' };

  const stats = [
    { label: 'Total Users',    value: users.length,                            color: '#6366f1' },
    { label: 'Active',         value: users.filter(u => u.status === 'Active').length,   color: '#10b981' },
    { label: 'Inactive',       value: users.filter(u => u.status !== 'Active').length,   color: '#f59e0b' },
    { label: 'Admins',         value: users.filter(u => u.role === 'admin').length,      color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, background: '#1f2937', color: 'white', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', animation: 'slideIn 0.3s ease' }}>
          <CheckCircle size={18} color="#10b981" /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 24, fontWeight: 700 }}>User Management</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Manage team members, roles, and access</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchUsersAndRoles} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          {canCreate && (
            <button onClick={openAdd} id="add-user-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}>
              <UserPlus size={16} /> Add User
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ ...inp, paddingLeft: 38, background: '#f9fafb' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setRoleFilter('all')}
            style={{ padding: '8px 16px', background: roleFilter === 'all' ? '#6366f1' : '#f3f4f6', color: roleFilter === 'all' ? 'white' : '#6b7280', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: '0.2s' }}>
            All Roles
          </button>
          {dbRoles.map(r => (
            <button key={r.id || r.name} onClick={() => setRoleFilter(r.name)}
              style={{ padding: '8px 16px', background: roleFilter === r.name ? '#6366f1' : '#f3f4f6', color: roleFilter === r.name ? 'white' : '#6b7280', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: '0.2s' }}>
              {r.name}
            </button>
          ))}
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
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `hsl(${(u.id * 60) % 360},60%,60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{u.name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px', color: '#6b7280', fontSize: 14 }}>{u.email}</td>
                  <td style={{ padding: '14px 18px', color: '#6b7280', fontSize: 14 }}>{u.phone || '—'}</td>

                  {/* Role Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: getRoleColor(u.role).bg, color: getRoleColor(u.role).color, textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={11} /> {u.role}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td style={{ padding: '14px 18px' }}>
                    <button onClick={() => canEdit && toggleStatus(u.id)}
                      disabled={!canEdit}
                      style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: u.status === 'Active' ? '#d1fae5' : '#fee2e2', color: u.status === 'Active' ? '#065f46' : '#dc2626', border: 'none', cursor: canEdit ? 'pointer' : 'default', opacity: canEdit ? 1 : 0.7 }}>
                      {u.status === 'Active' ? '● Active' : '○ Inactive'}
                    </button>
                  </td>

                  <td style={{ padding: '14px 18px', color: '#9ca3af', fontSize: 13 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canEdit && (
                        <button onClick={() => openEdit(u)} title="Edit User"
                          style={{ width: 34, height: 34, borderRadius: 8, background: '#eef2ff', color: '#6366f1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Pencil size={15} />
                        </button>
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
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#6b7280' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editUser ? <Pencil size={20} color="white" /> : <UserPlus size={20} color="white" />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{editUser ? `Editing: ${editUser.name}` : 'Fill in the details below'}</p>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inp, paddingLeft: 36 }} placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inp, paddingLeft: 36 }} placeholder="user@company.com" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ ...inp, paddingLeft: 36 }} placeholder="+91 9876543210" />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Role *</label>
                  <input 
                    required 
                    type="text" 
                    value={form.role} 
                    onChange={e => setForm({ ...form, role: e.target.value })} 
                    style={inp} 
                    placeholder="e.g. Employee, Admin" 
                  />
                </div>

                <div>
                  <label style={lbl}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inp}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={lbl}>{editUser ? 'New Password (optional)' : 'Password *'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      required={!editUser}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      style={{ ...inp, paddingRight: 38 }}
                      placeholder={editUser ? 'Leave blank to keep current' : 'Min 6 characters'}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
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

      {/* ─── Delete Confirm Modal ─────────────────────────────────── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center' }}>
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
