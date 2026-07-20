import React, { useState, useEffect } from 'react';
import { Menu, Clock, Calendar, ShieldCheck, Sun, Moon, Sunrise } from 'lucide-react';

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
  const token = localStorage.getItem('token');
  const tokenUser = decodeToken(token) || { role: 'employee' };
  
  let storedUser = {};
  try { storedUser = JSON.parse(localStorage.getItem('user') || '{}'); } catch(e){}
  
  const user = {
    name: storedUser.name || localStorage.getItem('user_name') || 'Admin',
    role: (tokenUser.role || storedUser.role || 'employee').toLowerCase()
  };

  const displayName = user.role === 'admin' ? 'Admin' : (storedUser.name || localStorage.getItem('user_name') || 'User');

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  // Live real-time digital clock
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-based smart greeting logic
  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) {
      return { text: 'Good Morning', icon: <Sunrise size={20} color="#fbbf24" /> };
    } else if (hour < 17) {
      return { text: 'Good Afternoon', icon: <Sun size={20} color="#fbbf24" /> };
    } else {
      return { text: 'Good Evening', icon: <Moon size={20} color="#c084fc" /> };
    }
  };

  const greeting = getGreeting();

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="crm-header-split">
      {/* ── Desktop Left / Mobile Row 1 ────────────────────────────── */}
      <div className="header-row-primary">
        <div className="header-left-group">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(true)}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Mobile Only Branding */}
          <div className="header-mobile-brand">
            <div className="mobile-logo-box">A</div>
            <span className="mobile-brand-title">AruvixLabs</span>
          </div>

          {/* Desktop Indigo Card (Smart Greeting) */}
          <div className="header-greeting-card">
            <div className="header-greeting-title">
              {greeting.icon}
              <span>{greeting.text}, <strong>{displayName}</strong></span>
            </div>
            <span className="header-role-badge-indigo">
              <ShieldCheck size={12} /> {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Desktop Right / Mobile Row 2 ───────────────────────────── */}
      <div className="header-row-secondary">
        {/* Mobile View Indigo Greeting Pill */}
        <div className="header-mobile-greeting">
          {greeting.icon}
          <span>{greeting.text}, <strong>{displayName}</strong></span>
        </div>

        {/* Live Clock & Date Widget (Pearl White Pill) */}
        <div className="header-clock-widget">
          <div className="clock-item clock-date clock-date-desktop">
            <Calendar size={14} color="#4f46e5" />
            <span>{formattedDate}</span>
          </div>
          <div className="clock-divider clock-date-desktop">|</div>
          <div className="clock-item clock-time">
            <Clock size={14} color="#4f46e5" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
