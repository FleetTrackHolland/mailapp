import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useLeads } from '../context/LeadsContext';
import { useApp } from '../context/AppContext';
import {
  UsersIcon, 
  EnvelopeIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  PlusIcon,
  ClockIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  CpuChipIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--chart-1))",
  },
  emails: {
    label: "Emails",
    color: "hsl(var(--chart-2))",
  },
}

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { leads } = useLeads();
  const { appConfig } = useApp();
  const navigate = useNavigate();
  
  const [period, setPeriod] = useState('week');

  const now = new Date();
  const hour = now.getHours();
  
  const greeting = useMemo(() => {
    if (language === 'nl') return hour < 12 ? '☀️ Goedemorgen' : hour < 18 ? '👋 Goedemiddag' : '🌙 Goedenavond';
    if (language === 'tr') return hour < 12 ? '☀️ Günaydın' : hour < 18 ? '👋 İyi Günler' : '🌙 İyi Akşamlar';
    return hour < 12 ? '☀️ Good Morning' : hour < 18 ? '👋 Good Afternoon' : '🌙 Good Evening';
  }, [hour, language]);

  // KPI calculations
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => ['contacted', 'interested', 'in_discussion'].includes(l.status)).length;
  const customers = leads.filter(l => l.status === 'customer').length;
  const convRate = totalLeads > 0 ? ((customers / totalLeads) * 100).toFixed(1) : '0.0';
  
  const newThisWeek = leads.filter(l => {
    if (!l.createdAt) return false;
    return (now - new Date(l.createdAt)) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const chartData = [
    { day: "Mon", leads: 12, emails: 45 },
    { day: "Tue", leads: 19, emails: 62 },
    { day: "Wed", leads: 14, emails: 55 },
    { day: "Thu", leads: 22, emails: 78 },
    { day: "Fri", leads: 18, emails: 66 },
    { day: "Sat", leads: 27, emails: 84 },
    { day: "Sun", leads: totalLeads || 31, emails: 97 },
  ]

  const upcomingTasks = [
    { time: "10:30", task: "Vervolg gesprek met Tesla", target: "Tesla Inc.", color: "text-blue-500" },
    { time: "14:00", task: "Demo FleetTrack Pro", target: "SpaceX", color: "text-purple-500" },
    { time: "16:45", task: "Offerte doorlopen", target: "Apple", color: "text-emerald-500" },
  ]

  const activities = [
    { text: "Nieuwe lead toegevoegd via website", company: "Microsoft", time: "2 min geleden", type: "system" },
    { text: "E-mail campagne 'Lente 2024' verzonden", company: "Interne Marketing", time: "45 min geleden", type: "mail" },
    { text: "Status gewijzigd naar 'Geïnteresseerd'", company: "Amazon", time: "2 uur geleden", type: "status" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ── Header Area ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            {greeting}, Dogan
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Hier is een overzicht van uw CRM-activiteiten voor bugün.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="rounded-full gap-2">
             <ArrowPathIcon className="h-4 w-4" />
             {t('refresh') || 'Vernieuwen'}
           </Button>
           <Button size="sm" className="rounded-full gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={() => navigate('/leads')}>
             <PlusIcon className="h-4 w-4" />
             {t('addLead')}
           </Button>
        </div>
      </div>

      {/* ── KPI Bento Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('totalLeads'), value: totalLeads, detail: `+${newThisWeek} deze week`, icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: t('activeLeads'), value: activeLeads, detail: `${Math.round((activeLeads/totalLeads)*100 || 0)}% van totaal`, icon: FireIcon, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: t('conversionRate'), value: `${convRate}%`, detail: `${customers} klanten`, icon: ChartBarIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "AI Efficiency", value: "+22%", detail: "Optimalisatie door automation", icon: CpuChipIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover-glow transition-all duration-300 border-border/50 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                    <h3 className="text-3xl font-bold mt-2 tracking-tight">{kpi.value}</h3>
                  </div>
                  <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <ArrowUpIcon className="h-3 w-3" />
                    12%
                  </span>
                  <span>{kpi.detail}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Main Section Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Growth Chart (Col 8) */}
        <Card className="lg:col-span-8 border-border/50 shadow-sm overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">E-mail & Leads Groei</CardTitle>
              <CardDescription>Prestaties over de son 7 gün</CardDescription>
            </div>
            <Tabs defaultValue="leads" className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2 rounded-full h-9 p-1">
                <TabsTrigger value="leads" className="text-xs rounded-full">Leads</TabsTrigger>
                <TabsTrigger value="emails" className="text-xs rounded-full">E-mails</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
             <ChartContainer config={chartConfig} className="h-full w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--tesla-blue)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--tesla-blue)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="currentColor" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="leads" stroke="var(--tesla-blue)" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm border-t border-border/50 py-4 bg-muted/5">
            <div className="flex gap-2 font-medium leading-none">
              In totaal {totalLeads} leads gegenereerd deze week <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
            </div>
          </CardFooter>
        </Card>

        {/* Upcoming Tasks (Col 4) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <Card className="border-border/50 shadow-sm flex-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Agenda</CardTitle>
                <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {upcomingTasks.map((task, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold text-foreground">{task.time}</div>
                    <div className="w-px h-full bg-border mt-2 mb-2 group-last:hidden" />
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{task.task}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.target}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
               <Button variant="ghost" className="w-full text-xs font-semibold text-primary rounded-xl" onClick={() => navigate('/agenda')}>
                 Bekijk volledige agenda
               </Button>
            </CardFooter>
          </Card>

          {/* Apex Analytics Integrated Widget */}
          <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <SparklesIcon className="h-24 w-24 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Apex Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground font-medium">Conversie Kans</span>
                    <span className="text-foreground font-bold">84.2%</span>
                  </div>
                  <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '84.2%' }}
                      className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                    />
                  </div>
                </div>
                <div className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Inzicht</span>
                    <Badge variant="outline" className="text-[9px] h-4 bg-primary/10 text-primary border-none">AI Tip</Badge>
                  </div>
                  <p className="text-[11px] mt-2 font-medium leading-relaxed">
                    Focus bugün "Follow-up" görüşmelerine ROI için odaklanın.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Secondary Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recent Activity */}
         <Card className="lg:col-span-2 border-border/50 shadow-sm">
           <CardHeader className="flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-bold tracking-tight">Recente Activiteit</CardTitle>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full">
               <ArrowPathIcon className="h-4 w-4" />
             </Button>
           </CardHeader>
           <CardContent className="p-0">
             <div className="divide-y divide-border/50">
               {activities.map((act, i) => (
                 <div key={i} className="px-6 py-4 hover:bg-muted/30 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 cursor-pointer flex items-center justify-center rounded-2xl border border-border group-hover:scale-110 transition-transform ${act.type === 'system' ? 'text-blue-500' : act.type === 'mail' ? 'text-orange-500' : 'text-purple-500'}`}>
                        {act.type === 'system' ? <CpuChipIcon className="h-5 w-5" /> : act.type === 'mail' ? <EnvelopeIcon className="h-5 w-5" /> : <ChartBarIcon className="h-5 w-5" />}
                     </div>
                     <div>
                       <h4 className="text-sm font-semibold">{act.text}</h4>
                       <p className="text-xs text-muted-foreground">{act.company}</p>
                     </div>
                   </div>
                   <span className="text-[10px] font-medium text-muted-foreground">{act.time}</span>
                 </div>
               ))}
             </div>
           </CardContent>
           <CardFooter className="justify-center border-t border-border/50 py-3">
             <Button variant="link" className="text-xs text-muted-foreground">Toon alle activiteiten</Button>
           </CardFooter>
         </Card>

         {/* Email Performance */}
         <Card className="lg:col-span-1 border-border/50 shadow-sm">
           <CardHeader>
             <CardTitle className="text-lg font-bold tracking-tight">E-mail Campagne</CardTitle>
             <CardDescription>Succes ratio's</CardDescription>
           </CardHeader>
           <CardContent>
             <ChartContainer config={chartConfig} className="h-[180px] w-full mt-2">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="emails" fill="var(--tesla-blue)" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </ChartContainer>
             <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="text-center">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Geopend</p>
                 <p className="text-lg font-bold mt-1 text-emerald-500">64%</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Geklikt</p>
                 <p className="text-lg font-bold mt-1 text-blue-500">12%</p>
               </div>
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
