import React, { useState, useEffect } from 'react';
import { PlusCircle, List, CheckCircle, Download, Upload, Users, Eye, Edit2, Trash2 } from 'lucide-react';
import Papa from 'papaparse';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ActionButtons from './ActionButtons';
import { getPerms } from './permissions';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const Clients = () => {
  const perms = getPerms('clients');
  const hasAddTab = perms.add_clients ?? perms.canCreate;
  const hasAllTab = perms.all_clients ?? perms.canView;
  const hasMineTab = perms.my_clients ?? perms.canView;
  const canCreate = perms.create ?? perms.canCreate;
  const canEdit = perms.edit ?? perms.canEdit;
  const canDelete = perms.delete ?? perms.canDelete;

  const [activeTab, setActiveTab] = useState(() => {
    if (hasAllTab) return 'all';
    if (hasMineTab) return 'mine';
    if (hasAddTab) return 'add';
    return '';
  });
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', district: '', car_model: '', registration_number: '', source: 'Manual Entry' });
  const [successMessage, setSuccessMessage] = useState('');
  const [viewClient, setViewClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setCurrentUser(user.name);
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Clients are leads that have been converted
        setClients(data.filter(c => c.status === 'Converted'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const payload = {
        customer_id: 'C-' + Date.now() + Math.floor(Math.random()*1000),
        name: form.name,
        phone: form.phone,
        district: form.district,
        car_model: form.car_model,
        registration_number: form.registration_number,
        source: form.source
      };
      
      const res = await fetch(`${API}/customers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const { id } = await res.json();
        // Mark as converted
        await fetch(`${API}/customers/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ status: 'Converted' })
        });
        
        fetchClients();
        showSuccess('Client added successfully!');
        setForm({ name: '', phone: '', email: '', district: '', car_model: '', registration_number: '', source: 'Manual Entry' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const token = localStorage.getItem('token');
        for (let row of results.data) {
          try {
            const payload = {
              customer_id: 'C-' + Date.now() + Math.floor(Math.random()*1000),
              name: row.Name || row.name || 'Unknown',
              phone: row.Phone || row.phone || '',
              district: row.Location || row.location || '',
              source: 'CSV Import'
            };
            const res = await fetch(`${API}/customers`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const { id } = await res.json();
              await fetch(`${API}/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'Converted' })
              });
            }
          } catch (e) { console.error(e); }
        }
        fetchClients();
        showSuccess(`Imported clients from CSV!`);
      }
    });
  };

  const exportCSV = () => {
    if (clients.length === 0) return alert('No clients to export.');
    const csv = Papa.unparse(clients);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this client?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/customers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          fetchClients();
          showSuccess('Client deleted successfully!');
        } else {
          alert('Failed to delete client.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while deleting.');
      }
    }
  };

  const handleEdit = (client) => {
    setEditClient(client);
  };

  const handleView = (client) => {
    setViewClient(client);
  };



  const renderTable = (data) => (
    <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client Name</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Contact Info</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Location</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Source</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No clients found.</td>
            </tr>
          ) : data.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
              <td data-label="Client Name" style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '600' }}>{c.name}</td>
              <td data-label="Contact Info" style={{ padding: '14px 16px', color: '#4b5563' }}>
                <div>{c.phone}</div>
              </td>
              <td data-label="Location" style={{ padding: '14px 16px', color: '#4b5563' }}>{c.district}</td>
              <td data-label="Source" style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', fontWeight: '600' }}>{c.source}</span>
              </td>
              <td data-label="Actions" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <ActionButtons 
                  onView={() => handleView(c)}
                  onEdit={() => handleEdit(c)}
                  onDelete={() => handleDelete(c.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!hasAddTab && !hasAllTab && !hasMineTab) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access any categories in Clients. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasAddTab && (
          <button 
            onClick={() => setActiveTab('add')}
            style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <PlusCircle size={18} /> Add Clients
          </button>
        )}
        {hasAllTab && (
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <List size={18} /> All Clients
          </button>
        )}
        {hasMineTab && (
          <button 
            onClick={() => setActiveTab('mine')}
            style={{ padding: '12px 24px', background: activeTab === 'mine' ? 'var(--primary)' : 'transparent', color: activeTab === 'mine' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <Users size={18} /> My Clients
          </button>
        )}
        {(activeTab === 'all' || activeTab === 'mine') && (
          <button 
            onClick={exportCSV}
            style={{ marginLeft: 'auto', padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <Download size={18} /> Export CSV
          </button>
        )}
      </div>

      <div className="page-content">
        {successMessage && (
          <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}

        {activeTab === 'add' && hasAddTab && (
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Manual Form */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={24} color="var(--primary)" /> Manual Client Entry
              </h2>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Client/Company Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                </div>
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Phone</label>
                    <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location</label>
                  <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Car Model</label>
                    <input type="text" value={form.car_model} onChange={e => setForm({...form, car_model: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., Honda City" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Car Number</label>
                    <input type="text" value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., TN-01-AB-1234" />
                  </div>
                </div>
                <button type="submit" style={{ marginTop: '10px', background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                  Save Client
                </button>
              </form>
            </div>

            {/* CSV Import */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={24} color="#10b981" /> Import CSV
              </h2>
              <div style={{ border: '2px dashed #d1d5db', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', background: '#f9fafb' }}>
                <Upload size={40} color="#9ca3af" style={{ marginBottom: '15px' }} />
                <p style={{ color: '#4b5563', marginBottom: '20px' }}>Upload a CSV file containing Name, Phone, Email, Location columns.</p>
                <label style={{ background: '#e0e7ff', color: '#4338ca', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}>
                  Select CSV File
                  <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all' && hasAllTab && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>All Clients ({clients.length})</h2>
            {renderTable(clients)}
          </div>
        )}

        {activeTab === 'mine' && hasMineTab && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>My Clients ({clients.filter(c => c.assignedTo === currentUser).length})</h2>
            {renderTable(clients.filter(c => c.assignedTo === currentUser))}
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={!!viewClient} 
        onClose={() => setViewClient(null)} 
        title="Client Details" 
        data={viewClient || {}} 
      />

      <EditLeadModal 
        isOpen={!!editClient} 
        onClose={() => setEditClient(null)} 
        data={editClient} 
        onSave={(updated) => { fetchClients(); setEditClient(null); }} 
      />
    </div>
  );
};

export default Clients;
