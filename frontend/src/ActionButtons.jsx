import React from 'react';
import { Eye, Edit3, Trash2 } from 'lucide-react';

const ActionButtons = ({ onView, onEdit, onDelete }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {onView && (
        <button 
          onClick={(e) => { e.stopPropagation(); onView(); }}
          title="View Details"
          style={{
            background: 'rgba(79, 70, 229, 0.08)', color: '#4F46E5', border: '1px solid rgba(79, 70, 229, 0.2)',
            width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#4F46E5';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)';
            e.currentTarget.style.color = '#4F46E5';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Eye size={15} />
        </button>
      )}

      {onEdit && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit Details"
          style={{
            background: 'rgba(245, 158, 11, 0.08)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.2)',
            width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#D97706';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
            e.currentTarget.style.color = '#D97706';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Edit3 size={15} />
        </button>
      )}

      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete Record"
          style={{
            background: 'rgba(239, 68, 68, 0.08)', color: '#DC2626', border: '1px solid rgba(239, 68, 68, 0.2)',
            width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#DC2626';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.color = '#DC2626';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
