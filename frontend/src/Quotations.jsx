import React, { useState, useEffect } from 'react';
import { PlusCircle, List, CheckCircle, FileText, Plus, Trash2, Eye, Edit2 } from 'lucide-react';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const Quotations = () => {
  const perms = getPerms('quotes');
  const hasAddTab = perms.create_quote ?? perms.canCreate;
  const hasAllTab = perms.all_quotes ?? perms.canView;
  const canCreate = perms.create ?? perms.canCreate;
  const canEdit = perms.edit ?? perms.canEdit;
  const canDelete = perms.delete ?? perms.canDelete;

  const [activeTab, setActiveTab] = useState(() => {
    if (hasAllTab) return 'all';
    if (hasAddTab) return 'add';
    return '';
  });
  const [quotations, setQuotations] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchQuotations();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        // Allow creating quotes for Interested and Converted leads
        setClients(data.filter(c => c.status === 'Converted' || c.status === 'Interested'));
      }
    } catch (e) { console.error(e); }
  };

  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/quotations`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (e) { console.error(e); }
  };

  const [viewQuote, setViewQuote] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    client_id: '',
    items: [{ name: '', count: 1, amount: 0 }],
    validity: '',
    notes: ''
  });

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { name: '', count: 1, amount: 0 }] });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_id) {
      alert("Please select a client.");
      return;
    }
    const total = calculateTotal();

    try {
      const token = localStorage.getItem('token');
      const payload = {
        quoteNo: `QT-2026-${String(quotations.length + 1).padStart(3, '0')}`,
        client_id: form.client_id,
        items: form.items,
        totalAmount: total,
        validity: form.validity,
        notes: form.notes,
        date: new Date().toISOString().split('T')[0],
        status: 'Draft'
      };

      const res = await fetch(`${API}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess('Quotation generated successfully!');
        setForm({
          client_id: '',
          items: [{ name: '', count: 1, amount: 0 }],
          validity: '',
          notes: ''
        });
        fetchQuotations();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/quotations/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchQuotations();
      } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (q) => {
    alert(`Editing Quotation: ${q.quote_no}\n(Full edit form will open here)`);
  };

  const handleView = (q) => {
    let items = [];
    try {
      items = typeof q.items === 'string' ? JSON.parse(q.items) : q.items;
    } catch(e){}

    const itemsText = items.map(item => `${item.count}x ${item.name} (₹${item.amount})`).join('\n');
    setViewQuote({
      QuoteNo: q.quote_no,
      Client: q.client_name,
      Date: q.date.split('T')[0],
      Validity: q.validity ? q.validity.split('T')[0] : 'N/A',
      Status: q.status,
      TotalAmount: `₹${parseFloat(q.total_amount).toFixed(2)}`,
      Items: itemsText,
      Notes: q.notes || 'None'
    });
  };

  const renderTable = (data) => (
    <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Quote No</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Amount</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No quotations found.</td>
            </tr>
          ) : data.map(q => (
            <tr key={q.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
              <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '600' }}>
                <div>{q.quote_no}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontWeight: 'normal' }}>Valid till: {q.validity ? q.validity.split('T')[0] : 'N/A'}</div>
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>{q.client_name}</td>
              <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '600' }}>₹{parseFloat(q.total_amount).toFixed(2)}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', background: q.status === 'Accepted' ? '#d1fae5' : q.status === 'Rejected' ? '#fee2e2' : q.status === 'Sent' ? '#e0e7ff' : '#f3f4f6', color: q.status === 'Accepted' ? '#065f46' : q.status === 'Rejected' ? '#991b1b' : q.status === 'Sent' ? '#4338ca' : '#374151', borderRadius: '12px', fontWeight: '600' }}>{q.status}</span>
              </td>
              <td style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button onClick={() => handleView(q)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="View Details"><Eye size={16} /></button>
                {canEdit && <button onClick={() => handleEdit(q)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>}
                {canDelete && <button onClick={() => handleDelete(q.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!hasAddTab && !hasAllTab) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access any categories in Quotations. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="quotations-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasAddTab && (
          <button 
            onClick={() => setActiveTab('add')}
            style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <PlusCircle size={18} /> New Quotation
          </button>
        )}
        {hasAllTab && (
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <List size={18} /> All Quotations
          </button>
        )}
      </div>

      <div className="page-content">
        {activeTab === 'add' && hasAddTab && (
          <div style={{ maxWidth: '800px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} color="var(--primary)" /> Generate New Quotation
            </h2>
            
            {successMessage && (
              <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Client / Lead</label>
                <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required>
                  <option value="">Select a Client or Interested Lead</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Items Section */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', marginBottom: '15px', fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>Quotation Items / Services</label>
                
                {form.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 2 }}>
                      <input type="text" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder="Item / Service Description" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="number" min="1" value={item.count} onChange={e => handleItemChange(index, 'count', e.target.value)} placeholder="Qty/Count" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="number" step="0.01" value={item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} placeholder="Total Amount" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
                    </div>
                    <button type="button" onClick={() => removeItem(index)} disabled={form.items.length === 1} style={{ padding: '10px', background: form.items.length === 1 ? '#f3f4f6' : '#fee2e2', color: form.items.length === 1 ? '#9ca3af' : '#dc2626', border: 'none', borderRadius: '6px', cursor: form.items.length === 1 ? 'not-allowed' : 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <button type="button" onClick={addItem} style={{ background: '#e0e7ff', color: '#4338ca', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Plus size={16} /> Add Item
                  </button>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                    Estimated Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Validity Date</label>
                <input type="date" value={form.validity} onChange={e => setForm({...form, validity: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Extra Notes / Terms (e.g. 50% advance required)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '80px' }} placeholder="Terms and conditions..."></textarea>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '14px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <FileText size={18} /> Generate Quotation
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'all' && hasAllTab && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>All Quotations ({quotations.length})</h2>
            {renderTable(quotations)}
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={!!viewQuote} 
        onClose={() => setViewQuote(null)} 
        title="Quotation Details" 
        data={viewQuote || {}} 
      />
    </div>
  );
};

export default Quotations;
