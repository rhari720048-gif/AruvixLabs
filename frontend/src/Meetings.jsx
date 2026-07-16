import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, CheckCircle, Search, MoreVertical, Plus, Edit2, Trash2 } from 'lucide-react';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const Meetings = () => {
  const perms = getPerms('meetings');
  const hasScheduleTab = perms.schedule_meeting ?? perms.canCreate;
  const hasMyMeetingsTab = perms.my_meetings ?? perms.canView;
  const canCreate = perms.create ?? perms.canCreate;
  const canEdit = perms.edit ?? perms.canEdit;
  const canDelete = perms.delete ?? perms.canDelete;

  const [activeTab, setActiveTab] = useState(() => {
    if (hasMyMeetingsTab) return 'upcoming';
    if (hasScheduleTab) return 'schedule';
    return '';
  });
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState('');
  
  const [viewMeeting, setViewMeeting] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', link: '', assigned_to: '' });

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/meetings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMeetings(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess('Meeting scheduled successfully!');
        setForm({ title: '', description: '', date: '', time: '', link: '', assigned_to: '' });
        fetchMeetings();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this meeting?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/meetings/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMeetings();
      } catch (e) { console.error(e); }
    }
  };

  const handleView = (m) => {
    setViewMeeting({
      Title: m.title,
      Date: m.date.split('T')[0],
      Time: m.time,
      "Assigned To": m.assigned_to_name || 'Unassigned',
      Link: m.link,
      Description: m.description
    });
  };

  // Filter meetings
  const todayStr = new Date().toISOString().split('T')[0];
  const upcoming = meetings.filter(m => m.date >= todayStr);
  const past = meetings.filter(m => m.date < todayStr);

  if (!hasScheduleTab && !hasMyMeetingsTab) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access any categories in Meetings. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="meetings-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasMyMeetingsTab && (
          <>
            <button onClick={() => setActiveTab('upcoming')} style={{ padding: '12px 24px', background: activeTab === 'upcoming' ? 'var(--primary)' : 'transparent', color: activeTab === 'upcoming' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Upcoming
            </button>
            <button onClick={() => setActiveTab('past')} style={{ padding: '12px 24px', background: activeTab === 'past' ? 'var(--primary)' : 'transparent', color: activeTab === 'past' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Past Meetings
            </button>
          </>
        )}
        {hasScheduleTab && (
          <button onClick={() => setActiveTab('schedule')} style={{ padding: '12px 24px', background: activeTab === 'schedule' ? 'var(--primary)' : 'transparent', color: activeTab === 'schedule' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Schedule New
          </button>
        )}
      </div>

      <div className="page-content">
        {(activeTab === 'upcoming' || activeTab === 'past') && hasMyMeetingsTab && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
              <p style={{ color: '#6b7280' }}>No {activeTab} meetings found.</p>
            ) : (
              (activeTab === 'upcoming' ? upcoming : past).map(m => (
                <div key={m.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                        {m.link ? <Video size={20} /> : <Calendar size={20} />}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>{m.title}</h3>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{m.assigned_to_name || 'Unassigned'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                      <Calendar size={16} color="#6b7280" /> {m.date.split('T')[0]}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '14px' }}>
                      <Clock size={16} color="#6b7280" /> {m.time}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    {m.link && (
                      <button onClick={() => window.open(m.link, '_blank')} style={{ flex: 1, padding: '10px', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Video size={16} /> Join
                      </button>
                    )}
                    <button onClick={() => handleView(m)} style={{ flex: 1, padding: '10px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Details
                    </button>
                    {canDelete && (
                      <button onClick={() => handleDelete(m.id)} style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'schedule' && hasScheduleTab && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Schedule New Meeting</h2>
            {success && <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px' }}>{success}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Meeting Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Meeting Link (optional)</label>
                <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://zoom.us/..." style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Assign To / Attendee</label>
                <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Description (optional)</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> Schedule
              </button>
            </form>
          </div>
        )}
      </div>

      <ViewModal isOpen={!!viewMeeting} onClose={() => setViewMeeting(null)} title="Meeting Details" data={viewMeeting || {}} />
    </div>
  );
};

export default Meetings;
