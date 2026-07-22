import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import { LayoutDashboard, User, UserPlus, Users, Settings, ChevronRight, Pencil, X, CheckCircle, Camera, Eye, Edit2, Trash2, PhoneCall, Clock, Calendar, Archive, Building, LogOut, ShieldCheck } from 'lucide-react';
import AdminLeads from './AdminLeads';
import SettingsPage from './SettingsPage';
import Clients from './Clients';
import UserManagement from './UserManagement';
import Header from './Header';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';
import { Toaster } from 'react-hot-toast';
import { API } from './apiConfig';
import './index.css';

import Appointments from './Appointments';
import CallLater from './CallLater';
import NIBox from './NIBox';
import CallHistory from './CallHistory';
import CompletedWork from './CompletedWork';

const ProtectedRoute = ({ children, module, requireEmployee }) => {
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch(e){}

  if (!token) return <Navigate to="/login" />;

  const hasPerm = (mod) => {
    if (role === 'admin') return true;
    const isRestricted = mod === 'settings' || mod === 'user_management';
    if (!isRestricted) return true; // ALL regular CRM pages (Dashboard, Profile, Leads, Clients, etc.) ALWAYS shown!
    
    const p = permissions[mod];
    if (p === undefined || p === null) return false;
    if (typeof p === 'boolean') return p;
    if (typeof p === 'object' && p !== null) {
      if (p.view !== undefined) return !!p.view;
      if (p.canView !== undefined) return !!p.canView;
    }
    return !!p;
  };

  if (requireEmployee && role === 'admin') return <Navigate to="/" />;
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
    if (role === 'admin') return true;
    const isRestricted = module === 'settings' || module === 'user_management';
    if (!isRestricted) return true; // ALL regular CRM pages (Dashboard, Profile, Leads, Clients, etc.) ALWAYS shown!
    
    const p = permissions[module];
    if (p === undefined || p === null) return false;
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

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [reports, setReports] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  const perms = getPerms('dashboard');
  const canEdit = perms.edit ?? perms.canEdit ?? true;
  const canDelete = perms.delete ?? perms.canDelete ?? true;

  const fetchData = () => {
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
  };

  useEffect(() => {
    fetchData();
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

  const handleDeleteCategory = async (category, categoryLabel) => {
    if (window.confirm(`⚠️ WARNING: Are you sure you want to delete ALL leads in the "${categoryLabel}" category? This will delete these leads and all their call history logs. This action CANNOT be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/customers/delete-by-category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ category })
        });
        if (res.ok) {
          toast.success(`Cleared all leads in "${categoryLabel}" successfully!`);
          fetchData(); // Refresh stats and list
        } else {
          const errData = await res.json();
          toast.error(`Failed to clear category: ${errData.error || 'Server error'}`);
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('all', 'Total Leads'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <Users size={20} />
            </div>
          </div>
          <div className="modern-stat-value">{total}</div>
          <Users size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-pending">
          <div className="modern-stat-header">
            <span>Uncalled / Pending</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('pending', 'Uncalled / Pending'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <PhoneCall size={20} />
            </div>
          </div>
          <div className="modern-stat-value">{pending}</div>
          <PhoneCall size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-appointments">
          <div className="modern-stat-header">
            <span>Appointments</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('appointments', 'Appointments'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <Calendar size={20} />
            </div>
          </div>
          <div className="modern-stat-value">{apts}</div>
          <Calendar size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-call-later">
          <div className="modern-stat-header">
            <span>Call Later</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('call_later', 'Call Later'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <Clock size={20} />
            </div>
          </div>
          <div className="modern-stat-value">{callLater}</div>
          <Clock size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-ni">
          <div className="modern-stat-header">
            <span>Not Interested (NI)</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('ni', 'Not Interested (NI)'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <Archive size={20} />
            </div>
          </div>
          <div className="modern-stat-value">{ni}</div>
          <Archive size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-converted">
          <div className="modern-stat-header">
            <span>Clients (Converted)</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('converted', 'Clients (Converted)'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <UserPlus size={20} />
            </div>
          </div>
          <div className="modern-stat-value">{converted}</div>
          <UserPlus size={100} className="bg-icon" />
        </div>
        
        <div className="modern-stat-card grad-completed">
          <div className="modern-stat-header">
            <span>Completed Work</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {role === 'admin' && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory('completed', 'Completed Work'); }}
                  style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.8, cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8'; }}
                  title="Clear Category"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <CheckCircle size={20} />
            </div>
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
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((c, index) => (
              <tr key={c.id}>
                <td data-label="S.No" style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                <td data-label="ID">{c.customer_id}</td>
                <td data-label="Name">
                  <div style={{ fontWeight: 600, color: '#111827' }}>{c.name}</div>
                </td>
                <td data-label="Phone">{c.phone}</td>
                <td data-label="Location">{c.district || c.location || '-'}</td>
                <td data-label="Status">
                  <span className={`badge ${c.status ? c.status.toLowerCase().replace(' ', '-') : ''}`}>{c.status}</span>
                </td>
                <td data-label="Actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => handleView(c)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="View" onMouseOver={e=>e.currentTarget.style.background='#c7d2fe'} onMouseOut={e=>e.currentTarget.style.background='#e0e7ff'}><Eye size={16} /></button>
                    {canEdit && <button onClick={() => handleEdit(c)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Edit" onMouseOver={e=>e.currentTarget.style.background='#fde68a'} onMouseOut={e=>e.currentTarget.style.background='#fef3c7'}><Edit2 size={16} /></button>}
                    {canDelete && <button onClick={() => handleDelete(c.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} title="Delete" onMouseOver={e=>e.currentTarget.style.background='#fecaca'} onMouseOut={e=>e.currentTarget.style.background='#fee2e2'}><Trash2 size={16} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#6b7280' }}>No recent records found.</td></tr>
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
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              {columns.map((c, i) => <th key={i}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
      <p style={{ color: '#c7d2fe', fontWeight: '600' }}>Loading Executive Credentials...</p>
    </div>
  );

  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', animation: 'fadeIn 0.35s ease-out', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Deep Indigo Background Canvas with Glass Blur Container */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #3730a3 100%)',
        borderRadius: '36px',
        padding: '44px 38px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 30px 70px -15px rgba(30, 27, 75, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
      }}>
        
        {/* Background Glowing Ambient Orbs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(255, 255, 255, 0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(255, 255, 255, 0) 70%)', pointerEvents: 'none' }} />

        {/* Seamless 2-Column Split (No Hard Vertical Dividers!) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '36px'
        }}>
          
          {/* Left Column: Floating Hero Identity */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            
            {/* Glowing Photo Initial Avatar */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: '800',
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35), 0 0 20px rgba(99, 102, 241, 0.5)',
                border: '4px solid rgba(255, 255, 255, 0.3)'
              }}>
                {initial}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                background: '#22c55e',
                border: '3.5px solid #1e1b4b',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                boxShadow: '0 0 12px #22c55e'
              }} title="Online Status" />
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {user?.name || 'Staff Executive'}
            </h1>
            
            <p style={{ margin: '0 0 18px 0', color: '#c7d2fe', fontSize: '14px', fontWeight: '500' }}>
              {user?.email || 'Official Staff Account'}
            </p>

            {/* Role Badge Pill */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
            }}>
              <ShieldCheck size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: '-3px' }} color="#a5b4fc" />
              {user?.role || 'EMPLOYEE'}
            </div>

            {/* Seamless Ambient Status Tag */}
            <div style={{ marginTop: '24px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac', padding: '6px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
              <span>Active System Credentials</span>
            </div>

          </div>

          {/* Right Column: 4 Asymmetric Wave Shape Cards (Unique Shapes!) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', zIndex: 2 }}>
            
            {/* Wave Card 1: Full Name */}
            <div style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '28px 8px 28px 28px',
              padding: '18px 24px',
              borderLeft: '6px solid #6366f1',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#4f46e5" />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</div>
                  <div style={{ fontSize: '16.5px', fontWeight: '800', color: '#1e1b4b', marginTop: '1px' }}>{user?.name || '-'}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '10px', fontWeight: '800' }}>
                VERIFIED
              </span>
            </div>

            {/* Wave Card 2: Email Address */}
            <div style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '8px 28px 28px 28px',
              padding: '18px 24px',
              borderLeft: '6px solid #38bdf8',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={20} color="#0284c7" />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</div>
                  <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#1e1b4b', marginTop: '1px', wordBreak: 'break-all' }}>{user?.email || '-'}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '10px', fontWeight: '800' }}>
                PRIMARY
              </span>
            </div>

            {/* Wave Card 3: Phone Number */}
            <div style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '28px 28px 8px 28px',
              padding: '18px 24px',
              borderLeft: '6px solid #34d399',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={20} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Contact</div>
                  <div style={{ fontSize: '16.5px', fontWeight: '800', color: '#1e1b4b', marginTop: '1px' }}>{user?.phone || 'Not Provided'}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '10px', fontWeight: '800' }}>
                DIRECT
              </span>
            </div>

            {/* Wave Card 4: Member Since */}
            <div style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '28px 28px 28px 8px',
              padding: '18px 24px',
              borderLeft: '6px solid #e879f9',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} color="#be185d" />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Member Since</div>
                  <div style={{ fontSize: '16.5px', fontWeight: '800', color: '#1e1b4b', marginTop: '1px' }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active Member'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', background: '#fce7f3', color: '#be185d', padding: '4px 10px', borderRadius: '10px', fontWeight: '800' }}>
                ISSUED
              </span>
            </div>

          </div>

        </div>

        {/* Seamless Glass Security Footer */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          paddingTop: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          color: '#c7d2fe',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#a5b4fc" />
            <span>Synced in Real-Time with Admin Staff Management</span>
          </div>
          <span style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)', color: '#ffffff', padding: '4px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
            Read-Only User Profile
          </span>
        </div>

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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Reload & Retry
              </button>
              <button 
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                style={{ padding: '10px 20px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Return Home
              </button>
            </div>
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
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#ffffff',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '14px 22px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35), 0 0 20px rgba(79, 70, 229, 0.25)',
                fontFamily: "'Outfit', 'Inter', sans-serif"
              },
              success: {
                duration: 3500,
                iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
                style: {
                  background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#f0fdf4',
                  boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.5), 0 0 25px rgba(16, 185, 129, 0.35)',
                }
              },
              error: {
                duration: 4000,
                iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
                style: {
                  background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                  border: '1px solid rgba(248, 113, 113, 0.4)',
                  color: '#fef2f2',
                  boxShadow: '0 20px 40px -10px rgba(127, 29, 29, 0.5), 0 0 25px rgba(239, 68, 68, 0.35)',
                }
              }
            }}
          />
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
          <Toaster 
            position="top-right" 
            reverseOrder={false}
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(15, 23, 42, 0.92)',
                color: '#ffffff',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '14px 22px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35), 0 0 20px rgba(79, 70, 229, 0.25)',
                fontFamily: "'Outfit', 'Inter', sans-serif"
              },
              success: {
                duration: 3500,
                iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
                style: {
                  background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  color: '#f0fdf4',
                  boxShadow: '0 20px 40px -10px rgba(6, 78, 59, 0.5), 0 0 25px rgba(16, 185, 129, 0.35)',
                }
              },
              error: {
                duration: 4000,
                iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
                style: {
                  background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
                  border: '1px solid rgba(248, 113, 113, 0.4)',
                  color: '#fef2f2',
                  boxShadow: '0 20px 40px -10px rgba(127, 29, 29, 0.5), 0 0 25px rgba(239, 68, 68, 0.35)',
                }
              }
            }}
          />
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
