import React, { useState, useEffect } from 'react';
import { Users, Clock, Calendar as CalendarIcon, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

export default function StaffAttendance() {
  const [report, setReport] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchReport();
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
              <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Details</th>
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
                    <td style={{ padding: '14px 18px' }}>
                      <button 
                        onClick={() => setExpanded(isExpanded ? null : user.user_id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}
                        disabled={!isPresent}
                      >
                        {isExpanded ? 'Hide' : 'View'}
                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
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
    </div>
  );
}
