import React, { useState } from 'react';
import { PhoneCall, Check, Download, Search, Edit2, Trash2, Eye, X } from 'lucide-react';

const AllLeads = ({ leads, handleConvert, handleDelete, handleBulkDelete, handleEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modals state
  const [viewLead, setViewLead] = useState(null);
  const [editLead, setEditLead] = useState(null);

  // Filter leads based on search
  const filteredLeads = leads.filter(lead => 
    (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone || '').includes(searchTerm) ||
    (lead.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const downloadCSV = () => {
    const headers = ['Client Name', 'Requirements', 'Mobile No', 'Location', 'Assigned To', 'Feedback', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name || ''}"`,
        `"${lead.requirements || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.location || ''}"`,
        `"${lead.assignedTo || ''}"`,
        `"${lead.feedback || ''}"`,
        `"${lead.status || 'Pending'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    handleEdit(editLead.id, editLead);
    setEditLead(null);
  };

  return (
    <div className="all-leads-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: 'var(--text-dark)', margin: 0 }}>All Leads ({filteredLeads.length})</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {selectedIds.length > 0 && (
            <button onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
                handleBulkDelete(selectedIds);
                setSelectedIds([]);
              }
            }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', width: '250px' }}
            />
          </div>

          <button onClick={downloadCSV} style={{ padding: '10px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>
      
      <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', width: '40px' }}>
                <input type="checkbox" checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Requirements</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Mobile No</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Location</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Assigned To</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No leads found.</td>
              </tr>
            ) : filteredLeads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', background: selectedIds.includes(lead.id) ? '#eff6ff' : 'transparent' }}>
                <td style={{ padding: '14px 16px' }}>
                  <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '500' }}>{lead.name}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.requirements?.substring(0, 20)}{lead.requirements?.length > 20 ? '...' : ''}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lead.phone}
                    <a href={`tel:${lead.phone}`} style={{ padding: '4px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'inline-flex', textDecoration: 'none' }} title="Call">
                      <PhoneCall size={12} />
                    </a>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.location}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.assignedTo}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setViewLead(lead)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }} title="View">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => setEditLead(lead)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer' }} title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this lead?')) handleDelete(lead.id) }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
                      <Trash2 size={18} />
                    </button>
                    {lead.status === 'Converted' ? (
                      <span style={{ fontSize: '11px', padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', fontWeight: '600' }}>Converted</span>
                    ) : (
                      <button onClick={() => handleConvert(lead.id)} style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                        Convert
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>Lead Details</h3>
              <button onClick={() => setViewLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div><strong>Name:</strong> {viewLead.name}</div>
              <div><strong>Phone:</strong> {viewLead.phone}</div>
              <div><strong>Location:</strong> {viewLead.location}</div>
              <div><strong>Requirements:</strong> {viewLead.requirements}</div>
              <div><strong>Feedback:</strong> {viewLead.feedback}</div>
              <div><strong>Assigned To:</strong> {viewLead.assignedTo}</div>
              <div><strong>Status:</strong> {viewLead.status}</div>
              <div><strong>Source:</strong> {viewLead.source || 'Unknown'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>Edit Lead</h3>
              <button onClick={() => setEditLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Name</label>
                <input type="text" value={editLead.name} onChange={e => setEditLead({...editLead, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Phone</label>
                <input type="text" value={editLead.phone} onChange={e => setEditLead({...editLead, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Location</label>
                <input type="text" value={editLead.location} onChange={e => setEditLead({...editLead, location: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Requirements</label>
                <input type="text" value={editLead.requirements} onChange={e => setEditLead({...editLead, requirements: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Feedback</label>
                <input type="text" value={editLead.feedback} onChange={e => setEditLead({...editLead, feedback: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Assigned To</label>
                <input type="text" value={editLead.assignedTo} onChange={e => setEditLead({...editLead, assignedTo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLeads;
