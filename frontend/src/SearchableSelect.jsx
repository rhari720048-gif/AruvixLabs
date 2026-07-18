import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder = "Select an option..." }) => {
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
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '10px 12px', borderRadius: '6px', 
          border: '1px solid #d1d5db', background: 'white', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', minHeight: '42px'
        }}
      >
        <span style={{ color: selectedOption ? '#1f2937' : '#9ca3af' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} color="#6b7280" />
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          marginTop: '4px', background: 'white', border: '1px solid #d1d5db', 
          borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          zIndex: 50, maxHeight: '250px', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '16px' }} />
            <input 
              type="text" 
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ width: '100%', padding: '8px 8px 8px 30px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none' }}
            />
          </div>
          <div style={{ overflowY: 'auto', padding: '4px' }}>
            <div 
              onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: '#6b7280', fontSize: '14px' }}
              onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              -- Unassigned --
            </div>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>No options found</div>
            ) : (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                  style={{ 
                    padding: '8px 12px', cursor: 'pointer', borderRadius: '4px',
                    background: opt.value === value ? '#eff6ff' : 'transparent',
                    color: opt.value === value ? '#2563eb' : '#374151',
                    fontSize: '14px'
                  }}
                  onMouseOver={e => { if(opt.value !== value) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseOut={e => { if(opt.value !== value) e.currentTarget.style.background = 'transparent' }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
