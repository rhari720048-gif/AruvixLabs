import React, { useState, useEffect } from 'react';
import { CheckCircle, Eye, Trash2, Search, Award, Calendar, UserCheck, Sparkles, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';

import { API } from './apiConfig';

const CompletedWork = () => {
  const perms = getPerms('completed_work');
  const canView = perms.view ?? perms.canView;
  const canDelete = perms.delete ?? perms.canDelete;

  const [clients, setClients] = useState([]);
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
      toast.error('Failed to load completed work.');
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return toast.error('No completed work data to export.');
    
    const exportRows = filteredData.map(c => ({
      'Client Name': c.name || '',
      'Phone': c.phone || '',
      'District / Location': c.district || c.location || '',
      'Car Details': `${c.car_model || ''} ${c.registration_number ? '(' + c.registration_number + ')' : ''}`.trim(),
      'Source': c.source || '',
      'Converted Date': c.converted_at ? new Date(c.converted_at).toLocaleDateString() : '',
      'Completed Time': c.completed_at ? new Date(c.completed_at).toLocaleString() : ''
    }));

    const headers = Object.keys(exportRows[0]);
    const csvRows = [headers.join(',')];
    for (const row of exportRows) {
      const values = headers.map(h => `"${('' + (row[h] || '')).replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Completed_Work_Deals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Completed Work exported to CSV!');
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
          toast.success('Record deleted successfully!');
        } else {
          toast.error('Failed to delete record.');
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while deleting.');
      }
    }
  };

  const handleView = (client) => {
    setViewClient(client);
  };

  const filteredData = clients.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery) ||
    c.car_model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.car_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!canView) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: '16px', color: '#dc2626', fontWeight: '700' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>You do not have permission to access the Completed Work page. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="page-completed-work" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <Award size={28} color="#10B981" />
            Completed Work & Closed Deals
          </h1>
          <p>Archive of fully serviced clients, successful deliveries, and milestone achievements</p>
        </div>
        <button onClick={handleExportCSV} className="btn-export-csv">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by client name, phone or car..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '46px' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>Client Name</th>
              <th>Contact Info</th>
              <th>Location</th>
              <th>Car Details</th>
              <th>Source</th>
              <th>Converted Date</th>
              <th>Completed Time</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No completed work records found.</td>
              </tr>
            ) : filteredData.map((c, index) => (
              <tr key={c.id}>
                <td data-label="S.No" style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                <td data-label="Client Name">
                  <div style={{ fontWeight: '700', color: '#0F172A' }}>{c.name}</div>
                </td>
                <td data-label="Contact Info">
                  <div style={{ fontWeight: '600' }}>{c.phone}</div>
                </td>
                <td data-label="Location">{c.district || c.location || '-'}</td>
                <td data-label="Car Details">
                  <div style={{ fontWeight: '600' }}>{c.car_model || c.car_name || '-'}</div>
                  {c.registration_number ? <div style={{ fontSize: '12px', color: '#64748b' }}>Reg: {c.registration_number}</div> : null}
                </td>
                <td data-label="Source">
                  <span className="badge callback">{c.source || 'Manual'}</span>
                </td>
                <td data-label="Converted Date" style={{ fontSize: '13px' }}>
                  {c.converted_at ? new Date(c.converted_at).toLocaleDateString() : '-'}
                </td>
                <td data-label="Completed Time">
                  <span className="badge converted">
                    <CheckCircle size={14} /> {c.completed_at ? new Date(c.completed_at).toLocaleDateString() : 'Completed'}
                  </span>
                </td>
                <td data-label="Actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => handleView(c)} className="btn btn-secondary" style={{ padding: '8px' }} title="View Details">
                      <Eye size={16} color="var(--primary)" />
                    </button>
                    {canDelete && (
                      <button onClick={() => handleDelete(c.id)} className="btn btn-secondary" style={{ padding: '8px', color: '#ef4444' }} title="Delete Record">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewClient && (
        <ViewModal isOpen={true} data={viewClient} type="client" title="Client Details" onClose={() => setViewClient(null)} />
      )}
    </div>
  );
};

export default CompletedWork;
