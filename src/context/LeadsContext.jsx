import React, { createContext, useContext, useState, useEffect } from 'react';

const LeadsContext = createContext();

export const useLeads = () => useContext(LeadsContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const initialLeads = [
  {
    id: "1",
    company: "Van Dijk Transport",
    sector: "Transport",
    vehicles: 12,
    email: "info@vandijktransport.nl",
    website: "www.vandijktransport.nl",
    source: "Google Maps",
    status: "new",
    notes: "Terugbellen vrijdag",
    activities: [
      { id: "a1", type: "system", text: "Lead created", date: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString()
  },
  {
    id: "2",
    company: "Jansen Schoonmaak",
    sector: "Schoonmaak",
    vehicles: 5,
    email: "contact@jansenschoonmaak.nl",
    website: "www.jansenschoonmaak.nl",
    source: "KVK",
    status: "contacted",
    notes: "E-mail gestuurd",
    activities: [
      { id: "a2", type: "system", text: "Lead created", date: new Date(Date.now() - 86400000).toISOString() },
      { id: "a3", type: "system", text: "Status changed to contacted", date: new Date(Date.now() - 86400000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastContact: new Date(Date.now() - 86400000).toISOString()
  }
];

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Initial Fetch
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch(`${API_URL}/leads`);
        const data = await res.json();
        setLeads(data);
      } catch (err) { console.error('Failed to fetch leads:', err); }
    };
    fetchLeads();
  }, []);

  // Reminder Monitoring Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newNotifications = [];

      leads.forEach(lead => {
        (lead.reminders || []).forEach(reminder => {
          if (reminder.completed) return;

          const taskDate = new Date(reminder.date);
          const diffInMinutes = (taskDate - now) / (1000 * 60);

          // 30 minute alert
          if (diffInMinutes > 29 && diffInMinutes <= 30 && !reminder.notified30m) {
            newNotifications.push({
              id: Date.now() + Math.random(),
              type: 'warning',
              title: lead.company || lead.name,
              message: reminder.text,
              time: '30m',
              leadId: lead.id
            });
            reminder.notified30m = true;
          }

          // Exact time alert
          if (diffInMinutes > -1 && diffInMinutes <= 0 && !reminder.notifiedNow) {
            newNotifications.push({
              id: Date.now() + Math.random(),
              type: 'urgent',
              title: lead.company || lead.name,
              message: reminder.text,
              time: 'NOW',
              leadId: lead.id
            });
            reminder.notifiedNow = true;
            // Play audio if in browser
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch (e) {}
          }
        });
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
        // Force state update to persist notified flags
        setLeads([...leads]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [leads]);

  const addLead = async (leadData) => {
    const now = new Date();
    const newLead = {
      ...leadData,
      createdAt: now.toISOString(),
      lastContact: now.toISOString(),
      followUp1Date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      followUp2Date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      nextAction: 'Follow-up Email (1 week)',
    };
    
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      const savedLead = await res.json();
      setLeads(prev => [savedLead, ...prev]);
      
      // Auto-log creation activity
      await addActivity(savedLead.id, "Lead created", "system");
    } catch (err) { console.error('Add lead error:', err); }
  };

  const addActivity = async (id, text, type = 'manual') => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type })
      });
      const newActivity = await res.json();
      
      setLeads(prevLeads => prevLeads.map(lead => 
        lead.id === id ? { 
          ...lead, 
          activities: [newActivity, ...(lead.activities || [])],
          lastContact: newActivity.date
        } : lead
      ));
    } catch (err) { console.error('Add activity error:', err); }
  };

  const addReminder = async (id, reminderText, date) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reminderText, date })
      });
      const newReminder = await res.json();
      
      setLeads(prevLeads => prevLeads.map(lead => 
        lead.id === id ? { 
          ...lead, 
          reminders: [newReminder, ...(lead.reminders || [])]
        } : lead
      ));
    } catch (err) { console.error('Add reminder error:', err); }
  };

  const deleteReminder = async (leadId, reminderId) => {
    try {
      await fetch(`${API_URL}/reminders/${reminderId}`, { method: 'DELETE' });
      setLeads(prevLeads => prevLeads.map(lead => 
        lead.id === leadId ? { 
          ...lead, 
          reminders: (lead.reminders || []).filter(r => r.id !== reminderId)
        } : lead
      ));
    } catch (err) { console.error('Delete reminder error:', err); }
  };

  const updateLeadStatus = async (id, newStatus) => {
    const statusTextMap = {
      new: 'New',
      contacted: 'Contacted',
      interested: 'Interested',
      customer: 'Closed (Won)',
      rejected: 'Closed (Rejected)'
    };
    
    try {
      const statusText = statusTextMap[newStatus] || newStatus;
      await updateLead(id, { status: newStatus });
      await addActivity(id, `Status changed to ${statusText}`, "system");
    } catch (err) { console.error('Update lead status error:', err); }
  };

  const updateLead = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const newData = await res.json();
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...newData } : l));
    } catch (err) { console.error('Update lead error:', err); }
  };

  const deleteLead = async (id) => {
    try {
      await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) { console.error('Delete lead error:', err); }
  };

  const bulkDeleteLeads = async (ids) => {
    try {
      await fetch(`${API_URL}/leads/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      setLeads(prev => prev.filter(lead => !ids.includes(lead.id)));
    } catch (err) { console.error('Bulk delete error:', err); }
  };

  const bulkUpdateLeadStatus = async (ids, status) => {
    try {
      await fetch(`${API_URL}/leads/bulk/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status })
      });
      // Refresh leads to get updated activities and status
      const res = await fetch(`${API_URL}/leads`);
      const data = await res.json();
      setLeads(data);
    } catch (err) { console.error('Bulk status update error:', err); }
  };

  const scrapeLeads = async (config) => {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success && data.leads) {
        setLeads(prev => [...data.leads, ...prev]);
        return data;
      }
      return { success: false, count: 0 };
    } catch (err) {
      console.error('Scrape error:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <LeadsContext.Provider value={{ 
      leads, addLead, updateLeadStatus, updateLead, deleteLead, 
      addActivity, addReminder, deleteReminder, scrapeLeads,
      bulkDeleteLeads, bulkUpdateLeadStatus,
      notifications, setNotifications
    }}>
      {children}
    </LeadsContext.Provider>
  );
};
