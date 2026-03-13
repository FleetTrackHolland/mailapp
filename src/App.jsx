import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Agenda from './pages/Agenda';
import Campaigns from './pages/Campaigns';
import CampaignBuilder from './pages/CampaignBuilder';
import CampaignDetail from './pages/CampaignDetail';
import EmailSettings from './pages/EmailSettings';
import AutomationSettings from './pages/AutomationSettings';
import Settings from './pages/Settings';
import Login from './pages/Login';
import CyberHUD from './components/CyberHUD';
import { LeadsProvider } from './context/LeadsContext';
import { CampaignsProvider } from './context/CampaignsContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
        <Routes>
          {/* Main App Container */}
          <Route 
            path="/" 
            element={
              user ? (
                <LeadsProvider>
                  <CampaignsProvider>
                    <Layout user={user} onLogout={handleLogout} />
                    <CyberHUD />
                  </CampaignsProvider>
                </LeadsProvider>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/new" element={<CampaignBuilder />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="email-settings" element={<EmailSettings />} />
            <Route path="automation-settings" element={<AutomationSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
