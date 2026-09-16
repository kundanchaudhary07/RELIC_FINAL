import React, { useState } from 'react';
import { Settings, Bell, Shield, Database, Cpu, Lock, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [liveTelemetry, setLiveTelemetry] = useState(true);
  const [autoFreezeAlerts, setAutoFreezeAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Telemetry Settings */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors text-xs">
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Preferences & Alerts</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Bank Telemetry Sync</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Stream transaction logs automatically</span>
              </div>
              <input
                type="checkbox"
                checked={liveTelemetry}
                onChange={(e) => setLiveTelemetry(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Auto Section 91 Drafts</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Pre-fill notices for Layer-1 accounts</span>
              </div>
              <input
                type="checkbox"
                checked={autoFreezeAlerts}
                onChange={(e) => setAutoFreezeAlerts(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Audio Alerts</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Alert on critical cashout windows</span>
              </div>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* AI Model Settings */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors text-xs">
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>AI Configuration</span>
          </h3>

          <div className="space-y-3 font-mono">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ACTIVE ENGINE</span>
              <div className="font-bold text-slate-900 dark:text-white">Gemini 2.5 Flash</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">Connected</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">MAP PROJECTION</span>
              <div className="font-bold text-slate-900 dark:text-white">India Vector Grid</div>
              <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-normal">28 States & 8 UTs</div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-400 dark:hover:bg-cyan-300 dark:text-slate-950 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVED</span>
                </>
              ) : (
                <span>SAVE CHANGES</span>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

