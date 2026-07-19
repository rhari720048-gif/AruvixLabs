import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        const userRole = (data.user.role || data.role || 'employee').toLowerCase();
        const userPerms = data.user.permissions || {};

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('permissions', JSON.stringify(userPerms));
        localStorage.setItem('user_name', data.user.name || data.name || '');
        // Save full user object so pages can access user.id, user.name etc.
        localStorage.setItem('user', JSON.stringify({
          id:          data.user.id,
          name:        data.user.name,
          role:        userRole,
          permissions: userPerms,
        }));

        setAuth(true);
        window.location.href = '/';
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
        width: '100%',
        maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'var(--primary, #3b82f6)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>A</span>
          </div>
          <h2 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '8px', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Sign in to your Aruvix account</p>
        </div>
        
        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', zIndex: 2 }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '46px', height: '48px', border: '1.5px solid #e2e8f0', borderRadius: '14px', fontSize: '14.5px', outline: 'none', background: '#f8fafc', fontWeight: '600', color: '#0f172a' }}
                placeholder="Enter email address"
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13.5px', fontWeight: '700', color: '#475569' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1', zIndex: 2 }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingLeft: '46px', height: '48px', border: '1.5px solid #e2e8f0', borderRadius: '14px', fontSize: '14.5px', outline: 'none', background: '#f8fafc', fontWeight: '600', color: '#0f172a' }}
                placeholder="Enter password"
              />
            </div>
          </div>
          <button type="submit" style={{
            background: '#3b82f6',
            color: 'white',
            padding: '16px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'background-color 0.2s'
          }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
