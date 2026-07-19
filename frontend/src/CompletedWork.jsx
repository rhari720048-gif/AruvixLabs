import React, { useState, useEffect } from 'react';
import { CheckCircle, Eye, Trash2, Search } from 'lucide-react';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const CompletedWork = () => {
  const perms = getPerms('completed_work');
  const canView = perms.view ?? perms.canView;
  const canDelete = perms.delete ?? perms.canDelete;

  const [clients, setClients] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [viewClient, setViewClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (canView) {
      fetchClients();
    }
  }, [canView]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.filter(c => c.status === 'Completed Work'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this completed work record?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/customers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          fetchClients();
          showSuccess('Record deleted successfully!');
        } else {
          alert('Failed to delete record.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while deleting.');
      }
    }
  };

  const handleView = (client) => {
    setViewClient(client);
  };

  const filteredData = clients.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery) ||
    c.car_model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!canView) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access the Completed Work page. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={26} color="#10b981" /> Completed Work
          </h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>View all clients with completed work.</p>
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: '12px 16px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', fontSize: '14px' }}>
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '250px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by name, phone or car model..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Contact Info</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Location</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Car Name with Year</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Source</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Converted Date</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Converted By</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Completed Time</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No completed work found.</td>
              </tr>
            ) : filteredData.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
                <td data-label="Client Name" style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '600' }}>{c.name}</td>
                <td data-label="Contact Info" style={{ padding: '14px 16px', color: '#4b5563' }}>
                  <div>{c.phone}</div>
                </td>
                <td data-label="Location" style={{ padding: '14px 16px', color: '#4b5563' }}>{c.district}</td>
                <td data-label="Car Name with Year" style={{ padding: '14px 16px', color: '#4b5563' }}>
                  {c.car_model || c.car_name || '-'}
                  {c.registration_number ? <div style={{ fontSize: '12px', color: '#9ca3af' }}>{c.registration_number}</div> : null}
                </td>
                <td data-label="Source" style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', fontWeight: '600' }}>{c.source}</span>
                </td>
                <td data-label="Converted Date" style={{ padding: '14px 16px', color: '#4b5563', fontSize: '13px' }}>
                  {c.converted_at ? new Date(c.converted_at).toLocaleString() : '-'}
                </td>
                <td data-label="Converted By" style={{ padding: '14px 16px', color: '#4b5563' }}>
                  {c.converted_by_name ? (
                    <span style={{ fontSize: '12px', padding: '4px 10px', background: '#e0e7ff', color: '#4338ca', borderRadius: '12px', fontWeight: '600' }}>{c.converted_by_name}</span>
                  ) : '-'}
                </td>
                <td data-label="Completed Time" style={{ padding: '14px 16px', color: '#10b981', fontWeight: '600', fontSize: '13px' }}>
                  {c.completed_at ? new Date(c.completed_at).toLocaleString() : '-'}
                </td>
                <td data-label="Actions" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button onClick={() => handleView(c)} title="View Details" style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                    <Eye size={16} />
                  </button>
                  {canDelete && (
                    <button onClick={() => handleDelete(c.id)} title="Delete" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewClient && (
        <ViewModal isOpen={true} data={viewClient} title="Client Details" onClose={() => setViewClient(null)} />
      )}
    </div>
  );
};

export default CompletedWork;
