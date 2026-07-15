import React, { useState, useEffect } from 'react';
import AddLeads from './AddLeads';
import AllLeads from './AllLeads';
import { UserPlus, Users } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const API = 'https://aruvixlabs.onrender.com/api';

const AdminLeads = () => {
  const [activePage, setActivePage] = useState('all'); // 'add' or 'all'
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();
  
  let permissions = {};
  try { permissions = JSON.parse(localStorage.getItem('permissions') || '{}'); } catch(e){}
  const role = (localStorage.getItem('role') || 'employee').toLowerCase();
  
  const canCreate = role === 'admin' || (permissions.leads && permissions.leads.create);
  const canDelete = role === 'admin' || (permissions.leads && permissions.leads.delete);
  const canEdit = role === 'admin' || (permissions.leads && permissions.leads.edit);

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
        // Map backend fields to frontend expected fields
        const formattedLeads = data.map(c => {
          const parts = (c.notes || '').split(' | ');
          return {
            ...c,
            location: c.district || 'Unknown',
            requirements: parts[0] || 'N/A',
            feedback: parts[1] || 'None',
            assignedTo: parts[2] || 'Unassigned'
          };
        });
        // Filter out converted clients
        setLeads(formattedLeads.filter(c => c.status !== 'Converted'));
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
          notes: (lead.requirements || 'N/A') + ' | ' + (lead.feedback || 'None') + ' | ' + (lead.assignedTo || 'Unassigned'),
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

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkDelete = async (ids) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/customers/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = async (id, updatedLead) => {
    const token = localStorage.getItem('token');
    try {
      const payload = {
        name: updatedLead.name,
        phone: updatedLead.phone,
        district: updatedLead.location,
        notes: (updatedLead.requirements || 'N/A') + ' | ' + (updatedLead.feedback || 'None') + ' | ' + (updatedLead.assignedTo || 'Unassigned'),
        source: updatedLead.source || 'Manual',
        status: updatedLead.status
      };
      
      const res = await fetch(`${API}/customers/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="admin-leads-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {canCreate && (
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
        )}
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
        {activePage === 'add' && canCreate ? (
          <AddLeads addLeads={addLeads} />
        ) : (
          <AllLeads 
            leads={leads} 
            handleConvert={handleConvert} 
            handleDelete={canDelete ? handleDelete : null}
            handleBulkDelete={canDelete ? handleBulkDelete : null}
            handleEdit={canEdit ? handleEdit : null}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
