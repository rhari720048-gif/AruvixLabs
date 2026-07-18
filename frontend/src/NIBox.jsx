import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw } from 'lucide-react';
import './index.css';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ActionButtons from './ActionButtons';

const API = 'https://aruvixlabs.onrender.com/api';

const NIBox = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewRecord, setViewRecord] = useState(null);
    const [editRecord, setEditRecord] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) return;
        try {
            const res = await fetch(`${API}/customers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) fetchLeads();
        } catch (e) { console.error(e); }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://aruvixlabs.onrender.com/api/telecalling/nibox', {
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

    useEffect(() => {
        fetchLeads();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Archive color="#6366f1" /> NI Box (Not Interested)
                </h2>
                <button onClick={fetchLeads} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading NI Leads...</div>
            ) : (
                <div className="data-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th style={{ padding: '15px' }}>Car Details</th>
                                <th style={{ padding: '15px' }}>Location</th>
                                <th style={{ padding: '15px' }}>Date</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id}>
                                    <td>{lead.name}</td>
                                    <td>
                                        <a href={`tel:${lead.phone}`} style={{ color: '#6366f1', textDecoration: 'none' }}>
                                            {lead.phone}
                                        </a>
                                    </td>
                                    <td>
                                      {lead.car_model || lead.car_name || '-'}
                                      {lead.registration_number && <div style={{ fontSize: '12px', color: '#6b7280' }}>{lead.registration_number}</div>}
                                    </td>
                                    <td>{lead.district || lead.location || '-'}</td>
                                    <td>{lead.last_dial_date ? new Date(lead.last_dial_date).toLocaleString() : '-'}</td>
                                    <td style={{ textAlign: 'center' }}>
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
                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No leads in the NI Box.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
                onSave={(updated) => { fetchLeads(); setEditRecord(null); }} 
            />
        </div>
    );
};

export default NIBox;
