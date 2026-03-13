import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ClockIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  TrashIcon, 
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useLeads } from '../context/LeadsContext';

export default function LeadModal({ isOpen, onClose, onSave, lead: initialLead = null }) {
  const { t } = useLanguage();
  const { leads, addActivity, addReminder, deleteReminder } = useLeads();
  
  // Always get the latest data from context for the current lead
  const lead = leads.find(l => l.id === initialLead?.id) || initialLead;
  
  const [newActivity, setNewActivity] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'reminders'
  
  const [formData, setFormData] = useState({
    company: '',
    sector: '',
    vehicles: '',
    email: '',
    phone: '',
    website: '',
    status: 'new',
    source: 'Manual',
    nextAction: 'Follow-up Email (1 week)',
    notes: ''
  });

  useEffect(() => {
    if (initialLead) {
      setFormData({
        ...initialLead,
        source: initialLead.source || 'Manual'
      });
    } else {
      setFormData({
        company: '',
        sector: '',
        vehicles: '',
        email: '',
        phone: '',
        website: '',
        status: 'new',
        source: 'Manual',
        nextAction: 'Follow-up Email (1 week)',
        notes: ''
      });
    }
  }, [initialLead, isOpen]);

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;
    addActivity(lead.id, newActivity, 'manual');
    setNewActivity('');
  };

  const handleAddReminder = () => {
    if (!reminderText.trim() || !reminderDate) return;
    addReminder(lead.id, reminderText, reminderDate);
    setReminderText('');
    setReminderDate('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      vehicles: parseInt(formData.vehicles, 10) || 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div className="fixed inset-0 bg-black/60 transition-opacity"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded bg-[#171A20] px-4 pb-4 pt-5 text-left transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6 border border-[#393C41] no-glass">
            <div className="sm:flex sm:gap-6">
              {/* Left Column: Form */}
              <div className="flex-1">
                <div className="mt-2 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-[11px] font-bold leading-6 text-white uppercase tracking-widest mb-6" id="modal-title">
                    {initialLead ? 'Edit Lead' : t('addLead')}
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="company" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Company Name</label>
                        <div className="mt-1.5">
                          <input type="text" name="company" id="company" required
                            value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="sector" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">{t('sector')}</label>
                          <div className="mt-1.5">
                            <input type="text" name="sector" id="sector" required
                              value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="vehicles" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Vehicles</label>
                          <div className="mt-1.5">
                            <input type="number" name="vehicles" id="vehicles" min="1" required
                              value={formData.vehicles} onChange={(e) => setFormData({...formData, vehicles: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="email" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Email</label>
                          <div className="mt-1.5">
                            <input type="email" name="email" id="email" required
                              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Phone</label>
                          <div className="mt-1.5">
                            <input type="text" name="phone" id="phone"
                              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="website" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Website</label>
                          <div className="mt-1.5">
                            <input type="text" name="website" id="website"
                              placeholder="www.example.com"
                              value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass placeholder:text-[#393C41]" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="source" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Source</label>
                          <div className="mt-1.5">
                            <select name="source" id="source"
                              value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all cursor-pointer no-glass"
                            >
                              <option value="Manual">Manual</option>
                              <option value="Google Maps">Google Maps</option>
                              <option value="KVK">KVK</option>
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="Website Form">Website Form</option>
                              <option value="Scraper">Scraper (Bot)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="nextAction" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Next Action</label>
                          <div className="mt-1.5">
                            <select name="nextAction" id="nextAction"
                              value={formData.nextAction} onChange={(e) => setFormData({...formData, nextAction: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all cursor-pointer no-glass"
                            >
                              <option value="Follow-up Email (1 week)">Follow-up Email (1 week)</option>
                              <option value="Follow-up Call (2 days)">Follow-up Call (2 days)</option>
                              <option value="Meeting Scheduled">Meeting Scheduled</option>
                              <option value="Quote Sent">Quote Sent</option>
                              <option value="Wait for Customer">Wait for Customer</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="status" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">{t('status')}</label>
                          <div className="mt-1.5">
                            <select name="status" id="status"
                              value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                              className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all cursor-pointer no-glass"
                            >
                              <option value="new">{t('new')}</option>
                              <option value="contacted">{t('contacted')}</option>
                              <option value="interested">{t('interested')}</option>
                              <option value="customer">{t('customer')}</option>
                              <option value="rejected">{t('rejected')}</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-[9px] font-bold uppercase tracking-widest text-[#8E8E93]">Notes</label>
                        <div className="mt-1.5">
                          <textarea id="notes" name="notes" rows={2}
                            value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="block w-full rounded border-[#393C41] bg-[#222222] py-2 text-white sm:text-[11px] font-bold uppercase tracking-widest focus:border-[#3E6AE1] focus:ring-0 transition-all no-glass" />
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row-reverse gap-3">
                        <button type="submit" className="flex-1 justify-center rounded bg-[#E31937] px-6 py-3 text-[10px] font-bold text-white uppercase tracking-widest hover:brightness-110 transition-all no-glass">
                          Save Lead
                        </button>
                        <button type="button" onClick={onClose} className="flex-1 justify-center rounded bg-[#222222] border border-[#393C41] px-6 py-3 text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest hover:text-white hover:border-white transition-all no-glass">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Right Column: Activities & Agenda */}
              {initialLead && (
                <div className="mt-10 sm:mt-0 sm:w-96 border-t sm:border-t-0 sm:border-l border-[#393C41] sm:pl-8 pt-8 sm:pt-0 flex flex-col h-full min-h-[500px]">
                  {/* Tabs */}
                  <div className="flex border-b border-[#393C41] mb-6">
                    <button 
                      onClick={() => setActiveTab('activities')}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b ${activeTab === 'activities' ? 'border-[#E31937] text-white' : 'border-transparent text-[#8E8E93] hover:text-white'}`}
                    >
                      <ClockIcon className="h-4 w-4 inline-block mr-2 -mt-0.5" />
                      Historie
                    </button>
                    <button 
                      onClick={() => setActiveTab('reminders')}
                      className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b ${activeTab === 'reminders' ? 'border-[#E31937] text-white' : 'border-transparent text-[#8E8E93] hover:text-white'}`}
                    >
                      <CalendarIcon className="h-4 w-4 inline-block mr-2 -mt-0.5" />
                      Ajanda
                    </button>
                  </div>
                  
                  {activeTab === 'activities' ? (
                    <>
                      {/* Activity Form */}
                      <div className="mb-6">
                        <textarea
                          rows={2}
                          placeholder="Log an interaction..."
                          value={newActivity}
                          onChange={(e) => setNewActivity(e.target.value)}
                          className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-[10px] font-bold uppercase tracking-widest text-white focus:border-[#3E6AE1] focus:ring-0 mb-3 no-glass placeholder:text-[#393C41]"
                        />
                        <button
                          type="button"
                          onClick={handleAddActivity}
                          disabled={!newActivity.trim()}
                          className="w-full flex items-center justify-center gap-2 rounded bg-white py-2.5 text-[10px] font-bold text-black uppercase tracking-widest hover:bg-[#8E8E93] disabled:opacity-30 transition-all no-glass"
                        >
                          <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
                          Log Interaction
                        </button>
                      </div>

                      {/* Activity List */}
                      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-6 custom-scrollbar">
                        {lead?.activities?.length > 0 ? (
                          lead.activities.map((activity) => (
                            <div key={activity.id} className="relative pl-7 pb-2 border-l border-[#393C41]">
                              <div className={`absolute -left-[5px] top-0 h-2 w-2 rounded-full ${activity.type === 'system' ? 'bg-[#393C41]' : 'bg-[#E31937]'}`}>
                              </div>
                                <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest italic">
                                  {activity.type === 'system' ? 'System' : 'Log'} • {new Date(activity.date).toLocaleString('nl-NL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                                </p>
                              <p className="text-[10px] text-white leading-relaxed font-bold uppercase tracking-widest mt-1 opacity-90">
                                {activity.type === 'system' ? <span className="opacity-50">{activity.text}</span> : activity.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16">
                            <ChatBubbleLeftRightIcon className="mx-auto h-10 w-10 text-[#222222]" />
                            <p className="mt-4 text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest">No activities recorded yet.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Reminder Form */}
                      <div className="mb-6 space-y-3">
                        <input 
                          type="text"
                          placeholder="Wat moet er gebeuren?"
                          value={reminderText}
                          onChange={(e) => setReminderText(e.target.value)}
                          className="block w-full rounded border-[#393C41] bg-[#222222] py-2.5 text-[10px] font-bold uppercase tracking-widest text-white focus:border-[#3E6AE1] focus:ring-0 no-glass placeholder:text-[#393C41]"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="datetime-local"
                            value={reminderDate}
                            onChange={(e) => setReminderDate(e.target.value)}
                            className="flex-1 rounded border-[#393C41] bg-[#222222] py-2.5 text-[10px] font-bold uppercase tracking-widest text-white focus:border-[#3E6AE1] focus:ring-0 no-glass"
                          />
                          <button
                            type="button"
                            onClick={handleAddReminder}
                            disabled={!reminderText.trim() || !reminderDate}
                            className="rounded bg-[#E31937] px-4 text-white disabled:opacity-30 hover:brightness-110 transition-all no-glass"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Reminder List */}
                      <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                        {lead?.reminders?.length > 0 ? (
                          lead.reminders.map((rem) => {
                            const isOverdue = new Date(rem.date) < new Date();
                            return (
                              <div key={rem.id} className={`p-4 rounded border flex items-start gap-4 transition-all ${isOverdue ? 'bg-[#E31937]/5 border-[#E31937]/20' : 'bg-[#222222] border-[#393C41]'}`}>
                                <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${isOverdue ? 'bg-[#E31937] text-white' : 'bg-[#393C41] text-[#8E8E93]'}`}>
                                  {isOverdue ? <ExclamationTriangleIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate">{rem.text}</p>
                                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isOverdue ? 'text-[#E31937]' : 'text-[#8E8E93]'}`}>
                                    {new Date(rem.date).toLocaleString('nl-NL', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => deleteReminder(lead.id, rem.id)}
                                  className="text-[#393C41] hover:text-[#E31937] p-1 transition-colors no-glass"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-16">
                            <CalendarIcon className="h-10 w-10 text-[#222222] mx-auto mb-4" />
                            <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-widest italic">Geen geplande taken.</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper icon not originally imported in current scope but used in my rewrite
function ExclamationTriangleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}
