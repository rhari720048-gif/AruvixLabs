import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Phone, FileText, Search, User, Users, PlusCircle, CheckCircle, Edit3 } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const CallHistory = () => {
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'all', 'manual'
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Manual form state
  const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', status: 'Interested', car_name: '', car_number: '', requirements: '', assignedTo: [], notes: '', duration: 0 });
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (activeTab !== 'manual') {
      fetchHistory(activeTab);
    } else {
      fetchUsers();
    }
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

  const fetchUsers = async () => {
    if (users.length > 0) return;
    try {
        const res = await fetch(`${API}/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phone) {
        return alert("Name and Phone are required!");
    }
    
    setIsSubmitting(true);
    try {
        // We will call the manual-ni endpoint if it's NI, or manual-appointment if it's Appointment.
        // Actually, let's just make a generic manual-call endpoint.
        // Wait, for simplicity, since we didn't add a generic manual endpoint to backend, 
        // we can reuse manual-appointment and change it, but wait, we can't change the status.
        // Let's add a generic endpoint /api/telecalling/manual-entry in a minute.
        const res = await fetch(`${API}/telecalling/manual-entry`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(manualForm)
        });
        if (res.ok) {
            setSuccessMsg('Manual Call Log added successfully!');
            setManualForm({ name: '', phone: '', location: '', status: 'Interested', car_name: '', car_number: '', requirements: '', assignedTo: [], notes: '', duration: 0 });
            setTimeout(() => setSuccessMsg(''), 3000);
        } else {
            const err = await res.json();
            alert(err.error || "Failed to save call log");
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred");
    } finally {
        setIsSubmitting(false);
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
          <button 
              onClick={() => setActiveTab('manual')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'manual' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'manual' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500' }}
          >
              <PlusCircle size={18} /> Manual Entry
          </button>
      </div>

      {successMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <CheckCircle size={18} /> {successMsg}
          </div>
      )}

      {activeTab === 'manual' ? (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '30px', overflowY: 'auto' }}>
              <h2 style={{ marginBottom: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Edit3 size={24} color="var(--primary)" /> Add Call Log Manually
              </h2>
              <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Customer Name *</label>
                      <input type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter name" required />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Phone Number *</label>
                      <input type="tel" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter phone" required />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Location</label>
                      <input type="text" value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter location" />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Call Status</label>
                      <select value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}>
                          <option value="Interested">Interested</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="Callback">Callback</option>
                          <option value="Appointment">Appointment</option>
                          <option value="RNR">RNR (Ring No Response)</option>
                          <option value="Busy">Busy</option>
                      </select>
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Call Duration (Seconds)</label>
                      <input type="number" value={manualForm.duration} onChange={e => setManualForm({...manualForm, duration: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Duration in seconds" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Assign To</label>
                      <select multiple value={manualForm.assignedTo} onChange={e => setManualForm({...manualForm, assignedTo: Array.from(e.target.selectedOptions, option => option.value)})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', height: '100px' }}>
                          {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                          ))}
                      </select>
                      <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>Hold Ctrl/Cmd to select multiple. Leave blank to assign to yourself.</span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Notes</label>
                      <textarea value={manualForm.notes} onChange={e => setManualForm({...manualForm, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', height: '80px', resize: 'vertical' }} placeholder="Add any call notes here..."></textarea>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="submit" disabled={isSubmitting} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                          {isSubmitting ? 'Saving...' : 'Save Manual Call Entry'}
                      </button>
                  </div>
              </form>
          </div>
      ) : (
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
      )}
    </div>
  );
};

export default CallHistory;
