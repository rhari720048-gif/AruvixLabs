import React, { useState, useEffect } from 'react';
import { Menu, Clock, Calendar, ShieldCheck, Sun, Moon, Sunrise, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { API } from './apiConfig';

const decodeToken = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch (e) { return null; }
};

const ROLE_LABELS = {
  admin:    'Admin',
  manager:  'Manager',
  employee: 'Employee',
};

export default function Header({ setSidebarOpen }) {
  const [userData, setUserData] = useState(() => {
    let s = {};
    try { s = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
    return {
      name: s.name || localStorage.getItem('user_name') || 'User',
      role: (s.role || localStorage.getItem('role') || 'employee').toLowerCase()
    };
  });

  useEffect(() => {
    const updateUser = () => {
      let s = {};
      try { s = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
      setUserData({
        name: s.name || localStorage.getItem('user_name') || 'User',
        role: (s.role || localStorage.getItem('role') || 'employee').toLowerCase()
      });
    };

    window.addEventListener('user-updated', updateUser);
    window.addEventListener('storage', updateUser);
    return () => {
      window.removeEventListener('user-updated', updateUser);
      window.removeEventListener('storage', updateUser);
    };
  }, []);

  const displayName = userData.role === 'admin' ? 'Admin' : userData.name;
  const roleLabel = ROLE_LABELS[userData.role] || (userData.role ? (userData.role.charAt(0).toUpperCase() + userData.role.slice(1)) : 'Employee');

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) {
      return { text: 'Good Morning', icon: <Sunrise size={18} color="#fbbf24" /> };
    } else if (hour < 17) {
      return { text: 'Good Afternoon', icon: <Sun size={18} color="#fbbf24" /> };
    } else {
      return { text: 'Good Evening', icon: <Moon size={18} color="#c084fc" /> };
    }
  };

  const greeting = getGreeting();

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  });

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API}/telecalling/release-locks`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Failed to release locks on logout:', e);
    }
    toast.success('Logged out successfully!');
    localStorage.clear();
    setTimeout(() => {
      window.location.href = '/login';
    }, 300);
  };

  return (
    <header className="crm-header-split">
      {/* ── MOBILE HEADER BAR (Clean Top Bar for Mobile View) ──────── */}
      <div className="mobile-header-bar">
        <div className="mobile-header-left">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </button>
          <div className="mobile-header-brand">
            <div className="mobile-logo-box">A</div>
            <span className="mobile-brand-title">AruvixLabs</span>
          </div>
        </div>

        <div className="mobile-header-right">
          {/* Stacked Clock Widget: Time on Top, Date Below */}
          <div className="mobile-header-clock-stacked">
            <div className="clock-time-line">
              <Clock size={11} color="#4f46e5" />
              <span>{formattedTime}</span>
            </div>
            <div className="clock-date-line">
              <Calendar size={10} color="#6366f1" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Indigo Logout Button (Matching Good Morning Background & White Text) */}
          <button 
            className="header-logout-btn-indigo"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={15} color="#ffffff" />
            <span className="logout-text-mobile">Logout</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE GREETING STRIP (Sub-header greeting strip) ──────── */}
      <div className="mobile-greeting-strip">
        <div className="mobile-greeting-pill">
          {greeting.icon}
          <span>{greeting.text}, <strong>{displayName}</strong></span>
          <span className="mobile-role-tag">{roleLabel}</span>
        </div>
      </div>

      {/* ── DESKTOP HEADER LAYOUT ──────────────────────────────────── */}
      <div className="desktop-header-container">
        {/* Desktop Left: Indigo Greeting Card */}
        <div className="header-greeting-card">
          <div className="header-greeting-title">
            {greeting.icon}
            <span>{greeting.text}, <strong>{displayName}</strong></span>
          </div>
          <span className="header-role-badge-indigo">
            <ShieldCheck size={12} /> {roleLabel}
          </span>
        </div>

        {/* Desktop Right: Live Clock & Indigo Logout Button */}
        <div className="desktop-header-right">
          <div className="header-clock-widget">
            <div className="clock-item clock-date">
              <Calendar size={14} color="#4f46e5" />
              <span>{formattedDate}</span>
            </div>
            <div className="clock-divider">|</div>
            <div className="clock-item clock-time">
              <Clock size={14} color="#4f46e5" />
              <span>{formattedTime}</span>
            </div>
          </div>

          <button 
            className="header-logout-btn-indigo"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} color="#ffffff" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
