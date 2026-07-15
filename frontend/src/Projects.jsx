import React, { useState, useEffect } from 'react';
import { PlusCircle, List, UserCheck, CheckCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import ViewModal from './ViewModal';

const API = 'https://aruvixlabs.onrender.com/api';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'add', 'all', 'mine'
  const [projects, setProjects] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(''); // Will set from token/localStorage

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setCurrentUser(user.name);

    fetchProjects();
    fetchDropdownData();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Format dates correctly for the frontend
        const formatted = data.map(p => ({
          ...p,
          startDate: p.start_date ? p.start_date.split('T')[0] : '',
          endDate: p.end_date ? p.end_date.split('T')[0] : '',
          assignedTo: p.assigned_to
        }));
        setProjects(formatted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Clients
      const resClients = await fetch(`${API}/customers`, { headers: { Authorization: `Bearer ${token}` } });
      if (resClients.ok) {
        const data = await resClients.json();
        setClientsList(data.filter(c => c.status === 'Converted'));
      }

      // Fetch Users (for assignedTo) - from attendance report or users endpoint
      // Using /api/attendance/admin/report as a hacky way to get users, 
      // or we can just fetch all users if there is a specific endpoint. 
      // I'll fetch the users via the attendance endpoint because it returns all non-admin users.
      const resUsers = await fetch(`${API}/attendance/admin/report`, { headers: { Authorization: `Bearer ${token}` } });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data.map(u => u.name));
      }

    } catch (e) { console.error(e); }
  };

  const [successMessage, setSuccessMessage] = useState('');
  const [viewProject, setViewProject] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    tags: '',
    description: '',
    client: '',
    startDate: '',
    endDate: '',
    assignedTo: '',
    status: 'Pending'
  });

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        category: form.category,
        tags: form.tags,
        description: form.description,
        client: form.client,
        start_date: form.startDate,
        end_date: form.endDate,
        assigned_to: form.assignedTo,
        status: form.status,
      };

      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showSuccess('Project added successfully!');
        setForm({
          name: '', category: '', tags: '', description: '',
          client: clientsList.length > 0 ? clientsList[0].name : '',
          startDate: '', endDate: '',
          assignedTo: usersList.length > 0 ? usersList[0] : '',
          status: 'Pending'
        });
        fetchProjects();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/projects/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProjects();
      } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (project) => {
    alert(`Editing Project: ${project.name}\n(Full edit form will open here)`);
  };

  const handleView = (project) => {
    setViewProject(project);
  };

  const renderTable = (data) => (
    <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Project Name</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Client</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Category/Tags</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Timeline</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Assigned To</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No projects found.</td>
            </tr>
          ) : data.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
              <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '500' }}>
                <div>{p.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{p.description}</div>
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>{p.client}</td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>
                <div>{p.category}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.tags}</div>
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563', fontSize: '13px' }}>
                {p.startDate} to {p.endDate}
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563', fontWeight: '500' }}>{p.assignedTo}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', background: p.status === 'Completed' ? '#d1fae5' : '#fef3c7', color: p.status === 'Completed' ? '#065f46' : '#d97706', borderRadius: '12px', fontWeight: '600' }}>{p.status}</span>
              </td>
              <td style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button onClick={() => handleView(p)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="View Details"><Eye size={16} /></button>
                <button onClick={() => handleEdit(p)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="projects-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        <button 
          onClick={() => setActiveTab('add')}
          style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <PlusCircle size={18} /> Add Projects
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <List size={18} /> All Projects
        </button>
        <button 
          onClick={() => setActiveTab('mine')}
          style={{ padding: '12px 24px', background: activeTab === 'mine' ? 'var(--primary)' : 'transparent', color: activeTab === 'mine' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
        >
          <UserCheck size={18} /> Assign to me
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'add' && (
          <div style={{ maxWidth: '700px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Add New Project</h2>
            
            {successMessage && (
              <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Project Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter project name" required />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Category</label>
                <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. Web Development" required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Tags</label>
                <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="e.g. React, Node.js" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '80px' }} placeholder="Project description..." required></textarea>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Client</label>
                <select value={form.client} onChange={e => setForm({...form, client: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="">Select a Client</option>
                  {clientsList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Assigned To</label>
                <select value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="">Select Assignee</option>
                  {usersList.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={18} /> Add Project
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'all' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>All Projects ({projects.length})</h2>
            {renderTable(projects)}
          </div>
        )}

        {activeTab === 'mine' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Projects Assigned to Me ({projects.filter(p => p.assignedTo === currentUser).length})</h2>
            {renderTable(projects.filter(p => p.assignedTo === currentUser))}
          </div>
        )}
      </div>
      
      <ViewModal 
        isOpen={!!viewProject} 
        onClose={() => setViewProject(null)} 
        title="Project Details" 
        data={viewProject || {}} 
      />
    </div>
  );
};

export default Projects;
