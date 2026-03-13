import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useLeads } from '../context/LeadsContext';
import { useApp } from '../context/AppContext';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  ShareIcon, 
  CheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import LeadModal from '../components/LeadModal';
import AIAgent from '../components/AIAgent';
import { AnimatePresence, motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : 'http://localhost:3001/api');

const statusConfig = {
  new: { color: 'bg-blue-500/10 text-blue-600 border-blue-200', label: 'Nieuw' },
  contacted: { color: 'bg-slate-500/10 text-slate-600 border-slate-200', label: 'Contact gehad' },
  interested: { color: 'bg-purple-500/10 text-purple-600 border-purple-200', label: 'Interesse' },
  customer: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', label: 'Klant' },
  rejected: { color: 'bg-rose-500/10 text-rose-600 border-rose-200', label: 'Afgewezen' },
};

export default function Leads() {
  const { t } = useLanguage();
  const { leads, updateLeadStatus, addLead, updateLead, deleteLead, bulkDeleteLeads, bulkUpdateLeadStatus } = useLeads();
  const { appConfig } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [apexLead, setApexLead] = useState(null);

  const selectedLeadIdFromState = location.state?.selectedLeadId;
  const filterStatus = location.state?.filterStatus;

  const handleOpenModal = (lead = null) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = (leadData) => {
    if (editingLead) {
      updateLead(editingLead.id, leadData);
    } else {
      addLead(leadData);
    }
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Weet u zeker dat u deze lead wilt verwijderen?')) {
      deleteLead(id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Sector', 'Location', 'Score', 'Email', 'Phone', 'Vehicles', 'Website', 'Status', 'Next Action', 'Created At'];
    const targetLeads = selectedIds.length > 0 
      ? leads.filter(l => selectedIds.includes(l.id))
      : filteredLeads;

    const rows = targetLeads.map(lead => [
      `"${lead.company || lead.name}"`, 
      `"${lead.sector}"`,
      `"${lead.location || ''}"`,
      lead.score || 0,
      `"${lead.email}"`,
      `"${lead.phone || ''}"`,
      lead.vehicles || 0,
      `"${lead.website || ''}"`,
      `"${t(lead.status)}"`,
      `"${lead.nextAction || ''}"`,
      `"${new Date(lead.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const prefix = appConfig.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.setAttribute('download', `${prefix}-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToSheets = async () => {
    try {
      const token = localStorage.getItem('google_access_token');
      if (!token) {
        alert('Log eerst in met Google om naar Sheets te exporteren.');
        return;
      }
      setIsExporting(true);
      const response = await axios.post(`${API_URL.replace('/api', '')}/api/export-sheets`, {
        accessToken: token,
        leads: filteredLeads
      });
      if (response.data.success) {
        if (window.confirm('Export succesvol! Wilt u het Google Sheet nu openen?')) {
          window.open(response.data.spreadsheetUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Exporteren naar Google Sheets mislukt. Controleer uw machtigingen.');
    } finally {
      setIsExporting(false);
    }
  };

  const sectors = useMemo(() => [...new Set(leads.map(lead => lead.sector))].filter(Boolean), [leads]);

  const filteredLeads = useMemo(() => leads.filter(lead => {
    if (selectedLeadIdFromState && lead.id !== selectedLeadIdFromState) return false;
    if (filterStatus === 'active') {
      if (!['contacted', 'interested', 'in_discussion'].includes(lead.status)) return false;
    } else if (filterStatus === 'customer') {
      if (lead.status !== 'customer') return false;
    }
    const matchesSearch = (lead.company || lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === '' || lead.sector === sectorFilter;
    return matchesSearch && matchesSector;
  }), [leads, selectedLeadIdFromState, filterStatus, searchTerm, sectorFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`${selectedIds.length} leads verwijderen?`)) {
      bulkDeleteLeads(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkStatusUpdate = (status) => {
    bulkUpdateLeadStatus(selectedIds, status);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ── Header Area ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('leads')}</h1>
          <p className="text-muted-foreground mt-1">Beheer en volg uw potentiële klanten en vlootgegevens.</p>
        </div>
        <div className="flex gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-full gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Exporteren
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
                  CSV Bestand (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportToSheets} className="gap-2 cursor-pointer" disabled={isExporting}>
                   {isExporting ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ShareIcon className="h-4 w-4" />}
                   Google Sheets
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
           <Button className="rounded-full gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={() => handleOpenModal()}>
             <PlusIcon className="h-4 w-4" />
             {t('addLead')}
           </Button>
        </div>
      </div>

      {/* ── Filters & Search ───────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full bg-muted/50 border-border/50 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full gap-2 whitespace-nowrap bg-primary text-primary-foreground">
                    <FunnelIcon className="h-4 w-4" />
                    {sectorFilter || "Alle Sectoren"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl max-h-60 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setSectorFilter('')}>Alle Sectoren</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {sectors.map(s => (
                    <DropdownMenuItem key={s} onClick={() => setSectorFilter(s)}>
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchTerm || sectorFilter || filterStatus) && (
                <Button variant="ghost" onClick={() => { setSearchTerm(''); setSectorFilter(''); navigate('/leads', { state: {} }); }} className="text-xs text-muted-foreground hover:text-primary">
                  Filters wissen
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Main Data Table ────────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-12 px-6">
                <Checkbox 
                  checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                  onCheckedChange={toggleSelectAll}
                  className="rounded-md"
                />
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest py-4">{t('company')}</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest py-4">Sector</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest py-4">Score</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-widest py-4 text-right pr-10">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="group hover:bg-muted/20 transition-colors">
                <TableCell className="px-6">
                  <Checkbox 
                    checked={selectedIds.includes(lead.id)}
                    onCheckedChange={() => toggleSelectLead(lead.id)}
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      {(lead.company || lead.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground">{lead.company || lead.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-muted-foreground">{lead.sector || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-wider ${statusConfig[lead.status]?.color || ''}`}>
                    {statusConfig[lead.status]?.label || lead.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                      <div className={`h-full ${lead.score > 75 ? 'bg-emerald-500' : lead.score > 40 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${lead.score}%` }} />
                    </div>
                    <span className="text-xs font-bold">{lead.score || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                   <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-blue-500 hover:bg-blue-50" onClick={() => setApexLead(lead)}>
                        <CpuChipIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => handleOpenModal(lead)}>
                        <PencilSquareIcon className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Extra Acties</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => handleDelete(lead.id)}>
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Wissen
                            </DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredLeads.length === 0 && (
          <div className="py-24 text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold">Geen leads gevonden</h3>
            <p className="text-muted-foreground text-sm mt-1">Probeer uw zoekterm of sectorfilter aan te passen.</p>
          </div>
        )}
      </Card>

      {/* ── Bulk Actions Floating Bar ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-foreground text-background px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center p-0 bg-primary text-primary-foreground font-bold">
                  {selectedIds.length}
                </Badge>
                <span className="text-sm font-semibold opacity-80">Geselecteerd</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs font-bold hover:bg-white/10 rounded-full h-9">
                      Status wijzigen
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="center" className="rounded-xl">
                    {Object.keys(statusConfig).map(status => (
                      <DropdownMenuItem key={status} onClick={() => handleBulkStatusUpdate(status)} className="cursor-pointer">
                        {statusConfig[status].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="destructive" size="sm" className="rounded-full h-9 px-6 font-bold" onClick={handleBulkDelete}>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Wissen
                </Button>
                
                <Button variant="ghost" size="sm" className="text-xs font-medium hover:bg-white/10 rounded-full h-9" onClick={() => setSelectedIds([])}>
                  Annuleren
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(null);
        }} 
        onSave={handleSaveLead} 
        lead={editingLead}
      />

      <AnimatePresence>
        {apexLead && (
          <AIAgent lead={apexLead} onClose={() => setApexLead(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
