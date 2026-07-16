import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Search, Trash2, FileText, Users, Edit3, User } from 'lucide-react';
import { getPerms } from './permissions';

const colors = ['#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#e6c9a8'];
const API = 'https://aruvixlabs.onrender.com/api';

const UserNotes = () => {
  const perms = getPerms('user_notes');
  const canAddTab = perms.add_notes;
  const canAllTab = perms.all_notes;
  const canMyTab = perms.my_notes;
  
  const canCreate = perms.create;
  const canEdit = perms.edit;
  const canDelete = perms.delete;

  const [activeTab, setActiveTab] = useState(
    canMyTab ? 'my_notes' : (canAllTab ? 'all_notes' : (canAddTab ? 'add_notes' : ''))
  );

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState(null); 
  const [newNoteForm, setNewNoteForm] = useState({ title: '', content: '', color: '#ffffff' });

  useEffect(() => {
    if (activeTab === 'my_notes' || activeTab === 'all_notes') {
      fetchNotes(activeTab);
    }
  }, [activeTab]);

  const fetchNotes = async (tab) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = tab === 'all_notes' ? `${API}/notes/all` : `${API}/notes`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(n => ({
          ...n,
          date: new Date(n.created_at).toLocaleString()
        }));
        setNotes(formatted);
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateSubmit = async () => {
    if (!newNoteForm.title.trim() && !newNoteForm.content.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newNoteForm)
      });
      setNewNoteForm({ title: '', content: '', color: '#ffffff' });
      alert('Note saved successfully!');
      if (canMyTab) setActiveTab('my_notes');
    } catch (e) { console.error(e); }
  };

  const handleSaveEdit = async () => {
    if (!activeNote.title.trim() && !activeNote.content.trim()) {
      setActiveNote(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API}/notes/${activeNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: activeNote.title,
          content: activeNote.content,
          color: activeNote.color
        })
      });
      setActiveNote(null);
      fetchNotes(activeTab);
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
        fetchNotes(activeTab);
        if (activeNote && activeNote.id === id) setActiveNote(null);
      } catch (e) { console.error(e); }
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title && n.title.toLowerCase().includes(search.toLowerCase())) || 
    (n.content && n.content.toLowerCase().includes(search.toLowerCase())) ||
    (n.user_name && n.user_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="user-notes-page" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', background: '#f3f4f6', padding: '6px', borderRadius: '10px', width: 'fit-content' }}>
        {canMyTab && (
          <button onClick={() => setActiveTab('my_notes')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: activeTab === 'my_notes' ? 'white' : 'transparent', color: activeTab === 'my_notes' ? '#6366f1' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: activeTab === 'my_notes' ? '700' : '500', fontSize: '14px', cursor: 'pointer', boxShadow: activeTab === 'my_notes' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: '0.2s' }}>
            <FileText size={16} /> My Notes
          </button>
        )}
        {canAllTab && (
          <button onClick={() => setActiveTab('all_notes')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: activeTab === 'all_notes' ? 'white' : 'transparent', color: activeTab === 'all_notes' ? '#6366f1' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: activeTab === 'all_notes' ? '700' : '500', fontSize: '14px', cursor: 'pointer', boxShadow: activeTab === 'all_notes' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none', transition: '0.2s' }}>
            <Users size={16} /> All Notes
          </button>
        )}
        {canAddTab && canCreate && (
          <button onClick={() => setActiveTab('add_notes')}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: activeTab === 'add_notes' ? '#6366f1' : 'transparent', color: activeTab === 'add_notes' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: activeTab === 'add_notes' ? '700' : '500', fontSize: '14px', cursor: 'pointer', boxShadow: activeTab === 'add_notes' ? '0 2px 8px rgba(99,102,241,0.3)' : 'none', transition: '0.2s' }}>
            <Edit3 size={16} /> Add Notes
          </button>
        )}
      </div>

      {activeTab === 'add_notes' && canAddTab && canCreate && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
          <div style={{ background: newNoteForm.color, width: '100%', maxWidth: '700px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden', border: newNoteForm.color === '#ffffff' ? '1px solid #e5e7eb' : 'none', transition: '0.3s' }}>
            <div style={{ padding: '30px', paddingBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Title" 
                value={newNoteForm.title} 
                onChange={e => setNewNoteForm({...newNoteForm, title: e.target.value})} 
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '24px', fontWeight: '700', color: '#1f2937', outline: 'none', marginBottom: '20px' }}
                autoFocus
              />
              <textarea 
                placeholder="Take a note..." 
                value={newNoteForm.content} 
                onChange={e => setNewNoteForm({...newNoteForm, content: e.target.value})} 
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: '#374151', outline: 'none', minHeight: '300px', resize: 'vertical', lineHeight: '1.6' }}
              ></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.4)' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colors.map(c => (
                  <div 
                    key={c} 
                    onClick={() => setNewNoteForm({...newNoteForm, color: c})}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer', border: newNoteForm.color === c ? '2px solid #4b5563' : '1px solid #d1d5db', transition: '0.2s', transform: newNoteForm.color === c ? 'scale(1.1)' : 'scale(1)' }}
                    title="Change Color"
                  ></div>
                ))}
              </div>
              <button onClick={handleCreateSubmit} style={{ background: '#1f2937', color: 'white', border: 'none', padding: '10px 28px', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} /> Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'my_notes' || activeTab === 'all_notes') && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input 
                type="text" 
                placeholder="Search notes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', alignContent: 'start', paddingBottom: '20px' }}>
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => {
                  if (canEdit && (activeTab === 'my_notes' || canEdit)) setActiveNote(note);
                }}
                style={{ 
                  background: note.color, 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: note.color === '#ffffff' ? '1px solid #e5e7eb' : `1px solid ${note.color}`, 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  cursor: canEdit ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '160px',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => { if(canEdit) e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { if(canEdit) e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)' }}
              >
                {activeTab === 'all_notes' && (
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} /> {note.user_name || 'User'}
                  </div>
                )}
                <h3 style={{ fontSize: '16px', color: '#1f2937', marginBottom: '10px', wordBreak: 'break-word', fontWeight: '700' }}>{note.title || 'Untitled'}</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', whiteSpace: 'pre-wrap', wordBreak: 'break-word', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
              {note.content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>{note.date}</span>
              {canDelete && (
                <button onClick={(e) => handleDelete(note.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }} title="Delete">
                  <Trash2 size={16} />
                </button>
              )}
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
