import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, User, Users, PlusCircle, CheckCircle, Edit3, PhoneCall, MapPin, Car, Clock, Phone, PhoneOff } from 'lucide-react';
import './index.css';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ActionButtons from './ActionButtons';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

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
    const [successMsg, setSuccessMsg] = useState('');

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
        } catch (e) { console.error(e); }
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
        if (selectedLead?.id !== leadToCall.id) setSelectedLead(leadToCall);
        resetCallState();
        setCallPhase('dialing');
        window.location.href = `tel:${leadToCall.phone}`;
        
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
                setSuccessMsg('Feedback submitted successfully!');
                setSelectedLead(null);
                resetCallState();
                setFeedback({ status: 'Call Later', notes: '', callback_time: '' });
                fetchLeads(activeTab);
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualForm.name || !manualForm.phone) {
            return alert("Name and Phone are required!");
        }
        
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API}/telecalling/manual-ni`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(manualForm)
            });
            if (res.ok) {
                setSuccessMsg('Manual NI lead added successfully!');
                setManualForm({ name: '', phone: '', location: '', car_name: '', notes: '' });
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save NI lead");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 100px)' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <button 
                    onClick={() => setActiveTab('my')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'my' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'my' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500' }}
                >
                    <User size={18} /> My NI Leads
                </button>
                <button 
                    onClick={() => setActiveTab('all')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'all' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500' }}
                >
                    <Users size={18} /> All NI Leads
                </button>
                <button 
                    onClick={() => setActiveTab('manual')}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'manual' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'manual' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', fontWeight: '500' }}
                >
                    <PlusCircle size={18} /> Manual Entry
                </button>
            </div>

            {successMsg && (
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                    <CheckCircle size={18} /> {successMsg}
                </div>
            )}

            {activeTab === 'manual' ? (
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '30px', overflowY: 'auto' }}>
                    <h2 style={{ marginBottom: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Edit3 size={24} color="var(--primary)" /> Add NI Lead Manually
                    </h2>
                    <form onSubmit={handleManualSubmit} className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '800px' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Customer Name *</label>
                            <input type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter name" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Phone Number *</label>
                            <input type="tel" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter phone" required />
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
                            <textarea value={manualForm.notes} onChange={e => setManualForm({...manualForm, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', height: '80px', resize: 'vertical' }} placeholder="Add any details about why they are not interested..."></textarea>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="submit" disabled={isSubmitting} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? 'Saving...' : 'Save Manual NI Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar List of Leads */}
                    <div style={{ flex: '0 0 300px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e5e7eb', margin: 0, position: 'sticky', top: 0, background: 'white', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>
                                {activeTab === 'my' ? 'My NI Leads' : 'All NI Leads'} ({leads.length})
                            </h3>
                            <button onClick={() => fetchLeads(activeTab)} style={{ padding: '4px 8px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                <RefreshCw size={12} />
                            </button>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{lead.name}</div>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            
                                            <ActionButtons 
                                                onView={() => setViewRecord(lead)}
                                                onEdit={() => setEditRecord(lead)}
                                                onDelete={() => handleDelete(lead.id)}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Car size={12} /> {lead.car_model || lead.car_name || 'No Car'} {lead.registration_number ? `(${lead.registration_number})` : ''}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Archive size={12} /> {lead.callback_time ? `Callback: ${new Date(lead.callback_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Not Interested'}
                                    </div>
                                </li>
                            ))}
                            {!loading && leads.length === 0 && (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No leads in the NI Box.</div>
                            )}
                        </ul>
                    </div>

                    {/* Main Dialing/Feedback Area */}
                    <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', overflowY: 'auto' }}>
                        {selectedLead ? (
                            <div>
                                <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '20px' }}>
                                    <h2 style={{ margin: '0 0 15px', color: '#111827', fontSize: '24px' }}>{selectedLead.name}</h2>
                                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                                            <PhoneCall size={18} color="#6366f1" /> <strong>Phone:</strong> {selectedLead.phone}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                                            <MapPin size={18} color="#10b981" /> <strong>District:</strong> {selectedLead.district || '-'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563' }}>
                                            <Car size={18} color="#f59e0b" /> <strong>Vehicle:</strong> {selectedLead.car_model || selectedLead.car_name || '-'} {selectedLead.registration_number ? `(${selectedLead.registration_number})` : ''}
                                        </div>
                                        {selectedLead.callback_time && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', gridColumn: '1 / -1' }}>
                                                <Clock size={18} color="#f59e0b" /> <strong>Callback Scheduled:</strong> {new Date(selectedLead.callback_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </div>
                                        )}
                                    </div>
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
                                            <button 
                                                onClick={() => startDialing(selectedLead)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                                                    background: '#10b981', color: 'white', padding: '12px 32px', border: 'none',
                                                    borderRadius: '50px', fontWeight: 'bold', fontSize: '16px',
                                                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)', marginBottom: '20px'
                                                }}
                                            >
                                                <PhoneCall size={20} /> Dial Now
                                            </button>
                                            
                                            <div style={{ textAlign: 'left' }}>
                                                <form onSubmit={handleFeedbackSubmit} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    <h3 style={{ margin: '0 0 15px', color: '#1e293b' }}>Update Status (Manual)</h3>
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Status</label>
                                                        <select 
                                                            value={feedback.status} 
                                                            onChange={e => setFeedback({...feedback, status: e.target.value})}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
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
                                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                                required
                                                            />
                                                        </div>
                                                    )}

                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Notes</label>
                                                        <textarea 
                                                            value={feedback.notes} 
                                                            onChange={e => setFeedback({...feedback, notes: e.target.value})}
                                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical' }}
                                                            required
                                                        ></textarea>
                                                    </div>
                                                    
                                                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <CheckCircle size={18} /> Save Update
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
                                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                            required
                                                        />
                                                    </div>
                                                )}

                                                <div style={{ marginBottom: '15px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>Notes</label>
                                                    <textarea 
                                                        value={feedback.notes} 
                                                        onChange={e => setFeedback({...feedback, notes: e.target.value})}
                                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical' }}
                                                        required
                                                    ></textarea>
                                                </div>
                                                
                                                <button type="submit" style={{ width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <CheckCircle size={18} /> Save Feedback
                                                </button>
                                            </form>
                                        </div>
                                    )}
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
            )}

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
