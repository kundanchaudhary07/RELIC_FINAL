import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileSearch, 
  FolderGit2, 
  BrainCircuit, 
  GitFork, 
  MapPin, 
  Building2, 
  Flame, 
  FolderArchive, 
  FileText, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronDown, 
  Bell, 
  Search, 
  Globe, 
  Menu, 
  X,
  Radio,
  Sun,
  Moon,
  Video,
  CheckCircle2,
  Sparkles,
  Command,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCase } from '../../context/CaseContext';
import { useTheme } from '../../context/ThemeContext';
import { ASSETS } from '../../assets/assetHelper';
import { BackButton } from './BackButton';
import { FullscreenButton } from './FullscreenButton';

interface AppLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRoute,
  onNavigate,
  onBack,
  children,
}) => {
  const { user, logout } = useAuth();
  const { cases, selectedCase, selectCaseById } = useCase();
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isPoliceOfficer = user?.role === 'POLICE_OFFICER';

  const navGroups = [
    {
      title: 'COMMAND',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'relic-overview', label: 'RELIC Architecture', icon: HelpCircle },
      ],
    },
    {
      title: 'INVESTIGATIONS',
      items: [
        { id: 'new-complaint', label: 'New Complaint', icon: PlusCircle },
        { id: 'active-cases', label: 'Active Cases', icon: Radio },
        { id: 'cases', label: 'Case Repository', icon: FolderGit2 },
        { id: 'case-details', label: 'Case Intelligence', icon: FileSearch },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'ai-analysis', label: 'AI Analysis', icon: BrainCircuit },
        { id: 'money-trail', label: 'Money Trail', icon: GitFork },
        { id: 'location-intelligence', label: 'Location Intel', icon: MapPin },
        { id: 'atm-intelligence', label: 'ATM Intelligence', icon: Building2 },
        { id: 'risk-heatmap', label: 'Risk Heatmap', icon: Flame },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'atm-cctv-evidence', label: 'CCTV Evidence', icon: Video },
        { id: 'evidence', label: 'Evidence Vault', icon: FolderArchive },
        { id: 'reports', label: 'Reports & Zero-FIR', icon: FileText },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'profile', label: 'Officer Profile', icon: User },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] transition-colors">
      
      {/* PERSISTENT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#0c1222] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto shadow-2xl lg:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center text-left focus:outline-none cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-['Inter',_sans-serif] text-lg font-black tracking-tight text-slate-900 dark:text-[#F5F5F5]">
                    RELIC
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#2F9BFF]/10 text-[#2F9BFF] border border-[#2F9BFF]/20">
                    INTEL
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-[#929292] font-medium tracking-wide">
                  Location Intelligence
                </div>
              </div>
            </button>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Role Card */}
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${isPoliceOfficer ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className={`absolute w-3.5 h-3.5 rounded-full ${isPoliceOfficer ? 'bg-emerald-500/30' : 'bg-amber-500/30'} animate-ping`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  ACTIVE ROLE
                </span>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {isPoliceOfficer ? 'Police Tactical Officer' : 'Cyber Crime Investigator'}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
              {isPoliceOfficer ? 'IPS' : 'CCIB'}
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-['Plus_Jakarta_Sans',_sans-serif] font-medium transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Public Site Link / Logout */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800/80 space-y-1 bg-slate-50/70 dark:bg-[#080d18]">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>Public Platform</span>
          </button>

          <button
            onClick={() => {
              logout();
              onNavigate('home');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN APPLICATION CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white/80 dark:bg-[#0c1222]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 z-40 transition-colors">
          
          {/* Left: Mobile hamburger, Back Button & Active Case Context */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {currentRoute !== 'dashboard' && (
              <BackButton
                label="Back"
                onClick={onBack ? onBack : () => onNavigate('dashboard')}
              />
            )}

            {/* Active Case Switcher Bar */}
            <div className="relative">
              <button
                onClick={() => setCaseDropdownOpen(!caseDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-xs font-mono transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Active Case:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedCase ? selectedCase.caseNumber : 'Select Case'}
                  </span>
                </div>
                <span className="text-amber-600 dark:text-amber-400 font-bold hidden md:inline">
                  (₹{selectedCase ? (selectedCase.reportedFraudAmount / 100000).toFixed(1) + 'L' : '0'})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Case Selection Dropdown */}
              {caseDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span>Registered Cases</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{cases.length} Total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1 py-1 custom-scrollbar">
                    {cases.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          selectCaseById(c.id);
                          setCaseDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                          selectedCase?.id === c.id
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{c.caseNumber}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
                            {c.title}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-amber-600 dark:text-amber-400">₹{(c.reportedFraudAmount / 100000).toFixed(1)}L</div>
                          <div className={`text-[10px] ${c.riskLevel === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-semibold'}`}>
                            {c.riskLevel}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Search + Fullscreen + Theme Toggle + Officer Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Fullscreen & Zoom Out Toggle */}
            <FullscreenButton size="sm" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-xs cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Officer Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 bg-slate-800 shrink-0">
                <img
                  src={user?.registeredPhoto || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {user?.name || 'Officer In-Charge'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {user?.badgeId || 'CCIB-HQ'}
                </span>
              </div>
            </div>

          </div>

        </header>

        {/* MAIN VIEW CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#f8fafc] dark:bg-[#070b14] custom-scrollbar transition-colors">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
};


