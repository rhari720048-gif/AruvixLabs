import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Phone, FileText, Search, User, Users, Trash2, Calendar, PhoneCall, Filter, Download } from 'lucide-react';
import { getPerms } from './permissions';
import toast from 'react-hot-toast';

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
      toast.error("Failed to load call history.");
    }
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return toast.error('No call activity logs to export.');
    
    const exportRows = filteredLogs.map(log => ({
      'Caller Name': log.employee_name || 'Unknown',
      'Customer Name': log.customer_name || 'N/A',
      'Phone Number': log.phone || '',
      'Outcome Status': log.status || '',
      'Call Duration': formatTime(log.duration),
      'Call Time': log.created_at ? new Date(log.created_at).toLocaleString() : '',
      'Notes': log.notes || ''
    }));

    const headers = Object.keys(exportRows[0]);
    const csvRows = [headers.join(',')];
    for (const row of exportRows) {
      const values = headers.map(h => `"${('' + (row[h] || '')).replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Call_Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Call history exported to CSV!');
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
        toast.success("Call log deleted successfully.");
      } else {
        toast.error("Failed to delete call log.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting call log.");
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
    return Object.entries(grouped).sort((a, b) => b[1].calls - a[1].calls);
  }, [filteredLogs]);

  return (
    <div className="page-call-history" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <PhoneCall size={28} color="var(--primary)" />
            Call Activity Log
          </h1>
          <p>Comprehensive audit history of completed calls, talk time, and outcome notes</p>
        </div>
        <button onClick={handleExportCSV} className="btn-export-csv">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('my')}
          className={`btn ${activeTab === 'my' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <User size={18} /> My Call History
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={18} /> All Staff Call Logs
        </button>
      </div>

      <div className="card-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by phone number or customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '42px' }}
          />
        </div>
      </div>

      {userGroupedLogs.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          No call history records available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {userGroupedLogs.map(([empName, groupData]) => (
            <div key={empName} className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: '800' }}>{empName}</h3>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                  <span>Calls: <strong style={{ color: '#0F172A' }}>{groupData.calls}</strong></span>
                  <span>Talk Time: <strong style={{ color: 'var(--primary)' }}>{formatDurationLong(groupData.duration)}</strong></span>
                </div>
              </div>

              <div className="data-table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>Outcome Status</th>
                      <th>Call Duration</th>
                      <th>Notes</th>
                      {canDelete && <th style={{ textAlign: 'center' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {groupData.logs.map(log => (
                      <tr key={log.id}>
                        <td data-label="Date & Time" style={{ fontSize: '13px' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td data-label="Customer Name">
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{log.customer_name || 'Unknown'}</div>
                        </td>
                        <td data-label="Phone">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                            <Phone size={14} color="var(--primary)" /> {log.phone || '-'}
                          </div>
                        </td>
                        <td data-label="Outcome Status">
                          <span className={`status-pill ${log.status === 'Appointment' ? 'interested' : log.status === 'NI' || log.status === 'Not Interested' ? 'ni' : 'callback'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td data-label="Call Duration" style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0F172A' }}>
                          {formatTime(log.duration)}
                        </td>
                        <td data-label="Notes" style={{ color: '#64748b', fontSize: '13px', maxWidth: '250px' }}>
                          {log.notes || '-'}
                        </td>
                        {canDelete && (
                          <td data-label="Actions" style={{ display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => handleDelete(log.id)} className="btn btn-secondary" style={{ padding: '6px', color: '#ef4444' }} title="Delete Log">
                              <Trash2 size={16} color="#ef4444" />
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
  );
};

export default CallHistory;
