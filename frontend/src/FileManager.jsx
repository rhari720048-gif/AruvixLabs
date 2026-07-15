import React, { useState, useEffect } from 'react';
import { Folder, FileText, Image as ImageIcon, Video, Archive, Upload, Download, Trash2, Search, Plus, Filter, MoreVertical, X } from 'lucide-react';

const API = 'https://aruvixlabs.onrender.com/api';

const FileManager = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ name: '', folder: 'General', file_obj: null });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/files`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setFiles(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/files/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        fetchFiles();
      } catch (e) { console.error(e); }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.name || !form.file_obj) return alert('Please select a file and name it.');

    // We simulate upload by just storing metadata and object url in DB (since we don't have a file storage backend setup in this demo)
    const ext = form.file_obj.name.split('.').pop().toLowerCase();
    let type = 'document';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) type = 'image';
    else if (['mp4','mov','avi'].includes(ext)) type = 'video';
    else if (['zip','rar','tar','gz'].includes(ext)) type = 'archive';

    const sizeInMB = (form.file_obj.size / (1024 * 1024)).toFixed(1);
    const sizeStr = sizeInMB > 0.1 ? `${sizeInMB} MB` : `${(form.file_obj.size / 1024).toFixed(0)} KB`;
    
    // Simulate an uploaded URL
    const simulatedUrl = URL.createObjectURL(form.file_obj);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        type,
        size: sizeStr,
        url: simulatedUrl,
        folder: form.folder
      };

      const res = await fetch(`${API}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('File uploaded successfully!');
        setForm({ name: '', folder: 'General', file_obj: null });
        fetchFiles();
        setShowModal(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || f.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const FileIcon = ({ type }) => {
    switch (type) {
      case 'image': return <ImageIcon size={24} color="#3b82f6" />;
      case 'video': return <Video size={24} color="#8b5cf6" />;
      case 'archive': return <Archive size={24} color="#f59e0b" />;
      default: return <FileText size={24} color="#10b981" />;
    }
  };

  return (
    <div className="file-manager-page">
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'document', 'image', 'video', 'archive'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '8px 16px', 
                background: activeTab === tab ? '#e0e7ff' : 'white', 
                color: activeTab === tab ? '#4338ca' : '#4b5563', 
                border: '1px solid', 
                borderColor: activeTab === tab ? '#c7d2fe' : '#d1d5db',
                borderRadius: '20px', 
                fontWeight: '500', 
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '13px'
              }}
            >
              {tab}s
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '9px 15px 9px 35px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', width: '250px' }}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={18} /> Upload File
          </button>
        </div>
      </div>

      {success && <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px' }}>{success}</div>}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {filteredFiles.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6b7280' }}>
            No files found matching your criteria.
          </div>
        ) : filteredFiles.map(file => (
          <div key={file.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'relative', group: 'true' }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
              <FileIcon type={file.type} />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>{file.name}</h3>
              <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                <span>{file.size}</span>
                <span>{file.created_at.split('T')[0]}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px' }}>By: {file.uploaded_by_name || 'System'}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button onClick={() => window.open(file.url, '_blank')} style={{ flex: 1, padding: '8px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px', fontWeight: '500' }}>
                <Download size={14} /> Open
              </button>
              <button onClick={() => handleDelete(file.id)} style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '400px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>Upload File</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>File Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Folder / Category</label>
                <select value={form.folder} onChange={e => setForm({...form, folder: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="General">General</option>
                  <option value="Finance">Finance</option>
                  <option value="Projects">Projects</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>Select File</label>
                <input type="file" onChange={e => setForm({...form, file_obj: e.target.files[0]})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Upload size={18} /> Upload
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FileManager;
