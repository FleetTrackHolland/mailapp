import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AppProvider = ({ children }) => {
  const [appConfig, setAppConfig] = useState({
    companyName: 'FleetTrack Logistics',
    logoUrl: '',
    website: 'www.fleettrack.nl',
    contactEmail: 'info@fleettrack.nl',
    address: 'Strawinskylaan 123, Amsterdam',
    phone: '+31 20 123 4567',
    kvk: '12345678',
    vat: 'NL123456789B01',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/config`);
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          setAppConfig(prev => ({ ...prev, ...data }));
        }
      } catch (err) { console.error('Failed to fetch config:', err); }
    };
    fetchConfig();
  }, []);

  const updateAppConfig = async (newConfig) => {
    // Update local state first
    setAppConfig(prev => ({ ...prev, ...newConfig }));
    
    // Save to backend
    try {
      await fetch(`${API_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (err) { console.error('Failed to save config:', err); }
  };

  return (
    <AppContext.Provider value={{ appConfig, updateAppConfig }}>
      {children}
    </AppContext.Provider>
  );
};
