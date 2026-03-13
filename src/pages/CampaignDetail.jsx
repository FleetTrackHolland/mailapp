import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../context/CampaignsContext';
import { useLanguage } from '../context/LanguageContext';
import { useLeads } from '../context/LeadsContext';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeftIcon,
  UsersIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilSquareIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

const statusColors = {
  'Sent': 'border-green-500 text-green-500',
  'Sending': 'border-[#3E6AE1] text-[#3E6AE1]',
  'Scheduled': 'border-white text-white',
  'Draft': 'border-[#8E8E93] text-[#8E8E93]',
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCampaign, updateCampaignStatus, deleteCampaign } = useCampaigns();
  const { t } = useLanguage();
  const { leads } = useLeads();
  const { appConfig } = useApp();

  const campaign = getCampaign(id);
  const targetLeads = campaign?.targetSector ? leads.filter(l => l.sector === campaign.targetSector) : leads;

  if (!campaign) {
    return (
      <div className="text-center py-20 bg-tesla-surface rounded-tesla border border-tesla-border">
        <h3 className="text-[11px] font-black text-white uppercase tracking-superwide">Campaign not found</h3>
        <button 
          onClick={() => navigate('/campaigns')}
          className="mt-6 text-[10px] font-black text-tesla-blue uppercase tracking-superwide hover:text-white transition-colors"
        >
          &larr; Back to Campaigns
        </button>
      </div>
    );
  }

  const stats = [
    { name: 'Sent', value: campaign.sentCount, icon: UsersIcon, color: 'text-white', bg: 'bg-tesla-elevated' },
    { name: 'Delivered', value: campaign.deliveredCount, icon: EnvelopeOpenIcon, color: 'text-green-500', bg: 'bg-tesla-elevated' },
    { name: 'Opened', value: `${campaign.openRate}%`, icon: CursorArrowRaysIcon, color: 'text-tesla-blue', bg: 'bg-tesla-elevated' },
    { name: 'Bounced', value: campaign.bouncedCount, icon: ExclamationTriangleIcon, color: 'text-tesla-blue', bg: 'bg-tesla-elevated' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-tesla-border pb-8">
        <div>
          <button 
            onClick={() => navigate('/campaigns')}
            className="flex items-center text-[10px] font-black text-tesla-muted hover:text-white uppercase tracking-superwide transition-colors mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Campaigns
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">{campaign.name}</h1>
            <span className={`inline-flex items-center border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm ${statusColors[campaign.status] || 'border-tesla-muted text-tesla-muted'}`}>
              {t(campaign.status.toLowerCase()) || campaign.status}
            </span>
          </div>
          <p className="mt-2 text-[10px] font-black text-tesla-muted uppercase tracking-superwide">{t('dateRun')}: {campaign.date}</p>
        </div>
        <div className="flex gap-4">
          {campaign.status === 'Draft' || campaign.status === 'Scheduled' ? (
            <>
              {campaign.status === 'Scheduled' && (
                <button 
                  onClick={() => updateCampaignStatus(campaign.id, 'Draft')}
                  className="rounded-tesla bg-tesla-elevated border border-tesla-border px-4 py-2.5 text-[10px] font-black text-tesla-muted uppercase tracking-wider hover:text-white hover:border-white flex items-center gap-2 transition-all no-glass"
                >
                  <PauseIcon className="h-4 w-4" />
                  {t('cancelSchedule')}
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (window.confirm(t('confirmDelete'))) {
                    deleteCampaign(campaign.id);
                    navigate('/campaigns');
                  }
                }}
                className="rounded-tesla bg-tesla-elevated border border-tesla-border px-4 py-2.5 text-[10px] font-black text-tesla-blue uppercase tracking-wider hover:brightness-110 flex items-center gap-2 transition-all no-glass"
              >
                <TrashIcon className="h-4 w-4" />
                {t('delete')}
              </button>

              <button 
                onClick={() => navigate(`/campaigns/new?edit=${campaign.id}`)}
                className="rounded-tesla bg-tesla-elevated border border-tesla-border px-4 py-2.5 text-[10px] font-black text-tesla-muted uppercase tracking-wider hover:text-white hover:border-white flex items-center gap-2 transition-all no-glass"
              >
                <PencilSquareIcon className="h-4 w-4" />
                {t('edit')}
              </button>
              
              <button 
                onClick={() => updateCampaignStatus(campaign.id, 'Sent', targetLeads.length)}
                className="rounded-tesla bg-tesla-blue px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-wider hover:brightness-110 transition-all no-glass"
              >
                {t('sendNow')}
              </button>
            </>
          ) : (
            <>
              <button className="rounded bg-[#171A20] border border-[#393C41] px-4 py-2.5 text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest hover:text-white hover:border-white transition-all no-glass">
                {t('exportReport')}
              </button>
              <button className="rounded bg-[#171A20] border border-[#393C41] px-4 py-2.5 text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest hover:text-white hover:border-white transition-all no-glass">
                {t('duplicate')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Analytics & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Performance Overview */}
          <div className="bg-tesla-surface rounded-tesla border border-tesla-border overflow-hidden no-glass">
            <div className="px-6 py-4 border-b border-tesla-border flex items-center bg-tesla-border/30">
              <h3 className="text-[10px] font-black text-white uppercase tracking-superwide">{t('performanceSummary')}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-tesla-border">
              {stats.map((stat) => (
                <div key={stat.name} className="px-6 py-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-tesla-muted uppercase tracking-superwide">{stat.name}</p>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-white uppercase tracking-tight">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          <div className="bg-tesla-surface rounded-tesla border border-tesla-border overflow-hidden no-glass">
            <div className="px-8 py-6 border-b border-tesla-border bg-tesla-border/30">
              <p className="text-[9px] font-black text-tesla-muted uppercase tracking-superwide mb-2">{t('subjectLine')}</p>
              <p className="text-[11px] font-black text-white uppercase tracking-wider">{campaign.subject}</p>
            </div>
            <div className="p-10 bg-black">
              {/* Email Content Window */}
              <div className="border border-tesla-border rounded-sm bg-tesla-surface max-w-2xl mx-auto overflow-hidden">
                <div className="border-b border-tesla-border px-5 py-3 flex gap-2 bg-tesla-elevated">
                  <div className="w-2.5 h-2.5 rounded-full bg-tesla-border"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-tesla-border"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-tesla-border"></div>
                </div>
                <div 
                  className="p-10 text-[13px] text-white font-sans leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 uppercase tracking-widest opacity-80"
                  dangerouslySetInnerHTML={{ __html: campaign.content }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Audience & Logs */}
        <div className="space-y-8">
          
          <div className="bg-tesla-surface rounded-tesla border border-tesla-border overflow-hidden no-glass">
            <div className="px-6 py-4 border-b border-tesla-border flex items-center bg-tesla-border/30">
              <h3 className="text-[10px] font-black text-white uppercase tracking-superwide">{t('audienceSettings')}</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-tesla-muted uppercase tracking-superwide">{t('targetSegments')}</p>
                  <span className="text-[9px] font-black text-tesla-blue uppercase tracking-superwide">
                    {targetLeads.length} Total
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center border border-tesla-border px-2.5 py-1 text-[9px] font-black text-tesla-muted uppercase tracking-wider rounded-sm">
                    {campaign.targetSector || 'All Sectors'}
                  </span>
                </div>
                {/* Visual recipient list */}
                <div className="bg-black rounded-sm p-4 max-h-40 overflow-y-auto border border-tesla-border custom-scrollbar">
                  <ul className="text-[9px] font-medium text-tesla-muted uppercase tracking-wider space-y-2 opacity-60">
                    {targetLeads.slice(0, 10).map(l => (
                      <li key={l.id} className="truncate">{l.email}</li>
                    ))}
                    {targetLeads.length > 10 && (
                      <li className="text-tesla-blue font-black pt-1">+{targetLeads.length - 10} more...</li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="pt-6 border-t border-tesla-border">
                <p className="text-[9px] font-black text-tesla-muted uppercase tracking-superwide mb-2">{t('sendingAccount')}</p>
                <p className="text-[11px] font-black text-white uppercase tracking-wider opacity-80">john.doe@{appConfig.website.replace('www.', '')}</p>
              </div>
              <div className="pt-6 border-t border-tesla-border">
                <p className="text-[9px] font-black text-tesla-muted uppercase tracking-superwide mb-2">{t('tracking')}</p>
                <p className="text-[11px] font-black text-white uppercase tracking-wider opacity-80">Opens and Link Clicks Enabled</p>
              </div>
            </div>
          </div>

          <div className="bg-tesla-surface rounded-tesla border border-tesla-border overflow-hidden no-glass">
            <div className="px-6 py-4 border-b border-tesla-border flex items-center bg-tesla-border/30">
              <h3 className="text-[10px] font-black text-white uppercase tracking-superwide">{t('recentActivity')}</h3>
            </div>
            <ul role="list" className="divide-y divide-tesla-border">
              {[
                { time: '10 mins ago', action: 'Email Opened', user: 'info@vandijktransport.nl' },
                { time: '1 hour ago', action: 'Email Bounced', user: 'contact@invalid-domain.nl' },
                { time: '3 hours ago', action: 'Link Clicked', user: 'info@logisned.nl' },
                { time: 'Oct 15, 08:00', action: 'Campaign Completed', user: 'System' },
              ].map((log, i) => (
                <li key={i} className="px-6 py-5 hover:bg-tesla-elevated transition-colors">
                  <p className="text-[10px] font-black text-white uppercase tracking-wider">
                    {log.action} <span className="font-medium text-tesla-muted opacity-60">by {log.user}</span>
                  </p>
                  <p className="text-[9px] font-medium text-tesla-muted uppercase tracking-wider mt-2">{log.time}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
