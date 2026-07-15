import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Search, Trash2 } from 'lucide-react';

const colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#e6c9a8'];
const API = 'https://aruvixlabs.onrender.com/api';

const UserNotes = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  
  const [activeNote, setActiveNote] = useState(null); // null means no active note open for editing/creating

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // format date from created_at
        const formatted = data.map(n => ({
          ...n,
          date: new Date(n.created_at).toLocaleString()
        }));
        setNotes(formatted);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreate = () => {
    setActiveNote({ id: 'new', title: '', content: '', color: '#ffffff', date: new Date().toLocaleString() });
  };

  const handleSave = async () => {
    if (!activeNote.title.trim() && !activeNote.content.trim()) {
      setActiveNote(null);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (activeNote.id === 'new') {
        // Create new
        await fetch(`${API}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: activeNote.title,
            content: activeNote.content,
            color: activeNote.color
          })
        });
      } else {
        // Update existing
        await fetch(`${API}/notes/${activeNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: activeNote.title,
            content: activeNote.content,
            color: activeNote.color
          })
        });
      }
      setActiveNote(null);
      fetchNotes();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this note?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/notes/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchNotes();
        if (activeNote && activeNote.id === id) setActiveNote(null);
      } catch (e) { console.error(e); }
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title && n.title.toLowerCase().includes(search.toLowerCase())) || 
    (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="user-notes-page" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
          />
        </div>
        <button 
          onClick={handleCreate} 
          style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Take a note
        </button>
      </div>

      {/* Notes Grid */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', alignContent: 'start', paddingBottom: '20px' }}>
        {filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => setActiveNote(note)}
            style={{ 
              background: note.color, 
              padding: '20px', 
              borderRadius: '12px', 
              border: note.color === '#ffffff' ? '1px solid #e5e7eb' : `1px solid ${note.color}`, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '150px',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
          >
            <h3 style={{ fontSize: '16px', color: '#1f2937', marginBottom: '10px', wordBreak: 'break-word' }}>{note.title || 'Untitled'}</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
              {note.content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{note.date}</span>
              <button onClick={(e) => handleDelete(note.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredNotes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
            No notes found. Click "Take a note" to create one.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {activeNote && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: activeNote.color, width: '90%', maxWidth: '600px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', border: activeNote.color === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}>
            
            <div style={{ padding: '20px', paddingBottom: '0' }}>
              <input 
                type="text" 
                placeholder="Title" 
                value={activeNote.title} 
                onChange={e => setActiveNote({...activeNote, title: e.target.value})} 
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '22px', fontWeight: '600', color: '#1f2937', outline: 'none', marginBottom: '15px' }}
                autoFocus
              />
              <textarea 
                placeholder="Take a note..." 
                value={activeNote.content} 
                onChange={e => setActiveNote({...activeNote, content: e.target.value})} 
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: '#374151', outline: 'none', minHeight: '200px', resize: 'vertical', lineHeight: '1.5' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.4)' }}>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                {colors.map(c => (
                  <div 
                    key={c} 
                    onClick={() => setActiveNote({...activeNote, color: c})}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer', 
                      border: activeNote.color === c ? '2px solid #4b5563' : '1px solid #d1d5db' 
                    }}
                    title="Change Color"
                  ></div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setActiveNote(null)} style={{ background: 'transparent', border: 'none', color: '#4b5563', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>
                  Cancel
                </button>
                <button onClick={handleSave} style={{ background: '#1f2937', color: 'white', border: 'none', padding: '8px 24px', fontWeight: '600', cursor: 'pointer', borderRadius: '6px' }}>
                  Save
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserNotes;
