import React, { useState, useEffect } from 'react';
import { PlusCircle, List, UserCheck, CheckCircle, DollarSign, TrendingUp, TrendingDown, Eye, Edit2, Trash2 } from 'lucide-react';
import ViewModal from './ViewModal';

const API = 'https://aruvixlabs.onrender.com/api';

const Accounting = () => {
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'all', 'mine'
  const [transactions, setTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [currentUser, setCurrentUser] = useState('');
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user.name);
    }
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/accounting`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // format date from created_at
        const formatted = data.map(t => ({
          ...t,
          date: t.date.split('T')[0],
          assignedTo: t.assigned_to
        }));
        setTransactions(formatted);
      }
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/attendance/admin/report`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) { console.error(e); }
  };

  const [successMessage, setSuccessMessage] = useState('');
  const [viewTransaction, setViewTransaction] = useState(null);

  const [form, setForm] = useState({
    type: 'Income',
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
    assignedTo: 'Everyone',
  });

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/accounting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        showSuccess('Transaction recorded successfully!');
        setForm({
          type: 'Income',
          amount: '',
          reason: '',
          date: new Date().toISOString().split('T')[0],
          assignedTo: 'Everyone',
        });
        fetchTransactions();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/accounting/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTransactions();
      } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (t) => {
    alert(`Editing Transaction: ${t.reason}\n(Full edit form will open here)`);
  };

  const handleView = (t) => {
    setViewTransaction({
      ...t,
      amount: `₹${t.amount}`
    });
  };

  const renderTable = (data) => (
    <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Type</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Reason</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Amount</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Assigned To</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No transactions found.</td>
            </tr>
          ) : data.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
              <td style={{ padding: '14px 16px', fontWeight: '500' }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  color: t.type === 'Income' ? '#059669' : '#dc2626',
                  background: t.type === 'Income' ? '#d1fae5' : '#fee2e2',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '13px'
                }}>
                  {t.type === 'Income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {t.type}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: '#1f2937' }}>{t.reason}</td>
              <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '600', fontSize: '15px' }}>
                ₹{parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>{t.date}</td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>{t.assignedTo}</td>
              <td style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button onClick={() => handleView(t)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="View Details"><Eye size={16} /></button>
                <button onClick={() => handleEdit(t)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="accounting-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('add')}
          style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <PlusCircle size={18} /> Record Transaction
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <List size={18} /> All Transactions
        </button>
        <button 
          onClick={() => setActiveTab('mine')}
          style={{ padding: '12px 24px', background: activeTab === 'mine' ? 'var(--primary)' : 'transparent', color: activeTab === 'mine' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <UserCheck size={18} /> Assigned to me
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'add' && (
          <div style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={24} color="var(--primary)" /> Record Income / Expense
            </h2>
            
            {successMessage && (
              <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '5px' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: form.type === 'Income' ? '2px solid #10b981' : '1px solid #d1d5db', background: form.type === 'Income' ? '#f0fdf4' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="type" value="Income" checked={form.type === 'Income'} onChange={e => setForm({...form, type: e.target.value})} style={{ accentColor: '#10b981' }} />
                  <TrendingUp size={18} color={form.type === 'Income' ? '#10b981' : '#6b7280'} /> <span style={{ fontWeight: form.type === 'Income' ? '600' : '500', color: form.type === 'Income' ? '#065f46' : '#374151' }}>Income</span>
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: form.type === 'Expense' ? '2px solid #ef4444' : '1px solid #d1d5db', background: form.type === 'Expense' ? '#fef2f2' : 'transparent', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="type" value="Expense" checked={form.type === 'Expense'} onChange={e => setForm({...form, type: e.target.value})} style={{ accentColor: '#ef4444' }} />
                  <TrendingDown size={18} color={form.type === 'Expense' ? '#ef4444' : '#6b7280'} /> <span style={{ fontWeight: form.type === 'Expense' ? '600' : '500', color: form.type === 'Expense' ? '#991b1b' : '#374151' }}>Expense</span>
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontWeight: '500' }}>₹</span>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{ width: '100%', padding: '10px 12px 10px 30px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="0.00" required />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Reason / Description</label>
                <input type="text" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. Server Cost or Client Payment" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Assign Access To</label>
                <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="Everyone">Everyone</option>
                  {usersList.map(u => <option key={u.user_id} value={u.name}>{u.name}</option>)}
                </select>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={18} /> Record Transaction
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>All Transactions ({transactions.length})</h2>
            {renderTable(transactions)}
          </div>
        )}

        {activeTab === 'mine' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>My Assigments ({transactions.filter(t => t.assignedTo === currentUser || t.assignedTo === 'Everyone').length})</h2>
            {renderTable(transactions.filter(t => t.assignedTo === currentUser || t.assignedTo === 'Everyone'))}
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={!!viewTransaction} 
        onClose={() => setViewTransaction(null)} 
        title="Transaction Details" 
        data={viewTransaction || {}} 
      />
    </div>
  );
};

export default Accounting;
