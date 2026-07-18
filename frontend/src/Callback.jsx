import React, { useState, useEffect } from 'react';
import { PhoneForwarded, PhoneCall, Calendar, Clock, MapPin, Car, CheckCircle } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const Callback = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [feedback, setFeedback] = useState({ status: 'Interested', notes: '', callback_time: '' });
  const [successMsg, setSuccessMsg] = useState('');
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
      const res = await fetch(`${API}/telecalling/callbacks`, {
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
    try {
      const res = await fetch(`${API}/customers/${selectedLead.id}/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(feedback)
      });
      if (res.ok) {
        setSuccessMsg('Feedback submitted successfully!');
        setFeedback({ status: 'Interested', notes: '', callback_time: '' });
        fetchLeads();
        fetchCallHistory(selectedLead.id);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' }}>
      {/* Sidebar List of Leads */}
      <div style={{ flex: '0 0 300px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <h3 style={{ padding: '15px 20px', borderBottom: '1px solid #e5e7eb', margin: 0, position: 'sticky', top: 0, background: 'white' }}>
          My Callbacks ({leads.length})
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {leads.map(lead => (
            <li 
              key={lead.id} 
              onClick={() => setSelectedLead(lead)}
              style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid #f3f4f6', 
                cursor: 'pointer',
                background: selectedLead?.id === lead.id ? '#eff6ff' : 'transparent',
                transition: '0.2s'
              }}
            >
              <div style={{ fontWeight: '600', color: '#1f2937' }}>{lead.name}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {lead.callback_time || 'No time set'}
              </div>
            </li>
          ))}
          {leads.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No callbacks scheduled.</div>
          )}
        </ul>
      </div>

      {/* Main Dialing/Feedback Area */}
      <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', overflowY: 'auto' }}>
        {successMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {selectedLead ? (
          <div>
            <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 15px', color: '#111827', fontSize: '24px' }}>{selectedLead.name}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                  <PhoneCall size={18} color="#6366f1" /> <strong>Phone:</strong> {selectedLead.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                  <MapPin size={18} color="#10b981" /> <strong>Location:</strong> {selectedLead.district || '-'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                  <Car size={18} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                  <Clock size={18} color="#ef4444" /> <strong>Callback Time:</strong> {selectedLead.callback_time || 'No time set'}
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

            <form onSubmit={handleFeedbackSubmit}>
              <h3 style={{ marginBottom: '15px' }}>Update Call Feedback</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Call Status</label>
                <select 
                  value={feedback.status} 
                  onChange={e => setFeedback({...feedback, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                  required
                >
                  <option value="Interested">Interested</option>
                  <option value="Call Later">Call Later / Callback</option>
                  <option value="Appointment">Appointment Fixed</option>
                  <option value="Not Interested">Not Interested (NI)</option>
                  <option value="No Answer">No Answer / Busy</option>
                </select>
              </div>

              {['Call Later', 'Appointment'].includes(feedback.status) && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={feedback.callback_time} 
                    onChange={e => setFeedback({...feedback, callback_time: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Notes</label>
                <textarea 
                  value={feedback.notes} 
                  onChange={e => setFeedback({...feedback, notes: e.target.value})}
                  rows="4"
                  placeholder="Enter details of the conversation..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', resize: 'vertical' }}
                  required
                ></textarea>
              </div>

              <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                Submit Feedback & Next
              </button>
            </form>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column' }}>
            <PhoneForwarded size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p>Select a lead from the list to make a callback.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Callback;
