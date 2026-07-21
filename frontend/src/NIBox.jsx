import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, User, Users, PlusCircle, CheckCircle, Edit3, PhoneCall, MapPin, Car, Clock, Phone, PhoneOff, Calendar, Download } from 'lucide-react';
import './index.css';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ActionButtons from './ActionButtons';
import ModernDateTimePicker from './ModernDateTimePicker';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';

import { API } from './apiConfig';

const NIBox = () => {
    const [activeTab, setActiveTab] = useState('my'); // 'my', 'all', 'manual'
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [feedback, setFeedback] = useState({ status: 'Call Later', notes: '', callback_time: '' });
    const [loading, setLoading] = useState(true);
    
    // Call State
    const [callPhase, setCallPhase] = useState('idle'); // 'idle', 'dialing', 'active', 'feedback'
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);
    const [viewRecord, setViewRecord] = useState(null);
    const [editRecord, setEditRecord] = useState(null);
    
    // Manual form state
    const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', car_name: '', notes: '' });
    const [users, setUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleExportCSV = () => {
        if (leads.length === 0) return toast.error('No NI leads data to export.');
        
        const exportRows = leads.map(l => ({
            'Customer Name': l.name || '',
            'Phone Number': l.phone || '',
            'District / Location': l.district || l.location || '',
            'Car Details': `${l.car_model || l.car_name || ''} ${l.registration_number ? '(' + l.registration_number + ')' : ''}`.trim(),
            'Assignee': l.assignee_name || l.assigned_to || 'Unassigned',
            'Last Feedback Note': l.last_note || l.notes || ''
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
        a.download = `Not_Interested_Leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('NI Box leads exported to CSV!');
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

    const fetchLeads = async (type = activeTab) => {
        if (type === 'manual') return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/telecalling/nibox?type=${type}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeads(data);
            }
        } catch (error) {
            console.error(error);
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
        } catch (e) {
            console.error(e);
        }
    };

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

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        const finalStatus = feedback.status === 'Not Interested' ? 'NI' : feedback.status;
        try {
            const res = await fetch(`${API}/telecalling/feedback`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: finalStatus,
                    notes: feedback.notes,
                    callback_time: feedback.callback_time || null,
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
                body: JSON.stringify({ ...manualForm, status: 'NI', duration: 0 })
            });
            if (res.ok) {
                toast.success('Manual NI lead added successfully!');
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
        <div className="page-ni-box" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="crm-page-header">
                <div className="crm-page-title-group">
                    <h1>
                        <Archive size={28} color="var(--primary)" />
                        Not Interested (NI) Archive
                    </h1>
                    <p>Archived leads, disposition feedback logs, and re-engagement recovery options</p>
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
                    <User size={18} /> My NI Leads ({leads.length})
                </button>
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    <Users size={18} /> All NI Leads
                </button>
            </div>

            <div className={`split-view-container ${selectedLead ? 'has-selected' : 'no-selected'}`}>
                {/* Sidebar List of Leads */}
                <div className={`split-sidebar ${selectedLead ? 'mobile-hide' : ''}`}>
                    <div className="split-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>
                            {activeTab === 'my' ? 'My NI Leads' : 'All NI Leads'} ({leads.length})
                        </h3>
                        <button onClick={() => fetchLeads(activeTab)} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                    
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
                                            title="Call Now"
                                            style={{ padding: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', textDecoration: 'none', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
                                        >
                                            <Phone size={14} />
                                        </a>
                                        <ActionButtons 
                                            onView={() => setViewRecord(lead)}
                                            onEdit={() => setEditRecord(lead)}
                                            onDelete={() => handleDelete(lead.id)}
                                        />
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Car size={14} /> {lead.car_model || lead.car_name || 'No Car'} {lead.registration_number ? `(${lead.registration_number})` : ''}
                                </div>
                                {activeTab === 'all' && (
                                    <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                        <User size={12} /> Converted By: {lead.converter_name || lead.employee_name || lead.assignee_name || 'System'}
                                    </div>
                                )}
                            </li>
                        ))}
                        {leads.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No NI leads found.</div>
                        )}
                    </ul>
                </div>

                {/* Main Dialing/Feedback Area */}
                <div className={`split-main ${!selectedLead ? 'mobile-hide' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    {selectedLead ? (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className="split-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                <ActionButtons 
                                    onView={() => setViewRecord(selectedLead)}
                                    onEdit={() => setEditRecord(selectedLead)}
                                    onDelete={() => handleDelete(selectedLead.id)}
                                />
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
                                            <User size={20} color="#6366f1" /> <strong>Converted By:</strong> {selectedLead.converter_name || selectedLead.employee_name || selectedLead.assignee_name || 'System'}
                                        </div>
                                    </div>
                                    
                                    {selectedLead.last_note && (
                                        <div style={{ marginTop: '24px', padding: '20px', background: '#eff6ff', borderRadius: '16px', borderLeft: '4px solid #6366f1' }}>
                                            <strong style={{ color: '#1e293b', display: 'block', marginBottom: '8px' }}>Previous Notes / Feedback:</strong>
                                            <span style={{ color: '#475569', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedLead.last_note}</span>
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
                                                    
                                                    <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <CheckCircle size={18} /> Save Update
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
                                                        style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                                                        required
                                                    ></textarea>
                                                </div>
                                                
                                                <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <CheckCircle size={18} /> Save Feedback
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column' }}>
                                <Archive size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
                                <p>Select a lead from the list to view details.</p>
                            </div>
                        )}
                    </div>
                </div>

            {viewRecord && (
                <ViewModal 
                    isOpen={!!viewRecord}
                    onClose={() => setViewRecord(null)}
                    title="Lead Details"
                    data={viewRecord}
                />
            )}

            <EditLeadModal 
                isOpen={!!editRecord} 
                onClose={() => setEditRecord(null)} 
                data={editRecord} 
                onSave={(updated) => { 
                    fetchLeads(activeTab); 
                    if (selectedLead?.id === updated.id) setSelectedLead(updated);
                    setEditRecord(null); 
                }} 
            />
        </div>
    );
};

export default NIBox;
