import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar as CalendarIcon, ChevronDown, ChevronUp, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const toDatetimeLocal = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function StaffAttendance() {
  const perms = getPerms('attendance');
  const canEdit = perms.edit ?? perms.canEdit;
  const canDelete = perms.delete ?? perms.canDelete;

  const [report, setReport] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expanded, setExpanded] = useState(null);
  const [editModal, setEditModal] = useState(null); // { id, name, status, check_in, check_out }

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 5000);
    return () => clearInterval(interval);
  }, [date]);

  const fetchReport = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/attendance/admin/report?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) { console.error(e); }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const diff = new Date(end) - new Date(start);
    const mins = Math.floor((diff / 1000) / 60);
    const hours = Math.floor(mins / 60);
    const rMins = mins % 60;
    if (hours > 0) return `${hours}h ${rMins}m`;
    return `${rMins}m`;
  };

  const handleEditClick = (user) => {
    setEditModal({
      id: user.attendance_id,
      name: user.name,
      status: user.status || 'Present',
      check_in: user.check_in ? toDatetimeLocal(user.check_in) : '',
      check_out: user.check_out ? toDatetimeLocal(user.check_out) : ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/attendance/admin/${editModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          check_in: editModal.check_in || null,
          check_out: editModal.check_out || null,
          status: editModal.status
        })
      });
      if (res.ok) {
        fetchReport();
        setEditModal(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteClick = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/attendance/admin/${attendanceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchReport();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 24, fontWeight: 700 }}>Staff Attendance</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Daily attendance report and pass tracking</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '8px 16px', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <CalendarIcon size={18} color="#6b7280" />
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#374151', background: 'transparent' }} 
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Staff Member</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Check In</th>
              <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Check Out</th>
              <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {report.map(user => {
              const isPresent = !!user.attendance_id;
              const isExpanded = expanded === user.user_id;

              return (
                <React.Fragment key={user.user_id}>
                  <tr style={{ borderBottom: '1px solid #f3f4f6', background: isExpanded ? '#f8fafc' : 'white', transition: '0.2s' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#111827' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#6b7280', textTransform: 'capitalize' }}>{user.role}</td>
                    <td style={{ padding: '14px 18px' }}>
                      {isPresent ? (
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#d1fae5', color: '#065f46' }}>Present</span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>Absent</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#4b5563', fontWeight: 500 }}>{formatTime(user.check_in)}</td>
                    <td style={{ padding: '14px 18px', color: '#4b5563', fontWeight: 500 }}>{formatTime(user.check_out)}</td>
                    <td style={{ padding: '14px 18px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => setExpanded(isExpanded ? null : user.user_id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: isPresent ? 'pointer' : 'not-allowed', opacity: isPresent ? 1 : 0.5 }}
                        disabled={!isPresent}
                        title="View Pass History"
                      >
                        <Eye size={15} /> {isExpanded ? 'Hide' : 'View'}
                      </button>
                      {canEdit && (
                        <button 
                          onClick={() => handleEditClick(user)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: isPresent ? 'pointer' : 'not-allowed', opacity: isPresent ? 1 : 0.5 }}
                          disabled={!isPresent}
                          title="Edit Attendance"
                        >
                          <Edit2 size={15} /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDeleteClick(user.attendance_id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: isPresent ? 'pointer' : 'not-allowed', opacity: isPresent ? 1 : 0.5 }}
                          disabled={!isPresent}
                          title="Delete Attendance"
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {isExpanded && isPresent && (
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan="6" style={{ padding: '0' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', borderLeft: '4px solid #4f46e5' }}>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#374151' }}>Pass Tracking History</h4>
                          {user.passes && user.passes.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {user.passes.map((pass, i) => (
                                <div key={i} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontWeight: 600, color: '#111827', fontSize: 14, marginBottom: 4 }}>Reason: {pass.reason}</div>
                                    <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 12 }}>
                                      <span>Req: {formatTime(pass.request_time)}</span>
                                      <span>Started: {formatTime(pass.pass_start)}</span>
                                      <span>Ended: {formatTime(pass.pass_end)}</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 12, display: 'inline-block', marginBottom: 6,
                                      background: pass.status === 'approved' ? '#d1fae5' : pass.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                      color: pass.status === 'approved' ? '#059669' : pass.status === 'rejected' ? '#dc2626' : '#d97706',
                                      textTransform: 'capitalize'
                                    }}>
                                      {pass.status}
                                    </div>
                                    {pass.pass_start && pass.pass_end && (
                                      <div style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>Duration: {calculateDuration(pass.pass_start, pass.pass_end)}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>No passes requested today.</div>
                          )}
                          
                          <div style={{ marginTop: 16, display: 'flex', gap: 24, fontSize: 14, fontWeight: 600, color: '#111827' }}>
                            <div>Total Passes: <span style={{ color: '#4f46e5' }}>{user.passes ? user.passes.length : 0}</span></div>
                            {user.check_in && user.check_out && (
                              <div>Total Work Time: <span style={{ color: '#4f46e5' }}>{calculateDuration(user.check_in, user.check_out)}</span></div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {report.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No records found for this date.</div>
        )}
      </div>

      {/* Edit Attendance Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, width: 440, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Edit Attendance: {editModal.name}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><XCircle size={20} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Status</label>
                <select 
                  value={editModal.status} 
                  onChange={e => setEditModal({ ...editModal, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none' }}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Check In Time</label>
                <input 
                  type="datetime-local" 
                  value={editModal.check_in} 
                  onChange={e => setEditModal({ ...editModal, check_in: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' }}>Check Out Time</label>
                <input 
                  type="datetime-local" 
                  value={editModal.check_out} 
                  onChange={e => setEditModal({ ...editModal, check_out: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setEditModal(null)} style={{ flex: 1, padding: 12, background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 12, background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
