import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Phone, FileText, Search, User } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const CallHistory = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/telecalling/history/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return '00:00';
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatDurationLong = (totalSeconds) => {
    if (!totalSeconds) return '0s';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => (log.phone && log.phone.includes(searchTerm)) || (log.customer_name && log.customer_name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [logs, searchTerm]);

  const userStats = useMemo(() => {
    const stats = {};
    filteredLogs.forEach(log => {
      const empName = log.employee_name || 'Unknown';
      if (!stats[empName]) {
        stats[empName] = { calls: 0, duration: 0 };
      }
      stats[empName].calls += 1;
      stats[empName].duration += (log.duration || 0);
    });
    return Object.entries(stats).sort((a, b) => b[1].calls - a[1].calls);
  }, [filteredLogs]);

  return (
    <div className="page-container" style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={24} color="#6366f1" /> Global Call History
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '300px' }}>
          <Search size={18} color="#64748b" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Search by phone number or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px' }}
          />
        </div>
      </div>

      {/* User Statistics Summary */}
      {userStats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
          {userStats.map(([empName, stats]) => (
            <div key={empName} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="#6366f1" /> {empName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Total Calls:</span> <strong style={{ color: '#0f172a' }}>{stats.calls}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Duration:</span> <strong style={{ color: '#0f172a' }}>{formatDurationLong(stats.duration)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Date & Time</th>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Employee</th>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Customer</th>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Duration</th>
              <th style={{ padding: '15px', color: '#475569', fontWeight: '600' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0', transition: '0.2s' }}>
                <td style={{ padding: '15px', color: '#475569', fontSize: '14px' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '15px', fontWeight: '500', color: '#6366f1' }}>
                  {log.employee_name || 'Unknown'}
                </td>
                <td style={{ padding: '15px', fontWeight: '500', color: '#1e293b' }}>
                  {log.customer_name || 'Unknown'}
                </td>
                <td style={{ padding: '15px', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> {log.phone || '-'}
                  </div>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '600',
                    background: log.status === 'Appointment' ? '#d1fae5' : log.status === 'NI' || log.status === 'Not Interested' ? '#fee2e2' : '#fef3c7',
                    color: log.status === 'Appointment' ? '#065f46' : log.status === 'NI' || log.status === 'Not Interested' ? '#991b1b' : '#92400e'
                  }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ padding: '15px', fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>
                  {formatTime(log.duration)}
                </td>
                <td style={{ padding: '15px', color: '#64748b', fontSize: '14px' }}>
                  {log.notes || '-'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                  No call history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallHistory;
