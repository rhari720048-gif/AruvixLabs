import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const ViewModal = ({ isOpen, onClose, title, data }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen && data && data.id) {
      fetch(`${API}/customers/${data.id}/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d)) setHistory(d);
      })
      .catch(e => console.error(e));
    } else {
      setHistory([]);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        width: '90%', 
        maxWidth: '500px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
        position: 'relative' 
      }}>
        <button onClick={onClose} style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          background: '#f3f4f6', 
          border: 'none', 
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer', 
          color: '#4b5563',
          transition: '0.2s'
        }}>
          <X size={18} />
        </button>
        
        <h2 style={{ marginBottom: '20px', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', fontSize: '20px' }}>
          {title}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
          {data.previewUrl && (
            <div style={{ marginBottom: '10px', textAlign: 'center' }}>
              <img src={data.previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
            </div>
          )}
          {Object.entries(data).map(([key, value]) => {
            // Skip the ID field in the view modal if we passed the whole object
            if (key === 'id' || key === 'previewUrl') return null;
            
            // Format camelCase keys into Title Case
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            return (
              <div key={key}>
                <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  {formattedKey}
                </span>
                <span style={{ 
                  display: 'block', 
                  fontSize: '15px', 
                  color: '#1f2937', 
                  background: '#f9fafb', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #f3f4f6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {value || '-'}
                </span>
              </div>
            );
          })}
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <Clock size={16} color="#6366f1" /> Call History
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {history.map(log => (
                <div key={log.id} style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: log.status === 'Interested' || log.status === 'Appointment' ? '#10b981' : log.status === 'Not Interested' ? '#ef4444' : '#f59e0b' }}>
                      {log.status}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>
                      {new Date(log.call_date).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ color: '#4b5563' }}>{log.notes || 'No notes'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
