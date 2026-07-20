import React, { useState, useEffect } from 'react';
import { Bell, Clock, Play, Pause, Square, Check, X, CheckCircle, Search, LogOut, Menu } from 'lucide-react';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const decodeToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch (e) { return null; }
};

export default function Header({ setSidebarOpen }) {
  const token = localStorage.getItem('token');
  const tokenUser = decodeToken(token) || { role: 'employee' };
  
  let storedUser = {};
  try { storedUser = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
  
  const user = {
    name: storedUser.name || localStorage.getItem('user_name') || 'User',
    role: tokenUser.role || storedUser.role || 'employee'
  };
  
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
    <header className="header">
      
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, background: '#1f2937', color: 'white', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
          <CheckCircle size={18} color="#10b981" /> {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h2 className="header-title" style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 24px)' }}>Welcome back, {user.name}</h2>
      </div>
      
      <div></div>

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
