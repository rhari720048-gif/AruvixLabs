import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

const SearchableSelect = ({ options = [], value, onChange, placeholder = "Select an option...", isMulti = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(opt => 
    opt.label?.toLowerCase().includes(search.toLowerCase())
  );

  const getDisplayValue = () => {
    if (isMulti) {
      if (!Array.isArray(value) || value.length === 0) return placeholder;
      const labels = value.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean);
      return labels.length > 0 ? labels.join(', ') : placeholder;
    }
    const selectedOption = options.find(opt => opt.value === value) || null;
    return selectedOption ? selectedOption.label : placeholder;
  };

  const handleSelect = (optValue) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      let newValues;
      if (currentValues.includes(optValue)) {
        newValues = currentValues.filter(v => v !== optValue);
      } else {
        newValues = [...currentValues, optValue];
      }
      onChange(newValues);
    } else {
      onChange(optValue);
      setIsOpen(false);
      setSearch('');
    }
  };

  const isSelected = (optValue) => {
    if (isMulti) {
      return Array.isArray(value) && value.includes(optValue);
    }
    return optValue === value;
  };

  const hasSelection = isMulti ? Array.isArray(value) && value.length > 0 : !!options.find(opt => opt.value === value);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '12px 18px', 
          borderRadius: '16px', 
          border: isOpen ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0', 
          background: disabled ? '#f1f5f9' : (isOpen ? '#ffffff' : '#f8fafc'), 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer', 
          minHeight: '48px',
          boxShadow: isOpen ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: disabled ? 0.7 : 1
        }}
      >
        <span style={{ 
          color: hasSelection ? '#0F172A' : '#94A3B8', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', 
          paddingRight: '12px',
          fontWeight: hasSelection ? '700' : '500',
          fontSize: '14px'
        }}>
          {getDisplayValue()}
        </span>
        <ChevronDown 
          size={18} 
          color="#6366f1" 
          style={{ 
            flexShrink: 0, 
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }} 
        />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: 'calc(100% + 6px)', 
          left: 0, 
          right: 0, 
          background: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(226, 232, 240, 0.95)', 
          borderRadius: '20px', 
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18)', 
          zIndex: 100, 
          maxHeight: '280px', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dropdownFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', position: 'relative', background: '#f8fafc' }}>
            <Search size={16} color="#6366f1" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter options..."
              style={{ 
                width: '100%', 
                padding: '10px 14px 10px 38px', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                outline: 'none',
                fontSize: '13px',
                fontWeight: '600',
                background: 'white'
              }}
            />
            {search && (
              <X 
                size={14} 
                color="#94a3b8" 
                onClick={() => setSearch('')} 
                style={{ position: 'absolute', right: '22px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
              />
            )}
          </div>

          <div style={{ overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!isMulti && (
              <div 
                onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
                style={{ 
                  padding: '10px 14px', 
                  cursor: 'pointer', 
                  borderRadius: '10px', 
                  color: '#64748b', 
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Clear Selection
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
                No options match your search.
              </div>
            ) : (
              filteredOptions.map(opt => {
                const selected = isSelected(opt.value);
                return (
                  <div 
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{ 
                      padding: '12px 14px', 
                      cursor: 'pointer', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: selected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                      color: selected ? '#4F46E5' : '#0F172A',
                      fontWeight: selected ? '700' : '600',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => { if (!selected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseOut={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={16} color="#4F46E5" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
