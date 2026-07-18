import React, { useState } from 'react';
import { PhoneCall, Download, Search, Trash2 } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import ActionButtons from './ActionButtons';
import ViewModal from './ViewModal';
import EditLeadModal from './EditLeadModal';

const AllLeads = ({ leads, employees = [], handleConvert, handleDelete, handleBulkDelete, handleBulkAssign, handleEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState([]);
  
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
    const headers = ['Client Name', 'Requirements', 'Mobile No', 'Location', 'Car Model', 'Car Number', 'Assigned To', 'Feedback', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name || ''}"`,
        `"${lead.requirements || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.location || ''}"`,
        `"${lead.car_model || ''}"`,
        `"${lead.registration_number || ''}"`,
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
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && handleBulkDelete && (
            <button onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
                handleBulkDelete(selectedIds);
                setSelectedIds([]);
              }
            }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
              <Trash2 size={16} /> Delete Selected ({selectedIds.length})
            </button>
          )}

          {selectedIds.length > 0 && handleBulkAssign && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '200px' }}>
                <SearchableSelect 
                  options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                  value={selectedEmployeeId}
                  onChange={(val) => setSelectedEmployeeId(val)}
                  placeholder="Select Employee..."
                  isMulti={true}
                />
              </div>
              <button 
                onClick={() => {
                  if (!selectedEmployeeId || selectedEmployeeId.length === 0) return alert('Please select at least one employee');
                  handleBulkAssign(selectedIds, selectedEmployeeId);
                  setSelectedIds([]);
                  setSelectedEmployeeId([]);
                }}
                style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Assign Selected
              </button>
            </div>
          )}

          <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', width: '100%', maxWidth: '300px' }}
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
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Vehicle</th>
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
                <td data-label="Select" style={{ padding: '14px 16px' }}>
                  <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} style={{ cursor: 'pointer' }} />
                </td>
                <td data-label="Client Name" style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '500' }}>{lead.name}</td>
                <td data-label="Vehicle" style={{ padding: '14px 16px', color: '#4b5563' }}>
                  {lead.car_model || '-'} 
                  {lead.registration_number && <span style={{ display: 'block', fontSize: '12px', color: '#9ca3af' }}>{lead.registration_number}</span>}
                </td>
                <td data-label="Requirements" style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.requirements?.substring(0, 20)}{lead.requirements?.length > 20 ? '...' : ''}</td>
                <td data-label="Mobile No" style={{ padding: '14px 16px', color: '#4b5563' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lead.phone}
                    <a href={`tel:${lead.phone}`} style={{ padding: '4px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'inline-flex', textDecoration: 'none' }} title="Call">
                      <PhoneCall size={12} />
                    </a>
                  </div>
                </td>
                <td data-label="Location" style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.location}</td>
                <td data-label="Assigned To" style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.assignedTo}</td>
                <td data-label="Actions" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ActionButtons 
                      onView={() => setViewLead(lead)}
                      onEdit={() => setEditLead(lead)}
                      onDelete={() => { if(window.confirm('Delete this lead?')) handleDelete(lead.id) }}
                    />
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

      <ViewModal 
        isOpen={!!viewLead} 
        onClose={() => setViewLead(null)} 
        title="Lead Details" 
        data={viewLead} 
      />

      <EditLeadModal 
        isOpen={!!editLead} 
        onClose={() => setEditLead(null)} 
        data={editLead} 
        onSave={(updated) => { handleEdit && handleEdit(updated.id, updated); setEditLead(null); }} 
      />
    </div>
  );
};

export default AllLeads;
