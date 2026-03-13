import React, { createContext, useContext, useState, useEffect } from 'react';

const CampaignsContext = createContext();

export const useCampaigns = () => useContext(CampaignsContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const mockCampaigns = [
  { 
    id: "demo-1", 
    name: 'Demo: Q4 Logistics Outreach', 
    subject: 'Optimize your fleet costs', 
    status: 'Sent', 
    sentCount: '4,200',
    deliveredCount: '4,150',
    bouncedCount: '50', 
    openRate: 48, 
    clickRate: 22, 
    date: 'Mar 10, 2026',
    content: `<p>Hi {{companyName}},</p><p>This is a demo campaign content.</p>`
  }
];

export const CampaignsProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);

  // Initial Fetch
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${API_URL}/campaigns`);
        const data = await res.json();
        setCampaigns(data);
      } catch (err) { console.error('Failed to fetch campaigns:', err); }
    };
    fetchCampaigns();
  }, []);

  const addCampaign = async (campaignData) => {
    const newCampaign = {
      ...campaignData,
      id: Date.now().toString(),
      sentCount: '0',
      deliveredCount: '0',
      bouncedCount: '0',
      openRate: 0,
      clickRate: 0,
    };
    
    try {
      const res = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });
      const savedCamp = await res.json();
      setCampaigns(prev => [savedCamp, ...prev]);
    } catch (err) { console.error('Add campaign error:', err); }
  };

  const getCampaign = (id) => {
    return campaigns.find(c => c.id === id);
  };

  const updateCampaign = async (id, updatedData) => {
    const camp = campaigns.find(c => c.id === id);
    if (!camp) return;
    const newData = { ...camp, ...updatedData };
    
    try {
      await fetch(`${API_URL}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      setCampaigns(prev => prev.map(c => c.id === id ? newData : c));
    } catch (err) { console.error('Update campaign error:', err); }
  };

  const deleteCampaign = async (id) => {
    try {
      await fetch(`${API_URL}/campaigns/${id}`, { method: 'DELETE' });
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error('Delete campaign error:', err); }
  };

  const updateCampaignStatus = async (id, newStatus, recipientCount = 0) => {
    const updates = { status: newStatus };
    if (newStatus === 'Sent') {
      updates.date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      updates.sentCount = String(recipientCount);
      updates.deliveredCount = String(Math.floor(recipientCount * 0.98)); // simulated 98% delivery
    }
    await updateCampaign(id, updates);
  };

  const sendCampaign = async (campaignId, targetLeads, addActivity) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Simulate sending for each lead
    for (const lead of targetLeads) {
      if (lead.unsubscribed) continue;

      let personalizedContent = campaign.content
        .replace(/{{companyName}}/g, lead.company || lead.name || 'valued partner')
        .replace(/{{sector}}/g, lead.sector || 'your industry')
        .replace(/{{unsubscribeUrl}}/g, `${API_URL.replace('/api', '')}/unsubscribe?leadId=${lead.id}`);

      // Log activity in Lead history (persisted)
      await addActivity(lead.id, `Email Sent: ${campaign.subject}`, 'email');
    }

    // Update campaign status (persisted)
    await updateCampaignStatus(campaignId, 'Sent', targetLeads.length);
  };

  return (
    <CampaignsContext.Provider value={{ 
      campaigns, 
      addCampaign, 
      getCampaign, 
      updateCampaign,
      deleteCampaign,
      updateCampaignStatus,
      sendCampaign
    }}>
      {children}
    </CampaignsContext.Provider>
  );
};
