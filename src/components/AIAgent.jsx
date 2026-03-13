import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  PaperAirplaneIcon, 
  ChartBarIcon, 
  LightBulbIcon,
  XMarkIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function AIAgent({ lead, onClose }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const runAnalysis = () => {
    setAnalyzing(true);
    // Simulate complex AI thinking
    setTimeout(() => {
      setResult({
        strategy: "High-Value Fleet Optimization",
        confidence: 94,
        suggestedSubject: `Optimization for ${lead.company} vloot`,
        draft: `Beste ${lead.name || 'beheerder'},\n\nIk heb ${lead.company} geanalyseerd en zie dat jullie vloot in ${lead.location || 'Nederland'} significant zou kunnen profiteren van realtime track & trace integratie. Dit kan de operationele kosten met wel 12% verlagen.\n\nZullen we een korte demo plannen?\n\nMet vriendelijke groet,\nApex Intelligence Bot`,
        nextAction: "Direct Call in 48h if no response"
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-24 bottom-24 w-96 bg-tesla-surface border border-tesla-blue/30 rounded-3xl shadow-premium z-[50] flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-tesla-border bg-gradient-to-r from-tesla-blue/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-tesla-blue/10 rounded-xl">
            <CpuChipIcon className="h-5 w-5 text-tesla-blue" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Apex AI Agent</h3>
            <p className="text-[10px] text-tesla-muted">Autonomous Strategy Orchestrator</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-tesla-muted">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-tesla-elevated/50 rounded-2xl p-4 border border-tesla-border">
          <span className="text-[10px] font-bold text-tesla-muted uppercase block mb-3">Target Intelligence</span>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-tesla-muted">Company:</span>
              <span className="text-white font-medium">{lead.company}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tesla-muted">Sector:</span>
              <span className="text-white font-medium">{lead.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tesla-muted">AI Score:</span>
              <span className="text-tesla-blue font-bold">{lead.score || 85}</span>
            </div>
          </div>
        </div>

        {!result ? (
          <div className="text-center py-8">
            {analyzing ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 border-2 border-tesla-blue/20 border-t-tesla-blue rounded-full"
                  />
                </div>
                <p className="text-xs text-tesla-muted animate-pulse">Scanning metadata and generating optimal outreach strategy...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-tesla-muted px-4">Ready to generate a high-conversion outreach plan for this lead.</p>
                <button 
                  onClick={runAnalysis}
                  className="w-full py-3 bg-tesla-blue text-white rounded-2xl font-bold text-sm shadow-glow flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="h-5 w-5" />
                  INITIATE AI CAMPAIGN DRAFT
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Strategy Match: {result.confidence}%</span>
              </div>
              <h4 className="text-white font-bold text-sm mb-1">{result.strategy}</h4>
            </div>

            <div className="bg-tesla-elevated p-4 rounded-2xl border border-tesla-border space-y-3">
              <div className="flex items-center gap-2">
                <LightBulbIcon className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-bold text-tesla-muted uppercase tracking-widest">Suggested Draft</span>
              </div>
              <div className="bg-black/20 p-3 rounded-xl">
                <p className="text-[9px] text-tesla-muted mb-2 uppercase tracking-tighter">Subject: {result.suggestedSubject}</p>
                <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">{result.draft}</p>
              </div>
            </div>

            <button className="w-full py-3 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
              <PaperAirplaneIcon className="h-5 w-5" />
              DEPLOY AS CAMPAIGN
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
