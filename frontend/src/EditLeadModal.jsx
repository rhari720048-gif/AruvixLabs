import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Save, User, MapPin, PhoneCall, Car, FileText, Edit3 } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const API = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const EditLeadModal = ({ isOpen, onClose, data, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
    car_model: '',
    status: '',
    source: ''
  });
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (data) {
        let assignedTo = [];
        try {
          if (data.assigned_to) {
            const parsed = typeof data.assigned_to === 'string' ? JSON.parse(data.assigned_to) : data.assigned_to;
            if (Array.isArray(parsed)) {
              assignedTo = parsed.map(String);
            }
          }
        } catch (e) {
          console.error("Error parsing assigned_to", e);
        }

        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          district: data.district || data.location || '',
          car_model: data.car_model || data.car_name || '',
          status: data.status || 'Pending',
          source: data.source || 'Manual'
        });
      }
    }
  }, [isOpen, data]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const result = await res.json();
        setUsers(result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data || !data.id) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        district: formData.district,
        car_model: formData.car_model,
        status: formData.status,
        source: formData.source
      };

      const res = await fetch(`${API}/customers/${data.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        if (onSave) {
          // Pass back the updated object so parent can update its state without a full reload
          onSave({ ...data, ...payload, assigned_to: JSON.stringify(payload.assigned_to) });
        }
        onClose();
      } else {
        alert("Failed to update lead.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving lead details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{ 
        background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', 
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' 
      }}>
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '20px', right: '20px', background: '#f3f4f6', border: 'none', 
          borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', cursor: 'pointer', color: '#4b5563', transition: '0.2s'
        }}>
          <X size={18} />
        </button>
        
        <h2 style={{ margin: '0 0 20px', color: '#1f2937', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Edit3 size={24} color="var(--primary)" /> Edit Lead Details
        </h2>
        
        <form onSubmit={handleSubmit} className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              <User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Full Name
            </label>
            <input 
              type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              <PhoneCall size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Phone Number
            </label>
            <input 
              type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Location / District
            </label>
            <input 
              type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              <Car size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Car Name with Year
            </label>
            <input 
              type="text" value={formData.car_model} onChange={e => setFormData({...formData, car_model: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
              <Save size={18} /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
