import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useLeads } from '../context/LeadsContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  UserCircleIcon, KeyIcon, BellIcon, CreditCardIcon, UsersIcon,
  TagIcon, SparklesIcon, PlusIcon, TrashIcon, CloudArrowDownIcon,
  CheckCircleIcon, DocumentTextIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { useCampaigns } from '../context/CampaignsContext';

export default function Settings() {
  const { t } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const { appConfig, updateAppConfig } = useApp();
  const { leads } = useLeads();
  const { campaigns } = useCampaigns();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'Profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };
  
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isDemo = user ? user.isDemo : false;

  // Split name for profile fields
  const getInitialNames = () => {
    if (!user || !user.name) return { first: 'John', last: 'Doe' };
    const parts = user.name.split(' ');
    return {
      first: parts[0] || '',
      last: parts.slice(1).join(' ') || ''
    };
  };

  const initialNames = getInitialNames();
  const [firstName, setFirstName] = useState(initialNames.first);
  const [lastName, setLastName] = useState(initialNames.last);
  const [email, setEmail] = useState(user?.email || `john.doe@mycompany.com`);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleSaveProfile = () => {
    if (!user) return;
    const updatedUser = { 
      ...user, 
      name: `${firstName} ${lastName}`.trim(), 
      email: email,
      avatar: avatar
    };
    
    // 1. Update current session
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // 2. Update permanent DB
    const db = localStorage.getItem('fleettrack_users');
    if (db) {
      const users = JSON.parse(db);
      const idx = users.findIndex(u => u.email === user.email || u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updatedUser };
        localStorage.setItem('fleettrack_users', JSON.stringify(users));
      }
    }

    alert(t('saveChanges') + '!');
    // Reload to sync Sidebar/Layout which reads from state/storage
    window.location.reload();
  };

  const tabs = [
    { name: 'Profile', textKey: 'tabProfile', icon: UserCircleIcon },
    { name: 'Company Details', textKey: 'tabCompanyDetails', icon: SparklesIcon },
    { name: 'Team Members', textKey: 'tabTeam', icon: UsersIcon },
    { name: 'Notifications', textKey: 'tabNotifications', icon: BellIcon },
    { name: 'Lead Management', textKey: 'tabLeadManagement', icon: TagIcon },
    { name: 'Billing & Usage', textKey: 'tabBilling', icon: CreditCardIcon },
    { name: 'API & Integrations', textKey: 'apiKeys', icon: KeyIcon },
    { name: 'Data Management', textKey: 'tabDataManagement', icon: CloudArrowDownIcon },
  ];

  // ---- FILE UPLOADS ----
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File too large, max 2MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => updateAppConfig({ logoUrl: reader.result });
    reader.readAsDataURL(file);
  };
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File too large, max 2MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  // ---- TEAM MEMBERS ----
  const domain = appConfig.website.replace('www.', '');
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Doe', email: `john.doe@${domain}`, role: 'admin', isOwner: true },
    { id: 2, name: 'Sarah Smith', email: `sarah@${domain}`, role: 'viewer', isOwner: false },
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const handleAddMember = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setTeamMembers(prev => [...prev, { id: Date.now(), name: inviteName, email: inviteEmail, role: inviteRole, isOwner: false }]);
    setInviteName(''); setInviteEmail(''); setInviteRole('viewer'); setShowInvite(false);
  };

  // ---- NOTIFICATION TOGGLES ----
  const [notif, setNotif] = useState({ emailOpens: true, emailClicks: true, realTimeAlerts: false, weeklyReports: true });
  const [notifSound, setNotifSound] = useState({ emailOpens: 'Ping', emailClicks: 'Chime', realTimeAlerts: 'Pop' });

  // Professional short tones via Web Audio API (no external URLs needed)
  const playSound = (name) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const tones = {
        Ping:  { type: 'sine',     freq: 1046, duration: 0.12, attack: 0.005, decay: 0.1 },
        Chime: { type: 'triangle', freq:  784, duration: 0.22, attack: 0.01,  decay: 0.18 },
        Pop:   { type: 'sine',     freq:  440, duration: 0.08, attack: 0.002, decay: 0.07 },
      };
      const cfg = tones[name] || tones.Ping;

      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + cfg.attack);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.attack + cfg.decay);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + cfg.duration);
      osc.onended = () => ctx.close();
    } catch(e) { console.log('Audio error', e); }
  };

  // ---- LEAD TAGS ----
  const [sectors, setSectors] = useState(appConfig.customSectors || ['B2B Logistics', 'Taxi', 'Construction', 'Delivery', 'Agriculture']);
  const [statuses, setStatuses] = useState(appConfig.customStatuses || ['New Lead', 'Contacted', 'In Discussion', 'Won', 'Lost']);
  const [newSector, setNewSector] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Auto-save tags
  useEffect(() => {
    updateAppConfig({ customSectors: sectors, customStatuses: statuses });
  }, [sectors, statuses]);

  const [activePlan, setActivePlan] = useState('Free');
  const [invoices, setInvoices] = useState([]);
  const [paymentModal, setPaymentModal] = useState(null);
  const [payStep, setPayStep] = useState('select'); // 'select' | 'confirm' | 'processing' | 'success' | 'error'
  const [paymentMethod, setPaymentMethod] = useState('ideal'); // 'ideal', 'card', 'paypal', 'applepay'
  const [selectedBank, setSelectedBank] = useState('');
  const [payProcessing, setPayProcessing] = useState(false);
  const [payError, setPayError] = useState('');

  // Fetch billing data
  useEffect(() => {
    if (activeTab === 'Billing & Usage' || activeTab === 'Profile') {
      const fetchBilling = async () => {
        try {
          const subRes = await fetch(`${API_URL}/subscriptions/${email}`);
          const subData = await subRes.json();
          setActivePlan(subData.plan || 'Free');

          const payRes = await fetch(`${API_URL}/payments`);
          const payData = await payRes.json();
          setInvoices(payData.map(p => ({
            date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: `€${p.totalIncVat.toFixed(2)}`,
            plan: p.planName,
            status: p.status
          })));
        } catch (err) { console.error('Billing fetch error:', err); }
      };
      fetchBilling();
    }
  }, [activeTab, email]);

  const idealBanks = ['ABN AMRO', 'ING', 'Rabobank', 'SNS Bank', 'ASN Bank', 'Triodos Bank', 'Bunq', 'RegioBank', 'Knab'];
  const openUpgradeModal = (plan) => { setPaymentModal(plan); setPayStep('select'); setPaymentMethod('ideal'); setSelectedBank(''); setPayError(''); };
  const handlePayConfirm = () => { if (paymentMethod === 'ideal' && !selectedBank) return; setPayStep('confirm'); };

  // Called when user clicks "Nu betalen" — Simulates payment and upgrades the database
  const handlePayNow = async () => {
    if (!paymentModal) return;
    setPayProcessing(true);
    setPayError('');
    
    try {
      // 1. Record payment on backend
      const payData = {
        orderId: `FT-${Date.now()}`,
        planName: paymentModal.name,
        price: paymentModal.price,
        vatAmount: paymentModal.price * 0.21,
        totalIncVat: paymentModal.price * 1.21,
        status: 'PAID',
        customerEmail: email,
        customerName: `${firstName} ${lastName}`
      };

      await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payData)
      });

      // 2. Update local state
      setActivePlan(paymentModal.name);
      setPayStep('success');
      
      // Reload to sync session
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (err) {
      setPayError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setPayProcessing(false);
    }
  };

  // Detect Mollie return redirect: /settings?payment=success&plan=Professional
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const plan = params.get('plan');
      if (plan) setActivePlan(plan);
      setPayStep('success');
      // Clean URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setPayStep('select'), 4000);
    }
  }, []);

  const plans = [
    { name: 'Starter', price: 29, features: ['2,500 Emails / month', 'Basic Templates', '1 Team Member'] },
    { name: 'Professional', price: 49, features: ['10,000 Emails / month', 'Premium Templates', '5 Team Members', 'Advanced Analytics'] },
    { name: 'Enterprise', price: 99, features: ['Unlimited Emails', 'Custom Whitelabeling', 'Unlimited Members', 'Dedicated Scraper Bot'] },
  ];
  const downloadInvoice = (inv) => {
    const content = `INVOICE\n\nDate: ${inv.date}\nPlan: ${inv.plan}\nAmount: ${inv.amount}\nStatus: PAID\n\n${appConfig.companyName}\n${appConfig.address || ''}\nVAT: ${appConfig.vat || 'N/A'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `invoice-${inv.date.replace(/ /g, '-')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---- API KEYS ----
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Scraper Bot API', token: 'fk_live_8x...92p', created: 'Oct 12, 2026' },
    { id: 2, name: 'CRM Webhook', token: 'fk_live_k2...44m', created: 'Mar 1, 2026' },
  ]);
  const [aiKeys, setAiKeys] = useState({ 
    openai: appConfig.aiKeyOpenai || '', 
    claude: appConfig.aiKeyClaude || '', 
    gemini: appConfig.aiKeyGemini || '' 
  });
  const [connectedAi, setConnectedAi] = useState({ 
    openai: !!appConfig.aiKeyOpenai, 
    claude: !!appConfig.aiKeyClaude, 
    gemini: !!appConfig.aiKeyGemini 
  });

  useEffect(() => {
    setAiKeys({
      openai: appConfig.aiKeyOpenai || '',
      claude: appConfig.aiKeyClaude || '',
      gemini: appConfig.aiKeyGemini || ''
    });
    setConnectedAi({
      openai: !!appConfig.aiKeyOpenai,
      claude: !!appConfig.aiKeyClaude,
      gemini: !!appConfig.aiKeyGemini
    });
  }, [appConfig]);

  const handleConnectAi = async (provider) => {
    if (!aiKeys[provider].trim()) { alert('Please enter a valid API key first.'); return; }
    const keyMap = { openai: 'aiKeyOpenai', claude: 'aiKeyClaude', gemini: 'aiKeyGemini' };
    await updateAppConfig({ [keyMap[provider]]: aiKeys[provider] });
    setConnectedAi(prev => ({ ...prev, [provider]: true }));
    alert(`${provider.toUpperCase()} API Key connected and saved!`);
  };

  const handleDisconnectAi = async (provider) => {
    const keyMap = { openai: 'aiKeyOpenai', claude: 'aiKeyClaude', gemini: 'aiKeyGemini' };
    await updateAppConfig({ [keyMap[provider]]: '' });
    setAiKeys(prev => ({ ...prev, [provider]: '' }));
    setConnectedAi(prev => ({ ...prev, [provider]: false }));
  };
  const handleGlobalBackup = () => {
    const backupData = {
      leads,
      campaigns,
      config: appConfig,
      exportDate: new Date().toISOString(),
      version: '1.2.0'
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleettrack-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const revokeKey = (id) => { if (window.confirm(t('confirmDelete'))) setApiKeys(prev => prev.filter(k => k.id !== id)); };
  const generateKey = () => {
    const t2 = 'fk_live_' + Math.random().toString(36).substr(2, 8) + '...' + Math.random().toString(36).substr(2, 3);
    setApiKeys(prev => [...prev, { id: Date.now(), name: 'New Key', token: t2, created: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) }]);
  };

  const Toggle = ({ value, onChange }) => (
    <div 
      onClick={onChange} 
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-tesla-border transition-all duration-300 ease-in-out focus:outline-none ${value ? 'bg-tesla-text' : 'bg-tesla-elevated'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-soft ring-0 transition-all duration-300 ease-in-out ${value ? 'translate-x-[22px]' : 'translate-x-0.5'} mt-[1.5px]`} />
    </div>
  );

  const inputCls = 'block w-full rounded-xl border border-input py-2.5 px-4 text-foreground shadow-sm focus:border-primary focus:ring-0 text-[13px] bg-muted/30 transition-all placeholder:text-muted-foreground/40 font-light';
  const saveBtn = <button className="rounded-full bg-primary px-8 py-2.5 text-[11px] font-medium text-primary-foreground shadow-lg hover:brightness-110 transition-all uppercase tracking-widest">{t('saveChanges')}</button>;

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 animate-in fade-in duration-700">
      <div className="mb-8 px-4">
        <h2 className="text-3xl font-light text-tesla-text tracking-tight uppercase">{t('settings')}</h2>
        <p className="mt-2 text-[13px] font-light text-tesla-muted">{t('settingsDesc') || 'Beheer uw accountinstellingen, team en integraties.'}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0 px-4">
          <nav className="space-y-1.5">
            {tabs.map((tab) => (
              <button key={tab.name} onClick={() => handleTabChange(tab.name)}
                className={`w-full flex items-center px-5 py-3 text-[13px] font-medium rounded-xl transition-all duration-200 ${activeTab === tab.name ? 'bg-primary text-primary-foreground shadow-md' : 'bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
                <tab.icon className={`flex-shrink-0 mr-3 h-5 w-5 ${activeTab === tab.name ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span className="truncate uppercase tracking-widest">{t(tab.textKey)}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-tesla-surface rounded-2xl border border-tesla-border overflow-auto shadow-soft mx-4">

          {/* ===== PROFILE ===== */}
          {activeTab === 'Profile' && (
            <div className="p-10 space-y-12">
              <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest mb-10">{t('personalInformation')}</h3>
              <div className="flex items-center gap-10 border-b border-tesla-border pb-12">
                {avatar
                  ? <img src={avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover border border-tesla-border shadow-soft" />
                  : <div className="h-24 w-24 rounded-full bg-tesla-elevated flex items-center justify-center text-tesla-text text-2xl font-light border border-tesla-border shadow-soft">
                      {(firstName[0] || '')+(lastName[0] || '') || 'JD'}
                    </div>
                }
                <div className="flex flex-col gap-3">
                  <label className="relative cursor-pointer">
                    <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleAvatarUpload} className="sr-only" />
                    <span className="bg-tesla-elevated px-6 py-2.5 border border-tesla-border text-[11px] font-normal text-tesla-text hover:bg-tesla-border transition-colors rounded-full inline-block shadow-soft uppercase tracking-widest">{t('changeAvatar')}</span>
                  </label>
                  <p className="text-[10px] font-light text-tesla-muted uppercase tracking-widest">JPG, GIF of PNG. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10 max-w-3xl">
                <div><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('firstName')}</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} /></div>
                <div><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('lastName')}</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} /></div>
                <div className="sm:col-span-2"><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('emailAddress')}</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></div>
              </div>
              <div className="mt-12 pt-8 border-t border-border flex justify-end">
                <button onClick={handleSaveProfile} className="rounded-full bg-primary px-10 py-3 text-[11px] font-medium text-primary-foreground shadow-lg hover:brightness-110 transition-all uppercase tracking-widest">
                  {t('saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* ===== COMPANY DETAILS ===== */}
          {activeTab === 'Company Details' && (
            <div className="p-10 space-y-12">
              <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest mb-10">{t('tabCompanyDetails')}</h3>
              <div className="flex items-center gap-10 border-b border-tesla-border pb-12">
                {appConfig.logoUrl
                  ? <div className="h-24 w-auto max-w-[240px] flex items-center justify-center p-4 bg-white rounded-2xl border border-tesla-border shadow-soft"><img src={appConfig.logoUrl} alt="Logo" className="h-full object-contain" /></div>
                  : <div className="h-24 w-24 rounded-2xl bg-tesla-elevated flex items-center justify-center text-tesla-muted border border-tesla-border border-dashed text-[11px] font-normal uppercase tracking-widest italic">{t('noLogo') || 'Geen Logo'}</div>
                }
                <div className="flex flex-col gap-3">
                  <label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest pl-1">{t('logoUploadField') || 'Bedrijfslogo'}</label>
                  <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload}
                    className="block w-full text-[11px] text-tesla-muted file:mr-6 file:py-2.5 file:px-6 file:rounded-full file:border file:border-tesla-border file:text-[11px] file:font-normal file:uppercase file:tracking-widest file:bg-tesla-elevated file:text-tesla-text hover:file:bg-tesla-border cursor-pointer transition-all shadow-soft" />
                  <p className="text-[10px] font-light text-tesla-muted uppercase tracking-widest">{t('logoUploadHelp') || 'PNG, JPG of SVG. Max 2MB.'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-10 max-w-3xl">
                <div className="sm:col-span-2"><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('companyNameField')}</label><input type="text" value={appConfig.companyName} onChange={(e) => updateAppConfig({ companyName: e.target.value })} className={inputCls} /></div>
                <div className="sm:col-span-2"><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('websiteUrlField')}</label><input type="text" value={appConfig.website} onChange={(e) => updateAppConfig({ website: e.target.value })} placeholder="www.mycompany.com" className={inputCls} /></div>
                <div className="sm:col-span-2"><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('addressField')}</label><input type="text" value={appConfig.address || ''} onChange={(e) => updateAppConfig({ address: e.target.value })} placeholder={t('addressPlaceholder')} className={inputCls} /></div>
                <div><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('phoneField')}</label><input type="text" value={appConfig.phone || ''} onChange={(e) => updateAppConfig({ phone: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('vatField')}</label><input type="text" value={appConfig.vat || ''} onChange={(e) => updateAppConfig({ vat: e.target.value })} className={inputCls} /></div>
                <div className="sm:col-span-2"><label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('kvkField')}</label><input type="text" value={appConfig.kvk || ''} onChange={(e) => updateAppConfig({ kvk: e.target.value })} className={inputCls} /></div>
              </div>
              <div className="mt-12 pt-8 border-t border-tesla-border flex justify-end">{saveBtn}</div>
            </div>
          )}

          {/* ===== TEAM MEMBERS ===== */}
          {activeTab === 'Team Members' && (
            <div className="p-10 space-y-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('teamMembers')}</h3>
                  <p className="text-[10px] font-light text-tesla-muted mt-2 uppercase tracking-widest">{t('manageTeamDescription')}</p>
                </div>
                <button onClick={() => setShowInvite(true)} className="rounded-full bg-tesla-text px-6 py-2.5 text-[11px] font-normal uppercase tracking-widest text-tesla-bg shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" /> {t('addMember')}
                </button>
              </div>

              {showInvite && (
                <div className="mb-10 p-8 bg-tesla-elevated rounded-2xl border border-tesla-border shadow-soft animate-in slide-in-from-top-4 duration-500">
                  <h4 className="text-[12px] font-normal text-tesla-text uppercase tracking-widest mb-6">{t('invite') || 'Nieuw Lid Uitnodigen'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">Naam</label>
                      <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder={t('firstName') + ' ' + t('lastName')} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">E-mail</label>
                      <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder={t('emailAddress')} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">Rol</label>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className={inputCls}>
                        <option value="viewer">{t('viewer')}</option>
                        <option value="admin">{t('admin')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button onClick={handleAddMember} className="rounded-full bg-tesla-text px-8 py-2.5 text-[11px] font-normal text-tesla-bg shadow-lg hover:brightness-110 transition-all uppercase tracking-widest">{t('invite')}</button>
                    <button onClick={() => setShowInvite(false)} className="rounded-full bg-tesla-surface border border-tesla-border px-8 py-2.5 text-[11px] font-normal text-tesla-muted hover:text-tesla-text shadow-soft transition-all uppercase tracking-widest">{t('cancel')}</button>
                  </div>
                </div>
              )}

              <div className="border border-tesla-border rounded-2xl overflow-hidden bg-tesla-surface shadow-soft">
                <table className="min-w-full divide-y divide-tesla-border">
                  <thead className="bg-tesla-elevated">
                    <tr>
                      <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('name')}</th>
                      <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('emailAddress')}</th>
                      <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('role')}</th>
                      <th className="py-4 px-8 text-right text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tesla-border bg-tesla-surface">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-tesla-elevated transition-colors border-b border-tesla-border last:border-0">
                        <td className="py-5 px-8 text-[13px] font-normal text-tesla-text uppercase tracking-tight">{member.name}</td>
                        <td className="py-5 px-8 text-[13px] font-light text-tesla-muted tracking-tight">{member.email}</td>
                        <td className="py-5 px-8 text-[13px]">
                          {member.isOwner
                            ? <span className="inline-flex items-center rounded-lg bg-tesla-text/5 px-3 py-1 text-[10px] font-normal text-tesla-text border border-tesla-border uppercase tracking-widest">Eigenaar</span>
                            : <select value={member.role} onChange={e => setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: e.target.value } : m))} className="text-[12px] font-normal bg-tesla-elevated border-tesla-border rounded-lg py-1.5 pl-3 pr-8 text-tesla-text focus:ring-1 focus:ring-tesla-blue focus:border-tesla-blue transition-all appearance-none cursor-pointer uppercase tracking-widest">
                                <option value="viewer">{t('viewer')}</option>
                                <option value="admin">{t('admin')}</option>
                              </select>
                          }
                        </td>
                        <td className="py-5 px-8 text-[13px] text-right">
                          {!member.isOwner && <button onClick={() => setTeamMembers(prev => prev.filter(m => m.id !== member.id))} className="text-tesla-muted hover:text-tesla-blue transition-all inline-flex items-center gap-2 font-normal text-[11px] uppercase tracking-widest"><TrashIcon className="h-4 w-4" /> {t('delete') || 'Verwijderen'}</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeTab === 'Notifications' && (
            <div className="p-10 space-y-12">
              <div className="mb-10">
                <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('notificationsSettings')}</h3>
                <p className="text-[10px] font-light text-tesla-muted mt-2 uppercase tracking-widest">{t('notificationsDesc')}</p>
              </div>
              <div className="space-y-6 max-w-3xl bg-tesla-elevated p-10 rounded-2xl border border-tesla-border shadow-soft">
                {[
                  { key: 'emailOpens', label: t('emailOpens'), desc: 'Ontvang een browser-melding wanneer een lead uw e-mail opent' },
                  { key: 'emailClicks', label: t('emailClicks'), desc: 'Ontvang een melding wanneer er op een link in een e-mail wordt geklikt' },
                  { key: 'realTimeAlerts', label: t('realTimeAlerts'), desc: 'Pushmeldingen voor actieve prospects' },
                  { key: 'weeklyReports', label: t('weeklyReports'), desc: 'Ontvang elke vrijdag om 16:00 uur een samenvattende e-mail', noSound: true },
                ].map((item) => (
                  <div key={item.key} className="flex flex-col sm:flex-row sm:items-start justify-between py-5 border-b border-tesla-border last:border-0 gap-6">
                    <div className="flex-1">
                      <span className="block text-[13px] font-normal text-tesla-text uppercase tracking-widest">{item.label}</span>
                      <span className="block text-[11px] font-light text-tesla-muted mt-2 leading-relaxed">{item.desc}</span>
                      {!item.noSound && notif[item.key] && (
                        <div className="mt-6 flex items-center gap-6 animate-in fade-in slide-in-from-left-2 duration-400">
                          <select value={notifSound[item.key]} onChange={e => setNotifSound(p => ({ ...p, [item.key]: e.target.value }))}
                            className="text-[11px] font-normal bg-tesla-surface border-tesla-border rounded-lg py-1.5 pl-3 pr-8 text-tesla-text focus:ring-1 focus:ring-tesla-blue focus:border-tesla-blue transition-all appearance-none cursor-pointer uppercase tracking-widest">
                            <option value="Ping">🔔 Pin</option>
                            <option value="Chime">🎵 Chime</option>
                            <option value="Pop">💬 Pop</option>
                          </select>
                          <button onClick={() => playSound(notifSound[item.key])} className="text-[10px] font-normal text-tesla-blue hover:text-tesla-text transition-all uppercase tracking-widest flex items-center gap-1">
                            <span className="text-[12px]">▶</span> Preview
                          </button>
                        </div>
                      )}
                    </div>
                    <Toggle value={notif[item.key]} onChange={() => setNotif(p => ({ ...p, [item.key]: !p[item.key] }))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== LEAD MANAGEMENT ===== */}
          {activeTab === 'Lead Management' && (
            <div className="p-10 space-y-12">
              <div className="mb-10">
                <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('leadManagementOptions')}</h3>
                <p className="text-[10px] font-light text-tesla-muted mt-2 uppercase tracking-widest">{t('leadManagementOptionsDesc') || 'Beheer hier de labels en fases voor uw klantcontacten.'}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Sectors */}
                <div className="border border-tesla-border rounded-2xl p-8 bg-tesla-elevated shadow-soft">
                  <h4 className="text-[11px] font-normal text-tesla-text uppercase tracking-widest mb-6">{t('customSectors') || 'Aangepaste Sectoren'}</h4>
                  <div className="flex flex-wrap gap-2.5 mb-8 min-h-[40px]">
                    {sectors.map(sec => (
                      <span key={sec} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[11px] font-normal text-tesla-text border border-tesla-border shadow-soft uppercase tracking-tight">
                        {sec}
                        <button onClick={() => setSectors(p => p.filter(s => s !== sec))} className="text-tesla-muted hover:text-tesla-blue transition-all font-light text-lg ml-1">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <input value={newSector} onChange={e => setNewSector(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setSectors(p => newSector.trim() ? [...p, newSector.trim()] : p), setNewSector(''))}
                      placeholder="Nieuwe sector..." className="flex-1 rounded-xl border border-tesla-border py-2 px-4 text-[13px] font-light text-tesla-text shadow-soft focus:border-tesla-blue focus:ring-0 bg-white" />
                    <button onClick={() => { if (newSector.trim()) { setSectors(p => [...p, newSector.trim()]); setNewSector(''); } }}
                      className="rounded-xl bg-tesla-text text-tesla-bg px-4 py-2 hover:brightness-110 transition-all shadow-lg"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                </div>

                {/* Statuses */}
                <div className="border border-tesla-border rounded-2xl p-8 bg-tesla-elevated shadow-soft">
                  <h4 className="text-[11px] font-normal text-tesla-text uppercase tracking-widest mb-6">{t('customStatuses') || 'Aangepaste Statussen'}</h4>
                  <div className="flex flex-wrap gap-2.5 mb-8 min-h-[40px]">
                    {statuses.map((st, i) => (
                      <span key={st} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[11px] font-normal text-tesla-text border border-tesla-border shadow-soft uppercase tracking-tight">
                        {st}
                        <button onClick={() => setStatuses(p => p.filter(s => s !== st))} className="text-tesla-muted hover:text-tesla-blue transition-all font-light text-lg ml-1">&times;</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <input value={newStatus} onChange={e => setNewStatus(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setStatuses(p => newStatus.trim() ? [...p, newStatus.trim()] : p), setNewStatus(''))}
                      placeholder="Nieuwe status..." className="flex-1 rounded-xl border border-tesla-border py-2 px-4 text-[13px] font-light text-tesla-text shadow-soft focus:border-tesla-blue focus:ring-0 bg-white" />
                    <button onClick={() => { if (newStatus.trim()) { setStatuses(p => [...p, newStatus.trim()]); setNewStatus(''); } }}
                      className="rounded-xl bg-tesla-text text-tesla-bg px-4 py-2 hover:brightness-110 transition-all shadow-lg"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== BILLING & USAGE ===== */}
          {activeTab === 'Billing & Usage' && (
            <div className="p-10 space-y-12">
              <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest mb-10">{t('billing')}</h3>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {plans.map(plan => {
                  const isActive = activePlan === plan.name;
                  const isEnterprise = plan.name === 'Enterprise';
                  return (
                    <div key={plan.name} className={`rounded-2xl p-8 flex flex-col border transition-all duration-300 ${isActive ? 'border-tesla-text bg-tesla-elevated shadow-soft scale-[1.02]' : 'border-tesla-border bg-tesla-surface shadow-soft hover:border-tesla-muted'} group`}>
                      {isActive && <div className="text-center -mt-12 mb-6"><span className="bg-tesla-text text-tesla-bg text-[10px] font-normal uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Huidig Plan</span></div>}
                      <h5 className="font-normal text-[13px] text-tesla-text uppercase tracking-widest">{plan.name}</h5>
                      <div className="text-3xl font-light text-tesla-text mt-4 mb-8 tracking-tight">€{plan.price}<span className="text-[13px] font-light text-tesla-muted ml-1 lowercase">/mnd</span></div>
                      <ul className="text-[12px] space-y-4 mb-10 flex-1 text-tesla-muted font-light leading-relaxed">
                        {plan.features.map(f => <li key={f} className="flex gap-3"><span className="text-tesla-text opacity-40">●</span> {f}</li>)}
                      </ul>
                      <button onClick={() => !isActive && openUpgradeModal(plan)}
                        className={`w-full py-3 text-[11px] font-normal rounded-xl transition-all uppercase tracking-widest ${isActive ? 'bg-tesla-elevated text-tesla-muted cursor-not-allowed border border-tesla-border' : 'bg-tesla-text text-tesla-bg hover:brightness-125 shadow-lg'}`}
                        disabled={isActive}>{isActive ? 'Actief' : `Kies ${plan.name}`}</button>
                    </div>
                  );
                })}
              </div>

              {/* Usage */}
              <div className="border border-tesla-border rounded-2xl p-10 bg-tesla-elevated shadow-soft mb-16">
                <h4 className="text-[11px] font-normal text-tesla-text uppercase tracking-widest mb-6">{t('currentUsage') || 'Huidig Verbruik'}</h4>
                <div className="flex justify-between text-[11px] text-tesla-muted mb-3 font-light uppercase tracking-widest"><span>{t('emailsSentThisMonth') || 'Verzonden e-mails deze maand'}</span><span className="text-tesla-text font-normal">1,450 / 10,000</span></div>
                <div className="w-full bg-white rounded-full h-1.5 overflow-hidden border border-tesla-border/50 shadow-inner"><div className="bg-tesla-text h-full rounded-full transition-all duration-1000" style={{ width: '14.5%' }}></div></div>
              </div>

              {/* Invoices */}
              <h4 className="text-[11px] font-normal text-tesla-text uppercase tracking-widest mb-6">{t('invoiceHistory') || 'Factuurgeschiedenis'}</h4>
              <div className="border border-tesla-border rounded-2xl overflow-hidden bg-tesla-surface shadow-soft">
                <table className="min-w-full divide-y divide-tesla-border">
                  <thead className="bg-tesla-elevated">
                    <tr>
                      <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('date')}</th>
                      <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('amount')}</th>
                      <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">Plan</th>
                      <th className="py-4 px-8 text-right text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tesla-border bg-tesla-surface">
                    {invoices.map((inv, i) => (
                      <tr key={i} className="hover:bg-tesla-elevated transition-colors">
                        <td className="py-5 px-8 text-sm font-semibold text-tesla-text">{inv.date}</td>
                        <td className="py-5 px-8 text-sm font-semibold text-tesla-text">{inv.amount}</td>
                        <td className="py-5 px-8 text-sm font-medium text-tesla-muted">{inv.plan}</td>
                        <td className="py-5 px-8 text-sm text-right flex items-center justify-end gap-5">
                          <span className="text-tesla-blue font-semibold text-xs border border-tesla-blue/20 bg-tesla-blue/5 px-2.5 py-1 rounded-full">{t('paid')}</span>
                          <button onClick={() => downloadInvoice(inv)} className="text-tesla-blue hover:brightness-125 text-xs font-semibold transition-all border-b border-tesla-blue/30">{t('downloadPdf')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== API & INTEGRATIONS ===== */}
          {activeTab === 'API & Integrations' && (
            <div className="p-10 space-y-16">
              {/* AI Integrations */}
              <div>
              <div className="mb-10">
                <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('aiIntegrations')}</h3>
                <p className="text-[10px] font-light text-tesla-muted mt-2 uppercase tracking-widest">{t('aiIntegrationsDesc')}</p>
              </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {[
                    { key: 'openai', label: 'OpenAI / ChatGPT', model: 'gpt-4o', color: '#10a37f', abbr: 'GPT', desc: 'Krachtige tekstgeneratie voor persoonlijke e-mailinhoud.', link: 'https://platform.openai.com/api-keys', ph: 'sk-...' },
                    { key: 'claude', label: 'Anthropic / Claude', model: 'claude-3-5-sonnet', color: '#c96442', abbr: 'CLD', desc: 'Geavanceerd taalmodel voor natuurlijke gesprekken.', link: 'https://console.anthropic.com/settings/keys', ph: 'sk-ant-...' },
                    { key: 'gemini', label: 'Google Gemini', model: 'gemini-2.0-flash', color: 'linear-gradient(135deg,#4285F4,#7c3aed)', abbr: 'GEM', desc: 'Snel en efficiënt model van Google voor bulkverwerking.', link: 'https://aistudio.google.com/app/apikey', ph: 'AIza...' },
                  ].map(ai => (
                    <div key={ai.key} className="border border-tesla-border rounded-2xl p-8 bg-tesla-elevated shadow-soft flex flex-col gap-6 transition-all hover:border-tesla-muted group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-soft" style={{ background: ai.color }}>{ai.abbr}</div>
                        <div>
                          <h4 className="font-normal text-tesla-text text-[13px] uppercase tracking-widest">{ai.label}</h4>
                          <span className="text-[10px] font-light text-tesla-muted uppercase tracking-widest">{ai.model}</span>
                        </div>
                        <span className={`ml-auto text-[9px] font-normal uppercase tracking-widest px-2 py-0.5 rounded-md border ${connectedAi[ai.key] ? 'text-tesla-text border-tesla-text/20 bg-white shadow-soft' : 'text-tesla-muted border-tesla-border bg-tesla-surface'}`}>
                          {connectedAi[ai.key] ? 'Gekoppeld' : 'Niet Gekoppeld'}
                        </span>
                      </div>
                      <p className="text-[11px] text-tesla-muted leading-relaxed font-light">{ai.desc}</p>
                      <input type="password" value={aiKeys[ai.key]} onChange={e => setAiKeys(prev => ({ ...prev, [ai.key]: e.target.value }))}
                        placeholder={ai.ph} className="block w-full rounded-xl border border-tesla-border py-2 px-4 shadow-soft focus:border-tesla-blue focus:ring-0 text-[11px] font-mono bg-white text-tesla-text" />
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-tesla-border/50">
                        <a href={ai.link} target="_blank" rel="noreferrer" className="text-[10px] text-tesla-muted font-normal hover:text-tesla-text transition-all uppercase tracking-widest border-b border-transparent hover:border-tesla-text">Sleutel ophalen</a>
                        <button onClick={() => connectedAi[ai.key] ? handleDisconnectAi(ai.key) : handleConnectAi(ai.key)} className={`rounded-full px-6 py-2 text-[10px] font-normal text-white shadow-lg transition-all uppercase tracking-widest ${connectedAi[ai.key] ? 'bg-tesla-muted hover:bg-tesla-blue' : 'bg-tesla-text hover:bg-tesla-blue'}`}>
                          {connectedAi[ai.key] ? 'Ontkoppelen' : 'Koppelen'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System API Keys */}
              <div>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h4 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('apiKeys')}</h4>
                    <p className="text-[10px] font-light text-tesla-muted mt-2 uppercase tracking-widest">{t('apiKeysDesc')}</p>
                  </div>
                  <button onClick={generateKey} className="bg-tesla-text text-tesla-bg px-8 py-3 rounded-full text-[11px] font-normal uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
                    {t('generateNewKey') || 'Nieuwe Sleutel'}
                  </button>
                </div>
                <div className="border border-tesla-border rounded-2xl overflow-hidden bg-tesla-surface shadow-soft">
                  <table className="min-w-full divide-y divide-tesla-border">
                    <thead className="bg-tesla-elevated">
                      <tr>
                        <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('name')}</th>
                        <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('tokenPreview')}</th>
                        <th className="py-4 px-8 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('created')}</th>
                        <th className="py-4 px-8 text-right text-[10px] font-normal text-tesla-muted uppercase tracking-widest">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tesla-border bg-tesla-surface">
                      {apiKeys.map(k => (
                        <tr key={k.id} className="hover:bg-tesla-elevated transition-colors border-b border-tesla-border last:border-0">
                          <td className="py-5 px-8 text-[13px] font-normal text-tesla-text uppercase tracking-tight">{k.name}</td>
                          <td className="py-5 px-8 text-[13px] text-tesla-muted font-mono">{k.token}</td>
                          <td className="py-5 px-8 text-[13px] text-tesla-muted font-light">{k.created}</td>
                          <td className="py-5 px-8 text-[13px] text-right">
                            <button onClick={() => revokeKey(k.id)} className="text-tesla-muted hover:text-tesla-blue font-normal text-[11px] uppercase tracking-widest transition-all">{t('revoke') || 'Intrekken'}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== DATA MANAGEMENT ===== */}
          {activeTab === 'Data Management' && (
            <div className="p-10 space-y-12">
              <div className="mb-10">
                <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('tabDataManagement')}</h3>
                <p className="text-[10px] font-light text-tesla-muted mt-2 uppercase tracking-widest">{t('dataExportDesc')}</p>
              </div>
              
              <div className="bg-tesla-elevated rounded-2xl border border-tesla-border p-16 flex flex-col items-center text-center shadow-soft">
                <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mb-10 border border-tesla-border shadow-soft">
                  <CloudArrowDownIcon className="h-10 w-10 text-tesla-text" />
                </div>
                <h4 className="text-xl font-light text-tesla-text mb-4 uppercase tracking-widest">Systeem Back-up</h4>
                <p className="text-[13px] font-light text-tesla-muted max-w-md mb-12 leading-relaxed">
                  Download een volledige snapshot van uw CRM, inclusief alle {leads.length} leads, {campaigns.length} campagnes en uw systeemconfiguratie.
                </p>
                <button 
                  onClick={handleGlobalBackup}
                  className="rounded-full bg-tesla-text px-12 py-4 text-[11px] font-normal text-tesla-bg shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all uppercase tracking-widest"
                >
                  Genereer Back-up (.json)
                </button>
                <div className="mt-16 flex flex-wrap justify-center gap-10 text-[9px] font-normal text-tesla-muted uppercase tracking-widest">
                  <span className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-tesla-text opacity-40" /> AES-256 Beveiligd</span>
                  <span className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-tesla-text opacity-40" /> JSON Formaat</span>
                  <span className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-tesla-text opacity-40" /> Offline Toegang</span>
                </div>
              </div>

              <div className="mt-16">
                <h4 className="text-[11px] font-normal text-tesla-text uppercase tracking-widest mb-6">Exportgeschiedenis</h4>
                <div className="border border-tesla-border rounded-2xl p-10 bg-tesla-elevated flex items-center justify-between opacity-80 border-dashed">
                    <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-tesla-border shadow-soft">
                            <DocumentTextIcon className="h-6 w-6 text-tesla-muted opacity-40" />
                        </div>
                        <span className="text-[11px] font-light text-tesla-muted uppercase tracking-widest italic">Geen recente exports gevonden.</span>
                    </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ===== iDEAL PAYMENT MODAL ===== */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => !payProcessing && setPaymentModal(null)}>
          <div className="bg-tesla-surface rounded-2xl border border-tesla-border shadow-soft w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Success state */}
            {payStep === 'success' && (
              <div className="p-16 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-tesla-text/5 flex items-center justify-center mx-auto mb-10 border border-tesla-border shadow-soft">
                  <CheckCircleIcon className="h-12 w-12 text-tesla-text" />
                </div>
                <h3 className="text-2xl font-light text-tesla-text mb-4 uppercase tracking-widest">Betaling geslaagd!</h3>
                <p className="text-[13px] font-light text-tesla-muted leading-relaxed">Je account wordt bijgewerkt naar <strong>{paymentModal?.name}</strong>...</p>
                <div className="mt-12 w-full bg-tesla-elevated rounded-full h-1 overflow-hidden border border-tesla-border/30">
                  <div className="bg-tesla-text h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}

            {/* Select method */}
            {payStep === 'select' && (
              <>
                <div className="bg-tesla-elevated px-10 py-10 text-tesla-text relative border-b border-tesla-border">
                  <button onClick={() => setPaymentModal(null)} className="absolute top-8 right-8 text-tesla-muted hover:text-tesla-text transition-all p-2 rounded-full hover:bg-white shadow-soft">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <div>
                    <p className="text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-2">Upgrade naar</p>
                    <h3 className="text-2xl font-light tracking-widest uppercase">{paymentModal.name} Plan</h3>
                    <p className="text-3xl font-light mt-4 tracking-tight text-tesla-text">€{paymentModal.price}<span className="text-[14px] font-light text-tesla-muted ml-2 lowercase">/maand</span></p>
                  </div>
                </div>

                {/* Method selector horizontal scroll */}
                <div className="flex overflow-x-auto hide-scrollbar px-10 pt-4 gap-8 border-b border-tesla-border bg-white">
                  {[
                    { id: 'ideal', label: 'iDEAL', icon: '🏦' },
                    { id: 'card', label: 'Credit Card', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { id: 'applepay', label: 'Apple Pay', icon: '' }
                  ].map(method => (
                    <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`pb-4 text-[11px] font-normal uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${paymentMethod === method.id ? 'border-tesla-text text-tesla-text' : 'border-transparent text-tesla-muted hover:text-tesla-text'}`}>
                      <span className="mr-2 opacity-60">{method.icon}</span> {method.label}
                    </button>
                  ))}
                </div>

                <div className="p-8 h-64 overflow-y-auto">
                  {/* iDEAL */}
                  {paymentMethod === 'ideal' && (
                    <div className="animate-in fade-in duration-400">
                      <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-6 pl-1">Kies je bank</label>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        {idealBanks.map(bank => (
                          <button key={bank} onClick={() => setSelectedBank(bank)}
                            className={`py-4 px-6 rounded-xl border transition-all text-[12px] font-normal uppercase tracking-widest ${selectedBank === bank ? 'border-tesla-text bg-tesla-elevated text-tesla-text shadow-soft' : 'border-tesla-border text-tesla-muted hover:border-tesla-muted bg-white'}`}>
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credit Card */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-6 animate-in fade-in duration-400">
                       <div><label className="block text-[10px] font-normal text-tesla-muted mb-2 pl-1 uppercase tracking-widest">{t('cardNumber') || 'Card Number'}</label><input type="text" placeholder="0000 0000 0000 0000" className={inputCls} /></div>
                       <div className="grid grid-cols-2 gap-6">
                         <div><label className="block text-[10px] font-normal text-tesla-muted mb-2 pl-1 uppercase tracking-widest">{t('expiryDate') || 'Expiry (MM/YY)'}</label><input type="text" placeholder="12/26" className={inputCls} /></div>
                         <div><label className="block text-[10px] font-normal text-tesla-muted mb-2 pl-1 uppercase tracking-widest">CVC</label><input type="text" placeholder="123" className={inputCls} /></div>
                       </div>
                       <div><label className="block text-[10px] font-normal text-tesla-muted mb-2 pl-1 uppercase tracking-widest">{t('cardHolder') || 'Cardholder Name'}</label><input type="text" placeholder="John Doe" className={inputCls} /></div>
                    </div>
                  )}

                  {/* PayPal */}
                  {paymentMethod === 'paypal' && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 mb-4 rounded-full bg-tesla-elevated flex items-center justify-center text-4xl shadow-sm border border-tesla-border">🅿️</div>
                      <h4 className="font-bold text-tesla-text">Pasarela de PayPal</h4>
                      <p className="text-sm text-tesla-muted mt-2 leading-relaxed">Serás redirigido a PayPal para iniciar sesión de forma segura y completar el pago.</p>
                    </div>
                  )}

                  {/* Apple Pay */}
                  {paymentMethod === 'applepay' && (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 mb-4 rounded-full bg-black flex items-center justify-center text-white text-4xl shadow-sm"></div>
                      <h4 className="font-bold text-tesla-text">Apple Pay</h4>
                      <p className="text-sm text-tesla-muted mt-2 leading-relaxed">Usa el dispositivo móvil o Safari para autenticar rápidamente sin introducir datos.</p>
                    </div>
                  )}
                </div>

                <div className="p-10 pt-4 flex gap-6">
                  <button onClick={() => setPaymentModal(null)} className="flex-1 py-4 border border-tesla-border rounded-full text-[11px] font-normal uppercase tracking-widest text-tesla-muted hover:text-tesla-text hover:bg-tesla-elevated transition-all">Annuleren</button>
                  <button onClick={handlePayConfirm} disabled={paymentMethod === 'ideal' && !selectedBank}
                    className={`flex-1 py-4 rounded-full text-[11px] font-normal uppercase tracking-widest text-tesla-bg shadow-lg transition-all ${(paymentMethod !== 'ideal' || selectedBank) ? 'bg-tesla-text hover:brightness-110' : 'bg-tesla-elevated text-tesla-muted cursor-not-allowed border border-tesla-border'}`}>
                    {paymentMethod === 'ideal' || paymentMethod === 'card' ? 'Verder →' : `Betaal met ${paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}`}
                  </button>
                </div>
              </>
            )}

            {/* Confirm payment */}
            {payStep === 'confirm' && (
              <div className="p-10 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 bg-tesla-text/5 border border-tesla-border rounded-full px-6 py-2 mb-6 shadow-soft">
                    <span className="text-[10px] font-normal uppercase tracking-widest text-tesla-text">
                      {paymentMethod === 'ideal' && `🏦 iDEAL — ${selectedBank}`}
                      {paymentMethod === 'card' && `💳 Credit Card`}
                      {paymentMethod === 'paypal' && `🅿️ PayPal Checkout`}
                      {paymentMethod === 'applepay' && ` Apple Pay`}
                    </span>
                  </div>
                  <h3 className="text-2xl font-light text-tesla-text uppercase tracking-widest">Bevestig betaling</h3>
                  <p className="text-tesla-muted text-[11px] mt-3 uppercase tracking-widest font-light">U wordt doorgestuurd om de betaling af te ronden.</p>
                </div>

                <div className="bg-tesla-elevated rounded-2xl p-8 mb-10 space-y-6 shadow-soft border border-tesla-border">
                  <div className="flex justify-between text-[13px] uppercase tracking-widest font-light"><span className="text-tesla-muted">{paymentModal.name} Plan</span><span className="font-normal text-tesla-text">€{paymentModal.price},00</span></div>
                  <div className="flex justify-between text-[13px] uppercase tracking-widest font-light"><span className="text-tesla-muted">BTW (21%)</span><span className="font-normal text-tesla-text">€{(paymentModal.price * 0.21).toFixed(2)}</span></div>
                  <div className="border-t border-tesla-border pt-6 flex justify-between text-xl font-light uppercase tracking-widest"><span>Totaal</span><span className="text-tesla-text font-normal">€{(paymentModal.price * 1.21).toFixed(2)}</span></div>
                </div>

                <div className="bg-tesla-text/5 border border-tesla-border rounded-xl p-5 mb-10 text-[9px] text-tesla-muted text-center font-normal uppercase tracking-widest leading-relaxed">
                  🔒 Versleuteld en beveiligd via AES-256 Stripe/Mollie netwerk.
                </div>

                {payError && (
                  <div className="bg-tesla-blue/5 border border-tesla-blue/20 rounded-xl p-5 mb-8 text-[11px] text-tesla-blue font-normal text-center uppercase tracking-widest animate-pulse">
                    ⚠️ {payError}
                  </div>
                )}

                <button onClick={handlePayNow} disabled={payProcessing}
                  className="w-full py-5 bg-tesla-text text-tesla-bg rounded-full font-normal text-[13px] hover:brightness-110 transition-all shadow-xl disabled:opacity-70 flex items-center justify-center gap-4 uppercase tracking-widest"
                >
                  {payProcessing ? (
                    <><span className="animate-spin inline-block h-4 w-4 border-2 border-tesla-bg border-t-transparent rounded-full"></span> Verwerken...</>
                  ) : `Nu Betalen →`}
                </button>
                <button onClick={() => setPayStep('select')} className="w-full mt-6 py-2 text-[11px] font-normal text-tesla-muted hover:text-tesla-text transition-colors uppercase tracking-widest">← Terug naar methodes</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
