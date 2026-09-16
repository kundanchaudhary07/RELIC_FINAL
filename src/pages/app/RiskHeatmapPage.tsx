import React from 'react';
import { Flame, ShieldAlert, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { InteractiveIndiaMap } from '../../components/common/InteractiveIndiaMap';

export const RiskHeatmapPage: React.FC = () => {
  const { riskZones, selectedCase } = useCase();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white">
            Risk Heatmap
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-xs font-mono text-red-700 dark:text-red-400 font-bold">
            {riskZones.length} HUBS MONITORED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: India Heatmap with zoom and historical ATM toggle */}
        <div className="lg:col-span-8 space-y-4">
          <InteractiveIndiaMap
            currentCase={selectedCase}
            riskZones={riskZones}
            initialMode="history"
            heightClass="h-[560px]"
          />
        </div>

        {/* Right Col: Hotspot breakdown list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-sm transition-colors">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              Regional Risk Ranking
            </h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {riskZones.map((zone) => (
                <div
                  key={zone.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-red-500/40 space-y-2 text-xs transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm font-['Space_Grotesk']">
                      {zone.district}, {zone.state}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        zone.riskLevel === 'CRITICAL'
                          ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {zone.riskLevel}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    <div>Total Complaints: <span className="text-slate-900 dark:text-white font-bold">{zone.totalComplaints}</span></div>
                    <div>Active Money Trails: <span className="text-cyan-700 dark:text-cyan-300 font-bold">{zone.activeMoneyTrails}</span></div>
                    <div>Typologies: <span className="text-amber-700 dark:text-amber-400 font-bold">{zone.fraudTypes.join(', ')}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
