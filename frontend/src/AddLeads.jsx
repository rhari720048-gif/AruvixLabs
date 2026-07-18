import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import Papa from 'papaparse';
import { Upload, FileText, Edit3, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const AddLeads = ({ addLeads }) => {
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'csv', 'manual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Manual Form State
  const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', car_name: '', car_number: '', requirements: '', assignedTo: [], feedback: '' });
  
  const [bulkAssignTo, setBulkAssignTo] = useState([]);
  const [users, setUsers] = useState([]);
  const API = 'https://aruvixlabs.onrender.com/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle Image Upload & OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      console.log("OCR Text Output:", text); // Helpful for debugging in browser console
      
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      // Look for at least 8-10 digits, allowing spaces/dashes between them
      const phoneRegex = /(?:\+?91)?[\s\-]*[6789](?:[\s\-]*\d){9}/; 
      
      const extractedLeads = [];
      let idCounter = Date.now();

      lines.forEach(line => {
        // Also try to remove common OCR errors for numbers like 'O' to '0' or 'l' to '1' before matching if needed, 
        // but let's just do a basic match first
        const match = line.match(phoneRegex) || line.replace(/o/ig, '0').replace(/[il|]/ig, '1').match(phoneRegex);
        
        if (match) {
          const phone = match[0];
          // Split the original line using the original matched text (or roughly around it)
          const parts = line.split(phoneRegex);
          
          let name = parts[0] ? parts[0].trim().replace(/[^a-zA-Z\s]/g, '') : 'Unknown';
          let rest = parts[1] ? parts[1].trim() : '';
          
          if (!name) name = 'Unknown';
          
          // Try to extract location and requirements from the rest of the text
          const restParts = rest.split(/\s{2,}/); // split by multiple spaces if tabular
          let location = restParts[0] || 'Unknown';
          let requirements = restParts[1] || 'N/A';
          let assignedTo = restParts[2] || 'Unassigned';

          extractedLeads.push({
            id: idCounter++,
            name: name.substring(0, 50),
            phone: phone.replace(/[^0-9+]/g, ''), // clean phone
            location: location.substring(0, 50),
            requirements: requirements.substring(0, 100),
            assignedTo: bulkAssignTo || assignedTo.substring(0, 50),
            feedback: 'None',
            source: 'OCR Image',
            status: 'Pending'
          });
        }
      });

      if (extractedLeads.length > 0) {
        addLeads(extractedLeads);
        showSuccess(`Photo uploaded successfully! ${extractedLeads.length} lead(s) extracted.`);
      } else {
        alert("No valid phone numbers found in the image. Please try again or use manual entry.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Error extracting text from image.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsedLeads = results.data.map((row, i) => ({
          id: Date.now() + i,
          name: row.name || row.Name || 'Unknown',
          phone: row.phone || row.Phone || row.Contact || 'Unknown',
          location: row.location || row.Location || row.City || 'Unknown',
          requirements: row.requirements || row.Requirements || 'N/A',
          assignedTo: bulkAssignTo || row.assignedTo || row.AssignedTo || 'Unassigned',
          feedback: row.feedback || row.Feedback || 'None',
          source: 'CSV',
          status: 'Pending'
        }));
        addLeads(parsedLeads);
        showSuccess('CSV uploaded successfully! Leads added.');
        setIsProcessing(false);
      },
      error: function (error) {
        console.error("CSV Error:", error);
        alert("Error parsing CSV.");
        setIsProcessing(false);
      }
    });
  };

  // Handle Manual Form Submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phone) return alert("Name and Phone required!");
    
    const newLead = {
      id: Date.now(),
      name: manualForm.name,
      phone: manualForm.phone,
      location: manualForm.location || 'Unknown',
      car_name: manualForm.car_name || '',
      car_number: manualForm.car_number || '',
      requirements: manualForm.requirements || 'N/A',
      assignedTo: manualForm.assignedTo || 'Unassigned',
      feedback: manualForm.feedback || 'None',
      source: 'Manual',
      status: 'Pending'
    };
    
    addLeads([newLead]);
    setManualForm({ name: '', phone: '', location: '', car_name: '', car_number: '', requirements: '', assignedTo: '', feedback: '' });
    showSuccess('Lead added manually successfully!');
  };

  return (
    <div className="add-leads-container">
      <h2 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Add Leads</h2>
      
      {successMessage && (
        <div style={{ padding: '12px 20px', background: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {successMessage}
        </div>
      )}

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('image')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'image' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'image' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
        >
          <ImageIcon size={18} /> Paper / Image OCR
        </button>
        <button 
          onClick={() => setActiveTab('csv')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'csv' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'csv' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
        >
          <FileText size={18} /> Upload CSV
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'manual' ? 'var(--primary)' : '#e5e7eb', color: activeTab === 'manual' ? 'white' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s' }}
        >
          <Edit3 size={18} /> Manual Entry
        </button>
      </div>

      <div className="tab-content" style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
        {activeTab === 'image' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #d1d5db', borderRadius: '12px', background: '#f9fafb' }}>
            <ImageIcon size={48} color="#9ca3af" style={{ marginBottom: '10px' }} />
            <h3 style={{ marginBottom: '10px', color: '#1f2937' }}>Upload Paper / Visiting Card Image</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>AI will magically extract Name, Phone, and Location.</p>
            
            <div style={{ marginBottom: '20px', maxWidth: '300px', margin: '0 auto 20px auto' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151', textAlign: 'left' }}>Assign these leads to (Optional)</label>
              <SearchableSelect 
                options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))}
                value={bulkAssignTo}
                onChange={val => setBulkAssignTo(val)}
                placeholder="-- Unassigned --"
                isMulti={true}
              />
            </div>

            <label style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '500', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
              {isProcessing ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
              {isProcessing ? 'Extracting Data... Please Wait' : 'Choose Image File'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isProcessing} />
            </label>
          </div>
        )}

        {activeTab === 'csv' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #d1d5db', borderRadius: '12px', background: '#f9fafb' }}>
            <FileText size={48} color="#9ca3af" style={{ marginBottom: '10px' }} />
            <h3 style={{ marginBottom: '10px', color: '#1f2937' }}>Upload Bulk Leads via CSV</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Ensure your CSV has headers like Name, Phone, Location.</p>
            
            <div style={{ marginBottom: '20px', maxWidth: '300px', margin: '0 auto 20px auto' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151', textAlign: 'left' }}>Assign these leads to (Optional)</label>
              <SearchableSelect 
                options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))}
                value={bulkAssignTo}
                onChange={val => setBulkAssignTo(val)}
                placeholder="-- Unassigned --"
                isMulti={true}
              />
            </div>

            <label style={{ background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '500', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
              {isProcessing ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
              {isProcessing ? 'Parsing CSV...' : 'Choose CSV File'}
              <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} disabled={isProcessing} />
            </label>
          </div>
        )}

        {activeTab === 'manual' && (
          <div style={{ maxWidth: '500px', margin: '0 auto', background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Add Lead Manually</h3>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Name</label>
                <input type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter lead name" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Phone Number</label>
                <input type="tel" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter phone number" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Location</label>
                <input type="text" value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter location (optional)" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Car Name / Model</label>
                  <input type="text" value={manualForm.car_name} onChange={e => setManualForm({...manualForm, car_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., Honda City" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Car Number</label>
                  <input type="text" value={manualForm.car_number} onChange={e => setManualForm({...manualForm, car_number: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="E.g., TN-01-AB-1234" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Requirements</label>
                <input type="text" value={manualForm.requirements} onChange={e => setManualForm({...manualForm, requirements: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter requirements" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Assigned To</label>
                <SearchableSelect 
                  options={users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))}
                  value={manualForm.assignedTo}
                  onChange={val => setManualForm({...manualForm, assignedTo: val})}
                  placeholder="-- Select Assignee --"
                  isMulti={true}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Feedback</label>
                <input type="text" value={manualForm.feedback} onChange={e => setManualForm({...manualForm, feedback: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }} placeholder="Enter initial feedback" />
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <CheckCircle size={18} /> Add Lead to System
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddLeads;
