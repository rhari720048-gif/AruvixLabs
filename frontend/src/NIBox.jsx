import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw, User, Users, PlusCircle, CheckCircle, Edit3 } from 'lucide-react';
import './index.css';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ActionButtons from './ActionButtons';

const API = 'https://aruvixlabs.onrender.com/api';

const NIBox = () => {
    const [activeTab, setActiveTab] = useState('my'); // 'my', 'all', 'manual'
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewRecord, setViewRecord] = useState(null);
    const [editRecord, setEditRecord] = useState(null);
    
    // Manual form state
    const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', car_name: '', car_number: '', requirements: '', assignedTo: [], notes: '' });
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
            if (res.ok) fetchLeads(activeTab);
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
                setManualForm({ name: '', phone: '', location: '', car_name: '', car_number: '', requirements: '', assignedTo: [], notes: '' });
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Car Name / Model</label>
                            <input type="text" value={manualForm.car_name} onChange={e => setManualForm({...manualForm, car_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., Honda City" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Car Number</label>
                            <input type="text" value={manualForm.car_number} onChange={e => setManualForm({...manualForm, car_number: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., TN-01-AB-1234" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>Assign To</label>
                            <select multiple value={manualForm.assignedTo} onChange={e => setManualForm({...manualForm, assignedTo: Array.from(e.target.selectedOptions, option => option.value)})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', height: '100px' }}>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                            <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>Hold Ctrl/Cmd to select multiple. Leave blank to assign to yourself.</span>
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
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: '#111827' }}>
                                <Archive color="#6366f1" /> {activeTab === 'my' ? 'My NI Leads' : 'All NI Leads'}
                            </h2>
                            <button onClick={() => fetchLeads(activeTab)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RefreshCw size={16} /> Refresh
                            </button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading NI Leads...</div>
                            ) : leads.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No leads in the NI Box.</div>
                            ) : (
                                <div className="data-table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Phone</th>
                                                <th>Car Details</th>
                                                <th>Location</th>
                                                <th>Date</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.map(lead => (
                                                <tr key={lead.id}>
                                                    <td data-label="Name">{lead.name}</td>
                                                    <td data-label="Phone">
                                                        <a href={`tel:${lead.phone}`} style={{ color: '#6366f1', textDecoration: 'none' }}>
                                                            {lead.phone}
                                                        </a>
                                                    </td>
                                                    <td data-label="Car Details">
                                                      {lead.car_model || lead.car_name || '-'}
                                                      {lead.registration_number && <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.registration_number}</div>}
                                                    </td>
                                                    <td data-label="Location">{lead.district || lead.location || '-'}</td>
                                                    <td data-label="Date">{lead.last_dial_date ? new Date(lead.last_dial_date).toLocaleString() : '-'}</td>
                                                    <td data-label="Actions" style={{ textAlign: 'center' }}>
                                                        <div style={{ display: 'inline-block' }}>
                                                            <ActionButtons 
                                                                onView={() => setViewRecord(lead)}
                                                                onEdit={() => setEditRecord(lead)}
                                                                onDelete={() => handleDelete(lead.id)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
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
                onSave={() => { fetchLeads(activeTab); setEditRecord(null); }} 
            />
        </div>
    );
};

export default NIBox;
