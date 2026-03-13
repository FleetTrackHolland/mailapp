import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  CpuChipIcon, 
  CommandLineIcon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function CyberHUD() {
  const [isOpen, setIsOpen] = useState(false);
  const [briefing, setBriefing] = useState('AI Kern initialiseren...');
  
  const briefings = [
    // TIMING STRATEGIE
    "📊 Timing Tip: Dinsdag en woensdag om 09:00-10:00 hebben de hoogste open rates (42%). Plan nu uw campagne.",
    // FOLLOW-UP STRATEGIE
    "🔄 Follow-up Alert: Leads die binnen 48 uur een 2e mail ontvangen converteren 3x vaker. Activeer uw follow-up reeks.",
    // PERSONALISATIE
    "🎯 Personalisatie: Mails met de bedrijfsnaam in het onderwerp hebben 26% hogere open rate. Gebruik {{companyName}} variabelen.",
    // SECTOR ANALYSE
    "📈 Sector Analyse: Bouw- en installatiebedrijven tonen 34% hogere interesse in vlootbeheer dit kwartaal. Focus hierop.",
    // OUTREACH STRATEGIE
    "💡 Beste Aanpak: Stuur eerst waarde (gratis demo/rapport), vraag pas in mail 2 om een gesprek. Converteert 2x beter.",
    // CONCURRENTIE
    "⚡ Marktinzicht: 67% van de {{sector}} bedrijven in uw regio gebruikt nog geen digitale ritregistratie. Groot potentieel.",
    // URGENTIE
    "🔥 Urgentie Tip: Vermeld concrete besparingen (€) in uw onderwerpregel. Voorbeeld: 'Bespaar €2.400/jaar op ritregistratie'.",
    // SOCIAL PROOF
    "⭐ Social Proof: Voeg een klantquote toe aan uw mail. Bedrijven vertrouwen andere bedrijven meer dan marketing.",
    // CONTACT STRATEGIE
    "📞 Multi-channel: Combineer email met een LinkedIn connectie 24u later. Dit verhoogt de responsrate met 55%.",
    // A/B TEST
    "🧪 A/B Test: Test twee onderwerpregels per campagne. Zelfs kleine aanpassingen kunnen 15-20% verschil maken.",
    // LEAD SCORING
    "🏆 High-Intent Leads: Focus eerst op leads met score 80+. Deze hebben de kortste sales cycle (gem. 12 dagen).",
    // SEIZOEN STRATEGIE
    "📅 Seizoensinzicht: Q1 is het beste kwartaal voor fleet-aankopen. Bedrijven plannen nu hun jaarbudget."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setBriefing(briefings[i % briefings.length]);
      i++;
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-80 bg-popover/90 backdrop-blur-xl border border-border shadow-2xl rounded-[2rem] p-6 relative overflow-hidden"
          >
            {/* Background scanner animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
              <motion.div 
                animate={{ y: [0, 400, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="h-px w-full bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]" 
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Apex Assistant v2.0</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 rounded-full hover:bg-muted">
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <CommandLineIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Briefing</span>
                </div>
                <p className="text-[12px] font-medium text-foreground leading-relaxed italic">
                  "{briefing}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Status</span>
                  <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-none h-5 px-2">OPTIMAAL</Badge>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Signaal</span>
                  <span className="text-[10px] font-black text-emerald-500">BEVEILIGD</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <CpuChipIcon className="h-4 w-4 text-muted-foreground/30 mx-2" />
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="apex-hud-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/20 border border-white/10 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <BoltIcon className="h-8 w-8 text-primary-foreground" />
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full animate-pulse bg-primary/20 blur-xl -z-10" />
      </motion.button>
    </div>
  );
}
