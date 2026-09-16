import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  MapPin, 
  GitFork, 
  FileText, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  Cpu,
  UserCheck,
  Building2
} from 'lucide-react';
import { BackButton } from '../../components/common/BackButton';

export const SolutionsPage: React.FC<{ 
  onGetStarted?: () => void; 
  onNavigate: (route: string) => void;
  onBack?: () => void;
}> = ({
  onGetStarted,
  onNavigate,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'INVESTIGATOR' | 'POLICE_OFFICER'>('INVESTIGATOR');

  return (
    <div className="w-full bg-slate-50 dark:bg-[#030712] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation / Back Button */}
        <div>
          <BackButton
            label="Back to Home"
            onClick={onBack ? onBack : () => onNavigate('home')}
          />
        </div>

        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="font-['Outfit',_sans-serif] text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Role-Specific Investigation Intelligence
          </h1>
          <p className="font-['Plus_Jakarta_Sans',_sans-serif] text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            Tailored workflows for forensic cybercell analysts and on-ground police officers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-200 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-1.5 rounded-2xl flex items-center gap-2 max-w-md w-full shadow-sm">
            <button
              onClick={() => setActiveTab('INVESTIGATOR')}
              className={`flex-1 py-3 px-4 rounded-xl font-['Outfit',_sans-serif] text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'INVESTIGATOR'
                  ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>CYBERCRIME INVESTIGATORS</span>
            </button>

            <button
              onClick={() => setActiveTab('POLICE_OFFICER')}
              className={`flex-1 py-3 px-4 rounded-xl font-['Outfit',_sans-serif] text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'POLICE_OFFICER'
                  ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>POLICE OFFICERS</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Investigator */}
        {activeTab === 'INVESTIGATOR' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/40 text-cyan-800 dark:text-cyan-300 text-xs font-mono font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>FOR FORENSIC ANALYSTS & CYBER CELLS</span>
                </div>
                <h2 className="font-['Outfit',_sans-serif] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Multi-Tier Financial Reconstruction
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  Automates ledger extraction, multi-hop mule tracing, and Section 91 notice generation from raw bank statements and UPI logs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-['Outfit',_sans-serif] font-bold text-sm">
                    <GitFork className="w-4 h-4" />
                    <span>Multi-Hop Layering</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Tracks layer-1 through layer-3 transfers with real-time remaining balance calculations.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-['Outfit',_sans-serif] font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Court-Ready Dossiers</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Generates structured case dossiers with full transaction timelines and exhibit attachments.
                  </p>
                </div>
              </div>

              <button
                onClick={onGetStarted ? onGetStarted : () => onNavigate('login')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 font-['Outfit',_sans-serif] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>OPEN INVESTIGATOR WORKBENCH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-['Outfit',_sans-serif] text-base font-bold text-slate-900 dark:text-slate-200">
                Automated Forensic Pipeline
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-cyan-300 font-bold">01. COMPLAINT INGESTION & PARSING</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">COMPLETED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-cyan-300 font-bold">02. MULTI-HOP MULE GRAPH EXPANSION</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">MAPPED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-cyan-300 font-bold">03. AI PATTERN & RISK CLASSIFICATION</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">CRITICAL</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-cyan-300 font-bold">04. PREDICTIVE CASHOUT RADAR PINPOINTING</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">RADAR READY</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>FOR POLICE STATIONS & PATROL UNITS</span>
                </div>
                <h2 className="font-['Outfit',_sans-serif] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  On-Ground Interception Intelligence
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  Delivers geographic coordinates and ranked ATM candidate locations to patrol units for fast on-ground response.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-['Outfit',_sans-serif] font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Regional Threat Radar</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Interactive state and district map showing high-risk cash-out zones.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-['Outfit',_sans-serif] font-bold text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Dispatch Briefings</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Concise tactical summaries ready for patrol deployment and ATM monitoring.
                  </p>
                </div>
              </div>

              <button
                onClick={onGetStarted ? onGetStarted : () => onNavigate('login')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950 font-['Outfit',_sans-serif] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>LOG IN AS POLICE OFFICER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="font-['Outfit',_sans-serif] text-base font-bold text-slate-900 dark:text-slate-200">
                Tactical Law Enforcement Dispatch Flow
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-red-500/30 flex items-center justify-between">
                  <span className="text-red-700 dark:text-red-300 font-bold">01. HIGH-RISK CASE ALERT</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">URGENT</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-amber-700 dark:text-amber-300 font-bold">02. REGIONAL CASHOUT PREDICTION</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">LOCATED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">03. ATM KIOSK SURVEILLANCE DIRECTIVE</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-cyan-300 font-bold">04. ON-GROUND INTERCEPTION LOGGED</span>
                  <span className="text-sky-600 dark:text-sky-400 font-bold">RESOLVED</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
