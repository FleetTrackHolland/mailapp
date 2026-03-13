import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCampaigns } from '../context/CampaignsContext';
import { 
  EnvelopeIcon, 
  CursorArrowRaysIcon, 
  ChatBubbleBottomCenterTextIcon,
  PaperAirplaneIcon, // Corrected from Paper ArrowPathIcon
  PlusIcon,
  PencilSquareIcon, // Added
  TrashIcon // Added
} from '@heroicons/react/24/outline';

export default function Campaigns() {
  const { t } = useLanguage();
  const { campaigns, deleteCampaign } = useCampaigns(); // Added deleteCampaign
  const navigate = useNavigate();

  const stats = [
    { name: 'Total Sent', value: '12,400', icon: PaperAirplaneIcon, change: '+12%', changeType: 'positive' },
    { name: 'Avg. Open Rate', value: '42.8%', icon: EnvelopeIcon, change: '+5.4%', changeType: 'positive' },
    { name: 'Avg. Click Rate', value: '18.2%', icon: CursorArrowRaysIcon, change: '-1.2%', changeType: 'negative' },
    { name: 'Total Replies', value: '840', icon: ChatBubbleBottomCenterTextIcon, change: '+14%', changeType: 'positive' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-light text-tesla-text tracking-tight">{t('mailCampaigns')}</h2>
          <p className="mt-1 text-[13px] font-light text-tesla-muted">Beheer uw e-mailmarketing en bekijk de resultaten.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => navigate('/campaigns/new')}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {t('createCampaign')}
          </button>
        </div>
      </div>

      {/* Stats row */}
      {/* Stats row */}
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-tesla-surface rounded-2xl border border-tesla-border p-6 shadow-sm">
            <dt className="flex items-center justify-between mb-2">
              <p className="text-xs font-normal text-tesla-muted uppercase tracking-wider">{t(item.name.charAt(0).toLowerCase() + item.name.replace(/ /g, '').slice(1)) || item.name}</p>
              <item.icon className="h-5 w-5 text-tesla-blue" aria-hidden="true" />
            </dt>
            <dd className="flex items-baseline justify-between">
              <p className="text-3xl font-light text-tesla-text tracking-tight">{item.value}</p>
              <p className={`text-xs font-normal ${item.changeType === 'positive' ? 'text-green-500' : 'text-tesla-blue'}`}>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      {/* Campaigns Table */}
      <div className="bg-tesla-surface rounded-2xl border border-tesla-border overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-tesla-border flex justify-between items-center bg-tesla-elevated">
          <h3 className="text-sm font-normal text-tesla-text">{t('recentCampaigns')}</h3>
          <button className="text-xs font-normal text-tesla-blue hover:text-tesla-text transition-colors">{t('viewAll')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-tesla-border">
            <thead>
              <tr className="bg-tesla-elevated">
                <th scope="col" className="px-6 py-2.5 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-wider">{t('campaignName')}</th>
                <th scope="col" className="px-6 py-2.5 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-wider">{t('status')}</th>
                <th scope="col" className="px-6 py-2.5 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-wider">{t('sentTo')}</th>
                <th scope="col" className="px-6 py-2.5 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-wider">{t('openRate')}</th>
                <th scope="col" className="px-6 py-2.5 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-wider">{t('clickRate')}</th>
                <th scope="col" className="px-3 py-2.5 text-left text-[10px] font-normal text-tesla-muted uppercase tracking-wider">
                  {t('date')}
                </th>
                <th scope="col" className="relative py-2.5 pl-3 pr-8">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tesla-border">
              {campaigns.map((campaign) => (
                <tr 
                  key={campaign.id} 
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="hover:bg-tesla-elevated transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-[13px] font-normal text-tesla-text tracking-tight group-hover:text-tesla-blue transition-colors">{campaign.name}</div>
                    <div className="text-[10px] font-light text-tesla-muted truncate max-w-xs">{campaign.subject}</div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-normal uppercase tracking-wider shadow-sm ${
                      campaign.status === 'Sent' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                      campaign.status === 'Sending' ? 'bg-tesla-blue/10 border-tesla-blue/20 text-tesla-blue' : 
                      campaign.status === 'Scheduled' ? 'bg-tesla-text/10 border-tesla-text/20 text-tesla-text' : 
                      'bg-tesla-muted/10 border-tesla-muted/20 text-tesla-muted'
                    }`}>
                      {t(campaign.status.toLowerCase()) || campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-[12px] font-normal text-tesla-text">
                    {campaign.sentCount}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-normal text-tesla-text">{campaign.openRate}%</span>
                      <div className="flex-1 min-w-[50px] h-1 bg-tesla-elevated rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-tesla-text" style={{ width: `${campaign.openRate}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-normal text-tesla-text">{campaign.clickRate}%</span>
                      <div className="flex-1 min-w-[50px] h-1 bg-tesla-elevated rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full bg-tesla-blue" style={{ width: `${Math.min(100, campaign.clickRate * 2)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[11px] font-light text-tesla-muted sm:table-cell">
                    {campaign.date}
                  </td>
                  <td className="relative whitespace-nowrap py-2 pl-3 pr-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => navigate(`/campaigns/new?edit=${campaign.id}`)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-tesla-border text-tesla-muted hover:text-tesla-blue hover:border-tesla-blue transition-all"
                        title={t('edit')}
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(t('confirmDelete'))) {
                            deleteCampaign(campaign.id);
                          }
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-tesla-border text-tesla-muted hover:text-tesla-blue hover:border-tesla-blue transition-all"
                        title={t('delete')}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
