import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, Clock, MapPin, Car, CheckCircle, Phone, ThumbsUp, ThumbsDown, PhoneOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = 'https://aruvixlabs.onrender.com/api';

const StartDial = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Timer & Call State
  const [callPhase, setCallPhase] = useState('idle'); // 'idle', 'dialing', 'active', 'feedback'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const [feedback, setFeedback] = useState({ selection: '', notes: '', reason: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [callHistory, setCallHistory] = useState([]);

  useEffect(() => {
    fetchLeads();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    }
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchCallHistory(selectedLead.id);
    } else {
      setCallHistory([]);
    }
    resetCallState();
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

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API}/telecalling/assigned`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
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
    window.location.href = `tel:${selectedLead.phone}`; // Trigger native dialer
    
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
        resetCallState();
        fetchLeads(); // Refresh the list
        fetchCallHistory(selectedLead.id); // Refresh history for the current lead
        setTimeout(() => {
          setSuccessMsg('');
          if (finalStatus === 'Appointment') navigate('/appointments');
          else if (finalStatus === 'Call Later') navigate('/call-later');
          else if (finalStatus === 'NI') navigate('/ni-box');
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' }}>
      {/* Sidebar List of Leads */}
      <div style={{ flex: '0 0 320px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <h3 style={{ padding: '15px 20px', borderBottom: '1px solid #e5e7eb', margin: 0, position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          Assigned Leads ({leads.length})
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {leads.map(lead => (
            <li 
              key={lead.id} 
              onClick={() => { setSelectedLead(lead); }}
              style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid #f3f4f6', 
                cursor: 'pointer',
                background: selectedLead?.id === lead.id ? '#eff6ff' : 'transparent',
                borderLeft: selectedLead?.id === lead.id ? '4px solid #6366f1' : '4px solid transparent',
                transition: '0.2s'
              }}
            >
              <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>{lead.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PhoneCall size={12} /> {lead.phone}
              </div>
            </li>
          ))}
          {leads.length === 0 && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#6b7280' }}>
              <CheckCircle size={32} color="#10b981" style={{ marginBottom: '10px' }} />
              <div>No more leads to call!</div>
            </div>
          )}
        </ul>
      </div>

      {/* Main Dialing/Feedback Area */}
      <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '30px', overflowY: 'auto' }}>
        {successMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        {selectedLead ? (
          <div style={{ maxWidth: '600px' }}>
            {/* Lead Details Header */}
            <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '25px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 8px', color: '#111827', fontSize: '28px' }}>{selectedLead.name}</h2>
                  <div style={{ color: '#6b7280', fontSize: '15px', marginBottom: '20px' }}>
                    {selectedLead.district || selectedLead.location || 'Location Unknown'}
                  </div>
                </div>
                
              </div>

              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <PhoneCall size={18} color="#6366f1" /> <strong>Phone:</strong> {selectedLead.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <Car size={18} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                </div>
              </div>
            </div>

            {/* Call History */}
            {callHistory.length > 0 && (
              <div style={{ marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                  <Clock size={18} color="#6366f1" /> Call History ({callHistory.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto' }}>
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
            <div style={{ paddingTop: '10px', textAlign: 'center' }}>
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
                  <form onSubmit={handleFeedbackSubmit} style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#1e293b', textAlign: 'center' }}>How did the call go?</h3>
                    <div style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b', fontWeight: '500' }}>
                      Call Duration: <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{formatTime(secondsElapsed)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <button 
                        type="button"
                        onClick={() => setFeedback({ ...feedback, selection: 'Appointment', reason: '' })}
                        style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', border: '2px solid', borderColor: feedback.selection === 'Appointment' ? '#10b981' : '#e2e8f0', background: feedback.selection === 'Appointment' ? '#ecfdf5' : 'white', color: feedback.selection === 'Appointment' ? '#065f46' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '13px' }}
                      >
                        <ThumbsUp size={20} style={{ marginBottom: '6px' }} />
                        Appointment
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFeedback({ ...feedback, selection: 'Call Later', reason: '' })}
                        style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', border: '2px solid', borderColor: feedback.selection === 'Call Later' ? '#f59e0b' : '#e2e8f0', background: feedback.selection === 'Call Later' ? '#fef3c7' : 'white', color: feedback.selection === 'Call Later' ? '#92400e' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '13px' }}
                      >
                        <Clock size={20} style={{ marginBottom: '6px' }} />
                        Call Later
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFeedback({ ...feedback, selection: 'Not Interested', notes: '' })}
                        style={{ flex: 1, padding: '12px 5px', borderRadius: '10px', border: '2px solid', borderColor: feedback.selection === 'Not Interested' ? '#ef4444' : '#e2e8f0', background: feedback.selection === 'Not Interested' ? '#fef2f2' : 'white', color: feedback.selection === 'Not Interested' ? '#991b1b' : '#64748b', fontWeight: '600', cursor: 'pointer', transition: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '13px' }}
                      >
                        <ThumbsDown size={20} style={{ marginBottom: '6px' }} />
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
                          required
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
                          required
                        />
                      </div>
                    )}

                    {(feedback.selection) && (
                      <button 
                        type="submit"
                        style={{ width: '100%', padding: '15px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      >
                        <CheckCircle size={20} /> Save & Close Lead
                      </button>
                    )}
                  </form>
                )}
              </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column' }}>
            <div style={{ background: '#f3f4f6', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
              <PhoneCall size={64} color="#d1d5db" />
            </div>
            <h3 style={{ margin: '0 0 10px', color: '#4b5563' }}>No Lead Selected</h3>
            <p style={{ margin: 0 }}>Please select a lead from the list on the left to view details and start calling.</p>
          </div>
        )}
      </div>
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
    </div>
  );
};

export default StartDial;
