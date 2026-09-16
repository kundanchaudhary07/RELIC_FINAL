import React from 'react';
import { 
  ArrowRight, 
  Shield, 
  Cpu, 
  MapPin, 
  Activity, 
  Bell, 
  FileCheck, 
  Lock, 
  ChevronRight,
  Database
} from 'lucide-react';
import { RelicLogo } from '../../components/common/RelicLogo';
import { useAuth } from '../../context/AuthContext';

interface RelicPostLoginOverviewProps {
  onEnterDashboard: () => void;
}

export const RelicPostLoginOverview: React.FC<RelicPostLoginOverviewProps> = ({
  onEnterDashboard,
}) => {
  const { user } = useAuth();

  const workflowSteps = [
    {
      step: '01',
      title: 'TRANSACTION',
      subtitle: 'Telemetry Ingestion',
      description: 'Ingests transaction streams, UPI logs, and banking telemetry across financial institutions.',
      icon: Activity,
    },
    {
      step: '02',
      title: 'RISK ANALYSIS',
      subtitle: 'Multi-Hop Evaluation',
      description: 'Traces layered mule accounts and calculates velocity scores across intermediate hops.',
      icon: Shield,
    },
    {
      step: '03',
      title: 'LOCATION INTELLIGENCE',
      subtitle: 'Spatial Correlation',
      description: 'Maps physical ATM networks and correlates geographical patterns with syndicate mobility.',
      icon: MapPin,
    },
    {
      step: '04',
      title: 'PREDICTION',
      subtitle: 'Target Forecasting',
      description: 'Generates probabilistic predictions for target cash-out regions before physical withdrawal.',
      icon: Cpu,
    },
    {
      step: '05',
      title: 'ALERT',
      subtitle: 'Tactical Dispatch',
      description: 'Broadcasts verified high-priority alerts to regional cybercells and nodal bank officers.',
      icon: Bell,
    },
    {
      step: '06',
      title: 'INVESTIGATION',
      subtitle: 'Enforcement Action',
      description: 'Generates Zero-FIR documentation, aggregates digital evidence, and supports interception.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#030303] text-[#F5F5F5] font-['Inter',_sans-serif] flex flex-col justify-between relative overflow-hidden selection:bg-[#2F9BFF] selection:text-white">
      {/* Background Subtle Atmospheric Rim Lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, rgba(47, 155, 255, 0.15) 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#222222]">
        <RelicLogo size="md" showText showSubtitle />
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-[#F5F5F5]">{user.name}</span>
              <span className="text-[10px] font-mono text-[#929292]">
                BADGE: {user.badgeNumber || user.badgeId || 'AUTHORIZED'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#101010] border border-[#222222] flex items-center justify-center text-xs font-mono text-[#2F9BFF]">
              {user.role === 'POLICE_OFFICER' ? 'IPS' : 'RELIC'}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-6 py-10 flex flex-col justify-center space-y-12">
        {/* Title & Introduction */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101010] border border-[#222222] text-[11px] font-mono text-[#2F9BFF] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F9BFF] animate-pulse" />
            <span>RELIC INTELLIGENCE OVERVIEW</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F5F5] leading-tight">
            Risk Evaluation & Location Intelligence for Cashpoints
          </h1>

          <p className="text-base sm:text-lg text-[#929292] leading-relaxed font-normal">
            RELIC brings risk evaluation, location intelligence, transaction analysis and investigation into one unified intelligence platform.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className="space-y-4">
          <div className="text-xs font-mono text-[#929292] uppercase tracking-wider">
            OPERATIONAL PIPELINE WORKFLOW
          </div>

          {/* 6-Stage Workflow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {workflowSteps.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-[#101010] border border-[#222222] hover:border-[#2F9BFF]/50 p-4 rounded-xl flex flex-col justify-between transition-all group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#929292] font-semibold">
                        {item.step}
                      </span>
                      <IconComp className="w-4 h-4 text-[#929292] group-hover:text-[#2F9BFF] transition-colors" />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[#F5F5F5] tracking-wider uppercase">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-[#2F9BFF] mt-0.5 font-medium">
                        {item.subtitle}
                      </p>
                    </div>

                    <p className="text-[11px] text-[#929292] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <ChevronRight className="w-3.5 h-3.5 text-[#333333]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#222222]">
          <div className="flex items-center gap-3 text-xs text-[#929292]">
            <Lock className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>Session verified. Clearance granted to access nationwide intelligence dashboard.</span>
          </div>

          <button
            id="enter-command-center-btn"
            onClick={onEnterDashboard}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2F9BFF] hover:bg-[#258ae6] active:bg-[#1d76c7] text-white font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#2F9BFF]/20 cursor-pointer group"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#1a1a1a] text-[11px] font-mono text-[#929292]">
        <div>RELIC — Risk Evaluation & Location Intelligence for Cashpoints</div>
        <div>&copy; 2026 RELIC. All rights reserved.</div>
      </footer>
    </div>
  );
};
