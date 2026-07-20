import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import { LayoutDashboard, User, UserPlus, Users, Settings, ChevronRight, Pencil, X, CheckCircle, Camera, Eye, Edit2, Trash2, PhoneCall, Clock, Calendar, Archive, Building, LogOut } from 'lucide-react';
import AdminLeads from './AdminLeads';
import SettingsPage from './SettingsPage';
import Clients from './Clients';
import UserManagement from './UserManagement';
import Header from './Header';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';
import { Toaster } from 'react-hot-toast';
import './index.css';

import Appointments from './Appointments';
import CallLater from './CallLater';
import NIBox from './NIBox';
import CallHistory from './CallHistory';
import CompletedWork from './CompletedWork';
// Mock Data removed as data is now fetched from APIs

const ProtectedRoute = ({ children, module, requireEmployee }) => {
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch(e){}

  if (!token) return <Navigate to="/login" />;

  const hasPerm = (mod) => {
    if (role === 'admin') return true;
    if (mod === 'settings' || mod === 'user_management') return false; // STRICTLY ADMIN ONLY
    if (mod === 'dashboard' || mod === 'profile') return true;
    const p = permissions[mod];
    if (p === undefined || p === null) return true;
    if (typeof p === 'boolean') return p;
    if (typeof p === 'object' && p !== null) {
      if (p.view !== undefined) return !!p.view;
      if (p.canView !== undefined) return !!p.canView;
    }
    return !!p;
  };

  if (requireEmployee && role !== 'employee') return <Navigate to="/" />;
  if (module && !hasPerm(module)) return <Navigate to="/" />;

  return children;
};

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch (e) { }
  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  const userName = localStorage.getItem('user_name') || 'User';

  const hasPerm = (module) => {
    if (role === 'admin') return true; // Admin sees all
    if (module === 'settings' || module === 'user_management') return false; // STRICTLY ADMIN ONLY
    if (module === 'dashboard' || module === 'profile') return true;
    const p = permissions[module];
    if (p === undefined || p === null) return true;
    if (typeof p === 'boolean') return p;
    if (typeof p === 'object' && p !== null) {
      if (p.view !== undefined) return !!p.view;
      if (p.canView !== undefined) return !!p.canView;
    }
    return !!p;
  };

  return (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-logo">
        <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: 16 }}>A</span>
        </div>
        AruvixLabs
      </div>
      <ul className="nav-links" style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
        {hasPerm('dashboard') && <li><Link onClick={() => setSidebarOpen(false)} to="/" className={`nav-link ${isActive('/')}`}><LayoutDashboard size={20} /> Dashboard</Link></li>}
        {hasPerm('profile') && <li><Link onClick={() => setSidebarOpen(false)} to="/profile" className={`nav-link ${isActive('/profile')}`}><User size={20} /> My Profile</Link></li>}
        

        {hasPerm('leads') && <li><Link onClick={() => setSidebarOpen(false)} to="/leads" className={`nav-link ${isActive('/leads')}`}><UserPlus size={20} /> Leads</Link></li>}
        {hasPerm('appointments') && <li><Link onClick={() => setSidebarOpen(false)} to="/appointments" className={`nav-link ${isActive('/appointments')}`}><Calendar size={20} /> Appointments</Link></li>}
        {hasPerm('call_later') && <li><Link onClick={() => setSidebarOpen(false)} to="/call-later" className={`nav-link ${isActive('/call-later')}`}><Clock size={20} /> Call Later</Link></li>}
        {hasPerm('ni_box') && <li><Link onClick={() => setSidebarOpen(false)} to="/ni-box" className={`nav-link ${isActive('/ni-box')}`}><Archive size={20} /> Not Interested (NI)</Link></li>}
        {hasPerm('call_history') && <li><Link onClick={() => setSidebarOpen(false)} to="/call-history" className={`nav-link ${isActive('/call-history')}`}><PhoneCall size={20} /> Call History</Link></li>}
        {hasPerm('clients') && <li><Link onClick={() => setSidebarOpen(false)} to="/clients" className={`nav-link ${isActive('/clients')}`}><Users size={20} /> Clients / Customers</Link></li>}
        {hasPerm('completed_work') && <li><Link onClick={() => setSidebarOpen(false)} to="/completed-work" className={`nav-link ${isActive('/completed-work')}`}><CheckCircle size={20} /> Completed Work</Link></li>}
        
        {hasPerm('user_management') && <li><Link onClick={() => setSidebarOpen(false)} to="/user-management" className={`nav-link ${isActive('/user-management')}`}><Users size={20} /> Staff Management</Link></li>}
        {hasPerm('settings') && <li style={{ marginTop: '14px' }}><Link onClick={() => setSidebarOpen(false)} to="/settings" className={`nav-link ${isActive('/settings')}`}><Settings size={20} /> Settings</Link></li>}
      </ul>
    </aside>
    </>
  );
};



const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [reports, setReports] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  const perms = getPerms('dashboard');
  const canEdit = perms.edit ?? perms.canEdit ?? true;
  const canDelete = perms.delete ?? perms.canDelete ?? true;

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(resData => {
      if (Array.isArray(resData)) setData(resData);
    }).catch(e => console.error(e));

    fetch(`${API}/telecalling/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(resData => {
      setReports(resData);
    }).catch(e => console.error(e));
  }, []);

  const handleView = (c) => setViewRecord(c);
  const handleEdit = (c) => toast(`Editing ${c.name}`, { icon: '✏️' });
  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try {
        const res = await fetch(`${API}/customers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          setData(data.filter(c => c.id !== id));
          toast.success("Record deleted successfully.");
        } else {
          toast.error('Failed to delete record.');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while deleting.');
      }
    }
  };

  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  
  // Use telecalling reports if admin, otherwise local data fallback
  const total = data.length;
  const pending = data.filter(c => !['Converted', 'Completed Work', 'Appointment', 'Call Later', 'NI', 'Not Interested'].includes(c.status)).length;
  const apts = data.filter(c => c.status === 'Appointment').length;
  const callLater = data.filter(c => c.status === 'Call Later').length;
  const ni = data.filter(c => c.status === 'NI' || c.status === 'Not Interested').length;
  const converted = data.filter(c => c.status === 'Converted').length;
  const completed = data.filter(c => c.status === 'Completed Work').length;

  return (
    <div>
      <div className="modern-dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, here is your CRM summary</p>
        </div>
      </div>

      <div className="modern-stats-grid">
        <div className="modern-stat-card grad-total">
          <div className="modern-stat-header">
            <span>Total Leads</span>
            <Users size={20} />
          </div>
          <div className="modern-stat-value">{total}</div>
          <Users size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-pending">
          <div className="modern-stat-header">
            <span>Uncalled / Pending</span>
            <PhoneCall size={20} />
          </div>
          <div className="modern-stat-value">{pending}</div>
          <PhoneCall size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-appointments">
          <div className="modern-stat-header">
            <span>Appointments</span>
            <Calendar size={20} />
          </div>
          <div className="modern-stat-value">{apts}</div>
          <Calendar size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-call-later">
          <div className="modern-stat-header">
            <span>Call Later</span>
            <Clock size={20} />
          </div>
          <div className="modern-stat-value">{callLater}</div>
          <Clock size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-ni">
          <div className="modern-stat-header">
            <span>Not Interested (NI)</span>
            <Archive size={20} />
          </div>
          <div className="modern-stat-value">{ni}</div>
          <Archive size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-converted">
          <div className="modern-stat-header">
            <span>Clients (Converted)</span>
            <UserPlus size={20} />
          </div>
          <div className="modern-stat-value">{converted}</div>
          <UserPlus size={100} className="bg-icon" />
        </div>

        <div className="modern-stat-card grad-completed">
          <div className="modern-stat-header">
            <span>Completed Work</span>
            <CheckCircle size={20} />
          </div>
          <div className="modern-stat-value">{completed}</div>
          <CheckCircle size={100} className="bg-icon" />
        </div>
      </div>

      <div className="modern-section-title">
        <LayoutDashboard size={24} color="#3b82f6" />
        Recent Records
      </div>
      <div className="modern-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map(c => (
              <tr key={c.id}>
                <td data-label="ID">{c.customer_id}</td>
                <td data-label="Name">
                  <div style={{ fontWeight: 600, color: '#111827' }}>{c.name}</div>
                </td>
                <td data-label="Phone">{c.phone}</td>
                <td data-label="Location">{c.district || c.location || '-'}</td>
                <td data-label="Status">
                  <span className={`badge ${c.status ? c.status.toLowerCase().replace(' ', '-') : ''}`}>{c.status}</span>
                </td>
                <td data-label="Actions" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button onClick={() => handleView(c)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="View" onMouseOver={e=>e.currentTarget.style.background='#c7d2fe'} onMouseOut={e=>e.currentTarget.style.background='#e0e7ff'}><Eye size={16} /></button>
                  {canEdit && <button onClick={() => handleEdit(c)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Edit" onMouseOver={e=>e.currentTarget.style.background='#fde68a'} onMouseOut={e=>e.currentTarget.style.background='#fef3c7'}><Edit2 size={16} /></button>}
                  {canDelete && <button onClick={() => handleDelete(c.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Delete" onMouseOver={e=>e.currentTarget.style.background='#fecaca'} onMouseOut={e=>e.currentTarget.style.background='#fee2e2'}><Trash2 size={16} /></button>}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No recent records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewRecord && (
        <ViewModal
          isOpen={!!viewRecord}
          onClose={() => setViewRecord(null)}
          data={viewRecord}
          type={viewRecord.status === 'Converted' ? 'client' : 'lead'}
        />
      )}
    </div>
  );
};

const DummyPage = ({ title, columns, data, stats }) => (
  <div>
    <h2 style={{ marginBottom: '24px' }}>{title}</h2>
    {stats && (
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>
    )}
    {data && columns && (
      <div className="data-table-container">
        <table>
          <thead>
            <tr>
              {columns.map((c, i) => <th key={i}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  let badgeClass = "";
                  if (typeof cell === 'string') {
                    const lower = cell.toLowerCase();
                    if (['active', 'approved', 'paid', 'converted', 'completed', 'delivered'].includes(lower)) badgeClass = "badge converted";
                    else if (['pending', 'in progress', 'scheduled', 'unread', 'open'].includes(lower)) badgeClass = "badge pending";
                    else if (['overdue', 'rejected', 'cancelled', 'late', 'absent'].includes(lower)) badgeClass = "badge"; // using default badge with no bg, or we could just render text
                  }
                  return (
                    <td key={j}>
                      {badgeClass ? <span className={badgeClass}>{cell}</span> : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const ProfilePage = () => {
  const getProfilePerms = () => {
    let permissions = {};
    try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch (e) { }
    const role = (localStorage.getItem('role') || 'employee').toLowerCase();
    const isAdmin = role === 'admin';
    const mod = permissions['profile'] || {};
    return {
      canEdit: isAdmin || !!mod.edit
    };
  };
  const { canEdit } = getProfilePerms();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    role: '',
    bio: '',
  });
  const [draft, setDraft] = useState({ ...form });

  useEffect(() => {
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const u = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            department: data.department || '',
            role: data.role || '',
            bio: data.bio || '',
          };
          setForm(u);
          setDraft(u);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = () => { setDraft({ ...form }); setIsEditing(true); setSaved(false); };
  const handleCancel = () => { setIsEditing(false); };
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: draft.name,
          phone: draft.phone,
          bio: draft.bio,
          location: draft.location,
          department: draft.department,
        })
      });
      if (res.ok) {
        setForm({ ...draft });
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#6b7280', textAlign: 'center' }}>Loading profile details...</div>;
  }

  const inputStyle = (editing) => ({
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: editing ? '1.5px solid #6366f1' : '1px solid #e5e7eb',
    background: editing ? '#fff' : '#f9fafb',
    color: '#1f2937', fontSize: '14px', outline: 'none',
    cursor: editing ? 'text' : 'default', transition: '0.2s',
  });

  return (
    <div style={{ maxWidth: 880, animation: 'fadeIn 0.3s ease-out' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <User size={28} color="var(--primary)" />
            My User Profile
          </h1>
          <p>Personal profile preferences, contact information, and role credentials</p>
        </div>
      </div>

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: 16, marginBottom: 20, fontWeight: 600 }}>
          <CheckCircle size={18} /> Profile updated successfully!
        </div>
      )}

      {/* Dashboard-Style KPI Cards for Profile */}
      <div className="modern-stats-grid">
        <div className="modern-stat-card grad-profile">
          <div className="modern-stat-header">
            <span>Account Role</span>
            <User size={20} />
          </div>
          <div className="modern-stat-value" style={{ fontSize: '28px', textTransform: 'capitalize' }}>{form.role || 'Staff'}</div>
          <User size={90} className="bg-icon" />
        </div>

        <div className="modern-stat-card grad-converted">
          <div className="modern-stat-header">
            <span>Account Status</span>
            <CheckCircle size={20} />
          </div>
          <div className="modern-stat-value" style={{ fontSize: '28px' }}>Active</div>
          <CheckCircle size={90} className="bg-icon" />
        </div>

        <div className="modern-stat-card grad-pending">
          <div className="modern-stat-header">
            <span>Department</span>
            <Building size={20} />
          </div>
          <div className="modern-stat-value" style={{ fontSize: '28px' }}>{form.department || 'Sales'}</div>
          <Building size={90} className="bg-icon" />
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="card-panel" style={{ overflow: 'hidden', padding: 0, marginBottom: 24 }}>
        <div style={{ height: 120, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
        <div style={{ padding: '0 30px 24px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginTop: -44 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#6366f1', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
              {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontSize: 36, fontWeight: 800 }}>{form.name.charAt(0)}</span>}
            </div>
            {isEditing && (
              <button onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: '50%', background: '#6366f1', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={14} color="white" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) setAvatar(URL.createObjectURL(e.target.files[0])); }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 14, flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0F172A', fontSize: 24, fontWeight: '800' }}>{form.name}</h2>
              <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14, fontWeight: '600' }}>{form.role} · {form.department}</p>
            </div>
            {canEdit && !isEditing ? (
              <button
                onClick={handleEdit}
                id="edit-profile-btn"
                className="btn btn-primary"
              >
                <Pencil size={16} /> Edit Profile Details
              </button>
            ) : isEditing ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCancel} className="btn btn-secondary">
                  <X size={15} /> Cancel
                </button>
                <button form="profile-form" type="submit" className="btn btn-success">
                  <CheckCircle size={15} /> Save Changes
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Details Form */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', padding: '30px' }}>
        <h3 style={{ margin: '0 0 24px', color: '#111827', fontSize: 17, fontWeight: 700 }}>Personal Information</h3>
        <form id="profile-form" onSubmit={handleSave}>
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Full Name</label>
              <input value={isEditing ? draft.name : form.name} onChange={e => setDraft({ ...draft, name: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Email Address</label>
              <input type="email" value={isEditing ? draft.email : form.email} onChange={e => setDraft({ ...draft, email: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Phone Number (10 digits only)</label>
              <input type="tel" maxLength={10} value={isEditing ? draft.phone : form.phone} onChange={e => setDraft({ ...draft, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Location</label>
              <input value={isEditing ? draft.location : form.location} onChange={e => setDraft({ ...draft, location: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Department</label>
              <input value={isEditing ? draft.department : form.department} onChange={e => setDraft({ ...draft, department: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Role</label>
              <input value={isEditing ? draft.role : form.role} onChange={e => setDraft({ ...draft, role: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Bio</label>
              <textarea value={isEditing ? draft.bio : form.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} readOnly={!isEditing} rows={3} style={{ ...inputStyle(isEditing), resize: isEditing ? 'vertical' : 'none' }} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`mobile-bottom-item ${isActive('/')}`}>
        <LayoutDashboard size={20} />
        <span>Home</span>
      </Link>
      <Link to="/leads" className={`mobile-bottom-item ${isActive('/leads')}`}>
        <UserPlus size={20} />
        <span>Leads</span>
      </Link>
      <Link to="/appointments" className={`mobile-bottom-item ${isActive('/appointments')}`}>
        <Calendar size={20} />
        <span>Appts</span>
      </Link>
      <Link to="/call-later" className={`mobile-bottom-item ${isActive('/call-later')}`}>
        <Clock size={20} />
        <span>Callbacks</span>
      </Link>
      <Link to="/profile" className={`mobile-bottom-item ${isActive('/profile')}`}>
        <User size={20} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', padding: '30px', maxWidth: '500px', margin: '60px auto' }}>
            <h2 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>Something went wrong</h2>
            <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button 
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Return to Safety
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            const userRole = (data.role || 'employee').toLowerCase();
            const userPerms = data.permissions || {};
            localStorage.setItem('role', userRole);
            localStorage.setItem('permissions', JSON.stringify(userPerms));
            localStorage.setItem('user_name', data.name || '');
            localStorage.setItem('user', JSON.stringify({
              id: data.id,
              name: data.name,
              role: userRole,
              permissions: userPerms,
            }));
            window.dispatchEvent(new Event('user-updated'));
          }
        })
        .catch(() => { });
    }
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Login setAuth={setIsAuthenticated} />} />
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
            <Route path="*" element={<Login setAuth={setIsAuthenticated} />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-container">
          <Toaster position="top-center" reverseOrder={false} />
          <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="main-content">
            <Header setSidebarOpen={setSidebarOpen} />
            <div className="content-area">
              <Routes>
                <Route path="/" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute module="profile"><ProfilePage /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute module="leads"><AdminLeads /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute module="clients"><Clients /></ProtectedRoute>} />
                <Route path="/user-management" element={<ProtectedRoute module="user_management"><UserManagement /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute module="settings"><SettingsPage /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute module="appointments"><Appointments /></ProtectedRoute>} />
                <Route path="/call-later" element={<ProtectedRoute module="call_later"><CallLater /></ProtectedRoute>} />
                <Route path="/ni-box" element={<ProtectedRoute module="ni_box"><NIBox /></ProtectedRoute>} />
                <Route path="/call-history" element={<ProtectedRoute module="call_history"><CallHistory /></ProtectedRoute>} />
                <Route path="/completed-work" element={<ProtectedRoute module="completed_work"><CompletedWork /></ProtectedRoute>} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
