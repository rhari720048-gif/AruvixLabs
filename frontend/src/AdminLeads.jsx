import React, { useState, useEffect } from 'react';
import AddLeads from './AddLeads';
import AllLeads from './AllLeads';
import { UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const AdminLeads = () => {
  const perms = getPerms('leads');
  const hasAddTab = perms.add_leads ?? perms.canCreate;
  const hasAllTab = perms.all_leads ?? perms.canView;
  const hasMineTab = perms.my_leads ?? perms.canView;
  const canCreate = perms.create ?? perms.canCreate;
  const canDelete = perms.delete ?? perms.canDelete;
  const canEdit = perms.edit ?? perms.canEdit;

  const [activePage, setActivePage] = useState(() => {
    if (hasAllTab) return 'all';
    if (hasMineTab) return 'mine';
    if (hasAddTab) return 'add';
    return '';
  });
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setCurrentUser(user.name);
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

  if (!hasAddTab && !hasAllTab) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access any categories in Leads. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="admin-leads-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasAddTab && (
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
        {hasAllTab && (
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
        )}
        {hasMineTab && (
          <button 
            onClick={() => setActivePage('mine')}
            style={{
              padding: '12px 24px', 
              background: activePage === 'mine' ? 'var(--primary)' : 'transparent', 
              color: activePage === 'mine' ? 'white' : '#4b5563', 
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
            <Users size={18} /> My Leads
          </button>
        )}
      </div>

      <div className="page-content">
        {activePage === 'add' && hasAddTab ? (
          <AddLeads addLeads={addLeads} />
        ) : activePage === 'all' && hasAllTab ? (
          <AllLeads 
            leads={leads} 
            handleConvert={handleConvert} 
            handleDelete={canDelete ? handleDelete : null}
            handleBulkDelete={canDelete ? handleBulkDelete : null}
            handleEdit={canEdit ? handleEdit : null}
          />
        ) : activePage === 'mine' && hasMineTab ? (
          <AllLeads 
            leads={leads.filter(l => l.assignedTo === currentUser)} 
            handleConvert={handleConvert} 
            handleDelete={canDelete ? handleDelete : null}
            handleBulkDelete={canDelete ? handleBulkDelete : null}
            handleEdit={canEdit ? handleEdit : null}
          />
        ) : null}
      </div>
    </div>
  );
};

export default AdminLeads;
