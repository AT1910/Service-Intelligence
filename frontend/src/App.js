import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import '@/App.css';
import Dashboard from '@/components/Dashboard';
import Reservations from '@/components/Reservations';
import Guests from '@/components/Guests';
import TeamMembers from '@/components/TeamMembers';
import ServiceSchedules from '@/components/ServiceSchedules';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Service Intelligence', icon: '✨' },
    { path: '/reservations', label: 'Reservations & Covers', icon: '📖' },
    { path: '/guests', label: 'Guest Relations', icon: '🤝' },
    { path: '/team', label: 'Team & Hospitality', icon: '👥' },
    { path: '/schedules', label: 'Floor Schedules', icon: '⏰' },
  ];
  
  return (
    <nav className="nav-header">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">🍽</span>
          <div className="brand-text">
            <h1 className="brand-title">Enlightened Hospitality</h1>
            <p className="brand-subtitle">Operations Intelligence</p>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'nav-link-active' : ''}`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/team" element={<TeamMembers />} />
            <Route path="/schedules" element={<ServiceSchedules />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
