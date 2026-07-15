import React, { useState, useEffect } from 'react';
import { PlusCircle, List, CheckCircle, FileText, Plus, Trash2, Eye, Edit2, Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const API = 'http://localhost:5000/api';
const paymentMethods = ['UPI', 'Card', 'Cash', 'Bank Transfer'];

const InvoicePreviewModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  const handleDownload = () => {
    const element = document.getElementById('invoice-pdf-content');
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${invoice.invoice_no}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const company = {
    name: 'AruvixLabs',
    address: '123 Tech Park, Chennai, India',
    phone: '+91 9876543210',
    email: 'contact@aruvixlabs.com'
  };

  // Safe parse JSON items
  let items = [];
  try {
    items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items;
  } catch (e) {
    items = [];
  }

  const totalAmount = parseFloat(invoice.total_amount) || 0;
  const paidAmount = parseFloat(invoice.paid_amount) || 0;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ background: 'white', width: '90%', maxWidth: '850px', height: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
          <h2 style={{ fontSize: '18px', color: '#1f2937' }}>Invoice Preview</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownload} style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <Download size={16} /> Download PDF
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#e5e7eb' }}>
          <div id="invoice-pdf-content" style={{ background: 'white', padding: '40px', margin: '0 auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            
            {/* Header: Company & Invoice Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
                  A
                </div>
                <div>
                  <h1 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '2px' }}>{company.name}</h1>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{company.address}</p>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{company.phone} | {company.email}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '32px', color: '#111827', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0' }}>Invoice</h2>
                <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}><strong>Invoice No:</strong> {invoice.invoice_no}</div>
                <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}><strong>Date:</strong> {invoice.date.split('T')[0]}</div>
                <div style={{ display: 'inline-block', padding: '4px 10px', background: invoice.status === 'Paid' ? '#d1fae5' : invoice.status === 'Partially Paid' ? '#fef3c7' : '#fee2e2', color: invoice.status === 'Paid' ? '#065f46' : invoice.status === 'Partially Paid' ? '#d97706' : '#991b1b', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                  {invoice.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div style={{ marginBottom: '40px', display: 'flex' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '5px' }}>Billed To:</h3>
                <div style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>{invoice.client_name}</div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #d1d5db', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Description</th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #d1d5db', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #d1d5db', color: '#374151', fontSize: '13px', textTransform: 'uppercase' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ padding: '15px', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>{item.name}</td>
                    <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>{item.count}</td>
                    <td style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', color: '#1f2937', fontWeight: '500' }}>₹{parseFloat(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
              <div style={{ width: '320px', background: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', marginBottom: '10px' }}>
                  <span style={{ color: '#4b5563' }}>Subtotal:</span>
                  <span style={{ color: '#1f2937', fontWeight: '500' }}>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', marginBottom: '10px' }}>
                  <span style={{ color: '#059669' }}>Amount Paid:</span>
                  <span style={{ color: '#059669', fontWeight: '500' }}>-₹{paidAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #e5e7eb', fontSize: '18px', fontWeight: 'bold' }}>
                  <span style={{ color: '#1f2937' }}>Balance Due:</span>
                  <span style={{ color: '#1f2937' }}>₹{(totalAmount - paidAmount).toFixed(2)}</span>
                </div>
                {invoice.payment_method && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Payment Method:</span>
                    <span style={{ color: '#4b5563', fontWeight: '500' }}>{invoice.payment_method}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div style={{ color: '#4b5563', fontSize: '14px', marginBottom: '40px' }}>
                <strong style={{ color: '#1f2937' }}>Notes / Terms:</strong><br />
                {invoice.notes}
              </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#9ca3af', fontSize: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              Thank you for your business!<br />
              Generated by {company.name}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const Invoices = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setClients(data.filter(c => c.status === 'Converted')); // Only bill converted clients
      }
    } catch (e) { console.error(e); }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/invoices`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) { console.error(e); }
  };

  const [viewInvoice, setViewInvoice] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    client_id: '',
    items: [{ name: '', count: 1, amount: 0 }],
    paidAmount: '',
    paymentMethod: paymentMethods[0],
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
    const paid = parseFloat(form.paidAmount) || 0;
    
    let status = 'Unpaid';
    if (paid >= total && total > 0) status = 'Paid';
    else if (paid > 0) status = 'Partially Paid';

    try {
      const token = localStorage.getItem('token');
      const payload = {
        invoiceNo: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
        client_id: form.client_id,
        items: form.items,
        totalAmount: total,
        paidAmount: paid,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        date: new Date().toISOString().split('T')[0],
        status: status
      };

      const res = await fetch(`${API}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess('Invoice created successfully!');
        setForm({
          client_id: '',
          items: [{ name: '', count: 1, amount: 0 }],
          paidAmount: '',
          paymentMethod: paymentMethods[0],
          notes: ''
        });
        fetchInvoices();
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/invoices/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchInvoices();
      } catch (error) { console.error(error); }
    }
  };

  const handleEdit = (inv) => {
    alert(`Editing Invoice: ${inv.invoice_no}\n(Full edit form will open here)`);
  };

  const handleView = (inv) => {
    setViewInvoice(inv);
  };

  const renderTable = (data) => (
    <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Invoice No</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Amount</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No invoices found.</td>
            </tr>
          ) : data.map(inv => (
            <tr key={inv.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
              <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '600' }}>{inv.invoice_no}</td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>{inv.client_name}</td>
              <td style={{ padding: '14px 16px', color: '#1f2937' }}>
                <div style={{ fontWeight: '600' }}>Total: ₹{parseFloat(inv.total_amount).toFixed(2)}</div>
                <div style={{ fontSize: '12px', color: '#059669' }}>Paid: ₹{parseFloat(inv.paid_amount).toFixed(2)}</div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', background: inv.status === 'Paid' ? '#d1fae5' : inv.status === 'Partially Paid' ? '#fef3c7' : '#fee2e2', color: inv.status === 'Paid' ? '#065f46' : inv.status === 'Partially Paid' ? '#d97706' : '#991b1b', borderRadius: '12px', fontWeight: '600' }}>{inv.status}</span>
              </td>
              <td style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button onClick={() => handleView(inv)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Preview & Download"><Eye size={16} /></button>
                <button onClick={() => handleEdit(inv)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(inv.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="invoices-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('add')}
          style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <PlusCircle size={18} /> Create Invoice
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <List size={18} /> All Invoices
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'add' && (
          <div style={{ maxWidth: '800px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={24} color="var(--primary)" /> Generate New Invoice
            </h2>
            
            {successMessage && (
              <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Client</label>
                <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required>
                  <option value="">Select a Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Items Section */}
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', marginBottom: '15px', fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>Invoice Items</label>
                
                {form.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 2 }}>
                      <input type="text" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} placeholder="Item Description" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
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
                    Subtotal: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Amount Paid (optional)</label>
                  <input type="number" step="0.01" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: e.target.value})} placeholder="0.00" style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                    {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Extra Notes / Terms</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '80px' }} placeholder="Thank you for your business..."></textarea>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '14px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <FileText size={18} /> Save & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>All Invoices ({invoices.length})</h2>
            {renderTable(invoices)}
          </div>
        )}
      </div>

      <InvoicePreviewModal 
        isOpen={!!viewInvoice} 
        onClose={() => setViewInvoice(null)} 
        invoice={viewInvoice} 
      />
    </div>
  );
};

export default Invoices;
