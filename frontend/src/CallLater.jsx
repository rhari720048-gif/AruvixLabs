import React, { useState, useEffect } from 'react';
import { Clock, PhoneCall, Calendar, MapPin, Car, CheckCircle, RefreshCw, User, Users, PlusCircle, Edit3, Phone, PhoneOff, Download, Search } from 'lucide-react';
import ActionButtons from './ActionButtons';
import toast from 'react-hot-toast';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ModernDateTimePicker from './ModernDateTimePicker';
import SearchableSelect from './SearchableSelect';

import { API } from './apiConfig';

const CallLater = () => {
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'all', 'manual'
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [feedback, setFeedback] = useState({ status: 'Call Later', notes: '', callback_time: '' });
  const [loading, setLoading] = useState(true);

  const handleExportCSV = () => {
    if (leads.length === 0) return toast.error('No call later queue data to export.');
    
    const exportRows = leads.map(l => ({
      'Customer Name': l.name || '',
      'Phone Number': l.phone || '',
      'District / Location': l.district || l.location || '',
      'Car Details': `${l.car_model || l.car_name || ''} ${l.registration_number ? '(' + l.registration_number + ')' : ''}`.trim(),
      'Assigned To': l.assigned_to_names || l.assigned_to || '',
      'Callback Schedule Time': l.callback_time ? new Date(l.callback_time).toLocaleString() : '',
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
    a.download = `Call_Later_Queue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Call Later queue exported to CSV!');
  };
  
  // Call State
  const [callPhase, setCallPhase] = useState('idle'); // 'idle', 'dialing', 'active', 'feedback'
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);

  // Manual form state
  const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', car_name: '', notes: '' });
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

  const fetchLeads = async (type = activeTab) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/telecalling/callbacks?type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        if (selectedLead && !data.find(l => l.id === selectedLead.id)) {
            setSelectedLead(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    } catch (e) { console.error(e); }
  };

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
        toast.success("Lead deleted successfully!");
      } else {
        toast.error("Failed to delete lead.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while deleting.");
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
        toast.success("Feedback submitted successfully!");
        setSelectedLead(null);
        resetCallState();
        fetchLeads(activeTab);
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while submitting feedback.");
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phone) return toast.error("Name and Phone are required!");
    setIsSubmitting(true);
    try {
        const res = await fetch(`${API}/telecalling/manual-entry`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ ...manualForm, status: 'Call Later', duration: 0 })
        });
        if (res.ok) {
            toast.success('Manual Call Later lead added successfully!');
            setManualForm({ name: '', phone: '', location: '', car_name: '', notes: '' });
        } else {
            const err = await res.json();
            toast.error(err.error || "Failed to save lead");
        }
    } catch (e) {
        console.error(e);
        toast.error("An error occurred");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="page-call-later" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <Clock size={28} color="var(--primary)" />
            Call Later & Callbacks Queue
          </h1>
          <p>Time-sensitive client follow-up calls, reminder schedules, and disposition tracking</p>
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
          <User size={18} /> My Call Later ({leads.length})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={18} /> All Call Later
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`btn ${activeTab === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <PlusCircle size={18} /> Add Manual Entry
        </button>
      </div>

      {activeTab === 'manual' ? (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '30px', overflowY: 'auto' }}>
              <h2 style={{ marginBottom: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Edit3 size={24} color="var(--primary)" /> Add Call Later Lead Manually
              </h2>
              <form onSubmit={handleManualSubmit} className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Customer Name *</label>
                      <input type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter name" required />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Phone Number (10 digits only) *</label>
                      <input type="tel" maxLength={10} value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})} style={{ width: '100%' }} placeholder="Enter 10 digit mobile number" required />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Location</label>
                      <input type="text" value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter location" />
                  </div>
                  <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Car Name with Year</label>
                      <input type="text" value={manualForm.car_name} onChange={e => setManualForm({...manualForm, car_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., Honda City 2021" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Notes</label>
                      <textarea value={manualForm.notes} onChange={e => setManualForm({...manualForm, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', height: '80px', resize: 'vertical' }} placeholder="Add any details..."></textarea>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="submit" disabled={isSubmitting} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                          {isSubmitting ? 'Saving...' : 'Save Manual Call Later'}
                      </button>
                  </div>
              </form>
          </div>
      ) : (
      <div className={`split-view-container ${selectedLead ? 'has-selected' : 'no-selected'}`}>
        {/* Sidebar Contacts List */}
        <div className={`split-sidebar ${selectedLead ? 'mobile-hide' : ''}`}>
          <div className="split-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Contacts Queue ({leads.length})</span>
            <button onClick={() => fetchLeads(activeTab)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} title="Refresh List">
              <RefreshCw size={16} />
            </button>
          </div>
          
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="has-icon-left"
                placeholder="Search Call Later queue..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px', fontSize: '13px', borderRadius: '10px' }}
              />
            </div>
          </div>
          
          <ul className="split-sidebar-list" style={{ listStyle: 'none', padding: '16px', margin: 0 }}>
            {leads.filter(l => {
              if (!searchTerm.trim()) return true;
              const q = searchTerm.toLowerCase().trim();
              return (l.name || '').toLowerCase().includes(q) ||
                     (l.phone || '').toLowerCase().includes(q) ||
                     (l.car_model || l.car_name || '').toLowerCase().includes(q) ||
                     (l.district || l.location || '').toLowerCase().includes(q) ||
                     (l.notes || '').toLowerCase().includes(q);
            }).length === 0 ? (
              <li style={{ textAlign: 'center', color: '#94a3b8', padding: '20px 0' }}>No matching leads</li>
            ) : (
              leads.filter(l => {
                if (!searchTerm.trim()) return true;
                const q = searchTerm.toLowerCase().trim();
                return (l.name || '').toLowerCase().includes(q) ||
                       (l.phone || '').toLowerCase().includes(q) ||
                       (l.car_model || l.car_name || '').toLowerCase().includes(q) ||
                       (l.district || l.location || '').toLowerCase().includes(q) ||
                       (l.notes || '').toLowerCase().includes(q);
              }).map(lead => (
                <li 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`contact-card ${selectedLead?.id === lead.id ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>{lead.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a 
                        href={`tel:${lead.phone}`}
                        onClick={(e) => { e.stopPropagation(); startDialing(lead); }}
                        title="Call Now"
                        style={{ padding: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)' }}
                      >
                        <Phone size={15} />
                      </a>
                      <ActionButtons 
                        onView={() => setViewLead(lead)}
                        onEdit={() => setEditLead(lead)}
                        onDelete={() => handleDelete(lead.id)}
                      />
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Car size={14} /> {lead.car_model || lead.car_name || 'No Car Listed'}
                  </div>

                  {lead.callback_time && (
                    <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <Clock size={13} /> Callback: {new Date(lead.callback_time).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                  {activeTab === 'all' && (
                    <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <User size={12} /> Converted By: {lead.converter_name || lead.assignee_name || lead.assigned_to_names || 'System'}
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Main Dialing/Feedback Area */}
        <div className={`split-main ${!selectedLead ? 'mobile-hide' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedLead ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="split-main-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="btn btn-secondary mobile-back-btn"
                    style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    ← Back to List
                  </button>
                  <h2 style={{ margin: 0, color: '#111827', fontSize: '20px' }}>{selectedLead.name}</h2>
                </div>
              </div>
                <div className="split-main-content">
                  <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <PhoneCall size={20} color="#6366f1" /> <strong>Phone:</strong> {selectedLead.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <MapPin size={20} color="#10b981" /> <strong>District:</strong> {selectedLead.district || '-'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <Car size={20} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <User size={20} color="#6366f1" /> <strong>Converted By:</strong> {selectedLead.converter_name || selectedLead.assignee_name || selectedLead.assigned_to_names || 'System'}
                    </div>
                    {selectedLead.callback_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b', padding: '16px', background: '#fffbeb', borderRadius: '12px', gridColumn: '1 / -1' }}>
                        <Clock size={20} color="#f59e0b" /> <strong>Callback Scheduled:</strong> {new Date(selectedLead.callback_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    )}
                  </div>
                  
                  {selectedLead.last_note && (
                    <div style={{ marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                      <strong style={{ color: '#374151', display: 'block', marginBottom: '5px' }}>Previous Notes / Feedback:</strong>
                      <span style={{ color: '#4b5563', whiteSpace: 'pre-wrap' }}>{selectedLead.last_note}</span>
                    </div>
                  )}

                  <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '24px', marginTop: '24px', textAlign: 'center' }}>
                    {callPhase === 'idle' && (
                      <div>
                        <a 
                          href={`tel:${selectedLead?.phone}`}
                          onClick={() => startDialing(selectedLead)}
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
                        </a>
                        
                        <div style={{ textAlign: 'left', marginTop: '30px' }}>
                            <form onSubmit={handleFeedbackSubmit} style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                              <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontWeight: '800' }}>Update Status (Manual)</h3>
                              <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</label>
                                <SearchableSelect 
                                  options={[
                                    { label: 'Not Interested (NI)', value: 'Not Interested' },
                                    { label: 'Call Later', value: 'Call Later' },
                                    { label: 'Appointment', value: 'Appointment' }
                                  ]}
                                  value={feedback.status} 
                                  onChange={val => setFeedback({...feedback, status: val})}
                                  placeholder="Select status..."
                                />
                              </div>

                              {['Call Later', 'Appointment'].includes(feedback.status) && (
                                <div style={{ marginBottom: '20px' }}>
                                  <ModernDateTimePicker 
                                    label="New Date & Time"
                                    value={feedback.callback_time}
                                    onChange={val => setFeedback({...feedback, callback_time: val})}
                                    required={true}
                                  />
                                </div>
                              )}
                              <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Notes</label>
                                <textarea 
                                  value={feedback.notes} 
                                  onChange={e => setFeedback({...feedback, notes: e.target.value})}
                                  style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                  required
                                ></textarea>
                              </div>
                              
                              <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Update
                              </button>
                            </form>
                        </div>
                      </div>
                    )}

                    {callPhase === 'dialing' && (
                      <div style={{ padding: '40px', animation: 'pulse 1.5s infinite', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PhoneCall size={56} color="#10b981" style={{ marginBottom: '16px' }} />
                        <h3 style={{ margin: 0, color: '#10b981', fontSize: '24px' }}>Dialing...</h3>
                      </div>
                    )}

                    {callPhase === 'active' && (
                      <div style={{ background: '#f0fdf4', padding: '40px', borderRadius: '24px', border: '2px solid #86efac', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '56px', fontWeight: '800', color: '#15803d', fontFamily: 'monospace', marginBottom: '32px', letterSpacing: '-0.02em' }}>
                          {formatTime(secondsElapsed)}
                        </div>
                        <button 
                          onClick={stopTimer}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            background: '#ef4444', color: 'white', padding: '18px 48px', border: 'none',
                            borderRadius: '50px', fontWeight: 'bold', fontSize: '18px',
                            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
                          }}
                        >
                          <PhoneOff size={24} /> End Call
                        </button>
                      </div>
                    )}

                    {callPhase === 'feedback' && (
                        <div style={{ textAlign: 'left' }}>
                            <form onSubmit={handleFeedbackSubmit} style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                              <h3 style={{ margin: '0 0 24px', color: '#0f172a', textAlign: 'center', fontWeight: '800', fontSize: '20px' }}>How did the call go?</h3>
                              <div style={{ textAlign: 'center', marginBottom: '32px', color: '#64748b', fontSize: '15px' }}>
                                Call Duration: <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '18px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', marginLeft: '8px' }}>{formatTime(secondsElapsed)}</span>
                              </div>
                              <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '13px' }}>Status</label>
                                <select 
                                  value={feedback.status} 
                                  onChange={e => setFeedback({...feedback, status: e.target.value})}
                                  style={{ width: '100%' }}
                                >
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
                                    required
                                  />
                                </div>
                              )}
                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Notes</label>
                                <textarea 
                                  value={feedback.notes} 
                                  onChange={e => setFeedback({...feedback, notes: e.target.value})}
                                  required
                                ></textarea>
                              </div>
                              
                              <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
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
                <Clock size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p>Select a lead from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ViewModal 
        isOpen={!!viewLead} 
        onClose={() => setViewLead(null)} 
        title="Lead Details" 
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

export default CallLater;
