import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';

const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : 'https://aruvixlabs.onrender.com/api';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-page">
      {/* ── Left Side: White + Indigo Branding Hero ─────────────── */}
      <div className="login-split-left">
        <div className="login-brand-content">
          {/* Logo Badge */}
          <div className="login-hero-logo">
            <span>A</span>
          </div>

          {/* Main Title */}
          <h1 className="login-hero-title">
            <span className="hero-welcome-text">WELCOME TO</span> <br />
            <span className="indigo-brand-text">ARUVIXLABS</span>
          </h1>

          {/* Enterprise Badge Pill */}
          <div className="login-hero-badge-pill">
            <ShieldCheck size={14} color="#4f46e5" />
            <span>Next-Gen Enterprise CRM</span>
          </div>

          <div className="login-hero-footer">
            © 2026 AruvixLabs Enterprise CRM. All rights reserved.
          </div>
        </div>
      </div>

      {/* ── Right Side: Concept F Curved Top Banner Overlay Portal ──── */}
      <div className="login-split-right">
        <div className="login-card-curved">
          {/* Curved Indigo Top Banner */}
          <div className="curved-banner-header">
            <div className="curved-top-badge">
              <ShieldCheck size={13} color="#ffffff" />
              <span>SECURE PORTAL ACCESS</span>
            </div>
            <h2 className="curved-banner-title">Sign In to Portal</h2>
            <p className="curved-banner-subtitle">Enter your credentials to access workspace</p>
          </div>

          {/* Lower Pearl White Form Body */}
          <div className="curved-card-body">
            {error && (
              <div className="login-error-banner">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form-element">
              <div className="form-group-login">
                <label className="login-field-label">Email Address</label>
                <div className="login-input-wrapper">
                  <div className="indigo-icon-badge">
                    <Mail size={17} color="#4338ca" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="has-icon-left login-text-input"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-group-login">
                <label className="login-field-label">Password</label>
                <div className="login-input-wrapper">
                  <div className="indigo-icon-badge">
                    <KeyRound size={17} color="#4338ca" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="has-icon-left login-text-input"
                    placeholder="Enter your password"
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} color="#6366f1" /> : <Eye size={18} color="#6366f1" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="curved-submit-button btn"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
