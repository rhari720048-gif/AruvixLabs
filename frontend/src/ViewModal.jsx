import React, { useState, useEffect } from 'react';
import { X, Clock, User, Phone, MapPin, Car, FileText, Calendar, CheckCircle } from 'lucide-react';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const formatTime = (totalSeconds) => {
  if (totalSeconds == null) return '00:00';
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const ViewModal = ({ isOpen, onClose, title = "Record Details", data }) => {
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
      top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(15, 23, 42, 0.4)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 1000,
      backdropFilter: 'blur(6px)',
      padding: '16px'
    }}>
      <div className="modal-content-wrapper" style={{ 
        background: 'white', 
        padding: '32px', 
        borderRadius: '24px', 
        width: '100%', 
        maxWidth: '540px', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', 
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '24px', right: '24px', 
          background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%',
          width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
        }}>
          <X size={18} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#0F172A', fontSize: '20px', fontWeight: '800' }}>
              {data.name || title}
            </h2>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              ID: {data.customer_id || data.id} • Status: <span className="status-pill callback" style={{ padding: '2px 8px', fontSize: '11px' }}>{data.status || 'Active'}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {data.previewUrl && (
            <div style={{ textAlign: 'center', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src={data.previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} color="var(--primary)" /> Phone
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{data.phone || '-'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="#10B981" /> District / City
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{data.district || data.location || '-'}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Car size={12} color="#F59E0B" /> Vehicle Details
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                {data.car_model || data.car_name || '-'} {data.registration_number ? `(${data.registration_number})` : ''}
              </div>
            </div>
          </div>

          {data.last_note && (
            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>Latest Note:</div>
              <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>{data.last_note}</div>
            </div>
          )}

          {history.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="var(--primary)" /> Call History Log ({history.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {history.map(h => (
                  <div key={h.id} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#334155' }}>
                      <span>{h.status} • {formatTime(h.duration)}</span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{new Date(h.created_at).toLocaleDateString()}</span>
                    </div>
                    {h.notes && <div style={{ color: '#64748b', marginTop: '4px' }}>{h.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
