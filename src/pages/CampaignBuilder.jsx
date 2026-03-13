import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCampaigns } from '../context/CampaignsContext';
import { useLeads } from '../context/LeadsContext';
import { useLanguage } from '../context/LanguageContext';
import { PREMIUM_TEMPLATES } from '../data/EmailTemplates';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CodeBracketIcon,
  CalendarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { 
  SparklesIcon as SparklesSolid,
  PhotoIcon,
  RectangleStackIcon,
  GlobeAltIcon
} from '@heroicons/react/24/solid';
import { 
  XMarkIcon as XIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';

const getTemplates = (appConfig) => {
  const logoUrl = '/images/email/logo.png';
  const dashboardUrl = '/images/email/dashboard.png';
  const fleetMapUrl = '/images/email/fleet_map.png';

  return {
    blank: `<div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #171A20; line-height: 1.6;">
      <p style="font-weight: 300;">Beste {{companyName}},</p>
      <br/>
      <p style="font-weight: 300;">Typ hier uw bericht...</p>
      <br/><br/>
      <div style="font-size: 11px; color: #8E8E93; border-top: 1px solid #F0F2F5; padding-top: 24px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.05em;">
        U ontvangt dit bericht van ${appConfig?.companyName || "FleetTrack Holland"}.<br>✉️ <a href="mailto:sales@fleettrackholland.nl" style="color: #3b82f6; text-decoration: none;">sales@fleettrackholland.nl</a> · 🌐 <a href="https://www.fleettrackholland.nl" style="color: #3b82f6; text-decoration: none;">fleettrackholland.nl</a><br><a href="{{unsubscribeUrl}}" style="color: #171A20; text-decoration: underline;">Afmelden</a>
      </div>
    </div>`,
    
    intro: `<div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #F0F2F5; border-radius: 24px; overflow: hidden; color: #171A20; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
      <div style="background-color: #F8F9FA; padding: 40px; text-align: center; border-bottom: 1px solid #F0F2F5;">
        <img src="${logoUrl}" alt="FleetTrack" style="height: 48px; width: auto;" />
      </div>
      <div style="padding: 50px 40px;">
        <h1 style="font-size: 28px; font-weight: 200; letter-spacing: -0.01em; margin-bottom: 28px; color: #171A20; line-height: 1.2;">Maak uw wagenpark <span style="font-weight: 400;">slimmer</span></h1>
        <p style="font-size: 16px; font-weight: 300; line-height: 1.7; margin-bottom: 20px;">Beste {{companyName}},</p>
        <p style="font-size: 16px; font-weight: 300; line-height: 1.7; margin-bottom: 20px;">Mijn naam is {{senderName}} van <strong>FleetTrack Holland</strong>. Ik zag uw activiteiten in de {{sector}} sector en wilde graag kort laten zien hoe wij vergelijkbare bedrijven helpen om hun operationele processen te stroomlijnen.</p>
        
        <div style="margin: 40px 0; border-radius: 16px; overflow: hidden; border: 1px solid #F0F2F5;">
          <img src="${dashboardUrl}" alt="Dashboard" style="width: 100%; display: block;" />
        </div>

        <p style="font-size: 16px; font-weight: 300; line-height: 1.7; margin-bottom: 32px;">Wij bieden 100% Belastingdienst-proof ritregistratie ve real-time tracking die zichzelf binnen enkele maanden terugverdient.</p>
        
        <div style="text-align: left; margin-bottom: 40px;">
          <a href="https://www.fleettrackholland.nl" style="display: inline-block; background-color: #171A20; color: #ffffff; padding: 16px 36px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; shadow: 0 4px 15px rgba(0,0,0,0.1);">Ontdek de mogelijkheden</a>
        </div>
        
        <p style="font-size: 14px; font-weight: 300; color: #8E8E93; margin-bottom: 0;">Met vriendelijke groet,</p>
        <p style="font-size: 14px; font-weight: 400; margin-top: 6px; letter-spacing: 0.02em;">{{senderName}}</p>
      </div>
      <div style="background-color: #F8F9FA; padding: 32px; text-align: center; font-size: 10px; color: #8E8E93; border-top: 1px solid #F0F2F5; text-transform: uppercase; letter-spacing: 0.1em;">
        <p style="margin: 0;">FleetTrack Holland &bull; Amsterdam, NL &bull; <a href="mailto:sales@fleettrackholland.nl" style="color: #3b82f6; text-decoration: none;">sales@fleettrackholland.nl</a> &bull; <a href="https://www.fleettrackholland.nl" style="color: #3b82f6; text-decoration: none;">fleettrackholland.nl</a></p>
        <p style="margin: 12px 0 0 0;"><a href="{{unsubscribeUrl}}" style="color: #171A20; text-decoration: underline;">Uitschrijven van deze lijst</a></p>
      </div>
    </div>`,
    
    partnership: `<div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #171A20; background-color: #ffffff; border-radius: 24px; border: 1px solid #F0F2F5; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
      <div style="position: relative;">
        <img src="${fleetMapUrl}" alt="FleetTrack Tracking" style="width: 100%; display: block;" />
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0)); height: 80px;"></div>
      </div>
      <div style="padding: 0 48px 48px 48px;">
        <h2 style="font-size: 32px; font-weight: 200; letter-spacing: -0.02em; margin-bottom: 24px; color: #171A20; line-height: 1.1;">Strategische <span style="font-weight: 400;">samenwerking</span></h2>
        <p style="font-size: 16px; font-weight: 300; line-height: 1.8; margin-bottom: 24px;">Beste {{companyName}},</p>
        <p style="font-size: 16px; font-weight: 300; line-height: 1.8; margin-bottom: 24px;">Mijn oog viel op uw bedrijfsvoering binnen de <strong>{{sector}} sector</strong>. Bij FleetTrack Holland geloven we dat er sterke raakvlakken zijn voor een waardevolle, technologische samenwerking.</p>
        <p style="font-size: 16px; font-weight: 300; line-height: 1.8; margin-bottom: 40px;">Zullen we volgende week een kort digitaal koffiemomentje inplannen van 10 minuten om de synergie te verkennen?</p>
        
        <div style="border-left: 2px solid #171A20; padding-left: 24px; margin-bottom: 40px;">
          <p style="font-style: italic; color: #4B5563; font-weight: 300; font-size: 18px; line-height: 1.6;">"FleetTrack heeft onze operationele administratie met 80% verminderd."</p>
          <p style="font-size: 12px; color: #8E8E93; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.1em;">— Logistiek Manager, Rotterdam</p>
        </div>
        
        <div style="text-align: center; background-color: #F8F9FA; padding: 24px; border-radius: 16px; border: 1px solid #F0F2F5;">
          <p style="font-size: 14px; font-weight: 400; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em;">Beschikbaarheid opvragen</p>
          <a href="https://calendly.com/fleettrack" style="display: inline-block; background-color: #171A20; color: #ffffff; padding: 12px 32px; border-radius: 100px; text-decoration: none; font-size: 12px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em;">Plan gesprek →</a>
        </div>
      </div>
    </div>`,
    
    offer: `<div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; padding: 60px 40px; border-radius: 32px; text-align: center; color: #ffffff;">
      <div style="margin-bottom: 40px;">
        <img src="${logoUrl}" alt="Logo" style="height: 32px; filter: brightness(0) invert(1);" />
      </div>
      <h2 style="font-size: 36px; font-weight: 200; letter-spacing: -0.03em; margin-bottom: 20px; line-height: 1.1;">Exclusief aanbod voor <span style="border-bottom: 1px solid rgba(255,255,255,0.3);">{{sector}}</span></h2>
      <p style="font-size: 17px; font-weight: 300; color: rgba(255,255,255,0.7); margin-bottom: 48px; line-height: 1.6;">Speciaal voor nieuwe relaties bieden wij tijdelijk gratis installatie ve 3 maanden service aan op onze Pro-systemen.</p>
      
      <div style="background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 48px; margin-bottom: 48px; backdrop-filter: blur(10px);">
        <p style="font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.5); margin-bottom: 12px;">Totaal Voordeel</p>
        <p style="font-size: 56px; font-weight: 200; margin: 0; letter-spacing: -0.02em;">&euro;349,00</p>
        <div style="margin-top: 24px; display: inline-block; padding: 4px 16px; background-color: rgba(255,255,255,1); color: #000000; border-radius: 100px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Code: FLEET2026</div>
      </div>
      
      <a href="https://www.fleettrackholland.nl/pro" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 18px 56px; border-radius: 100px; text-decoration: none; font-size: 15px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">Claim deze deal</a>
      
      <p style="font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 60px; text-transform: uppercase; letter-spacing: 0.05em;">Geldig tot eind deze maand &bull; <a href="mailto:sales@fleettrackholland.nl" style="color: rgba(255,255,255,0.6);">sales@fleettrackholland.nl</a> &bull; <a href="https://www.fleettrackholland.nl" style="color: rgba(255,255,255,0.6);">fleettrackholland.nl</a> &bull; <a href="{{unsubscribeUrl}}" style="color: rgba(255,255,255,0.4);">Afmelden</a></p>
    </div>`
  };
};

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const { sendCampaign, addCampaign, getCampaign, updateCampaign } = useCampaigns();
  const { leads, addActivity } = useLeads();
  const { t } = useLanguage();
  const { appConfig } = useApp();
  
  const templates = getTemplates(appConfig);
  
  const existingCampaign = editId ? getCampaign(editId) : null;
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    targetSectors: [],
    excludedLeads: [],
    content: templates?.blank || "",
    status: 'Draft',
    date: '',
    
    // Advanced Settings
    senderName: '',
    replyTo: '',
    trackOpens: true,
    trackClicks: true,
    abTest: false,
    followUpEnabled: false,
    followUpWait: '7 Days'
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [showHtml, setShowHtml] = useState(false);

  const storedUser = localStorage.getItem('user');
  const isDemo = storedUser ? JSON.parse(storedUser).isDemo : false;
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLeadIQ, setShowLeadIQ] = useState(false);
  const [selectedLeadForIQ, setSelectedLeadForIQ] = useState(null);

  const handleDemoRestriction = (e) => {
    e.preventDefault();
    alert('This action is restricted in Demo mode. Please upgrade to Pro to launch live campaigns.');
  };

  useEffect(() => {
    if (existingCampaign) {
      setFormData({
        name: existingCampaign.name,
        subject: existingCampaign.subject,
        targetSectors: existingCampaign.targetSectors || [],
        excludedLeads: existingCampaign.excludedLeads || [],
        content: existingCampaign.content,
        status: existingCampaign.status,
        date: '',
        senderName: existingCampaign.senderName || '',
        replyTo: existingCampaign.replyTo || '',
        trackOpens: existingCampaign.trackOpens ?? true,
        trackClicks: existingCampaign.trackClicks ?? true,
        abTest: existingCampaign.abTest ?? false,
        followUpEnabled: existingCampaign.followUpEnabled ?? false,
        followUpWait: existingCampaign.followUpWait || '7 Days'
      });
      if (existingCampaign.status === 'Scheduled') {
        setIsScheduling(true);
      }
    }
  }, [existingCampaign]);

  const uniqueSectors = [...new Set(leads.map(lead => lead.sector))].filter(Boolean);
  
  const targetLeads = leads.filter(l => {
    // If no sectors selected, everyone is targeted BY DEFAULT (unless excluded)
    // If sectors selected, only those sectors are included (minus excluded)
    const matchesSector = formData.targetSectors.length === 0 || formData.targetSectors.includes(l.sector);
    const isExcluded = formData.excludedLeads.includes(l.id);
    return matchesSector && !isExcluded;
  });

  const toggleSector = (sector) => {
    setFormData(prev => {
      const sectors = prev.targetSectors.includes(sector)
        ? prev.targetSectors.filter(s => s !== sector)
        : [...prev.targetSectors, sector];
      return { ...prev, targetSectors: sectors };
    });
  };

  const toggleLeadExclusion = (leadId) => {
    setFormData(prev => {
      const isExcluded = prev.excludedLeads.includes(leadId);
      const excluded = isExcluded
        ? prev.excludedLeads.filter(id => id !== leadId)
        : [...prev.excludedLeads, leadId];
      return { ...prev, excludedLeads: excluded };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = () => {
    const payload = {
      ...formData,
      status: 'Draft',
      date: '-',
    };
    if (editId) {
      updateCampaign(editId, payload);
    } else {
      addCampaign(payload);
    }
    navigate('/campaigns');
  };

  const handleSchedule = () => {
    if (!formData.name || !formData.subject) {
      alert("Please provide a Campaign Name and Subject.");
      return;
    }
    if (!formData.date) {
      alert("Please specify a date to schedule.");
      return;
    }

    const payload = {
      ...formData,
      status: 'Scheduled',
      date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    if (editId) {
      updateCampaign(editId, payload);
    } else {
      addCampaign(payload);
    }
    navigate('/campaigns');
  };

  const handleSend = () => {
    if (!formData.name || !formData.subject) {
      alert("Please provide a Campaign Name and Subject.");
      return;
    }
    
    // Pass real target leads length rather than hardcoded 245 inside context
    const payload = {
      ...formData,
      status: 'Sent',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sentCount: String(targetLeads.length),
      deliveredCount: String(Math.floor(targetLeads.length * 0.98)) // Simulate 98% dev. rate
    };

    let campId = editId;
    if (editId) {
      updateCampaign(editId, payload);
    } else {
      campId = Date.now().toString();
      addCampaign({ ...payload, id: campId });
    }

    // Trigger sending logic (replacement and logging)
    sendCampaign(campId, targetLeads, addActivity);
    
    navigate('/campaigns');
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-tesla-border pb-6 animate-in fade-in slide-in-from-top duration-700">
        <div>
          <button 
            onClick={() => navigate('/campaigns')}
            className="flex items-center text-[10px] font-normal text-tesla-muted hover:text-tesla-text uppercase tracking-widest transition-colors mb-3"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {t('backToCampaigns') || 'Terug naar overzicht'}
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-light text-tesla-text tracking-tight uppercase">{editId ? t('editCampaign') : 'Nieuwe Campagne'}</h1>
          </div>
          <p className="mt-1.5 text-[11px] font-light text-tesla-muted uppercase tracking-widest">Ontwerp uw e-mailsjabloon en selecteer uw doelgroep.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={isDemo ? handleDemoRestriction : handleSaveDraft}
            className="rounded-full bg-tesla-surface border border-tesla-border px-5 py-2.5 text-[10px] font-normal text-tesla-muted uppercase tracking-widest hover:text-tesla-text hover:border-tesla-text flex items-center gap-2 transition-all shadow-sm"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            Concept Opslaan
          </button>
          {isScheduling && formData.date ? (
            <button 
              onClick={isDemo ? handleDemoRestriction : handleSchedule}
              className="rounded-full bg-tesla-text px-6 py-2.5 text-[10px] font-normal text-tesla-bg uppercase tracking-widest hover:brightness-110 flex items-center gap-2 transition-all shadow-lg"
            >
              <ClockIcon className="h-4 w-4" />
              Inplannen
            </button>
          ) : (
            <button 
              onClick={isDemo ? handleDemoRestriction : handleSend}
              className="rounded-full bg-tesla-blue px-6 py-2.5 text-[10px] font-normal text-white uppercase tracking-widest hover:brightness-110 flex items-center gap-2 transition-all shadow-lg"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              {isDemo ? 'Verzenden (Demo)' : 'Nu Verzenden'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-tesla-surface rounded-2xl border border-tesla-border overflow-hidden shadow-soft">
            <div className="p-8 space-y-8">
              
              <div>
                <label htmlFor="name" className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('campaignInternalName') || 'Interne Naam'}</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Bijv. Q1 Transport Promotie"
                  className="block w-full rounded-xl border-tesla-border bg-tesla-elevated py-2.5 px-4 text-tesla-text tracking-normal text-[13px] font-light focus:border-tesla-blue focus:ring-0 transition-all placeholder:text-tesla-muted/40"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-2 pl-1">{t('emailSubjectLine') || 'Onderwerpregel'}</label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Optimaliseer uw fleet management met 20%..."
                  className="block w-full rounded-xl border-tesla-border bg-tesla-elevated py-2.5 px-4 text-tesla-text tracking-normal text-[13px] font-light focus:border-tesla-blue focus:ring-0 transition-all placeholder:text-tesla-muted/40"
                />
              </div>

              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                  <label htmlFor="content" className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest pl-1">E-mail Inhoud (HTML/Tekst)</label>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => setShowLibrary(true)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-tesla-blue text-white rounded-full py-2.5 px-8 hover:brightness-110 transition-all shadow-lg shadow-tesla-blue/20"
                      >
                        <SparklesSolid className="h-4 w-4" />
                        PREMIUM LIBRARY
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1 mb-3">
                    <span className="text-[9px] font-light text-tesla-muted uppercase tracking-widest">Variabelen: {'{{companyName}}'}, {'{{sector}}'}, {'{{senderName}}'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="border border-tesla-border rounded-xl overflow-hidden bg-white transition-all flex flex-col h-[520px] shadow-sm">
                    {/* Rich text toolbar */}
                    <div className="bg-tesla-elevated border-b border-tesla-border px-4 py-2 flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '<strong>Bold Text</strong>' }))} 
                        type="button" 
                        className="p-1 px-3 text-tesla-muted hover:text-tesla-text hover:bg-black/5 rounded-md font-bold uppercase tracking-widest text-[10px] transition-all"
                      >B</button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '<em>Italic Text</em>' }))} 
                        type="button" 
                        className="p-1 px-3 text-tesla-muted hover:text-tesla-text hover:bg-black/5 rounded-md italic uppercase tracking-widest text-[10px] transition-all"
                      >I</button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, content: prev.content + '<u>Underline Text</u>' }))} 
                        type="button" 
                        className="p-1 px-3 text-tesla-muted hover:text-tesla-text hover:bg-black/5 rounded-md underline uppercase tracking-widest text-[10px] transition-all"
                      >U</button>
                      <div className="h-4 w-px bg-tesla-border mx-2"></div>
                      <button 
                        onClick={() => setShowHtml(!showHtml)}
                        type="button" 
                        className={`p-1.5 px-3 flex items-center gap-2 rounded-md transition-all text-[9px] font-bold uppercase tracking-widest shadow-sm ${showHtml ? 'bg-tesla-blue text-white' : 'text-tesla-muted border border-tesla-border hover:text-tesla-text hover:bg-white'}`}
                      >
                        <CodeBracketIcon className="h-3.5 w-3.5" />
                        HTML
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto relative bg-white">
                      <textarea
                        name="content"
                        id="content"
                        value={formData.content}
                        onChange={handleChange}
                        className={`block w-full h-full min-h-full border-0 py-6 px-6 focus:ring-0 text-[12px] uppercase tracking-widest resize-none bg-transparent transition-opacity ${showHtml ? 'font-mono text-tesla-text leading-relaxed' : 'text-tesla-text'}`}
                        placeholder="Schrijf hier uw e-mailinhoud..."
                        spellCheck={!showHtml}
                      />
                      {!showHtml && (
                        <div className="absolute top-4 right-4 p-2 pointer-events-none">
                          <span className="text-[8px] font-bold text-tesla-muted/40 uppercase tracking-widest">
                            WYSIWYG Mode
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Preview Panel */}
                  <div className="border border-tesla-border rounded-xl overflow-hidden bg-tesla-bg flex flex-col h-[520px] shadow-sm">
                    <div className="bg-tesla-surface border-b border-tesla-border px-4 py-3 flex items-center justify-center shrink-0">
                       <span className="text-[9px] font-normal text-tesla-muted tracking-widest uppercase">Live Technical Preview</span>
                    </div>
                    <div className="flex-1 w-full h-full bg-white relative">
                      <iframe 
                        title="Email Preview"
                        className="absolute inset-0 w-full h-full border-0"
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <meta charset="utf-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1">
                              <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400&display=swap" rel="stylesheet">
                              <style>
                                body { margin: 0; padding: 40px; font-family: 'Plus Jakarta Sans', sans-serif; background: #ffffff; }
                                p { margin-top: 0; }
                              </style>
                            </head>
                            <body>
                              ${formData.content
                                .replace(/{{companyName}}/g, '<span style="color: #3E6AE1; font-weight: 300; border-bottom: 1px dashed #3E6AE1;">[Company]</span>')
                                .replace(/{{sector}}/g, '<span style="color: #3E6AE1; font-weight: 300; border-bottom: 1px dashed #3E6AE1;">[Sector]</span>')
                                .replace(/{{senderName}}/g, formData.senderName || '<span style="color: #3E6AE1; font-weight: 300; border-bottom: 1px dashed #3E6AE1;">[Sender]</span>')
                                .replace(/{{unsubscribeUrl}}/g, '#')
                              }
                            </body>
                          </html>
                        `}
                      />
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-tesla-surface rounded-2xl shadow-soft border border-tesla-border overflow-hidden">
            <div className="px-6 py-4 border-b border-tesla-border flex justify-between items-center bg-tesla-elevated">
              <h3 className="text-[13px] font-normal text-tesla-text uppercase tracking-widest">{t('audienceSettings') || 'Doelgroep'}</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-3 pl-1">{t('targetSector') || 'Doelsector'}(en)</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.targetSectors.length === 0}
                      onChange={() => setFormData(prev => ({ ...prev, targetSectors: [] }))}
                      className="rounded-md border-tesla-border bg-tesla-elevated text-tesla-blue focus:ring-0 w-4 h-4"
                    />
                    <span className="text-[13px] text-tesla-text group-hover:text-tesla-blue transition-colors font-light">{t('allSectors') || 'Alle Sectoren'}</span>
                  </label>
                  {uniqueSectors.map(sector => (
                    <label key={sector} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={formData.targetSectors.includes(sector)}
                        onChange={() => toggleSector(sector)}
                        className="rounded-md border-tesla-border bg-tesla-elevated text-tesla-blue focus:ring-0 w-4 h-4"
                      />
                      <span className="text-[13px] text-tesla-text group-hover:text-tesla-blue transition-colors font-light">{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-tesla-border">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[12px] font-normal text-tesla-text">{t('estimatedAudience') || 'Geschat Bereik'} ({targetLeads.length})</span>
                </div>
                {/* Granular Recipient Selection */}
                <div className="bg-tesla-elevated rounded-xl p-4 h-64 overflow-y-auto border border-tesla-border custom-scrollbar">
                  <p className="text-[9px] font-normal text-tesla-muted uppercase tracking-widest mb-3 px-1">Individuele Leads</p>
                  <ul className="space-y-1.5">
                    {leads
                      .filter(l => formData.targetSectors.length === 0 || formData.targetSectors.includes(l.sector))
                      .map(l => {
                        const isIncluded = !formData.excludedLeads.includes(l.id);
                        return (
                          <li key={l.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={isIncluded}
                              onChange={() => toggleLeadExclusion(l.id)}
                              className="rounded-md border-tesla-border bg-tesla-surface text-tesla-blue focus:ring-0 w-3.5 h-3.5"
                            />
                            <span className={`text-[11px] truncate group-hover:text-tesla-blue transition-colors ${isIncluded ? 'text-tesla-text font-light' : 'text-tesla-muted line-through font-light'}`}>
                              {l.email}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-tesla-surface rounded-2xl shadow-soft border border-tesla-border overflow-hidden">
            <div className="px-6 py-4 border-b border-tesla-border flex justify-between items-center bg-tesla-elevated">
              <h3 className="text-[13px] font-normal text-tesla-text uppercase tracking-widest">{t('advancedSettings') || 'Geavanceerde Instellingen'}</h3>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Sending Options */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-normal text-tesla-muted uppercase tracking-widest pl-1">Verzending</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleChange}
                    placeholder="Naam Afzender"
                    className="block w-full rounded-xl border-tesla-border py-2 px-4 shadow-sm focus:border-tesla-blue focus:ring-0 text-[13px] bg-tesla-elevated text-tesla-text transition-all font-light placeholder:text-tesla-muted/40"
                  />
                  <input
                    type="email"
                    name="replyTo"
                    value={formData.replyTo}
                    onChange={handleChange}
                    placeholder="Antwoord-adres (Reply-To)"
                    className="block w-full rounded-xl border-tesla-border py-2 px-4 shadow-sm focus:border-tesla-blue focus:ring-0 text-[13px] bg-tesla-elevated text-tesla-text transition-all font-light placeholder:text-tesla-muted/40"
                  />
                </div>
              </div>

              <div className="h-px bg-tesla-border opacity-50 my-6"></div>

              {/* Tracking */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-normal text-tesla-muted uppercase tracking-widest pl-1">Tracking & A/B Test</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="trackOpens"
                    checked={formData.trackOpens}
                    onChange={(e) => setFormData(prev => ({ ...prev, trackOpens: e.target.checked }))}
                    className="rounded-md border-tesla-border bg-tesla-elevated text-tesla-blue focus:ring-0 w-4 h-4" 
                  />
                  <span className="text-[13px] text-tesla-text group-hover:text-tesla-blue transition-colors font-light">E-mail Opens volgen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="trackClicks"
                    checked={formData.trackClicks}
                    onChange={(e) => setFormData(prev => ({ ...prev, trackClicks: e.target.checked }))}
                    className="rounded-md border-tesla-border bg-tesla-elevated text-tesla-blue focus:ring-0 w-4 h-4" 
                  />
                  <span className="text-[13px] text-tesla-text group-hover:text-tesla-blue transition-colors font-light">Link Clicks volgen</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="abTest"
                    checked={formData.abTest}
                    onChange={(e) => setFormData(prev => ({ ...prev, abTest: e.target.checked }))}
                    className="rounded-md border-tesla-border bg-tesla-elevated text-tesla-blue focus:ring-0 w-4 h-4" 
                  />
                  <span className="text-[13px] text-tesla-text group-hover:text-tesla-blue transition-colors font-light">A/B Test Onderwerpregels</span>
                </label>
              </div>

              <div className="h-px bg-tesla-border opacity-50 my-6"></div>

              {/* Follow-up Sequence */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-normal text-tesla-muted uppercase tracking-widest pl-1">Auto Follow-up Strategie</h4>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="followUpEnabled"
                    checked={formData.followUpEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpEnabled: e.target.checked }))}
                    className="rounded-md border-tesla-border bg-tesla-elevated text-tesla-blue focus:ring-0 w-4 h-4" 
                  />
                  <span className="text-[13px] text-tesla-text group-hover:text-tesla-blue transition-colors font-light">Stuur follow-up bij geen reactie</span>
                </label>
                {formData.followUpEnabled && (
                  <div className="pl-7 pb-2 animate-in fade-in duration-300">
                    <span className="text-[11px] text-tesla-muted font-light">Wachttijd:</span>
                    <select 
                      name="followUpWait"
                      value={formData.followUpWait}
                      onChange={handleChange}
                      className="ml-2 text-[11px] border-tesla-border rounded-lg py-1 pl-2 pr-8 text-tesla-text focus:ring-0 bg-tesla-elevated appearance-none cursor-pointer font-normal shadow-sm"
                    >
                       <option value="3 Days">3 Dagen</option>
                       <option value="7 Days">7 Dagen</option>
                       <option value="14 Days">14 Dagen</option>
                    </select>
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="bg-tesla-surface rounded-2xl shadow-soft border border-tesla-border p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 bg-tesla-elevated p-2 rounded-xl border border-tesla-border">
                <ClockIcon className="h-5 w-5 text-tesla-blue" />
              </div>
              <div className="flex-1">
                <h4 className="text-[13px] font-normal text-tesla-text uppercase tracking-widest">{t('scheduleDelivery') || 'Bezorging Inplannen'}</h4>
                <p className="mt-1 text-[11px] text-tesla-muted leading-relaxed mb-4 font-light">{t('emailsWillBeSent') || 'E-mails worden op de geselecteerde tijd verzonden.'}</p>
                
                {isScheduling ? (
                  <div className="mt-3">
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-tesla-border py-2 px-4 text-[13px] text-tesla-text shadow-sm focus:border-tesla-blue focus:ring-0 bg-tesla-elevated transition-all font-light"
                    />
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => {
                          setIsScheduling(false);
                          setFormData(prev => ({...prev, date: ''}));
                        }}
                        className="text-[11px] font-normal text-tesla-muted hover:text-tesla-blue transition-colors uppercase tracking-widest"
                      >
                        {t('cancel') || 'Annuleren'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsScheduling(true)}
                    className="text-[12px] font-normal text-tesla-blue hover:text-tesla-text transition-all flex items-center gap-1 group"
                  >
                    {t('setDateAndTime') || 'Datum en tijd instellen'} 
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* PREMIUM TEMPLATE LIBRARY MODAL */}
      {showLibrary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowLibrary(false)} />
          <div className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 fade-in duration-500">
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <SparklesSolid className="h-5 w-5 text-tesla-blue" />
                  <h3 className="text-2xl font-light text-white tracking-tight uppercase">Premium Template Library</h3>
                </div>
                <p className="text-[10px] font-normal text-white/40 uppercase tracking-[0.2em]">Selecteer een high-conversion sjabloon voor uw campagne</p>
              </div>
              <button onClick={() => setShowLibrary(false)} className="p-3 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <XIcon className="h-7 w-7" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-black">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {Object.entries(PREMIUM_TEMPLATES).map(([key, template]) => (
                  <div 
                    key={key}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, content: template.html, subject: template.subject || prev.subject }));
                      setShowLibrary(false);
                    }}
                    className="group relative bg-[#111] border border-white/5 rounded-[32px] overflow-hidden cursor-pointer transition-all hover:border-tesla-blue/50 hover:bg-[#161616]"
                  >
                    <div className="aspect-[4/5] bg-white/[0.02] border-b border-white/5 relative overflow-hidden">
                      <div className="absolute inset-4 overflow-hidden rounded-xl bg-white shadow-2xl scale-[0.3] origin-top opacity-30 group-hover:opacity-100 transition-all duration-700">
                         <div dangerouslySetInnerHTML={{ __html: template.html }} className="p-10 pointer-events-none" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-tesla-blue/20 backdrop-blur-[4px]">
                        <div className="bg-white text-black text-[11px] font-black uppercase tracking-widest py-4 px-10 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          Sjabloon Toepassen
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <RectangleStackIcon className="h-5 w-5 text-tesla-blue" />
                        <h4 className="text-[14px] font-medium text-white uppercase tracking-wider">{template.name}</h4>
                      </div>
                      <p className="text-[11px] font-light text-white/40 leading-relaxed line-clamp-2">{template.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAD IQ MODAL - PROACTIVE INTELLIGENCE */}
      {showLeadIQ && selectedLeadForIQ && (
        <div className="fixed inset-0 z-[110] flex items-center justify-end p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLeadIQ(false)} />
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-tesla-blue/20 flex items-center justify-center border border-tesla-blue/30">
                  <LightBulbIcon className="h-6 w-6 text-tesla-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-light text-white uppercase tracking-tight">Lead Intelligence IQ</h3>
                  <p className="text-[10px] text-tesla-blue font-black uppercase tracking-widest">Deep Web Analysis Active</p>
                </div>
              </div>
              <button onClick={() => setShowLeadIQ(false)} className="p-2 text-white/40 hover:text-white transition-all"><XIcon className="h-6 w-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <GlobeAltIcon className="h-4 w-4 text-tesla-blue" />
                  <span className="text-[10px] text-white/40 uppercase tracking-widest">Industry Relevance</span>
                </div>
                <h4 className="text-xl font-light text-white">{(selectedLeadForIQ?.company || "uw bedrijf")} is moving towards electric fleet integration.</h4>
                <p className="text-[12px] text-white/60 font-light leading-relaxed">Recent KVK data and website analysis suggest they are expanding their logistics capacity by 15% this quarter.</p>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] text-white/40 uppercase tracking-widest pl-1">Recommended Personalization</h5>
                <div className="p-5 bg-tesla-blue/5 border border-tesla-blue/20 rounded-2xl">
                   <p className="text-[13px] text-white font-light italic leading-relaxed">"Ik las over jullie recente vlootuitbreiding in {(selectedLeadForIQ?.location || "uw locatie")}. FleetTrack kan jullie direct helpen de ritregistratie hiervoor 100% te automatiseren."</p>
                </div>
                <button 
                  onClick={() => {
                     setFormData(prev => ({ ...prev, content: prev.content.replace('{icebreaker}', 'Ik las over jullie recente vlootuitbreiding...') }));
                     setShowLeadIQ(false);
                  }}
                  className="w-full py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 transition-all"
                >
                  Insert Intelligence Into Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

