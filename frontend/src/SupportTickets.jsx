import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Plus, MessageCircle, Clock, AlertCircle, CheckCircle2, ChevronRight, User, MoreVertical } from 'lucide-react';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';
const token = () => localStorage.getItem('token');

const SupportTickets = () => {
  const perms = getPerms('support');
  const canCreate = perms.create_ticket ?? perms.canCreate;
  const canReply = perms.reply_ticket ?? perms.canEdit;

  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('All'); // All, Open, In Progress, Resolved
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', client_id: '', priority: 'Low' });

  useEffect(() => {
    fetchTickets();
    fetchClients();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API}/support-tickets`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setTickets(data);
    } catch (e) { console.error(e); }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API}/customers`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setClients(data);
    } catch (e) { console.error(e); }
  };

  const filteredTickets = activeTab === 'All' ? tickets : tickets.filter(t => t.status === activeTab);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return { bg: '#fee2e2', text: '#dc2626' };
      case 'Medium': return { bg: '#fef3c7', text: '#d97706' };
      case 'Low': return { bg: '#e0e7ff', text: '#4338ca' };
      default: return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Open': return <AlertCircle size={16} color="#dc2626" />;
      case 'In Progress': return <Clock size={16} color="#d97706" />;
      case 'Resolved': return <CheckCircle2 size={16} color="#10b981" />;
      default: return null;
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      await fetch(`${API}/support-tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ sender_name: 'Admin User', message: replyText })
      });
      setReplyText('');
      fetchTickets();
      
      // Update local selected ticket messages instantly for better UX
      setSelectedTicket(prev => ({
        ...prev,
        messages: [...prev.messages, { sender_name: 'Admin User', message: replyText, created_at: new Date().toISOString() }],
        status: prev.status === 'Open' ? 'In Progress' : prev.status
      }));
    } catch (e) { console.error(e); }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.client_id) return alert('Subject and Client are required');
    try {
      const tckId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      await fetch(`${API}/support-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...newTicket, ticket_id: tckId })
      });
      setShowNewModal(false);
      setNewTicket({ subject: '', client_id: '', priority: 'Low' });
      fetchTickets();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="support-tickets-page" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' }}>
      
      {/* Left List Panel */}
      <div style={{ flex: '1', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header & Tabs */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={24} color="var(--primary)" /> Support Tickets
            </h2>
            {canCreate && (
              <button onClick={() => setShowNewModal(true)} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <Plus size={16} /> New Ticket
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
            {['All', 'Open', 'In Progress', 'Resolved'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeTab === tab ? '#1f2937' : '#f3f4f6',
                  color: activeTab === tab ? 'white' : '#4b5563',
                  transition: '0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div style={{ flex: '1', overflowY: 'auto' }}>
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid #f3f4f6', 
                cursor: 'pointer', 
                background: selectedTicket?.id === ticket.id ? '#f8fafc' : 'white',
                borderLeft: selectedTicket?.id === ticket.id ? '4px solid var(--primary)' : '4px solid transparent',
                transition: '0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{ticket.ticket_id}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', background: getPriorityColor(ticket.priority).bg, color: getPriorityColor(ticket.priority).text }}>
                  {ticket.priority}
                </span>
              </div>
              <h4 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '15px' }}>{ticket.subject}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> {ticket.client_name || 'Unknown Client'}
                </span>
                <span style={{ color: '#9ca3af' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14}/> {ticket.client}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                  {getStatusIcon(ticket.status)} {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Details Panel */}
      {selectedTicket ? (
        <div style={{ flex: '2', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Details Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>Ticket #{selectedTicket.ticket_id}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: getPriorityColor(selectedTicket.priority).bg, color: getPriorityColor(selectedTicket.priority).text, fontWeight: '600' }}>
                  {selectedTicket.priority} Priority
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#4b5563', fontWeight: '500', padding: '4px 12px', background: '#f3f4f6', borderRadius: '20px' }}>
                  {getStatusIcon(selectedTicket.status)} {selectedTicket.status}
                </span>
              </div>
            </div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '20px' }}>{selectedTicket.subject}</h2>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#6b7280' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> {selectedTicket.client_name || 'Unknown Client'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Opened on {new Date(selectedTicket.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Messages Thread */}
          <div style={{ flex: '1', overflowY: 'auto', padding: '20px', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(selectedTicket.messages || []).map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender_name === 'Admin User' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', justifyContent: msg.sender_name === 'Admin User' ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{msg.sender_name}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  background: msg.sender_name === 'Admin User' ? 'var(--primary)' : 'white',
                  color: msg.sender_name === 'Admin User' ? 'white' : '#1f2937',
                  border: msg.sender_name === 'Admin User' ? 'none' : '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  lineHeight: '1.5'
                }}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input Area */}
          {canReply && (
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', background: 'white' }}>
              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..." 
                  style={{ flex: '1', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                />
                <button type="submit" disabled={!replyText.trim()} style={{ background: replyText.trim() ? 'var(--primary)' : '#9ca3af', color: 'white', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: '600', cursor: replyText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageCircle size={18} /> Reply
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: '2', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <MessageCircle size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h3>Select a ticket to view details</h3>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Subject</label>
                <input required value={newTicket.subject} onChange={e=>setNewTicket({...newTicket, subject: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Client</label>
                <select required value={newTicket.client_id} onChange={e=>setNewTicket({...newTicket, client_id: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="">-- Select Client --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5 }}>Priority</label>
                <select value={newTicket.priority} onChange={e=>setNewTicket({...newTicket, priority: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowNewModal(false)} style={{ padding: '8px 16px', border: 'none', background: '#ccc', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', background: 'var(--primary)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
