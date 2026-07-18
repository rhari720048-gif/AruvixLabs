import React, { useState, useEffect } from 'react';
import { Clock, PhoneCall, Calendar, MapPin, Car, CheckCircle } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const CallLater = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [feedback, setFeedback] = useState({ status: 'Interested', notes: '', callback_time: '' });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

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
      const res = await fetch(`${API}/telecalling/feedback`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...feedback,
          customer_id: selectedLead.id,
          duration: 0
        })
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
          Call Later ({leads.length})
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
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Needs Follow-up
              </div>
            </li>
          ))}
          {leads.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No follow-ups scheduled.</div>
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
                  <MapPin size={18} color="#10b981" /> <strong>District:</strong> {selectedLead.district || '-'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                  <Car size={18} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                </div>
              </div>
              </div>
              
              {selectedLead.last_note && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                  <strong style={{ color: '#374151', display: 'block', marginBottom: '5px' }}>Previous Notes / Feedback:</strong>
                  <span style={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>{selectedLead.last_note}</span>
                </div>
              )}

            <form onSubmit={handleFeedbackSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 15px', color: '#1e293b' }}>Update Status</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Status</label>
                <select 
                  value={feedback.status} 
                  onChange={e => setFeedback({...feedback, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Call Later">Call Later</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Notes</label>
                <textarea 
                  value={feedback.notes} 
                  onChange={e => setFeedback({...feedback, notes: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' }}
                  required
                ></textarea>
              </div>
              
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Save Update
              </button>
            </form>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Select a lead to view details and update status
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLater;
