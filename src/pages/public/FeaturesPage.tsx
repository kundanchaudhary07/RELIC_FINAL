import React from 'react';
import { 
  BrainCircuit, 
  CreditCard, 
  GitFork, 
  Activity, 
  Compass, 
  MapPin, 
  Building2, 
  ShieldAlert, 
  FolderArchive, 
  Briefcase, 
  FileText, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { BackButton } from '../../components/common/BackButton';

export const FeaturesPage: React.FC<{ 
  onGetStarted?: () => void; 
  onNavigate: (route: string) => void;
  onBack?: () => void;
}> = ({
  onGetStarted,
  onNavigate,
  onBack,
}) => {
  const features = [
    {
      num: '01',
      title: 'Modus Operandi Analysis',
      icon: BrainCircuit,
      route: 'ai-analysis',
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/40',
      desc: 'Evaluates fraud patterns, suspect communication transcripts, and syndicate signatures to identify organized crime groups.',
    },
    {
      num: '02',
      title: 'Transaction Intelligence',
      icon: CreditCard,
      route: 'active-cases',
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/40',
      desc: 'Parses bank statements, reference numbers, UPI handles, and IFSC codes to trace end-to-end fund flows.',
    },
    {
      num: '03',
      title: 'Money Trail Analysis',
      icon: GitFork,
      route: 'money-trail',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/40',
      desc: 'Reconstructs multi-hop transfers through layer-1, layer-2, and layer-3 mule accounts with exact remaining balances.',
    },
    {
      num: '04',
      title: 'Behavioral Pattern Analysis',
      icon: Activity,
      route: 'ai-analysis',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/40',
      desc: 'Detects unusual transfer velocity, dormant account reactivations, and suspicious off-peak transactions.',
    },
    {
      num: '05',
      title: 'Geographical Intelligence',
      icon: Compass,
      route: 'location-intelligence',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40',
      desc: 'Correlates incident locations with banking nodes, IP telemetry, and known inter-state fraud routes.',
    },
    {
      num: '06',
      title: 'Predictive Location Intelligence',
      icon: MapPin,
      route: 'location-intelligence',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/40',
      desc: 'Forecasts the likely target state, district, and city where criminals plan to withdraw funds.',
    },
    {
      num: '07',
      title: 'ATM Candidate Ranking',
      icon: Building2,
      route: 'atm-intelligence',
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/40',
      desc: 'Ranks nearby ATM kiosks based on withdrawal probability, transit proximity, and operational status.',
    },
    {
      num: '08',
      title: 'Risk Assessment & Scoring',
      icon: ShieldAlert,
      route: 'risk-heatmap',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/40',
      desc: 'Calculates risk severity scores based on dispersal speed, loss amount, and withdrawal imminence.',
    },
    {
      num: '09',
      title: 'Evidence Management',
      icon: FolderArchive,
      route: 'evidence',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800/40',
      desc: 'Maintains chain-of-custody for FIR copies, certified bank statements, chat exports, and suspect exhibits.',
    },
    {
      num: '10',
      title: 'Case Repository',
      icon: Briefcase,
      route: 'cases',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/40',
      desc: 'Search and filter active and archived cases by Case ID, victim details, transaction reference, or status.',
    },
    {
      num: '11',
      title: 'Section 91 & Forensic Reports',
      icon: FileText,
      route: 'reports',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800/40',
      desc: 'Generates structured legal notices and court-ready dossiers with complete transaction histories.',
    },
    {
      num: '12',
      title: 'Interactive Map Radar',
      icon: Layers,
      route: 'location-intelligence',
      color: 'text-cyan-600 dark:text-cyan-300',
      bg: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/40',
      desc: 'Visualizes money trajectories, regional risk zones, and ATM pins on an interactive map.',
    },
  ];

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
            Investigation & Intelligence Features
          </h1>
          <p className="font-['Plus_Jakarta_Sans',_sans-serif] text-slate-700 dark:text-slate-300 text-base leading-relaxed">
            Built to trace multi-layer money movement, evaluate syndicate risks, and forecast withdrawal targets.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.num}
                onClick={() => onNavigate(f.route)}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 space-y-4 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all text-left group shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} border flex items-center justify-center ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {f.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-['Outfit',_sans-serif] text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{f.title}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-cyan-600 dark:text-cyan-400" />
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans',_sans-serif] text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-['Outfit',_sans-serif] text-xl font-bold text-slate-900 dark:text-white">
              Discover tailored solutions for your operational role
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              See how Cybercrime Investigators and Police Officers leverage GARUDA differently.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('solutions')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-['Outfit',_sans-serif] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              EXPLORE SOLUTIONS
            </button>
            <button
              onClick={onGetStarted ? onGetStarted : () => onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 text-xs font-['Outfit',_sans-serif] font-bold dark:hover:bg-cyan-300 transition-colors cursor-pointer shadow-md"
            >
              LAUNCH PLATFORM
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
