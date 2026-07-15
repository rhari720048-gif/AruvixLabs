import React, { useState, useEffect } from 'react';
import { Bell, Clock, Play, Pause, Square, Check, X, CheckCircle, Search } from 'lucide-react';

const API = 'http://localhost:5000/api';

const decodeToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch (e) { return null; }
};

export default function Header() {
  const token = localStorage.getItem('token');
  const user = decodeToken(token) || { name: 'User', role: 'employee' };
  
  const [attStatus, setAttStatus] = useState('not_checked_in'); // not_checked_in, checked_in, pass_pending, on_pass, checked_out
  const [pendingPasses, setPendingPasses] = useState([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passReason, setPassReason] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState('');

  const isAdmin = user.role === 'admin' || user.role === 'manager';

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/attendance/today`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAttStatus(data.status);
      }
    } catch (e) { console.error(e); }
  };

  const fetchPendingPasses = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${API}/attendance/admin/pending`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPendingPasses(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchStatus();
    fetchPendingPasses();
    const interval = setInterval(() => {
      fetchStatus();
      fetchPendingPasses();
    }, 15000); // Poll every 15s for demo
    return () => clearInterval(interval);
  }, [token, isAdmin]);

  const handleCheckIn = async () => {
    try {
      const res = await fetch(`${API}/attendance/check-in`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
      if (res.ok) { fetchStatus(); showToast('Checked In Successfully!'); }
    } catch (e) { console.error(e); }
  };

  const handleCheckOut = async () => {
    if (!window.confirm("Are you sure you want to Check Out for the day?")) return;
    try {
      const res = await fetch(`${API}/attendance/check-out`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
      if (res.ok) { fetchStatus(); showToast('Checked Out Successfully!'); }
    } catch (e) { console.error(e); }
  };

  const handleRequestPass = async (e) => {
    e.preventDefault();
    if (!passReason.trim()) return;
    try {
      const res = await fetch(`${API}/attendance/pass/request`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: passReason })
      });
      if (res.ok) { 
        fetchStatus(); 
        setShowPassModal(false); 
        setPassReason('');
        showToast('Pass started. Work paused.');
      }
    } catch (e) { console.error(e); }
  };

  const handleResume = async () => {
    try {
      const res = await fetch(`${API}/attendance/pass/resume`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
      if (res.ok) { fetchStatus(); showToast('Work Resumed!'); }
    } catch (e) { console.error(e); }
  };

  const handlePassAction = async (id, action) => {
    try {
      const res = await fetch(`${API}/attendance/admin/passes/${id}/action`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      if (res.ok) { 
        fetchPendingPasses();
        showToast(`Pass ${action}d successfully`);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, background: '#1f2937', color: 'white', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          <CheckCircle size={18} color="#10b981" /> {toast}
        </div>
      )}

      <h2 style={{ margin: 0 }}>Welcome back, {user.name}</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Attendance Widget */}
        <div style={{ background: '#f3f4f6', padding: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {attStatus === 'not_checked_in' && (
            <button onClick={handleCheckIn} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <Play size={16} /> Check In
            </button>
          )}
          
          {(attStatus === 'checked_in' || attStatus === 'pass_rejected') && (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#059669', padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4 }}><div style={{width:8,height:8,background:'#10b981',borderRadius:'50%'}}></div> Working</span>
              <button onClick={() => setShowPassModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Pause size={16} /> Pass
              </button>
              <button onClick={handleCheckOut} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Square size={16} /> Check Out
              </button>
            </>
          )}

          {attStatus === 'pass_pending' && (
            <div style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#d97706', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> Pass Pending...
            </div>
          )}

          {attStatus === 'on_pass' && (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#d97706', padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4 }}><div style={{width:8,height:8,background:'#f59e0b',borderRadius:'50%'}}></div> On Pass</span>
              <button onClick={handleResume} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <Play size={16} /> Resume Work
              </button>
            </>
          )}

          {attStatus === 'checked_out' && (
            <div style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
              Day Completed
            </div>
          )}
        </div>



        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontWeight: 600, color: '#374151' }}>{user.name}</span>
        </div>
      </div>

      {/* Pass Request Modal */}
      {showPassModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 400 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>Request Pass</h3>
            <form onSubmit={handleRequestPass}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#374151' }}>Reason for leaving</label>
              <textarea 
                required 
                value={passReason} 
                onChange={e => setPassReason(e.target.value)} 
                placeholder="Going to bank, lunch, etc..."
                style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setShowPassModal(false)} style={{ flex: 1, padding: 10, background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 10, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
