import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Video } from 'lucide-react';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const CalendarApp = () => {
  const perms = getPerms('calendar');
  const canCreate = perms.create_meeting ?? perms.canCreate;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', time: '', link: '', assigned_to: '' });

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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDayClick = (day) => {
    if (!canCreate) return;
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // adjust for local timezone offset so it doesn't shift
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().split('T')[0];
    
    setSelectedDate(localISOTime);
    setForm({ title: '', description: '', time: '10:00', link: '', assigned_to: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form, date: selectedDate };
      const res = await fetch(`${API}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchMeetings();
      }
    } catch (e) { console.error(e); }
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="calendar-page" style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={28} color="var(--primary)" /> Calendar
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={prevMonth} style={{ padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={20} color="#4b5563" /></button>
          <span style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', minWidth: '150px', textAlign: 'center' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} style={{ padding: '8px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronRight size={20} color="#4b5563" /></button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Days of week */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ background: '#f9fafb', padding: '15px 10px', textAlign: 'center', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>{d}</div>
        ))}
        
        {/* Days */}
        {days.map((day, i) => {
          let dayMeetings = [];
          if (day) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const tzOffset = d.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().split('T')[0];
            dayMeetings = meetings.filter(m => m.date.startsWith(localISOTime));
          }

          return (
            <div 
              key={i} 
              onClick={() => day ? handleDayClick(day) : null}
              style={{ 
                background: 'white', 
                minHeight: '120px', 
                padding: '10px', 
                cursor: day ? 'pointer' : 'default',
                position: 'relative'
              }}
            >
              {day && (
                <>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151', display: 'inline-block', marginBottom: '5px' }}>{day}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayMeetings.map(m => (
                      <div key={m.id} style={{ fontSize: '11px', padding: '4px 6px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.time} - {m.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>Schedule for {selectedDate}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Assign To</label>
                  <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Link (Optional)</label>
                <input type="url" value={form.link} onChange={e => setForm({...form, link: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Description (Optional)</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>Save Meeting</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
