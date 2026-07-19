import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Phone, FileText, Search, User, Users, PlusCircle, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import { getPerms } from './permissions';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const CallHistory = () => {
  const { canDelete } = getPerms('call_history');
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'all'
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory(activeTab);
  }, [activeTab]);

  const fetchHistory = async (type = activeTab) => {
    try {
      const res = await fetch(`${API}/telecalling/history/all?type=${type}`, {
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this call log?")) return;
    try {
      const res = await fetch(`${API}/telecalling/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setLogs(logs.filter(l => l.id !== id));
      } else {
        alert("Failed to delete call log.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting call log.");
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

  const userGroupedLogs = useMemo(() => {
    const grouped = {};
    filteredLogs.forEach(log => {
      const empName = log.employee_name || 'Unknown';
      if (!grouped[empName]) {
        grouped[empName] = { calls: 0, duration: 0, logs: [] };
      }
      grouped[empName].calls += 1;
      grouped[empName].duration += (log.duration || 0);
      grouped[empName].logs.push(log);
    });
    // Convert to array and sort by number of calls descending
    return Object.entries(grouped).sort((a, b) => b[1].calls - a[1].calls);
  }, [filteredLogs]);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button 
              onClick={() => setActiveTab('my')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'my' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'my' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500' }}
          >
              <User size={18} /> My Call History
          </button>
          <button 
              onClick={() => setActiveTab('all')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'all' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500' }}
          >
              <Users size={18} /> All Call History
          </button>
      </div>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#111827' }}>
              <Clock color="#6366f1" /> {activeTab === 'my' ? 'My Call History' : 'All Call History'}
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {userGroupedLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                No call history available.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {userGroupedLogs.map(([empName, groupData]) => (
                  <div key={empName} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '50%' }}>
                          <User size={20} color="#4f46e5" />
                        </div>
                        <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>{empName}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#64748b' }}>
                        <span>Total Calls: <strong style={{ color: '#0f172a' }}>{groupData.calls}</strong></span>
                        <span>Duration: <strong style={{ color: '#0f172a' }}>{formatDurationLong(groupData.duration)}</strong></span>
                      </div>
                    </div>

                    <div className="data-table-container">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', background: 'white' }}>
                            <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Date & Time</th>
                            <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Customer</th>
                            <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Phone</th>
                            <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Status</th>
                            <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Duration</th>
                            <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Notes</th>
                            {canDelete && <th style={{ padding: '12px 20px', color: '#475569', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {groupData.logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s', background: 'white' }}>
                              <td data-label="Date & Time" style={{ padding: '12px 20px', color: '#475569', fontSize: '14px' }}>
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td data-label="Customer" style={{ padding: '12px 20px', fontWeight: '500', color: '#1e293b' }}>
                                {log.customer_name || 'Unknown'}
                              </td>
                              <td data-label="Phone" style={{ padding: '12px 20px', color: '#475569' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Phone size={14} /> {log.phone || '-'}
                                </div>
                              </td>
                              <td data-label="Status" style={{ padding: '12px 20px' }}>
                                <span style={{ 
                                  padding: '4px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: '600',
                                  background: log.status === 'Appointment' ? '#d1fae5' : log.status === 'NI' || log.status === 'Not Interested' ? '#fee2e2' : '#fef3c7',
                                  color: log.status === 'Appointment' ? '#065f46' : log.status === 'NI' || log.status === 'Not Interested' ? '#991b1b' : '#92400e'
                                }}>
                                  {log.status}
                                </span>
                              </td>
                              <td data-label="Duration" style={{ padding: '12px 20px', fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>
                                {formatTime(log.duration)}
                              </td>
                              <td data-label="Notes" style={{ padding: '12px 20px', color: '#64748b', fontSize: '13px' }}>
                                {log.notes || '-'}
                              </td>
                              {canDelete && (
                                <td data-label="Actions" style={{ padding: '12px 20px', textAlign: 'center' }}>
                                  <button onClick={() => handleDelete(log.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default CallHistory;
