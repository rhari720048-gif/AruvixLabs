import React, { useState, useEffect } from 'react';
import AddLeads from './AddLeads';
import AllLeads from './AllLeads';
import { UserPlus, Users } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const AdminLeads = () => {
  const [activePage, setActivePage] = useState('add'); // 'add' or 'all'
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out converted clients
        setLeads(data.filter(c => c.status !== 'Converted'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addLeads = async (newLeads) => {
    const token = localStorage.getItem('token');
    
    // Process each new lead sequentially
    for (let lead of newLeads) {
      try {
        const payload = {
          customer_id: 'L-' + Date.now() + Math.floor(Math.random()*1000), // Random ID
          name: lead.name,
          phone: lead.phone,
          district: lead.location,
          notes: lead.requirements + ' | ' + lead.feedback,
          source: lead.source || 'Manual'
        };
        
        await fetch(`${API}/customers`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.error("Error adding lead:", e);
      }
    }
    
    fetchLeads(); // Refresh from DB
  };

  const handleConvert = async (id) => {
    if (window.confirm("Are you sure you want to convert this lead to a client?")) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API}/customers/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Converted', notes: 'Converted to Client' })
        });
        
        if (res.ok) {
          fetchLeads(); // Refresh leads
          navigate('/clients');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="admin-leads-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActivePage('add')}
          style={{
            padding: '12px 24px', 
            background: activePage === 'add' ? 'var(--primary)' : 'transparent', 
            color: activePage === 'add' ? 'white' : '#4b5563', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <UserPlus size={18} /> Add Leads
        </button>
        <button 
          onClick={() => setActivePage('all')}
          style={{
            padding: '12px 24px', 
            background: activePage === 'all' ? 'var(--primary)' : 'transparent', 
            color: activePage === 'all' ? 'white' : '#4b5563', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <Users size={18} /> All Leads
        </button>
      </div>

      <div className="page-content">
        {activePage === 'add' ? (
          <AddLeads addLeads={addLeads} />
        ) : (
          <AllLeads leads={leads} handleConvert={handleConvert} />
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
