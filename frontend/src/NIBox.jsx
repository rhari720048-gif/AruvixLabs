import React, { useState, useEffect } from 'react';
import { Archive, RefreshCw } from 'lucide-react';
import './index.css';
import ViewModal from './ViewModal';

const NIBox = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewRecord, setViewRecord] = useState(null);

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
                                <th>Car Details</th>
                                <th>Location</th>
                                <th>Last Dialed</th>
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
                                    <td>{lead.car_name || lead.car_model || '-'}</td>
                                    <td>{lead.district || lead.location || '-'}</td>
                                    <td>{lead.last_dial_date ? new Date(lead.last_dial_date).toLocaleString() : '-'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button onClick={() => setViewRecord(lead)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                                            View Details
                                        </button>
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
                    data={viewRecord}
                    type="lead"
                />
            )}
        </div>
    );
};

export default NIBox;
