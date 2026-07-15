import React, { useState, useEffect, useRef } from 'react';
import { Hash, User, Send, Search, MoreVertical, Phone, Video } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const channels = ["general", "engineering", "sales", "marketing"];

const TeamChat = () => {
  const [activeChat, setActiveChat] = useState({ type: 'channel', id: 'general' });
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages(activeChat.id);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (channel) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/chat/${channel}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMessages(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ channel: activeChat.id, message: inputText.trim() })
      });
      if (res.ok) {
        setInputText("");
        fetchMessages(activeChat.id);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: '280px', borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', color: '#1f2937', marginBottom: '15px' }}>Team Channels</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px 0' }}>
          <div style={{ padding: '0 20px', marginBottom: '10px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Channels</div>
          {channels.map(channel => (
            <div 
              key={channel}
              onClick={() => setActiveChat({ type: 'channel', id: channel })}
              style={{ 
                padding: '10px 20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                cursor: 'pointer',
                background: activeChat.id === channel ? '#e0e7ff' : 'transparent',
                color: activeChat.id === channel ? '#4338ca' : '#4b5563',
                fontWeight: activeChat.id === channel ? '600' : '500',
                transition: '0.2s'
              }}
            >
              <Hash size={18} /> {channel}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        
        {/* Chat Header */}
        <div style={{ height: '70px', borderBottom: '1px solid #e5e7eb', padding: '0 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hash size={20} color="#4b5563" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#1f2937' }}>#{activeChat.id}</h3>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
              No messages in this channel yet. Be the first to say hello!
            </div>
          ) : messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {msg.user_name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{msg.user_name}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>{msg.created_at.replace('T', ' ').substring(0, 16)}</span>
                </div>
                <div style={{ color: '#374151', lineHeight: '1.5' }}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '15px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message #${activeChat.id}...`}
              style={{ flex: 1, padding: '14px 20px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: '#f9fafb' }}
            />
            <button 
              type="submit" 
              style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default TeamChat;
