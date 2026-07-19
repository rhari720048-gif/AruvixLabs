import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import Papa from 'papaparse';
import { Upload, FileText, Edit3, Image as ImageIcon, Loader2, CheckCircle, User, Phone, MapPin, Car, Calendar, Sparkles } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';

const AddLeads = ({ addLeads }) => {
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'csv', 'manual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', phone: '', location: '', car_name: '', year: '' });

  // Handle Image Upload & OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const phoneRegex = /(?:\+?91)?[\s\-]*[6789](?:[\s\-]*\d){9}/; 
      
      const extractedLeads = [];
      let idCounter = Date.now();

      lines.forEach(line => {
        const match = line.match(phoneRegex) || line.replace(/o/ig, '0').replace(/[il|]/ig, '1').match(phoneRegex);
        
        if (match) {
          const phone = match[0];
          const parts = line.split(phoneRegex);
          
          let name = parts[0] ? parts[0].trim().replace(/[^a-zA-Z\s]/g, '') : 'Unknown';
          let rest = parts[1] ? parts[1].trim() : '';
          
          if (!name) name = 'Unknown';
          
          const restParts = rest.split(/\s{2,}/);
          let location = restParts[0] || 'Unknown';

          extractedLeads.push({
            id: idCounter++,
            name: name.substring(0, 50),
            phone: phone.replace(/[^0-9+]/g, ''),
            location: location.substring(0, 50),
            car_name: '',
            year: '',
            source: 'OCR Image',
            status: 'Pending'
          });
        }
      });

      if (extractedLeads.length > 0) {
        addLeads(extractedLeads);
        toast.success(`Photo processed successfully! ${extractedLeads.length} lead(s) extracted.`);
      } else {
        toast.error("No valid phone numbers found in image. Please try another or use manual entry.");
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast.error("Error extracting text from image.");
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
          car_name: row.car_name || row.car_model || row['Car Name'] || row['Car Name with Year'] || '',
          year: row.year || row.Year || '',
          source: 'CSV',
          status: 'Pending'
        }));
        addLeads(parsedLeads);
        toast.success('CSV uploaded successfully! Leads added.');
        setIsProcessing(false);
      },
      error: function (error) {
        console.error("CSV Parse Error:", error);
        toast.error("Error parsing CSV file.");
        setIsProcessing(false);
      }
    });
  };

  // Handle Manual Form Submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.phone) return toast.error("Name and Phone are required!");
    
    addLeads([{ 
      ...manualForm, 
      id: Date.now(), 
      location: manualForm.location || 'Unknown',
      car_name: manualForm.car_name || '',
      year: manualForm.year || '',
      status: 'Pending', 
      source: 'Manual' 
    }]);
    toast.success('Lead added successfully!');
    setManualForm({ name: '', phone: '', location: '', car_name: '', year: '' });
  };

  return (
    <div className="page-add-leads" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="crm-page-header">
        <div className="crm-page-title-group">
          <h1>
            <Sparkles size={28} color="#4F46E5" />
            Add New Leads
          </h1>
          <p>Import leads seamlessly via AI Image Scanner, CSV Batch File, or Manual Entry</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('image')}
          style={{ 
            flex: 1, minWidth: '160px', padding: '14px 20px', borderRadius: '16px', border: '1px solid',
            borderColor: activeTab === 'image' ? 'var(--primary)' : 'rgba(226, 232, 240, 0.8)',
            background: activeTab === 'image' ? 'white' : '#f8fafc',
            color: activeTab === 'image' ? 'var(--primary)' : '#64748b',
            boxShadow: activeTab === 'image' ? '0 4px 15px rgba(79, 70, 229, 0.12)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
        >
          <ImageIcon size={20} /> AI Visiting Card OCR
        </button>
        <button 
          onClick={() => setActiveTab('csv')}
          style={{ 
            flex: 1, minWidth: '160px', padding: '14px 20px', borderRadius: '16px', border: '1px solid',
            borderColor: activeTab === 'csv' ? 'var(--primary)' : 'rgba(226, 232, 240, 0.8)',
            background: activeTab === 'csv' ? 'white' : '#f8fafc',
            color: activeTab === 'csv' ? 'var(--primary)' : '#64748b',
            boxShadow: activeTab === 'csv' ? '0 4px 15px rgba(79, 70, 229, 0.12)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
        >
          <FileText size={20} /> Bulk CSV Import
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          style={{ 
            flex: 1, minWidth: '160px', padding: '14px 20px', borderRadius: '16px', border: '1px solid',
            borderColor: activeTab === 'manual' ? 'var(--primary)' : 'rgba(226, 232, 240, 0.8)',
            background: activeTab === 'manual' ? 'white' : '#f8fafc',
            color: activeTab === 'manual' ? 'var(--primary)' : '#64748b',
            boxShadow: activeTab === 'manual' ? '0 4px 15px rgba(79, 70, 229, 0.12)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s ease'
          }}
        >
          <Edit3 size={20} /> Direct Manual Entry
        </button>
      </div>

      <div className="card-panel" style={{ padding: '36px' }}>
        {activeTab === 'image' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed rgba(79, 70, 229, 0.3)', borderRadius: '20px', background: '#f8fafc' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ImageIcon size={32} />
            </div>
            <h3 style={{ marginBottom: '8px', color: '#0F172A', fontWeight: '800', fontSize: '20px' }}>Upload Visiting Card or Document Photo</h3>
            <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '14px', maxWidth: '450px', margin: '0 auto 24px' }}>AI OCR will instantly extract contact name, phone number, and location from your uploaded photo.</p>

            <label className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '14px', cursor: 'pointer', fontSize: '15px' }}>
              {isProcessing ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} /> : <Upload size={20} />}
              {isProcessing ? 'Scanning Image Data...' : 'Choose Image File'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isProcessing} />
            </label>
          </div>
        )}

        {activeTab === 'csv' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed rgba(16, 185, 129, 0.4)', borderRadius: '20px', background: '#f8fafc' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FileText size={32} />
            </div>
            <h3 style={{ marginBottom: '8px', color: '#0F172A', fontWeight: '800', fontSize: '20px' }}>Bulk Import via CSV Spreadsheet</h3>
            <p style={{ color: '#64748B', marginBottom: '24px', fontSize: '14px', maxWidth: '450px', margin: '0 auto 24px' }}>Upload a CSV file containing columns for Name, Phone, Location, Car Model, and Year.</p>

            <label className="btn btn-success" style={{ padding: '14px 32px', borderRadius: '14px', cursor: 'pointer', fontSize: '15px' }}>
              {isProcessing ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} /> : <Upload size={20} />}
              {isProcessing ? 'Importing CSV Records...' : 'Choose CSV Spreadsheet'}
              <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: 'none' }} disabled={isProcessing} />
            </label>
          </div>
        )}

        {activeTab === 'manual' && (
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px', color: '#0F172A', fontWeight: '800', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={22} color="var(--primary)" /> Lead Information
            </h3>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                  <User size={15} /> Lead Full Name *
                </label>
                <input type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} placeholder="e.g. Rajesh Kumar" required />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                  <Phone size={15} /> Mobile Phone Number (10 digits only) *
                </label>
                <input type="tel" maxLength={10} value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})} placeholder="e.g. 9876543210" required />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                  <MapPin size={15} /> City / Location
                </label>
                <input type="text" value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} placeholder="e.g. Chennai" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                    <Car size={15} /> Car Model
                  </label>
                  <input type="text" value={manualForm.car_name} onChange={e => setManualForm({...manualForm, car_name: e.target.value})} placeholder="e.g. Honda City" />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                    <Calendar size={15} /> Manufacture Year
                  </label>
                  <SearchableSelect 
                    options={Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => ({
                      label: String(year),
                      value: String(year)
                    }))}
                    value={manualForm.year}
                    onChange={val => setManualForm({...manualForm, year: val})}
                    placeholder="Select Year..."
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '14px', borderRadius: '14px', marginTop: '10px', fontSize: '15px' }}>
                <CheckCircle size={20} /> Save & Create Lead
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddLeads;
