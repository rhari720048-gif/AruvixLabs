import React, { useState, useEffect } from 'react';
import { Calendar, PhoneCall, Clock, MapPin, Car, CheckCircle, PlusCircle, Users, User, Edit3, UserCheck, Phone, PhoneOff, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';
import ActionButtons from './ActionButtons';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ModernDateTimePicker from './ModernDateTimePicker';
import toast from 'react-hot-toast';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'all', 'manual'
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);

  const handleExportCSV = () => {
    if (leads.length === 0) return toast.error('No scheduled appointments to export.');
    
    const exportRows = leads.map(l => ({
      'Customer Name': l.name || '',
      'Phone Number': l.phone || '',
      'District / Location': l.district || l.location || '',
      'Car Details': `${l.car_model || l.car_name || ''} ${l.registration_number ? '(' + l.registration_number + ')' : ''}`.trim(),
      'Assigned To': l.assigned_to_names || l.assigned_to || '',
      'Appointment Date & Time': l.appointment_time || l.callback_time ? new Date(l.appointment_time || l.callback_time).toLocaleString() : '',
      'Notes': l.notes || ''
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
    a.download = `Scheduled_Appointments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Appointments exported to CSV!');
  };
  
  // Call State
  const [callPhase, setCallPhase] = useState('idle'); // 'idle', 'dialing', 'active', 'feedback'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`${API}/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        if (selectedLead?.id === id) setSelectedLead(null);
        fetchLeads(activeTab);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvert = async (id) => {
    if (window.confirm("Are you sure you want to convert this lead to a client?")) {
      try {
        const res = await fetch(`${API}/customers/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ status: 'Converted', notes: 'Converted to Client' })
        });
        if (res.ok) {
          setSelectedLead(null);
          fetchLeads(activeTab);
          navigate('/clients');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  
  // Feedback state for existing appointments
  const [feedback, setFeedback] = useState({ status: 'Call Later', notes: '', callback_time: '' });
  const [successMsg, setSuccessMsg] = useState('');
  
  // Manual form state
  const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', car_name: '', callback_time: '', notes: '' });
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab !== 'manual') {
      fetchLeads(activeTab);
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  const resetCallState = () => {
    setCallPhase('idle');
    setSecondsElapsed(0);
    setFeedback({ status: 'Call Later', notes: '', callback_time: '' });
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const startDialing = (leadToCall) => {
    if (selectedLead?.id !== leadToCall.id) {
        setSelectedLead(leadToCall);
    }
    
    setTimeout(() => {
        resetCallState();
        setCallPhase('dialing');
        
        setTimeout(() => {
          setCallPhase('active');
          setSecondsElapsed(0);
          const interval = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
          }, 1000);
          setTimerInterval(interval);
        }, 2000);
    }, 100);
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

  const fetchLeads = async (type) => {
    try {
      const res = await fetch(`${API}/telecalling/appointments?type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        setSelectedLead(null); // Reset selection on tab change
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
          duration: secondsElapsed
        })
      });
      if (res.ok) {
        setSuccessMsg('Feedback submitted successfully!');
        setSelectedLead(null);
        resetCallState();
        fetchLeads(activeTab);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phone || !manualForm.callback_time) {
      return alert("Name, Phone, and Appointment Time are required!");
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/telecalling/manual-appointment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(manualForm)
      });
      if (res.ok) {
        setSuccessMsg('Manual appointment added successfully!');
        setManualForm({ name: '', phone: '', location: '', car_name: '', callback_time: '', notes: '' });
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save appointment");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-appointments" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <Calendar size={28} color="var(--primary)" />
            Scheduled Appointments & Call Workspace
          </h1>
          <p>Active calling workflow, scheduled client visits, and disposition logging</p>
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
          <User size={18} /> My Appointments ({leads.length})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={18} /> All Appointments
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <PlusCircle size={18} /> Add Manual Appointment
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', marginBottom: '20px' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {activeTab === 'manual' ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ marginBottom: '20px', color: '#111827', fontSize: '20px' }}>Add Manual Appointment</h2>
          <form onSubmit={handleManualSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Name</label>
              <input type="text" required value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Phone (10 digits only)</label>
              <input type="tel" required maxLength={10} value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})} style={{ width: '100%' }} placeholder="Enter 10 digit mobile number" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Location</label>
              <input type="text" value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Car Interest</label>
              <input type="text" value={manualForm.car_name} onChange={e => setManualForm({...manualForm, car_name: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div>
              <ModernDateTimePicker 
                label="Appointment Date & Time"
                value={manualForm.callback_time}
                onChange={val => setManualForm({...manualForm, callback_time: val})}
                required={true}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Notes</label>
              <textarea rows={3} value={manualForm.notes} onChange={e => setManualForm({...manualForm, notes: e.target.value})} style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%', opacity: isSubmitting ? 0.7 : 1 }}>
                <CheckCircle size={20} /> {isSubmitting ? 'Saving...' : 'Save Appointment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="split-view-container">
          {/* Sidebar List of Leads */}
          <div className="split-sidebar">
            <h3 className="split-sidebar-header">
              {activeTab === 'my' ? 'My Appointments' : 'All Appointments'} ({leads.length})
            </h3>
            <ul className="split-sidebar-list" style={{ listStyle: 'none', padding: '16px', margin: 0 }}>
              {leads.map(lead => (
                <li 
                  key={lead.id} 
                  className={`contact-card ${selectedLead?.id === lead.id ? 'active' : ''}`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>{lead.name}</div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a 
                        href={`tel:${lead.phone}`}
                        onClick={(e) => { e.stopPropagation(); startDialing(lead); }} 
                        style={{ padding: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', textDecoration: 'none', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }} title="Call Now"
                      >
                        <PhoneCall size={14} />
                      </a>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleConvert(lead.id); }}
                        title="Convert to Client"
                        style={{
                          background: '#d1fae5', color: '#10b981', border: 'none', borderRadius: '50%',
                          width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: '0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#a7f3d0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#d1fae5'}
                      >
                        <UserCheck size={14} />
                      </button>
                      <ActionButtons 
                        onView={() => setViewLead(lead)}
                        onEdit={() => setEditLead(lead)}
                        onDelete={() => handleDelete(lead.id)}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={14} /> {lead.car_model || lead.car_name || 'No Car'} {lead.registration_number ? `(${lead.registration_number})` : ''}
                  </div>
                  <div style={{ fontSize: '13px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                    <Calendar size={14} /> {lead.callback_time ? new Date(lead.callback_time).toLocaleString() : 'No time set'}
                  </div>
                </li>
              ))}
              {leads.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No appointments scheduled.</div>
              )}
            </ul>
          </div>

          {/* Main Details Panel */}
          <div className="split-main">
            {selectedLead ? (
              <div className="split-main" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="split-main-header">
                  <h2 style={{ margin: 0, color: '#111827', fontSize: '24px' }}>{selectedLead.name}</h2>
                  <button
                    onClick={() => handleConvert(selectedLead.id)}
                    title="Convert to Client"
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <UserCheck size={16} /> Convert to Client
                  </button>
                </div>
                <div className="split-main-content">
                  <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <PhoneCall size={20} color="#6366f1" /> <strong>Phone:</strong> {selectedLead.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <MapPin size={20} color="#10b981" /> <strong>Location:</strong> {selectedLead.district || '-'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <Car size={20} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <Calendar size={20} color="#10b981" /> <strong>Time:</strong> {selectedLead.callback_time ? new Date(selectedLead.callback_time).toLocaleString() : 'No time set'}
                    </div>
                  </div>
                  
                  {selectedLead.last_note && (
                    <div style={{ marginTop: '24px', padding: '20px', background: '#eff6ff', borderRadius: '16px', borderLeft: '4px solid #6366f1' }}>
                      <strong style={{ color: '#1e293b', display: 'block', marginBottom: '8px' }}>Previous Notes / Feedback:</strong>
                      <span style={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedLead.last_note}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '32px', marginTop: '32px', textAlign: 'center' }}>
                    {callPhase === 'idle' && (
                      <div>
                        <a 
                          href={`tel:${selectedLead?.phone}`}
                          onClick={() => startDialing(selectedLead)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '18px 40px', border: 'none',
                            borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold',
                            fontSize: '18px', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <PhoneCall size={24} /> Dial Now
                        </a>
                        
                        <div style={{ textAlign: 'left', marginTop: '30px' }}>
                            <form onSubmit={handleFeedbackSubmit} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                              <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontWeight: '800' }}>Update Status (Manual)</h3>
                              <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</label>
                                <select 
                                  value={feedback.status} 
                                  onChange={e => setFeedback({...feedback, status: e.target.value})}
                                  style={{ width: '100%' }}
                                  required
                                >
                                  <option value="">Select Status...</option>
                                  <option value="Not Interested">Not Interested (NI)</option>
                                  <option value="Call Later">Call Later</option>
                                  <option value="Appointment">Appointment</option>
                                </select>
                              </div>

                              {['Call Later', 'Appointment'].includes(feedback.status) && (
                                <div style={{ marginBottom: '20px' }}>
                                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>New Date & Time</label>
                                  <input 
                                    type="datetime-local" 
                                    value={feedback.callback_time} 
                                    onChange={e => setFeedback({...feedback, callback_time: e.target.value})}
                                    style={{ width: '100%' }}
                                    required
                                  />
                                </div>
                              )}
                              <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Notes</label>
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
                        <div style={{ textAlign: 'left' }}>
                            <form onSubmit={handleFeedbackSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <h3 style={{ margin: '0 0 15px', color: '#1e293b', textAlign: 'center' }}>How did the call go?</h3>
                              <div style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b', fontWeight: '500' }}>
                                Call Duration: <span style={{ color: '#0f172a', fontWeight: 'bold' }}>{formatTime(secondsElapsed)}</span>
                              </div>
                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Status</label>
                                <select 
                                  value={feedback.status} 
                                  onChange={e => setFeedback({...feedback, status: e.target.value})}
                                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                  required
                                >
                                  <option value="">Select Status...</option>
                                  <option value="Not Interested">Not Interested (NI)</option>
                                  <option value="Call Later">Call Later</option>
                                  <option value="Appointment">Appointment</option>
                                </select>
                              </div>

                              {['Call Later', 'Appointment'].includes(feedback.status) && (
                                <div style={{ marginBottom: '15px' }}>
                                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>New Date & Time</label>
                                  <input 
                                    type="datetime-local" 
                                    value={feedback.callback_time} 
                                    onChange={e => setFeedback({...feedback, callback_time: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    required
                                  />
                                </div>
                              )}

                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Notes / Feedback</label>
                                <textarea 
                                  value={feedback.notes} 
                                  onChange={e => setFeedback({...feedback, notes: e.target.value})}
                                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' }}
                                  required
                                ></textarea>
                              </div>
                              
                              <button type="submit" style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Feedback
                              </button>
                            </form>
                        </div>
                    )}
                  </div>
              </div>
            </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column' }}>
                <Calendar size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p>Select an appointment from the list to view and update.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ViewModal 
        isOpen={!!viewLead} 
        onClose={() => setViewLead(null)} 
        title="Appointment Details" 
        data={viewLead} 
      />

      <EditLeadModal 
        isOpen={!!editLead} 
        onClose={() => setEditLead(null)} 
        data={editLead} 
        onSave={(updated) => { 
          fetchLeads(activeTab); 
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          setEditLead(null); 
        }} 
      />
    </div>
  );
};

export default Appointments;
