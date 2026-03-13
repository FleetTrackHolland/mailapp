import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UserPlusIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useLeads } from '../context/LeadsContext';
import { useLanguage } from '../context/LanguageContext';

export default function Agenda() {
  const { leads, addReminder, addLead, deleteReminder } = useLeads();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab ] = useState('today'); // 'overdue', 'today', 'upcoming'
  
  // Quick Add State
  const [quickTask, setQuickTask] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedLeads, setMatchedLeads] = useState([]);
  const [targetLead, setTargetLead] = useState(null);
  
  const suggestionsRef = useRef(null);

  // Autocomplete Logic
  useEffect(() => {
    if (leadSearch.trim().length > 0 && !targetLead) {
      const filtered = leads.filter(l => 
        l.company?.toLowerCase().includes(leadSearch.toLowerCase())
      ).slice(0, 5);
      
      setMatchedLeads(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [leadSearch, leads, targetLead]);

  // Click outside suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLead = (lead) => {
    setTargetLead(lead);
    setLeadSearch(lead.company);
    setShowSuggestions(false);
  };

  const clearQuickAdd = () => {
    setQuickTask('');
    setLeadSearch('');
    setTaskDate('');
    setTaskTime('');
    setTargetLead(null);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickTask.trim() || !taskDate || !taskTime || !leadSearch.trim()) return;

    const fullDateTime = `${taskDate}T${taskTime}`;

    if (targetLead) {
      addReminder(targetLead.id, quickTask, fullDateTime);
      clearQuickAdd();
    } else {
      const newLeadId = Date.now().toString();
      addLead({
        id: newLeadId,
        company: leadSearch,
        sector: 'Nieuw',
        vehicles: 0,
        email: '',
        status: 'new',
        reminders: [{ id: Date.now().toString() + "-rem", text: quickTask, date: fullDateTime, completed: false }]
      });
      clearQuickAdd();
    }
  };

  // Aggregation Logic
  const allReminders = leads.flatMap(lead => 
    (lead.reminders || []).map(rem => ({
      ...rem,
      leadId: lead.id,
      company: lead.company,
      sector: lead.sector
    }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  const now = new Date();
  
  const filterTasks = () => {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23,59,59,999);
    
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    switch(activeTab) {
      case 'overdue':
        return allReminders.filter(t => new Date(t.date) < now && !t.completed);
      case 'today':
        return allReminders.filter(t => {
          const d = new Date(t.date);
          return d >= todayStart && d <= todayEnd;
        });
      case 'upcoming':
        return allReminders.filter(t => new Date(t.date) >= tomorrowStart);
      default:
        return [];
    }
  };

  const tasks = filterTasks();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">{t('agenda')}</h2>
          <p className="text-sm text-tesla-muted mt-1 font-medium">{t('agendaDescription')}</p>
        </div>

        <div className="flex bg-tesla-surface rounded-tesla border border-tesla-border p-1 shrink-0">
          {[
            { id: 'overdue', label: t('overdue'), icon: ExclamationTriangleIcon, color: 'text-red-500' },
            { id: 'today', label: t('today'), icon: ClockIcon, color: 'text-fleet-orange' },
            { id: 'upcoming', label: t('upcoming'), icon: CalendarIcon, color: 'text-[#007AFF]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-2 rounded-tesla text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-tesla-border text-white' 
                  : 'text-tesla-muted hover:text-white'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : 'text-tesla-muted'}`} />
              {tab.label}
              <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-sm ${activeTab === tab.id ? 'bg-white/10' : 'bg-white/5 opacity-50'}`}>
                {
                  tab.id === 'overdue' ? allReminders.filter(r => new Date(r.date) < now && !r.completed).length :
                  tab.id === 'today' ? allReminders.filter(r => {
                      const d = new Date(r.date);
                      const s = new Date(); s.setHours(0,0,0,0);
                      const e = new Date(s); e.setHours(23,59,59,999);
                      return d >= s && d <= e;
                  }).length :
                  allReminders.filter(r => {
                      const s = new Date(); s.setHours(0,0,0,0);
                      s.setDate(s.getDate()+1);
                      return new Date(r.date) >= s;
                  }).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-tesla-surface rounded-tesla-lg p-8 border border-tesla-border relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-tesla-blue/5 rounded-full blur-3xl group-hover:bg-tesla-blue/10 transition-all duration-700"></div>
        
        <h3 className="text-[10px] font-black uppercase tracking-superwide text-tesla-blue mb-6 flex items-center gap-3">
          <div className="h-1 w-6 bg-tesla-blue"></div>
          {t('quickTask')}
        </h3>
        <form onSubmit={handleQuickAddSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
          <div className="relative md:col-span-3">
            <label className="block text-[9px] font-black text-tesla-muted uppercase tracking-superwide mb-2 ml-1">{t('company')}</label>
            <div className="relative group/input">
               <input 
                type="text" 
                placeholder={t('companyPlaceholder')}
                value={leadSearch}
                onChange={e => {
                  setLeadSearch(e.target.value);
                  setTargetLead(null);
                }}
                className="w-full rounded-tesla border-tesla-border bg-tesla-elevated py-3 px-5 text-sm focus:border-tesla-muted transition-all outline-none placeholder:text-tesla-muted/50"
              />
              <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tesla-muted group-focus-within/input:text-white transition-colors" />
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && leadSearch.trim() && (
              <div ref={suggestionsRef} className="absolute z-[60] mt-2 w-full glass-deep rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-in fade-in slide-in-from-top-2">
                {matchedLeads.map(l => (
                  <button 
                    key={l.id} 
                    type="button"
                    onClick={() => handleSelectLead(l)}
                    className="w-full px-5 py-4 text-left text-sm hover:bg-fleet-orange/10 flex items-center gap-4 transition-colors border-b last:border-0 border-white/5"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center font-black text-fleet-navy shadow-sm border border-white/10">
                      {l.company?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-fleet-navy">{l.company}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{l.sector}</p>
                    </div>
                  </button>
                ))}
                
                <button 
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="w-full px-5 py-4 text-left text-sm hover:bg-fleet-navy hover:text-white flex items-center gap-4 transition-colors bg-white/5 dark:bg-black/20"
                >
                  <div className="h-10 w-10 rounded-xl bg-fleet-navy/10 flex items-center justify-center text-fleet-navy dark:text-white">
                    <UserPlusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold">"{leadSearch}" {t('addAsNew')}</p>
                    <p className="text-[10px] opacity-60 font-medium uppercase">{t('createNewLead')}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <label className="block text-[9px] font-black text-tesla-muted uppercase tracking-superwide mb-2 ml-1">{t('agendaTaskLabel')}</label>
            <input 
              type="text" 
              placeholder={t('taskPlaceholder')}
              value={quickTask}
              onChange={e => setQuickTask(e.target.value)}
              className="w-full rounded-tesla border-tesla-border bg-tesla-elevated py-3 px-5 text-sm focus:border-tesla-muted transition-all outline-none placeholder:text-tesla-muted/50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 opacity-70">{t('pickDate')}</label>
            <input 
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="w-full rounded-2xl border-white/10 bg-white/30 dark:bg-black/20 py-3.5 px-4 text-sm focus:ring-2 focus:ring-fleet-orange transition-all shadow-inner outline-none cursor-pointer"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 opacity-70">{t('pickTime')}</label>
            <input 
              type="time"
              value={taskTime}
              onChange={e => setTaskTime(e.target.value)}
              className="w-full rounded-2xl border-white/10 bg-white/30 dark:bg-black/20 py-3.5 px-4 text-sm focus:ring-2 focus:ring-fleet-orange transition-all shadow-inner outline-none cursor-pointer"
            />
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={!quickTask.trim() || !taskDate || !taskTime || !leadSearch.trim()}
              className="w-full flex items-center justify-center gap-3 rounded-tesla bg-primary py-3 text-[11px] font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-30 transition-all"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              {t('addLead') || 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Task List Section */}
      <div className="grid grid-cols-1 gap-3">
        {tasks.length > 0 && tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => navigate('/leads', { state: { selectedLeadId: task.leadId } })}
            className={`group bg-tesla-surface rounded-tesla p-5 border border-tesla-border hover:border-tesla-muted cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ${task.completed ? 'opacity-40 grayscale' : ''}`}
          >
            <div className="flex items-center gap-6">
              <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center border transition-transform group-hover:scale-110 ${
                activeTab === 'overdue' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                activeTab === 'today' ? 'bg-fleet-orange/10 border-fleet-orange/20 text-fleet-orange' :
                'bg-[#007AFF]/10 border-[#007AFF]/20 text-[#007AFF]'
              }`}>
                <span className="text-xl font-black leading-none">{new Date(task.date).getDate()}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter mt-1">
                  {new Date(task.date).toLocaleDateString('tr-TR', { month: 'short' })}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`text-lg font-black tracking-tight transition-colors ${task.completed ? 'line-through text-tesla-muted' : 'text-white'}`}>
                    {task.company}
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-white/5 text-tesla-muted uppercase tracking-wider">
                    {task.sector}
                  </span>
                </div>
                <p className="text-tesla-muted font-medium flex items-center gap-1.5 leading-relaxed text-sm">
                  <span className="h-1 w-1 rounded-full bg-tesla-muted"></span>
                  {task.text}
                </p>
                <div className="flex items-center gap-4 pt-1">
                   <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {new Date(task.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   {new Date(task.date) < now && !task.completed && (
                     <span className="text-[10px] font-black text-red-500 animate-pulse bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                       {t('overdue')}
                     </span>
                   )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!task.completed && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteReminder(task.leadId, task.id);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-tesla bg-tesla-border text-white text-[10px] font-black uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  {t('completeTask')}
                  <CheckCircleIcon className="h-3.5 w-3.5 stroke-[3px]" />
                </button>
              )}
              <div className="h-8 w-8 flex items-center justify-center rounded-sm bg-white/5 group-hover:bg-white/10 transition-colors">
                <ChevronRightIcon className="h-4 w-4 text-tesla-muted group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="glass-deep rounded-3xl p-20 text-center border border-white/10 opacity-60">
            <div className="h-20 w-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            </div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t('noTasks')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
