import React from 'react';
import { 
  FileEdit, 
  UploadCloud, 
  Brain, 
  GitFork, 
  Compass, 
  MapPin, 
  Building2, 
  FileCheck2,
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import { BackButton } from '../../components/common/BackButton';

export const HowItWorksPage: React.FC<{ 
  onGetStarted?: () => void;
  onNavigate: (route: string) => void;
  onBack?: () => void;
}> = ({ 
  onGetStarted,
  onNavigate,
  onBack,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Register Complaint',
      icon: FileEdit,
      color: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-300 dark:border-cyan-500/40',
      bg: 'bg-cyan-100 dark:bg-cyan-950/40',
      desc: 'Record victim details, transaction IDs, IFSC codes, UPI handles, and loss amount.',
    },
    {
      step: '02',
      title: 'Attach Evidence',
      icon: UploadCloud,
      color: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-300 dark:border-sky-500/40',
      bg: 'bg-sky-100 dark:bg-sky-950/40',
      desc: 'Upload bank statements, FIR copies, chat logs, fake warrants, and payment receipts.',
    },
    {
      step: '03',
      title: 'Analyze Modus Operandi',
      icon: Brain,
      color: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-300 dark:border-indigo-500/40',
      bg: 'bg-indigo-100 dark:bg-indigo-950/40',
      desc: 'Categorize the fraud type, evaluate risk levels, and establish an initial case timeline.',
    },
    {
      step: '04',
      title: 'Trace Money Trail',
      icon: GitFork,
      color: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-500/40',
      bg: 'bg-amber-100 dark:bg-amber-950/40',
      desc: 'Map fund movement through layer-1, layer-2, and layer-3 mule accounts with balance checks.',
    },
    {
      step: '05',
      title: 'Analyze Patterns & Transit',
      icon: Compass,
      color: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-500/40',
      bg: 'bg-purple-100 dark:bg-purple-950/40',
      desc: 'Evaluate transfer speed, dormant account usage, and inter-state movement patterns.',
    },
    {
      step: '06',
      title: 'Predict Cash-Out Region',
      icon: MapPin,
      color: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-300 dark:border-rose-500/40',
      bg: 'bg-rose-100 dark:bg-rose-950/40',
      desc: 'Identify the probable state, district, and city where funds will be withdrawn.',
    },
    {
      step: '07',
      title: 'Rank ATM Candidates',
      icon: Building2,
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-500/40',
      bg: 'bg-emerald-100 dark:bg-emerald-950/40',
      desc: 'Highlight nearby ATM locations based on probability, distance, and transit accessibility.',
    },
    {
      step: '08',
      title: 'Generate Reports & Notices',
      icon: FileCheck2,
      color: 'text-teal-600 dark:text-teal-400',
      border: 'border-teal-300 dark:border-teal-500/40',
      bg: 'bg-teal-100 dark:bg-teal-950/40',
      desc: 'Export Section 91 notices, police dispatch briefs, and complete evidence dossiers.',
    },
  ];

  return (
    <div className="w-full bg-slate-50 dark:bg-[#030712] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Navigation / Back Button */}
        <div>
          <BackButton
            label="Back to Home"
            onClick={onBack ? onBack : () => onNavigate('home')}
          />
        </div>

        {/* Header */}
        <div className="space-y-4 text-center">
          <h1 className="font-['Outfit',_sans-serif] text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How the Investigation Workflow Works
          </h1>
          <p className="font-['Plus_Jakarta_Sans',_sans-serif] text-slate-600 dark:text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            From initial complaint intake to mule account mapping and cash-out forecasting.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative space-y-6">
          {/* Vertical Center Line */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-amber-500 to-emerald-500 -translate-x-1/2 opacity-30" />

          {steps.map((s, index) => {
            const Icon = s.icon;
            const isEven = index % 2 === 0;

            return (
              <div key={s.step} className="relative flex flex-col items-center">
                
                <div className={`w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${isEven ? '' : 'md:flex-row-reverse'}`}>
                  
                  {/* Content Box */}
                  <div className={`${isEven ? 'md:text-right' : 'md:col-start-2 md:text-left'} space-y-2`}>
                    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-2.5 shadow-md hover:border-cyan-500/50 dark:hover:border-slate-700 transition-all">
                      <div className={`flex items-center gap-2 font-mono text-xs font-bold ${s.color} ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                        <span>STEP {s.step}</span>
                      </div>
                      <h3 className="font-['Outfit',_sans-serif] text-lg font-bold text-slate-900 dark:text-white">
                        {s.title}
                      </h3>
                      <p className="font-['Plus_Jakarta_Sans',_sans-serif] text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>

                  {/* Icon Indicator for Desktop */}
                  <div className={`hidden md:flex items-center justify-center ${isEven ? 'md:col-start-2 justify-start' : 'md:col-start-1 justify-end'}`}>
                    <div className={`w-14 h-14 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center ${s.color} shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                </div>

                {/* Arrow Connector */}
                {index < steps.length - 1 && (
                  <div className="my-3 text-slate-400 dark:text-slate-600">
                    <ArrowDown className="w-4 h-4 text-cyan-600 dark:text-cyan-500/60" />
                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-2xl bg-slate-100 dark:bg-gradient-to-r dark:from-slate-900 dark:via-cyan-950/40 dark:to-slate-900 border border-slate-200 dark:border-cyan-500/30 text-center space-y-4 shadow-md">
          <h3 className="font-['Outfit',_sans-serif] text-2xl font-bold text-slate-900 dark:text-white">
            Experience the End-to-End Investigation Workflow
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Log in to the authenticated portal to register a complaint, run live AI predictive intelligence, and inspect money trails in real-time.
          </p>
          <button
            onClick={onGetStarted ? onGetStarted : () => onNavigate('login')}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 font-['Outfit',_sans-serif] font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span>LAUNCH GARUDA PLATFORM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
