import React, { useState, useEffect } from 'react';
import { Calendar, Clock, LogIn, LogOut, CheckCircle } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

export default function MyAttendance() {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/attendance/history`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) { console.error(e); }
  };
  
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const diff = new Date(end) - new Date(start);
    const mins = Math.floor((diff / 1000) / 60);
    const hours = Math.floor(mins / 60);
    const rMins = mins % 60;
    return hours > 0 ? `${hours}h ${rMins}m` : `${rMins}m`;
  };

  const presentDays = history.filter(h => h.status === 'Present').length;
  
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#111827', fontSize: 24, fontWeight: 700 }}>My Attendance History</h2>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>View your daily logs and working hours</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="#4f46e5" />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{presentDays}</div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Total Present Days</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Check In</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Check Out</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, i) => (
              <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color="#9ca3af" /> {formatDate(record.date)}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: record.status === 'Present' ? '#d1fae5' : '#fee2e2', color: record.status === 'Present' ? '#065f46' : '#dc2626' }}>
                    {record.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', color: '#4b5563', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LogIn size={14} color="#10b981"/> {formatTime(record.check_in)}</div>
                </td>
                <td style={{ padding: '14px 20px', color: '#4b5563', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><LogOut size={14} color="#ef4444"/> {formatTime(record.check_out)}</div>
                </td>
                <td style={{ padding: '14px 20px', color: '#4f46e5', fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/> {calculateDuration(record.check_in, record.check_out)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No attendance history found.</div>
        )}
      </div>
    </div>
  );
}
