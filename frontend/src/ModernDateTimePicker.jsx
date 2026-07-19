import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, Check, X } from 'lucide-react';

const ModernDateTimePicker = ({ value, onChange, label = "Select Date & Time", required = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Format display string nicely e.g. "Mon, 20 Jul 2026 at 10:00 AM"
  const formatDisplay = (val) => {
    if (!val) return 'Choose appointment date & time...';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return val;
    }
  };

  const setShortcut = (type) => {
    const now = new Date();
    if (type === 'today_10am') {
      now.setHours(10, 0, 0, 0);
    } else if (type === 'today_2pm') {
      now.setHours(14, 0, 0, 0);
    } else if (type === 'tomorrow_10am') {
      now.setDate(now.getDate() + 1);
      now.setHours(10, 0, 0, 0);
    } else if (type === 'next_week') {
      now.setDate(now.getDate() + 7);
      now.setHours(10, 0, 0, 0);
    }

    const tzOffset = now.getTimezoneOffset() * 60000;
    const formatted = (new Date(now - tzOffset)).toISOString().slice(0, 16);
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
          <Calendar size={15} color="var(--primary)" /> {label} {required && '*'}
        </label>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '12px 18px', 
          borderRadius: '16px', 
          border: isOpen ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0', 
          background: isOpen ? '#ffffff' : '#f8fafc', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="#6366f1" />
          <span style={{ 
            color: value ? '#0F172A' : '#94A3B8', 
            fontWeight: value ? '700' : '500', 
            fontSize: '14px' 
          }}>
            {formatDisplay(value)}
          </span>
        </div>
        <Clock size={18} color="#64748b" />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: 'calc(100% + 8px)', 
          left: 0, 
          right: 0, 
          background: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(226, 232, 240, 0.95)', 
          borderRadius: '24px', 
          padding: '20px', 
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18)', 
          zIndex: 100,
          animation: 'dropdownFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--primary)" /> Quick Shortcuts
            </span>
            <X size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <button 
              type="button" 
              onClick={() => setShortcut('today_10am')} 
              style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
            >
              Today 10:00 AM
            </button>
            <button 
              type="button" 
              onClick={() => setShortcut('today_2pm')} 
              style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
            >
              Today 02:00 PM
            </button>
            <button 
              type="button" 
              onClick={() => setShortcut('tomorrow_10am')} 
              style={{ padding: '8px 12px', background: '#e0e7ff', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#4338ca', cursor: 'pointer' }}
            >
              Tomorrow 10:00 AM
            </button>
            <button 
              type="button" 
              onClick={() => setShortcut('next_week')} 
              style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
            >
              Next Week
            </button>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>
              Custom Date & Time Selection
            </label>
            <input 
              type="datetime-local" 
              value={value} 
              onChange={e => { onChange(e.target.value); }} 
              style={{ width: '100%' }}
              required={required}
            />
          </div>

          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '14px', padding: '10px' }}
          >
            <Check size={16} /> Confirm Appointment Time
          </button>
        </div>
      )}
    </div>
  );
};

export default ModernDateTimePicker;
