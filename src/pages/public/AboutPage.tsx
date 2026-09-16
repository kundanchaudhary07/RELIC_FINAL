import React from 'react';
import { Shield, Target, Award, CheckCircle2, ArrowRight, Lock, Eye, Compass, Users } from 'lucide-react';
import { ASSETS } from '../../assets/assetHelper';
import { BackButton } from '../../components/common/BackButton';

export const AboutPage: React.FC<{ 
  onNavigate: (route: string) => void; 
  onBack?: () => void;
  onGetStarted?: () => void;
}> = ({
  onNavigate,
  onBack,
  onGetStarted,
}) => {
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
            Cybercrime Intelligence for Law Enforcement
          </h1>
          <p className="font-['Plus_Jakarta_Sans',_sans-serif] text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            GARUDA helps cybercrime police cells and investigators track financial fraud across layered accounts and intercept cash withdrawals.
          </p>
        </div>

        {/* Section: What is GARUDA & Why Predictive Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h2 className="font-['Outfit',_sans-serif] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                The Financial Cybercrime Problem
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                In digital fraud, stolen money is quickly dispersed into layered mule accounts across multiple states and withdrawn at ATMs before freeze requests can be processed.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-['Outfit',_sans-serif] text-xl font-bold text-cyan-600 dark:text-cyan-400">
                The Approach
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                GARUDA analyzes transaction velocity, mule accounts, and transfer patterns to forecast likely cash-out locations and identify target ATMs for field interception.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 border border-cyan-500/40 flex items-center justify-center shrink-0">
                  <img src={ASSETS.LOGO} alt="GARUDA Logo" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-['Outfit',_sans-serif] text-lg font-bold text-slate-900 dark:text-white">Core Capabilities</h4>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Accurate Ledger:</strong> Tracks total fraud loss and multi-hop account balances without discrepancy.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Pattern Modeling:</strong> Evaluates transfer speed and inter-state movement to detect syndicate activity.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Actionable Leads:</strong> Converts transaction data into ranked ATM locations for on-ground response.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Mission, Vision, and Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3 shadow-sm">
            <Compass className="w-7 h-7 text-cyan-600 dark:text-cyan-400 mb-2" />
            <h3 className="font-['Outfit',_sans-serif] text-lg font-bold text-slate-900 dark:text-white">Our Mission</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-['Plus_Jakarta_Sans',_sans-serif]">
              Give investigators the tools to trace money trails and recover stolen funds before physical cash withdrawal.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3 shadow-sm">
            <Eye className="w-7 h-7 text-sky-600 dark:text-sky-400 mb-2" />
            <h3 className="font-['Outfit',_sans-serif] text-lg font-bold text-slate-900 dark:text-white">Our Focus</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-['Plus_Jakarta_Sans',_sans-serif]">
              Reduce response time across state boundaries through real-time forensic insights and cross-region coordination.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3 shadow-sm">
            <Shield className="w-7 h-7 text-amber-600 dark:text-amber-400 mb-2" />
            <h3 className="font-['Outfit',_sans-serif] text-lg font-bold text-slate-900 dark:text-white">Investigation Standards</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-['Plus_Jakarta_Sans',_sans-serif]">
              Provide court-ready evidence dossiers and Section 91 notices backed by verified transaction records.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1">
            <h3 className="font-['Outfit',_sans-serif] text-xl font-bold text-slate-900 dark:text-white">
              Explore Platform Features
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Review money trail analysis, ATM candidate ranking, and forensic reports.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('features')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-['Outfit',_sans-serif] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              VIEW FEATURES
            </button>
            <button
              onClick={onGetStarted ? onGetStarted : () => onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 text-xs font-['Outfit',_sans-serif] font-bold dark:hover:bg-cyan-300 transition-colors cursor-pointer shadow-md"
            >
              START INVESTIGATION
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
