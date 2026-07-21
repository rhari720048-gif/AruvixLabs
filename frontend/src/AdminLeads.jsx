import React, { useState, useEffect } from 'react';
import AddLeads from './AddLeads';
import AllLeads from './AllLeads';
import MyLeadsGrid from './MyLeadsGrid';
import { UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPerms } from './permissions';
import { API } from './apiConfig';

const TAMIL_NADU_LOCATIONS = [
  "Ariyalur", "Attur", "Avadi", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
  "Dindigul", "Erode", "Hosur", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karaikudi", "Karur", 
  "Kovilpatti", "Krishnagiri", "Kumbakonam", "Madurai", "Mayiladuthurai", "Nagapattinam", "Nagercoil", 
  "Namakkal", "Neyveli", "Ooty (Nilgiris)", "Perambalur", "Pollachi", "Pudukkottai", "Rajapalayam", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Sivakasi", "Tambaram", "Tenkasi", "Thanjavur", 
  "Theni", "Thiruvallur", "Thiruvarur", "Thoothukudi (Tuticorin)", "Tiruchirappalli (Trichy)", 
  "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvannamalai", "Vaniyambadi", "Vellore", "Viluppuram", 
  "Virudhunagar"
];

const AdminLeads = () => {
  const navigate = useNavigate();
  const perms = getPerms('leads');
  const hasAddTab = perms.add_leads ?? perms.canCreate ?? true;
  const hasAllTab = perms.all_leads ?? perms.canView ?? true;
  const canCreate = perms.create ?? perms.canCreate ?? true;
  const canDelete = perms.delete ?? perms.canDelete ?? true;
  const canEdit = perms.edit ?? perms.canEdit ?? true;

  const [activePage, setActivePage] = useState('all');
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [adminSkippedLocation, setAdminSkippedLocation] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem('selected_lead_location') || ''
  );
  const [locationSearch, setLocationSearch] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    let role = '';
    if (user) {
      setCurrentUser(user.name);
      setCurrentUserId(user.id);
      role = (user.role || '').toLowerCase();
      setCurrentUserRole(role);
    }
    fetchEmployees();
    if (selectedLocation || role === 'admin' || adminSkippedLocation) {
      fetchLeads(selectedLocation || '');
    }
  }, [selectedLocation, adminSkippedLocation]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeads = async (loc = selectedLocation) => {
    try {
      const token = localStorage.getItem('token');
      const url = loc 
        ? `${API}/customers?location=${encodeURIComponent(loc)}&queue=true` 
        : `${API}/customers`;
      const res = await fetch(url, {
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
            year: parts[0] || 'N/A',
            feedback: parts[1] || 'None',
            assignedTo: c.assignee_name || 'Unassigned',
            assignedToId: c.assigned_to || ''
          };
        });
        // Filter out processed clients from leads view
        setLeads(formattedLeads.filter(c => !['Converted', 'Completed Work', 'Appointment', 'Call Later', 'NI', 'Not Interested'].includes(c.status)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectLocation = (loc) => {
    localStorage.setItem('selected_lead_location', loc);
    setSelectedLocation(loc);
  };

  const handleChangeLocation = () => {
    localStorage.removeItem('selected_lead_location');
    setSelectedLocation('');
    setAdminSkippedLocation(false);
    setLeads([]);
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
          car_model: lead.car_name || '',
          registration_number: lead.car_number || '',
          notes: (lead.year || 'N/A') + ' | ' + (lead.feedback || 'None'),
          source: lead.source || 'Manual',
          assigned_to: lead.assignedTo || null
        };
        
        const res = await fetch(`${API}/customers`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
           toast.error(`Failed to add lead: ${lead.name}`);
        }
      } catch (e) {
        console.error("Error adding lead:", e);
        toast.error(`Error adding lead: ${lead.name}`);
      }
    }
    
    toast.success("Leads processed!");
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
          toast.success("Lead successfully converted!");
          fetchLeads(); // Refresh leads
          navigate('/clients');
        } else {
          toast.error("Failed to convert lead.");
        }
      } catch (e) {
        console.error(e);
        toast.error("An error occurred during conversion.");
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
        toast.success("Lead deleted successfully!");
        fetchLeads();
      } else {
        toast.error("Failed to delete lead.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while deleting.");
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
        toast.success(`Successfully deleted ${ids.length} leads!`);
        fetchLeads();
      } else {
        toast.error("Failed to delete leads.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while deleting leads.");
    }
  };

  const handleBulkAssign = async (ids, employee_id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/telecalling/bulk-assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ lead_ids: ids, employee_id })
      });
      if (res.ok) {
        toast.success(`Assigned ${ids.length} leads successfully!`);
        fetchLeads();
      } else {
        toast.error("Failed to assign leads.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while assigning leads.");
    }
  };

  const handleEdit = async (id, updatedLead) => {
    const token = localStorage.getItem('token');
    try {
      const payload = {
        name: updatedLead.name,
        phone: updatedLead.phone,
        district: updatedLead.location,
        notes: (updatedLead.year || 'N/A') + ' | ' + (updatedLead.feedback || 'None'),
        source: updatedLead.source || 'Manual',
        status: updatedLead.status,
        assigned_to: updatedLead.assignedToId || null
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
        toast.success("Lead edited successfully!");
        fetchLeads();
      } else {
        toast.error("Failed to edit lead.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while editing lead.");
    }
  };

  const renderLocationModal = () => {
    if (selectedLocation) return null;
    if (currentUserRole === 'admin' && adminSkippedLocation) return null;

    // Filter location search list
    const filteredLocations = TAMIL_NADU_LOCATIONS.filter(loc => 
      loc.toLowerCase().includes(locationSearch.toLowerCase())
    );

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Select Calling Location
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
            Tamil Nadu locations load and lock your calling queue exclusively to prevent overlapping calls.
          </p>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Search districts or cities..." 
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
              onFocus={(e) => e.target.style.border = '1.5px solid #6366f1'}
              onBlur={(e) => e.target.style.border = '1.5px solid rgba(255, 255, 255, 0.1)'}
            />
          </div>

          <div style={{
            maxHeight: '260px',
            overflowY: 'auto',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '8px'
          }} className="custom-scrollbar">
            {filteredLocations.map(loc => (
              <div 
                key={loc}
                onClick={() => handleSelectLocation(loc)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >
                <span style={{ fontSize: '16px' }}>📍</span> {loc}
              </div>
            ))}
            {filteredLocations.length === 0 && (
              <div style={{ padding: '20px', color: '#64748b', fontSize: '13px' }}>
                No locations match your search.
              </div>
            )}
          </div>
          {currentUserRole === 'admin' && (
            <button 
              onClick={() => {
                setAdminSkippedLocation(true);
                fetchLeads('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              Skip & View All Leads
            </button>
          )}
        </div>
      </div>
    );
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
      {activePage === 'all' && selectedLocation && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '14px',
          padding: '14px 24px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(49, 46, 129, 0.2), 0 0 0 1px rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📍</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '15px' }}>
                Calling Queue Location: {selectedLocation}
              </div>
              <div style={{ color: '#a5b4fc', fontSize: '12px', marginTop: '2px' }}>
                Exclusive dynamic lead distribution active for this region.
              </div>
            </div>
          </div>
          <button 
            onClick={handleChangeLocation}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            Change Location
          </button>
        </div>
      )}

      <div className="leads-tab-wrapper">
        {hasAddTab && (
          <button 
            onClick={() => setActivePage('add')}
            className={`leads-tab-btn ${activePage === 'add' ? 'active' : ''}`}
          >
            <UserPlus size={18} /> Add Leads
          </button>
        )}
        {hasAllTab && (
          <button 
            onClick={() => setActivePage('all')}
            className={`leads-tab-btn ${activePage === 'all' ? 'active' : ''}`}
          >
            <Users size={18} /> All Leads
          </button>
        )}
      </div>

      <div className="page-content" style={{ position: 'relative', minHeight: '400px' }}>
        {activePage === 'add' && hasAddTab ? (
          <AddLeads addLeads={addLeads} />
        ) : activePage === 'all' && hasAllTab ? (
          <>
            {renderLocationModal()}
            {selectedLocation && (
              <AllLeads 
                leads={leads} 
                employees={employees}
                handleDelete={canDelete ? handleDelete : undefined}
                handleBulkDelete={canDelete ? handleBulkDelete : undefined}
                handleBulkAssign={handleBulkAssign}
                handleEdit={canEdit ? handleEdit : undefined}
                refreshLeads={fetchLeads}
                onAddLeadClick={hasAddTab ? () => setActivePage('add') : undefined}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminLeads;
