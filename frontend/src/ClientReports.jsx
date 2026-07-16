import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, List, CheckCircle, ExternalLink, Trash2, Eye, Filter } from 'lucide-react';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';
const token = () => localStorage.getItem('token');

const ClientReports = () => {
  const perms = getPerms('reports');
  const hasAddTab = perms.generate_report ?? perms.canCreate;
  const hasAllTab = perms.all_reports ?? perms.canView;
  const canDelete = perms.delete ?? perms.canDelete;

  const [activeTab, setActiveTab] = useState(() => {
    if (hasAllTab) return 'all';
    if (hasAddTab) return 'add';
    return '';
  });
  const [clients, setClients] = useState([]);
  const [reports, setReports] = useState([]);
  
  // Form State
  const [form, setForm] = useState({
    client_id: '',
    title: '',
    category: 'Monthly Performance',
    file_url: '',
    notes: ''
  });

  const [filterClient, setFilterClient] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewReport, setViewReport] = useState(null);

  const categories = ['Monthly Performance', 'Project Status', 'Financial Summary', 'Engagement Metrics', 'Other'];

  useEffect(() => {
    fetchClients();
    fetchReports();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/customers`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setClients(data);
      if (data.length > 0 && !form.client_id) {
        setForm(prev => ({ ...prev, client_id: data[0].id }));
      }
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API}/client-reports`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setReports(data);
    } catch (e) { console.error(e); }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_id) return alert('Please select a client.');

    try {
      await fetch(`${API}/client-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, date: new Date().toISOString().split('T')[0] })
      });
      showSuccess('Client Report generated successfully!');
      setForm(prev => ({ ...prev, title: '', file_url: '', notes: '' }));
      fetchReports();
      setActiveTab('all');
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this report?')) {
      try {
        await fetch(`${API}/client-reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
        fetchReports();
      } catch (e) { console.error(e); }
    }
  };

  const handleView = (r) => {
    setViewReport({
      'Report Title': r.title,
      'Client': r.client_name,
      'Category': r.category,
      'Date Generated': new Date(r.date).toLocaleDateString(),
      'Status': r.status,
      'File Link': r.file_url,
      'Additional Notes': r.notes
    });
  };

  const filteredReports = filterClient === 'All' 
    ? reports 
    : reports.filter(r => String(r.client_id) === String(filterClient));

  if (!hasAddTab && !hasAllTab) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access Client Reports.</p>
      </div>
    );
  }

  return (
    <div className="client-reports-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasAddTab && (
          <button 
            onClick={() => setActiveTab('add')}
            style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <PlusCircle size={18} /> Generate Report
          </button>
        )}
        {hasAllTab && (
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <List size={18} /> View Reports
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
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} color="var(--primary)" /> Generate Client Report
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Select Client</label>
                <select 
                  value={form.client_id} 
                  onChange={e => setForm({...form, client_id: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                  required
                >
                  <option value="" disabled>-- Select Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {clients.length === 0 && <p style={{fontSize: '12px', color: '#dc2626', marginTop: '5px'}}>No clients available. Please add a client first.</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Report Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  placeholder="e.g. Q3 SEO Performance"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} 
                  required 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Category</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>File URL / Attachment Link</label>
                <input 
                  type="url" 
                  value={form.file_url} 
                  onChange={e => setForm({...form, file_url: e.target.value})} 
                  placeholder="https://drive.google.com/..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Notes (Optional)</label>
                <textarea 
                  value={form.notes} 
                  onChange={e => setForm({...form, notes: e.target.value})} 
                  placeholder="Summary of the report findings..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '80px' }}
                ></textarea>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '14px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <FileText size={18} /> Save & Generate Report
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'all' && hasAllTab && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'var(--text-dark)' }}>Client Reports Directory</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '5px 15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Filter size={18} color="#6b7280" />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Filter by Client:</span>
                <select 
                  value={filterClient} 
                  onChange={e => setFilterClient(e.target.value)} 
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', minWidth: '200px' }}
                >
                  <option value="All">All Clients</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Report Title</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Date Generated</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        No reports found for the selected filter.
                      </td>
                    </tr>
                  ) : filteredReports.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px 20px', color: '#111827', fontWeight: '500' }}>{r.title}</td>
                      <td style={{ padding: '15px 20px', color: '#4b5563' }}>{r.client_name}</td>
                      <td style={{ padding: '15px 20px', color: '#6b7280' }}>
                        <span style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>{r.category}</span>
                      </td>
                      <td style={{ padding: '15px 20px', color: '#4b5563' }}>{new Date(r.date).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button onClick={() => handleView(r)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="View Details"><Eye size={16} /></button>
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ background: '#d1fae5', color: '#059669', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Open Report Link"><ExternalLink size={16} /></a>
                        {canDelete && <button onClick={() => handleDelete(r.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={!!viewReport} 
        onClose={() => setViewReport(null)} 
        title="Report Information" 
        data={viewReport || {}} 
      />
    </div>
  );
};

export default ClientReports;
