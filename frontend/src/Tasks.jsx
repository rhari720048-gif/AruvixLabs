import React, { useState, useEffect } from 'react';
import { PlusCircle, List, UserCheck, CheckCircle, Clock, Eye, Edit2, Trash2 } from 'lucide-react';
import ViewModal from './ViewModal';
import { getPerms } from './permissions';

const API = 'https://aruvixlabs.onrender.com/api';

const Tasks = () => {
  const perms = getPerms('tasks');
  const hasAddTab = perms.add_tasks ?? perms.canCreate;
  const hasAllTab = perms.all_tasks ?? perms.canView;
  const hasMineTab = perms.assigned_to_me ?? perms.canView;
  const canCreate = perms.create ?? perms.canCreate;
  const canEdit = perms.edit ?? perms.canEdit;
  const canDelete = perms.delete ?? perms.canDelete;

  const [activeTab, setActiveTab] = useState(() => {
    if (hasAllTab) return 'all';
    if (hasMineTab) return 'mine';
    if (hasAddTab) return 'add';
    return '';
  });
  const [tasks, setTasks] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(''); // Will set from token/localStorage
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user.name);
      setCurrentUserId(user.id);
    }

    fetchTasks();
    fetchDropdownData();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(t => ({
          ...t,
          dueDate: t.due_date ? t.due_date.split('T')[0] : '',
          project: t.project_name || 'No Project',
          assignedTo: t.assigned_to_name || 'Unassigned'
        }));
        setTasks(formatted);
      }
    } catch (e) { console.error(e); }
  };

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Projects
      const resProjects = await fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (resProjects.ok) {
        const data = await resProjects.json();
        setProjectsList(data);
      }

      // Fetch Users
      const resUsers = await fetch(`${API}/attendance/admin/report`, { headers: { Authorization: `Bearer ${token}` } });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(data);
      }

    } catch (e) { console.error(e); }
  };

  const [successMessage, setSuccessMessage] = useState('');
  const [viewTask, setViewTask] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'Medium',
    dueDate: '',
    assigned_to: '',
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
        title: form.title,
        description: form.description,
        project_id: form.project_id || null,
        priority: form.priority,
        due_date: form.dueDate,
        assigned_to: form.assigned_to || null,
        status: form.status
      };

      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showSuccess('Task added successfully!');
        setForm({
          title: '',
          description: '',
          project_id: '',
          priority: 'Medium',
          dueDate: '',
          assigned_to: '',
          status: 'Pending'
        });
        fetchTasks();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API}/tasks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTasks();
      } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (task) => {
    alert(`Editing Task: ${task.title}\n(Full edit form will open here)`);
  };

  const handleView = (task) => {
    setViewTask(task);
  };

  const renderTable = (data) => (
    <div className="data-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Task Details</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Project</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Priority</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Due Date</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Assigned To</th>
            <th style={{ padding: '14px 16px', textAlign: 'left', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '14px 16px', textAlign: 'center', color: '#4b5563', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No tasks found.</td>
            </tr>
          ) : data.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s', ':hover': {background: '#f9fafb'} }}>
              <td style={{ padding: '14px 16px', color: '#1f2937', fontWeight: '500' }}>
                <div>{t.title}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{t.description}</div>
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563' }}>{t.project}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '4px 10px', 
                  background: t.priority === 'High' || t.priority === 'Critical' ? '#fee2e2' : t.priority === 'Medium' ? '#fef3c7' : '#e0e7ff', 
                  color: t.priority === 'High' || t.priority === 'Critical' ? '#991b1b' : t.priority === 'Medium' ? '#d97706' : '#4338ca', 
                  borderRadius: '12px', 
                  fontWeight: '600' 
                }}>
                  {t.priority}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#6b7280" /> {t.dueDate}
              </td>
              <td style={{ padding: '14px 16px', color: '#4b5563', fontWeight: '500' }}>{t.assignedTo}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', background: t.status === 'Completed' ? '#d1fae5' : '#f3f4f6', color: t.status === 'Completed' ? '#065f46' : '#374151', borderRadius: '12px', fontWeight: '600' }}>{t.status}</span>
              </td>
              <td style={{ padding: '14px 16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button onClick={() => handleView(t)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="View Details"><Eye size={16} /></button>
                {canEdit && <button onClick={() => handleEdit(t)} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>}
                {canDelete && <button onClick={() => handleDelete(t.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!hasAllTab && !hasMineTab && !hasAddTab) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0, fontSize: '15px', color: '#dc2626', fontWeight: '600' }}>Access Denied</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6b7280' }}>You do not have permission to access any categories in Tasks. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div style={{ display: 'flex', gap: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '25px' }}>
        {hasAddTab && (
          <button 
            onClick={() => setActiveTab('add')}
            style={{ padding: '12px 24px', background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: activeTab === 'add' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <PlusCircle size={18} /> Add Tasks
          </button>
        )}
        {hasAllTab && (
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: '12px 24px', background: activeTab === 'all' ? 'var(--primary)' : 'transparent', color: activeTab === 'all' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <List size={18} /> All Tasks
          </button>
        )}
        {hasMineTab && (
          <button 
            onClick={() => setActiveTab('mine')}
            style={{ padding: '12px 24px', background: activeTab === 'mine' ? 'var(--primary)' : 'transparent', color: activeTab === 'mine' ? 'white' : '#4b5563', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
          >
            <UserCheck size={18} /> Assign to me
          </button>
        )}
      </div>

      <div className="page-content">
        {activeTab === 'add' && hasAddTab && (
          <div style={{ maxWidth: '700px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Add New Task</h2>
            
            {successMessage && (
              <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Task Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter task title" required />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minHeight: '80px' }} placeholder="Task instructions or details..." required></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Project</label>
                <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="">No Project</option>
                  {projectsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Assigned To</label>
                <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="">Unassigned</option>
                  {usersList.map(u => <option key={u.user_id} value={u.user_id}>{u.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={18} /> Add Task
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'all' && hasAllTab && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>All Tasks ({tasks.length})</h2>
            {renderTable(tasks)}
          </div>
        )}

        {activeTab === 'mine' && hasMineTab && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Tasks Assigned to Me ({tasks.filter(t => t.assigned_to === currentUserId).length})</h2>
            {renderTable(tasks.filter(t => t.assigned_to === currentUserId))}
          </div>
        )}
      </div>

      <ViewModal 
        isOpen={!!viewTask} 
        onClose={() => setViewTask(null)} 
        title="Task Details" 
        data={viewTask || {}} 
      />
    </div>
  );
};

export default Tasks;
