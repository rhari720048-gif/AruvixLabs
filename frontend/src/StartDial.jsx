import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, Clock, MapPin, Car, CheckCircle, Phone } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const StartDial = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [feedback, setFeedback] = useState({ selection: '', notes: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [callInitiated, setCallInitiated] = useState(false);
  const [callHistory, setCallHistory] = useState([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchCallHistory(selectedLead.id);
    } else {
      setCallHistory([]);
    }
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
      // Use the newly created API endpoint for telecalling assigned leads
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.selection) return alert('Please select Interested or Not Interested');

    // Map selection to backend status as requested
    const finalStatus = feedback.selection === 'Interested' ? 'Appointment' : 'Callback';

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
          notes: feedback.notes,
          callback_time: null
        })
      });
      if (res.ok) {
        setSuccessMsg('Feedback submitted successfully!');
        setFeedback({ selection: '', notes: '' });
        setCallInitiated(false);
        fetchLeads(); // Refresh the list
        fetchCallHistory(selectedLead.id); // Refresh history for the current lead
        setTimeout(() => setSuccessMsg(''), 3000);
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
              onClick={() => { setSelectedLead(lead); setCallInitiated(false); }}
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
                
                {/* Big Call Button */}
                <a 
                  href={`tel:${selectedLead.phone}`}
                  onClick={() => setCallInitiated(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#10b981', color: 'white', textDecoration: 'none',
                    padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold',
                    fontSize: '16px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Phone size={20} fill="white" /> CALL NOW
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <PhoneCall size={18} color="#6366f1" /> <strong>Phone:</strong> {selectedLead.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <Car size={18} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_name || selectedLead.car_model || '-'}
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
                        <span style={{ fontWeight: 'bold', color: log.status === 'Interested' || log.status === 'Appointment' ? '#10b981' : log.status === 'Not Interested' ? '#ef4444' : '#f59e0b' }}>
                          {log.status}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          {new Date(log.created_at || log.call_date).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: '#4b5563' }}>{log.notes || 'No notes'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Form (Appears after call initiated) */}
            {callInitiated ? (
              <form onSubmit={handleFeedbackSubmit} style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} color="#6366f1" /> Call Feedback
                </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Call Outcome</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Interested', 'Not Interested'].map(opt => (
                    <div 
                      key={opt}
                      onClick={() => setFeedback({...feedback, selection: opt})}
                      style={{
                        flex: 1, textAlign: 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '2px solid',
                        background: feedback.selection === opt ? (opt === 'Interested' ? '#ecfdf5' : '#fef2f2') : '#ffffff',
                        borderColor: feedback.selection === opt ? (opt === 'Interested' ? '#10b981' : '#ef4444') : '#cbd5e1',
                        color: feedback.selection === opt ? (opt === 'Interested' ? '#065f46' : '#991b1b') : '#475569',
                        fontWeight: feedback.selection === opt ? 'bold' : 'normal',
                        transition: '0.2s'
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              {feedback.selection === 'Interested' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>What did the client say?</label>
                  <textarea 
                    value={feedback.notes} 
                    onChange={e => setFeedback({...feedback, notes: e.target.value})}
                    rows="4"
                    placeholder="Type client's requirements or feedback here..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '15px' }}
                    required
                  ></textarea>
                </div>
              )}

              {feedback.selection === 'Not Interested' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Reason for Not Interested</label>
                  <textarea 
                    value={feedback.notes} 
                    onChange={e => setFeedback({...feedback, notes: e.target.value})}
                    rows="4"
                    placeholder="Type reason here (e.g., Price too high, already bought)..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontSize: '15px' }}
                    required
                  ></textarea>
                </div>
              )}

              {feedback.selection && (
                <button type="submit" style={{ 
                  width: '100%', padding: '14px', background: '#6366f1', color: 'white', 
                  border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', 
                  fontSize: '16px', boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)' 
                }}>
                  Save & Close Lead
                </button>
              )}
            </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                <PhoneCall size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>Click the <strong>CALL NOW</strong> button above to initiate the call.<br/> The feedback options will appear here once the call is made.</p>
              </div>
            )}
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
    </div>
  );
};

export default StartDial;
