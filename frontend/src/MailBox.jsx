import React, { useState, useEffect } from 'react';
import { Mail, Send, Inbox, CheckCircle, Plus } from 'lucide-react';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const MailBox = () => {
  const perms = getPerms('mail');
  const hasInbox = perms.inbox ?? perms.canView;
  const hasCompose = perms.compose ?? perms.canView;

  const [activeTab, setActiveTab] = useState(() => {
    if (hasInbox) return 'inbox';
    if (hasCompose) return 'compose';
    return '';
  });
  const [mails, setMails] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [form, setForm] = useState({ receiver_id: '', subject: '', body: '' });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMails();
    fetchUsers();
  }, []);

  const fetchMails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/mail`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMails(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.receiver_id) return alert('Select a recipient');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess('Message sent successfully!');
        setForm({ receiver_id: '', subject: '', body: '' });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/mail/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMails();
    } catch (e) { console.error(e); }
  };

  if (!hasInbox && !hasCompose) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access any folders in Mail Box. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="mail-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasInbox && (
          <button onClick={() => setActiveTab('inbox')} style={{ padding: '12px 24px', background: activeTab === 'inbox' ? 'var(--primary)' : 'transparent', color: activeTab === 'inbox' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Inbox size={18} /> Inbox
          </button>
        )}
        {hasCompose && (
          <button onClick={() => setActiveTab('compose')} style={{ padding: '12px 24px', background: activeTab === 'compose' ? 'var(--primary)' : 'transparent', color: activeTab === 'compose' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Compose
          </button>
        )}
      </div>
 
      <div className="page-content">
        {activeTab === 'inbox' && hasInbox && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Inbox ({mails.filter(m => m.status === 'Unread').length} unread)</h2>
            {mails.length === 0 ? <p style={{ color: '#6b7280' }}>No messages found.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mails.map(m => (
                  <div key={m.id} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: m.status === 'Unread' ? '#f0fdf4' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: m.status === 'Unread' ? 'bold' : 'normal', color: '#1f2937', marginBottom: '5px' }}>{m.subject}</div>
                      <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>From: {m.sender_name} | {m.created_at.split('T')[0]}</div>
                      <div style={{ color: '#374151', fontSize: '14px' }}>{m.body}</div>
                    </div>
                    {m.status === 'Unread' && (
                      <button onClick={() => markRead(m.id)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Mark Read</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
 
        {activeTab === 'compose' && hasCompose && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Compose Message</h2>
            {success && <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px' }}><CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>{success}</div>}
            
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>To</label>
                <select value={form.receiver_id} onChange={e => setForm({...form, receiver_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required>
                  <option value="">Select recipient</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Subject</label>
                <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message</label>
                <textarea rows="5" value={form.body} onChange={e => setForm({...form, body: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }} required></textarea>
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailBox;
