import React, { useState, useEffect } from 'react';
import { PhoneCall, CheckCircle, ThumbsUp, ThumbsDown, X, Edit2, Trash2, MapPin, User, FileText, Activity, Clock, Save, PhoneOff, Car } from 'lucide-react';
import ActionButtons from './ActionButtons';
import EditLeadModal from './EditLeadModal';

const API = 'https://aruvixlabs.onrender.com/api';

const MyLeadsGrid = ({ leads, employees, handleEdit, handleDelete, onStatusUpdate }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Call History State
  const [callHistory, setCallHistory] = useState([]);
  
  // Timer & Call State
  const [callPhase, setCallPhase] = useState('idle'); // 'idle', 'dialing', 'active', 'feedback'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const [feedback, setFeedback] = useState({ selection: '', notes: '', reason: '' });
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [modalEditLead, setModalEditLead] = useState(null);

  useEffect(() => {
    if (selectedLead) {
      fetchCallHistory(selectedLead.id);
      setEditForm({
        name: selectedLead.name,
        phone: selectedLead.phone,
        district: selectedLead.district || selectedLead.location || '',
        status: selectedLead.status,
        requirements: selectedLead.requirements || ''
      });
      setIsEditing(false);
    } else {
      setCallHistory([]);
      resetCallState();
    }
    
    // Cleanup timer on unmount or selectedLead change
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [selectedLead]);

  const fetchCallHistory = async (id) => {
    try {
      const res = await fetch(`${API}/customers/${id}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCallHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetCallState = () => {
    setCallPhase('idle');
    setSecondsElapsed(0);
    setFeedback({ selection: '', notes: '', reason: '' });
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const startDialing = () => {
    setCallPhase('dialing');
    window.location.href = `tel:${selectedLead.phone}`; // Trigger the native dialer
    
    // Start 2 second delay before timer begins
    setTimeout(() => {
      setCallPhase('active');
      setSecondsElapsed(0);
      const interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }, 2000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setCallPhase('feedback');
  };

  const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return '00:00';
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.selection) return alert('Please select a call outcome');
    
    if (['Appointment', 'Call Later'].includes(feedback.selection) && !feedback.notes) {
       return alert('Please enter feedback notes.');
    }
    if (feedback.selection === 'Not Interested' && !feedback.reason) {
       return alert('Please enter a reason.');
    }

    const finalStatus = feedback.selection === 'Not Interested' ? 'NI' : feedback.selection;
    const finalNotes = feedback.selection === 'Not Interested' ? `Reason: ${feedback.reason}` : feedback.notes;

    try {
      const res = await fetch(`${API}/telecalling/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customer_id: selectedLead.id,
          status: finalStatus,
          notes: finalNotes,
          callback_time: feedback.callback_time || null,
          duration: secondsElapsed
        })
      });
      if (res.ok) {
        setSuccessMsg('Feedback submitted successfully!');
        
        // Refresh local lead data optimistically
        selectedLead.status = finalStatus;
        
        resetCallState();
        fetchCallHistory(selectedLead.id);
        
        setTimeout(() => {
          setSuccessMsg('');
          setSelectedLead(null); // Close modal on success
          if (onStatusUpdate) {
             if (finalStatus === 'Appointment') onStatusUpdate('appointment');
             else if (finalStatus === 'Call Later') onStatusUpdate('call-later');
             else if (finalStatus === 'NI') onStatusUpdate('ni');
          }
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit feedback.');
    }
  };

  const closeLead = () => {
    resetCallState();
    setSelectedLead(null);
  };

  const saveEdit = () => {
    if (handleEdit) {
      // AdminLeads handles edit which expects: name, phone, location(as district in AdminLeads payload), requirements, status, etc.
      // We package it similar to what AdminLeads expects.
      handleEdit(selectedLead.id, {
        ...selectedLead,
        name: editForm.name,
        phone: editForm.phone,
        location: editForm.district, // handleEdit maps location -> district payload
        requirements: editForm.requirements,
        car_model: editForm.car_model,
        car_number: editForm.registration_number,
        status: editForm.status
      });
      setSelectedLead({...selectedLead, ...editForm, district: editForm.district});
      setIsEditing(false);
    }
  };

  const triggerDelete = (id) => {
    if (handleDelete && window.confirm("Are you sure you want to delete this lead?")) {
      handleDelete(id);
      if (selectedLead?.id === id) closeLead();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)', margin: 0 }}>My Leads ({leads.length})</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {leads.map(lead => (
          <div 
            key={lead.id} 
            onClick={() => setSelectedLead(lead)}
            style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>{lead.name}</h3>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '20px', 
                  fontSize: '11px', 
                  fontWeight: '600',
                  alignSelf: 'flex-start',
                  background: lead.status === 'Converted' ? '#d1fae5' : lead.status === 'NI' ? '#fee2e2' : '#f3f4f6',
                  color: lead.status === 'Converted' ? '#065f46' : lead.status === 'NI' ? '#991b1b' : '#374151'
                }}>
                  {lead.status || 'Pending'}
                </span>
              </div>
              <ActionButtons 
                onView={() => setSelectedLead(lead)}
                onEdit={() => setModalEditLead(lead)}
                onDelete={() => triggerDelete(lead.id)}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
              <PhoneCall size={14} /> {lead.phone}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '14px' }}>
              <MapPin size={14} /> {lead.location || lead.district || 'Location unknown'}
            </div>

            {lead.requirements && (
              <div style={{ marginTop: '10px', fontSize: '13px', color: '#4b5563', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                <strong>Req:</strong> {lead.requirements}
              </div>
            )}
          </div>
        ))}
        {leads.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
            No leads assigned to you yet.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Lead Details</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                {handleEdit && !isEditing && (
                  <button onClick={() => setModalEditLead(selectedLead)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', color: '#4b5563' }} title="Edit Lead">
                    <Edit2 size={18} />
                  </button>
                )}
                {isEditing && (
                  <button onClick={saveEdit} style={{ background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <Save size={18} /> Save
                  </button>
                )}
                {handleDelete && (
                  <button onClick={() => triggerDelete(selectedLead.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', color: '#ef4444' }} title="Delete Lead">
                    <Trash2 size={18} />
                  </button>
                )}
                <button onClick={closeLead} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {successMsg && (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                  <CheckCircle size={20} /> {successMsg}
                </div>
              )}

              {/* Lead Details Grid */}
              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14}/> Name</div>
                  {isEditing ? (
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  ) : (
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>{selectedLead.name}</div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><PhoneCall size={14}/> Phone</div>
                  {isEditing ? (
                    <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  ) : (
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>{selectedLead.phone}</div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14}/> Location</div>
                  {isEditing ? (
                    <input type="text" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  ) : (
                    <div style={{ fontWeight: '500', color: '#374151', fontSize: '15px' }}>{selectedLead.district || selectedLead.location || '-'}</div>
                  )}
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14}/> Status</div>
                  {isEditing ? (
                     <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                       <option value="Pending">Pending</option>
                       <option value="Call Later">Call Later</option>
                     </select>
                  ) : (
                    <div style={{ fontWeight: '500', color: '#374151', fontSize: '15px' }}>{selectedLead.status || 'Pending'}</div>
                  )}
                </div>
                <div className="responsive-grid" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={14}/> Car Model</div>
                    {isEditing ? (
                      <input type="text" value={editForm.car_model || ''} onChange={e => setEditForm({...editForm, car_model: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    ) : (
                      <div style={{ fontWeight: '500', color: '#374151', fontSize: '15px' }}>{selectedLead.car_model || selectedLead.car_name || '-'}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Car size={14}/> Registration Number</div>
                    {isEditing ? (
                      <input type="text" value={editForm.registration_number || ''} onChange={e => setEditForm({...editForm, registration_number: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    ) : (
                      <div style={{ fontWeight: '500', color: '#374151', fontSize: '15px' }}>{selectedLead.registration_number || '-'}</div>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14}/> Requirements</div>
                  {isEditing ? (
                    <textarea value={editForm.requirements} onChange={e => setEditForm({...editForm, requirements: e.target.value})} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                  ) : (
                    <div style={{ fontWeight: '500', color: '#374151', fontSize: '15px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      {selectedLead.requirements || 'N/A'}
                    </div>
                  )}
                </div>
              </div>

              {/* Call History */}
              {callHistory.length > 0 && (
                <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                    <Clock size={18} color="#6366f1" /> Call History
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                    {callHistory.map(log => (
                      <div key={log.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: log.status === 'Interested' || log.status === 'Appointment' ? '#10b981' : log.status === 'Not Interested' || log.status === 'NI' ? '#ef4444' : '#f59e0b' }}>
                            {log.status}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {log.duration > 0 && (
                              <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                                ⏱ {formatTime(log.duration)}
                              </span>
                            )}
                            {new Date(log.created_at || log.call_date).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: '#4b5563', marginTop: '5px' }}>{log.notes || 'No notes'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call Action Section */}
              <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '24px', textAlign: 'center' }}>
                {callPhase === 'idle' && (
                  <div>
                    <h3 style={{ margin: '0 0 15px', color: '#374151' }}>Ready to call this lead?</h3>
                    <button 
                      onClick={startDialing}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                        background: '#10b981', color: 'white', padding: '16px 32px', border: 'none',
                        borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold',
                        fontSize: '18px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <PhoneCall size={24} /> Dial Now
                    </button>
                  </div>
                )}

                {callPhase === 'dialing' && (
                  <div style={{ padding: '20px', animation: 'pulse 1.5s infinite' }}>
                    <PhoneCall size={48} color="#10b981" style={{ marginBottom: '10px' }} />
                    <h3 style={{ margin: 0, color: '#10b981' }}>Dialing...</h3>
                  </div>
                )}

                {callPhase === 'active' && (
                  <div style={{ background: '#f0fdf4', padding: '30px', borderRadius: '16px', border: '2px solid #86efac' }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#15803d', fontFamily: 'monospace', marginBottom: '20px' }}>
                      {formatTime(secondsElapsed)}
                    </div>
                    <button 
                      onClick={stopTimer}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                        background: '#ef4444', color: 'white', padding: '16px 40px', border: 'none',
                        borderRadius: '50px', fontWeight: 'bold', fontSize: '18px',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <PhoneOff size={24} /> End Call
                    </button>
                  </div>
                )}

                {callPhase === 'feedback' && (
                  <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#1e293b', textAlign: 'center' }}>How did the call go?</h3>
                    <div style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b', fontWeight: '500' }}>
                      Call Duration: <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{formatTime(secondsElapsed)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <button 
                        onClick={() => setFeedback({ ...feedback, selection: 'Appointment', reason: '' })}
                        style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', border: '2px solid', borderColor: feedback.selection === 'Appointment' ? '#10b981' : '#e2e8f0', background: feedback.selection === 'Appointment' ? '#ecfdf5' : 'white', color: feedback.selection === 'Appointment' ? '#065f46' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: '0.2s', fontSize: '13px' }}
                      >
                        <ThumbsUp size={20} style={{ display: 'block', margin: '0 auto 6px' }} />
                        Appointment
                      </button>
                      <button 
                        onClick={() => setFeedback({ ...feedback, selection: 'Call Later', reason: '' })}
                        style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', border: '2px solid', borderColor: feedback.selection === 'Call Later' ? '#f59e0b' : '#e2e8f0', background: feedback.selection === 'Call Later' ? '#fef3c7' : 'white', color: feedback.selection === 'Call Later' ? '#92400e' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: '0.2s', fontSize: '13px' }}
                      >
                        <Clock size={20} style={{ display: 'block', margin: '0 auto 6px' }} />
                        Call Later
                      </button>
                      <button 
                        onClick={() => setFeedback({ ...feedback, selection: 'Not Interested', notes: '' })}
                        style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', border: '2px solid', borderColor: feedback.selection === 'Not Interested' ? '#ef4444' : '#e2e8f0', background: feedback.selection === 'Not Interested' ? '#fef2f2' : 'white', color: feedback.selection === 'Not Interested' ? '#991b1b' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: '0.2s', fontSize: '13px' }}
                      >
                        <ThumbsDown size={20} style={{ display: 'block', margin: '0 auto 6px' }} />
                        Not Interested
                      </button>
                    </div>
                    
                    {['Appointment', 'Call Later'].includes(feedback.selection) && (
                      <div style={{ animation: 'fadeIn 0.3s' }}>
                        {feedback.selection === 'Appointment' && (
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Appointment Date & Time</label>
                            <input 
                              type="datetime-local" 
                              value={feedback.callback_time || ''} 
                              onChange={e => setFeedback({ ...feedback, callback_time: e.target.value })} 
                              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                              required
                            />
                          </div>
                        )}
                        {feedback.selection === 'Call Later' && (
                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Callback Date & Time</label>
                            <input 
                              type="datetime-local" 
                              value={feedback.callback_time || ''} 
                              onChange={e => setFeedback({ ...feedback, callback_time: e.target.value })} 
                              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                              required
                            />
                          </div>
                        )}
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Feedback Notes</label>
                        <textarea 
                          placeholder="Enter conversation notes, next steps..."
                          value={feedback.notes}
                          onChange={e => setFeedback({ ...feedback, notes: e.target.value })}
                          style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '100px', resize: 'vertical', marginBottom: '20px', outline: 'none' }}
                        />
                      </div>
                    )}

                    {feedback.selection === 'Not Interested' && (
                      <div style={{ animation: 'fadeIn 0.3s' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Reason for Not Interested</label>
                        <textarea 
                          placeholder="E.g., Too expensive, already bought, wrong number..."
                          value={feedback.reason}
                          onChange={e => setFeedback({ ...feedback, reason: e.target.value })}
                          style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '100px', resize: 'vertical', marginBottom: '20px', outline: 'none' }}
                        />
                      </div>
                    )}

                    {(feedback.selection) && (
                      <button 
                        onClick={handleFeedbackSubmit}
                        style={{ width: '100%', padding: '15px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        <CheckCircle size={20} /> Submit
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <EditLeadModal 
        isOpen={!!modalEditLead} 
        onClose={() => setModalEditLead(null)} 
        data={modalEditLead} 
        onSave={(updated) => { 
          if (handleEdit) handleEdit(updated.id, updated);
          if (selectedLead?.id === updated.id) {
            setSelectedLead({...selectedLead, ...updated});
          }
          setModalEditLead(null); 
        }} 
      />
    </div>
  );
};

export default MyLeadsGrid;
