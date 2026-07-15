import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import { LayoutDashboard, User, Mail, Briefcase, ClipboardCheck, Folder, Calendar, Users, Archive, FileText, Files, UserPlus, Clock, UserCheck, FileSpreadsheet, CalendarOff, CalendarDays, BarChart2, BarChart, PieChart, MessageSquare, Ticket, Settings, ChevronRight, Pencil, X, CheckCircle, Camera } from 'lucide-react';
import AdminLeads from './AdminLeads';
import Projects from './Projects';
import Tasks from './Tasks';
import FileManager from './FileManager';
import CalendarApp from './CalendarApp';
import Meetings from './Meetings';
import Accounting from './Accounting';
import Invoices from './Invoices';
import SettingsPage from './SettingsPage';
import Quotations from './Quotations';
import UserNotes from './UserNotes';
import Clients from './Clients';
import ClientReports from './ClientReports';
import TeamChat from './TeamChat';
import SupportTickets from './SupportTickets';
import UserManagement from './UserManagement';
import Header from './Header';
import StaffAttendance from './StaffAttendance';
import MyAttendance from './MyAttendance';
import MailBox from './MailBox';
import Leaves from './Leaves';
import './index.css';

// Mock Data removed as data is now fetched from APIs

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <span style={{color: 'white', fontSize: 16}}>A</span>
        </div>
        AruvixLabs
      </div>
      <ul className="nav-links" style={{ overflowY: 'auto', paddingBottom: '20px' }}>
        <li><Link to="/" className={`nav-link ${isActive('/')}`}><LayoutDashboard size={20} /> Dashboard</Link></li>
        <li><Link to="/profile" className={`nav-link ${isActive('/profile')}`}><User size={20} /> My Profile</Link></li>
        <li><Link to="/mail" className={`nav-link ${isActive('/mail')}`} style={{ justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Mail size={20} /> Mail Box</div> <ChevronRight size={16} /></Link></li>
        <li><Link to="/projects" className={`nav-link ${isActive('/projects')}`}><Briefcase size={20} /> Projects</Link></li>
        <li><Link to="/tasks" className={`nav-link ${isActive('/tasks')}`}><ClipboardCheck size={20} /> Tasks</Link></li>
        <li><Link to="/files" className={`nav-link ${isActive('/files')}`}><Folder size={20} /> File Manager</Link></li>
        <li><Link to="/calendar" className={`nav-link ${isActive('/calendar')}`}><Calendar size={20} /> Calendar</Link></li>
        <li><Link to="/meetings" className={`nav-link ${isActive('/meetings')}`}><Users size={20} /> Meetings</Link></li>
        <li><Link to="/accounting" className={`nav-link ${isActive('/accounting')}`}><Archive size={20} /> Accounting</Link></li>
        <li><Link to="/invoices" className={`nav-link ${isActive('/invoices')}`}><FileText size={20} /> Invoices</Link></li>
        <li><Link to="/quotes" className={`nav-link ${isActive('/quotes')}`}><Files size={20} /> Quotes</Link></li>
        <li><Link to="/leads" className={`nav-link ${isActive('/leads')}`}><UserPlus size={20} /> Leads</Link></li>
        <li><Link to="/staff-attendance" className={`nav-link ${isActive('/staff-attendance')}`}><Clock size={20} /> Staff Attendance</Link></li>
        <li><Link to="/my-attendance" className={`nav-link ${isActive('/my-attendance')}`}><UserCheck size={20} /> My Attendance</Link></li>
        <li><Link to="/user-notes" className={`nav-link ${isActive('/user-notes')}`}><FileSpreadsheet size={20} /> User Notes</Link></li>
        <li><Link to="/user-management" className={`nav-link ${isActive('/user-management')}`}><Users size={20} /> User Management</Link></li>
        <li><Link to="/clients" className={`nav-link ${isActive('/clients')}`}><Users size={20} /> Clients / Customers</Link></li>
        <li><Link to="/leaves" className={`nav-link ${isActive('/leaves')}`}><CalendarOff size={20} /> Leave Management</Link></li>
        <li><Link to="/client-reports" className={`nav-link ${isActive('/client-reports')}`}><PieChart size={20} /> Client Reports</Link></li>
        <li><Link to="/team-chat" className={`nav-link ${isActive('/team-chat')}`}><MessageSquare size={20} /> Team Chat</Link></li>
        <li><Link to="/support" className={`nav-link ${isActive('/support')}`}><Ticket size={20} /> Support Ticket</Link></li>
        <li style={{marginTop: '20px'}}><Link to="/settings" className={`nav-link ${isActive('/settings')}`}><Settings size={20} /> Settings</Link></li>
      </ul>
    </aside>
  );
};



const Dashboard = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/customers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => res.json()).then(resData => {
      if(Array.isArray(resData)) setData(resData);
    }).catch(e => console.error(e));
  }, []);

  const total = data.length;
  const pending = data.filter(c => c.status === 'Pending').length;
  const interested = data.filter(c => c.status === 'Interested').length;
  const converted = data.filter(c => c.status === 'Converted').length;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Leads & Clients</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Leads</span>
          <span className="stat-value">{pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Interested</span>
          <span className="stat-value">{interested}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Converted</span>
          <span className="stat-value">{converted}</span>
        </div>
      </div>
      
      <h3>Recent Records</h3>
      <br/>
      <div className="data-table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map(c => (
              <tr key={c.id}>
                <td>{c.customer_id}</td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.district || c.location || '-'}</td>
                <td>
                  <span className={`badge ${c.status ? c.status.toLowerCase().replace(' ', '-') : ''}`}>{c.status}</span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
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
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: 'Admin User',
    email: 'admin@aruvixlabs.com',
    phone: '+1 234 567 890',
    location: 'New York, USA',
    department: 'Management',
    role: 'Administrator',
    bio: 'Experienced CRM administrator managing daily operations and team productivity.',
  });
  const [draft, setDraft] = useState({ ...form });

  const handleEdit = () => { setDraft({ ...form }); setIsEditing(true); setSaved(false); };
  const handleCancel = () => { setIsEditing(false); };
  const handleSave = (e) => {
    e.preventDefault();
    setForm({ ...draft });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle = (editing) => ({
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: editing ? '1.5px solid #6366f1' : '1px solid #e5e7eb',
    background: editing ? '#fff' : '#f9fafb',
    color: '#1f2937', fontSize: '14px', outline: 'none',
    cursor: editing ? 'text' : 'default', transition: '0.2s',
  });

  return (
    <div style={{ maxWidth: 780 }}>
      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: 8, marginBottom: 20, fontWeight: 500 }}>
          <CheckCircle size={18} /> Profile updated successfully!
        </div>
      )}

      {/* Profile Header Card */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 100, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
        <div style={{ padding: '0 30px 24px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginTop: -44 }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#6366f1', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.3)' }}>
              {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', fontSize: 32, fontWeight: 700 }}>{form.name.charAt(0)}</span>}
            </div>
            {isEditing && (
              <button onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: '#6366f1', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={13} color="white" />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) setAvatar(URL.createObjectURL(e.target.files[0])); }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12 }}>
            <div>
              <h2 style={{ margin: 0, color: '#111827', fontSize: 22 }}>{form.name}</h2>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>{form.role} · {form.department}</p>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                id="edit-profile-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.35)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
              >
                <Pencil size={16} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  <X size={15} /> Cancel
                </button>
                <button form="profile-form" type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                  <CheckCircle size={15} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Form */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', padding: '30px' }}>
        <h3 style={{ margin: '0 0 24px', color: '#111827', fontSize: 17, fontWeight: 700 }}>Personal Information</h3>
        <form id="profile-form" onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Full Name</label>
              <input value={isEditing ? draft.name : form.name} onChange={e => setDraft({ ...draft, name: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Email Address</label>
              <input type="email" value={isEditing ? draft.email : form.email} onChange={e => setDraft({ ...draft, email: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Phone Number</label>
              <input value={isEditing ? draft.phone : form.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} readOnly={!isEditing} style={inputStyle(isEditing)} />
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="*" element={<Login setAuth={setIsAuthenticated} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<AdminLeads />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/calendar" element={<CalendarApp />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/staff-attendance" element={<StaffAttendance />} />
              <Route path="/my-attendance" element={<MyAttendance />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/quotes" element={<Quotations />} />
              <Route path="/user-notes" element={<UserNotes />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/client-reports" element={<ClientReports />} />
              <Route path="/team-chat" element={<TeamChat />} />
              <Route path="/support" element={<SupportTickets />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/mail" element={<MailBox />} />
              <Route path="/leaves" element={<Leaves />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
