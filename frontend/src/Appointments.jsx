import React, { useState, useEffect } from 'react';
import { Calendar, PhoneCall, Clock, MapPin, Car, CheckCircle } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const Appointments = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [feedback, setFeedback] = useState({ status: 'Interested', notes: '', callback_time: '' });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API}/telecalling/appointments`, {
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
        setSelectedLead(null);
        setFeedback({ status: 'Interested', notes: '', callback_time: '' });
        fetchLeads();
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
          My Appointments ({leads.length})
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
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Car size={12} /> {lead.car_model || lead.car_name || 'No Car'} {lead.registration_number ? `(${lead.registration_number})` : ''}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {lead.callback_time ? new Date(lead.callback_time).toLocaleString() : 'No time set'}
              </div>
            </li>
          ))}
          {leads.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No appointments scheduled.</div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                  <Car size={18} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                  <Calendar size={18} color="#10b981" /> <strong>Appointment Time:</strong> {selectedLead.callback_time ? new Date(selectedLead.callback_time).toLocaleString() : 'No time set'}
                </div>
              </div>
              </div>
              
              {selectedLead.last_note && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                  <strong style={{ color: '#374151', display: 'block', marginBottom: '5px' }}>Previous Notes / Feedback:</strong>
                  <span style={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>{selectedLead.last_note}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleFeedbackSubmit}>
              <h3 style={{ marginBottom: '15px' }}>Update Status</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Call Status</label>
                <select 
                  value={feedback.status} 
                  onChange={e => setFeedback({...feedback, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                  required
                >
                  <option value="Interested">Interested / Follow-up</option>
                  <option value="Converted">Converted (Deal Closed)</option>
                  <option value="Call Later">Reschedule Appointment</option>
                  <option value="Not Interested">Not Interested (NI)</option>
                  <option value="No Answer">No Answer / Busy</option>
                </select>
              </div>

              {['Call Later', 'Appointment'].includes(feedback.status) && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>New Date & Time</label>
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
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Meeting Notes</label>
                <textarea 
                  value={feedback.notes} 
                  onChange={e => setFeedback({...feedback, notes: e.target.value})}
                  rows="4"
                  placeholder="Enter details of the meeting..."
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
            <Calendar size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p>Select an appointment from the list to update its status.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
