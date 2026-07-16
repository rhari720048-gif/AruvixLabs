import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';
const leaveTypes = ['Sick Leave', 'Vacation', 'Casual Leave', 'Emergency'];

const Leaves = () => {
  const [role, setRole] = useState('');
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [myLeaves, setMyLeaves] = useState([]);
  const [adminLeaves, setAdminLeaves] = useState([]);

  const [form, setForm] = useState({ type: leaveTypes[0], start_date: '', end_date: '', reason: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setRole((user.role || '').toLowerCase());
    
    fetchMyLeaves();
    const userRole = (user?.role || '').toLowerCase();
    if (userRole === 'admin' || userRole === 'manager') {
      fetchAdminLeaves();
    }

    const interval = setInterval(() => {
      fetchMyLeaves();
      const u = JSON.parse(localStorage.getItem('user'));
      if (u) {
        const uRole = (u.role || '').toLowerCase();
        if (uRole === 'admin' || uRole === 'manager') {
          fetchAdminLeaves();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/leaves/my`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMyLeaves(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchAdminLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/leaves/admin`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAdminLeaves(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess('Leave request submitted successfully!');
        setForm({ type: leaveTypes[0], start_date: '', end_date: '', reason: '' });
        fetchMyLeaves();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/leaves/${id}/action`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }) // 'Approved' or 'Rejected'
      });
      fetchAdminLeaves();
    } catch (e) { console.error(e); }
  };

  const handleDeleteLeave = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/leaves/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminLeaves();
      }
    } catch (e) { console.error(e); }
  };

  const renderStatus = (status) => {
    const colors = {
      Pending: '#d97706',
      Approved: '#059669',
      Rejected: '#dc2626'
    };
    const bgs = {
      Pending: '#fef3c7',
      Approved: '#d1fae5',
      Rejected: '#fee2e2'
    };
    return (
      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', color: colors[status], background: bgs[status] }}>
        {status}
      </span>
    );
  };

  return (
    <div className="leaves-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        <button onClick={() => setActiveTab('my-leaves')} style={{ padding: '12px 24px', background: activeTab === 'my-leaves' ? 'var(--primary)' : 'transparent', color: activeTab === 'my-leaves' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} /> My Leaves
        </button>
        <button onClick={() => setActiveTab('request')} style={{ padding: '12px 24px', background: activeTab === 'request' ? 'var(--primary)' : 'transparent', color: activeTab === 'request' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> Request Leave
        </button>
        {(role === 'admin' || role === 'manager') && (
          <button onClick={() => setActiveTab('admin')} style={{ padding: '12px 24px', background: activeTab === 'admin' ? 'var(--primary)' : 'transparent', color: activeTab === 'admin' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Manage Requests
          </button>
        )}
      </div>

      <div className="page-content">
        {activeTab === 'my-leaves' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>My Leave History</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Type</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>From</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>To</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Reason</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No leave requests found.</td></tr>
                ) : myLeaves.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#1f2937' }}>{l.type}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.start_date.split('T')[0]}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.end_date.split('T')[0]}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.reason}</td>
                    <td style={{ padding: '12px' }}>{renderStatus(l.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'request' && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Apply for Leave</h2>
            {success && <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px' }}>{success}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Leave Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required>
                  {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>From Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>To Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Reason</label>
                <textarea rows="4" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }} required></textarea>
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                <CheckCircle size={18} /> Submit Request
              </button>
            </form>
          </div>
        )}

        {activeTab === 'admin' && (role === 'admin' || role === 'manager') && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Manage Staff Leaves</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Name</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Role</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Type</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>From</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>To</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Reason</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px' }}>Status</th>
                  <th style={{ padding: '12px', color: '#4b5563', fontSize: '13px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminLeaves.length === 0 ? (
                  <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No requests found.</td></tr>
                ) : adminLeaves.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#1f2937' }}>{l.user_name}</td>
                    <td style={{ padding: '12px', color: '#4b5563', textTransform: 'capitalize' }}>{l.user_role}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.type}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.start_date.split('T')[0]}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.end_date.split('T')[0]}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{l.reason}</td>
                    <td style={{ padding: '12px' }}>{renderStatus(l.status)}</td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      {l.status === 'Pending' && (
                        <>
                          <button onClick={() => handleAction(l.id, 'Approved')} style={{ background: '#d1fae5', color: '#059669', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Approve"><CheckCircle size={16} /></button>
                          <button onClick={() => handleAction(l.id, 'Rejected')} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Reject"><XCircle size={16} /></button>
                        </>
                      )}
                      {l.status !== 'Pending' && <span style={{ color: '#9ca3af', fontSize: '12px', marginRight: '8px' }}>Done</span>}
                      <button onClick={() => handleDeleteLeave(l.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaves;
