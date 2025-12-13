import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import '@/App.css';
import Dashboard from '@/components/Dashboard';
import Reservations from '@/components/Reservations';
import Guests from '@/components/Guests';
import Staff from '@/components/Staff';
import Schedules from '@/components/Schedules';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/reservations', label: 'Reservations', icon: '📅' },
    { path: '/guests', label: 'Guests', icon: '👥' },
    { path: '/staff', label: 'Staff', icon: '👨‍🍳' },
    { path: '/schedules', label: 'Schedules', icon: '🕐' },
  ];
  
  return (
    <nav className="bg-slate-900 text-white border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-bold">Restaurant Operations</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="App min-h-screen bg-slate-50">
      <BrowserRouter>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/schedules" element={<Schedules />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
