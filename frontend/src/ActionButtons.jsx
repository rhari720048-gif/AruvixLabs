import React from 'react';
import { Eye, Edit3, Trash2 } from 'lucide-react';

const ActionButtons = ({ onView, onEdit, onDelete }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); onView(); }}
        title="View Details"
        style={{
          background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: '0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
        onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
      >
        <Eye size={16} />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        title="Edit Lead"
        style={{
          background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: '0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fde68a'}
        onMouseLeave={e => e.currentTarget.style.background = '#fef3c7'}
      >
        <Edit3 size={16} />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete Lead"
        style={{
          background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: '0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
        onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ActionButtons;
