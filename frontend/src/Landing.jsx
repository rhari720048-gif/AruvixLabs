import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{ maxWidth: '800px', textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'var(--primary, #3b82f6)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
        }}>
          <span style={{ color: 'white', fontSize: '40px', fontWeight: 'bold' }}>A</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', color: '#1e293b', marginBottom: '24px', fontWeight: '800', letterSpacing: '-1px' }}>
          Aruvix CRM
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 40px' }}>
          The all-in-one platform to manage your leads, employees, projects, and daily business operations efficiently. Built for speed and scalability.
        </p>
        <Link to="/login" style={{
          display: 'inline-block',
          padding: '14px 40px',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: '600',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}>
          Login to Portal
        </Link>
      </div>
    </div>
  );
};

export default Landing;
