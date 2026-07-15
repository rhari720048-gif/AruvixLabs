import React from 'react';
import { PhoneCall, Check, Download } from 'lucide-react';

const AllLeads = ({ leads, handleConvert }) => {

  const downloadCSV = () => {
    const headers = ['Client Name', 'Requirements', 'Mobile No', 'Location', 'Assigned To', 'Feedback', 'Status'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
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

  return (
    <div className="all-leads-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-dark)', margin: 0 }}>All Leads ({leads.length})</h2>
        <button onClick={downloadCSV} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <Download size={16} /> Download CSV
        </button>
      </div>
      
      <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Requirements</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Mobile No</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Location</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Assigned To</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Feedback</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No leads added yet. Go to Add Leads to get started.</td>
              </tr>
            ) : leads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
                <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '500' }}>{lead.name}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.requirements}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {lead.phone}
                    <a href={`tel:${lead.phone}`} style={{ padding: '6px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'inline-flex', textDecoration: 'none' }} title="Call">
                      <PhoneCall size={14} />
                    </a>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.location}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.assignedTo}</td>
                <td style={{ padding: '14px 16px', color: '#4b5563' }}>{lead.feedback}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lead.status === 'Converted' ? (
                      <span style={{ fontSize: '12px', padding: '4px 10px', background: '#d1fae5', color: '#065f46', borderRadius: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Converted</span>
                    ) : (
                      <button onClick={() => handleConvert(lead.id)} style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                        Convert Client
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllLeads;
