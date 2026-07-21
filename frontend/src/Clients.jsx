import React, { useState, useEffect } from 'react';
import { PlusCircle, List, CheckCircle, Download, Upload, Users, Eye, Edit2, Trash2, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import Papa from 'papaparse';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';
import ActionButtons from './ActionButtons';
import { getPerms } from './permissions';
import toast from 'react-hot-toast';

import { API } from './apiConfig';

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
        setClients(data.filter(c => c.status === 'Converted' || c.status === 'Converted Client' || c.status === 'Client'));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load clients.');
    }
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
        await fetch(`${API}/customers/${id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ status: 'Converted' })
        });
        
        fetchClients();
        toast.success('Client added successfully!');
        setForm({ name: '', phone: '', email: '', district: '', car_model: '', registration_number: '', source: 'Manual Entry' });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding client.');
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
        toast.success(`Imported clients from CSV!`);
      }
    });
  };

  const exportCSV = () => {
    if (clients.length === 0) return toast.error('No clients to export.');
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
          toast.success('Client deleted successfully!');
        } else {
          toast.error('Failed to delete client.');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while deleting.');
      }
    }
  };

  const handleCompleteWork = async (id) => {
    if (window.confirm('Mark this client as Completed Work?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/customers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: 'Completed Work' })
        });
        if (res.ok) {
          fetchClients();
          toast.success('Client marked as Completed Work!');
        } else {
          toast.error('Failed to update status.');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred.');
      }
    }
  };

  const myClientsCount = clients.filter(c => c.converted_by_name === currentUser).length;

  const renderTable = (data) => (
    <div className="data-table-container">
      <table>
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Contact Info</th>
            <th>Location</th>
            <th>Car Details</th>
            <th>Source</th>
            <th>Converted Date</th>
            <th>Converted By</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No clients found.</td>
            </tr>
          ) : data.map(c => (
            <tr key={c.id}>
              <td data-label="Client Name">
                <div style={{ fontWeight: '700', color: '#0F172A' }}>{c.name}</div>
              </td>
              <td data-label="Contact Info">
                <div style={{ fontWeight: '600' }}>{c.phone}</div>
              </td>
              <td data-label="Location">{c.district || c.location || '-'}</td>
              <td data-label="Car Details">
                <div style={{ fontWeight: '600' }}>{c.car_model || c.car_name || '-'}</div>
                {c.registration_number ? <div style={{ fontSize: '12px', color: '#64748b' }}>{c.registration_number}</div> : null}
              </td>
              <td data-label="Source">
                <span className="badge converted">{c.source || 'Manual'}</span>
              </td>
              <td data-label="Converted Date" style={{ fontSize: '13px' }}>
                {c.converted_at ? new Date(c.converted_at).toLocaleDateString() : '-'}
              </td>
              <td data-label="Converted By">
                {c.converted_by_name ? (
                  <span className="badge callback">{c.converted_by_name}</span>
                ) : '-'}
              </td>
              <td data-label="Actions" style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => handleCompleteWork(c.id)}
                  className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <CheckCircle size={14} /> Complete Work
                </button>
                <ActionButtons 
                  onView={() => setViewClient(c)}
                  onEdit={() => setEditClient(c)}
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
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: '16px', color: '#dc2626', fontWeight: '700' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>You do not have permission to access Client directory. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="clients-page" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <Users size={28} color="var(--primary)" />
            Client Directory
          </h1>
          <p>Converted client portfolio, customer accounts, and work order transitions</p>
        </div>
      </div>



      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {hasAddTab && (
          <button 
            onClick={() => setActiveTab('add')}
            className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <PlusCircle size={18} /> Add Client
          </button>
        )}
        {hasAllTab && (
          <button 
            onClick={() => setActiveTab('all')}
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <List size={18} /> All Clients ({clients.length})
          </button>
        )}
        {hasMineTab && (
          <button 
            onClick={() => setActiveTab('mine')}
            className={`btn ${activeTab === 'mine' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={18} /> My Clients ({myClientsCount})
          </button>
        )}
        {(activeTab === 'all' || activeTab === 'mine') && (
          <button 
            onClick={exportCSV}
            className="btn-export-csv" style={{ marginLeft: 'auto' }}
          >
            <Download size={18} /> Export CSV
          </button>
        )}
      </div>

      <div className="page-content">
        {activeTab === 'add' && hasAddTab && (
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card-panel">
              <h3 style={{ marginBottom: '20px', color: '#0F172A', fontWeight: '800', fontSize: '18px' }}>Manual Client Entry</h3>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Client Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. John Doe" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Phone (10 digits only)</label>
                    <input type="tel" maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})} placeholder="Mobile number" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email address" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Location</label>
                  <input type="text" value={form.district} onChange={e => setForm({...form, district: e.target.value})} placeholder="City / District" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Car Model</label>
                    <input type="text" value={form.car_model} onChange={e => setForm({...form, car_model: e.target.value})} placeholder="Honda City" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>Car Number</label>
                    <input type="text" value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} placeholder="TN-01-AB-1234" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '14px', marginTop: '10px' }}>
                  <PlusCircle size={18} /> Save Client
                </button>
              </form>
            </div>

            <div className="card-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px', color: '#0F172A', fontWeight: '800' }}>Bulk Import Clients</h3>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>Upload CSV spreadsheet with headers Name, Phone, Location.</p>
              <label className="btn btn-success" style={{ cursor: 'pointer' }}>
                <Upload size={18} /> Choose CSV File
                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'all' && hasAllTab && renderTable(clients)}
        {activeTab === 'mine' && hasMineTab && renderTable(clients.filter(c => c.converted_by_name === currentUser))}
      </div>

      {viewClient && (
        <ViewModal isOpen={true} data={viewClient} type="client" title="Client Profile Details" onClose={() => setViewClient(null)} />
      )}
      {editClient && (
        <EditLeadModal isOpen={true} data={editClient} onClose={() => setEditClient(null)} onSave={() => { fetchClients(); setEditClient(null); }} />
      )}
    </div>
  );
};

export default Clients;
