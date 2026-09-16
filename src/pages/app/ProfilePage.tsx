import React from 'react';
import { User, Shield, BadgeCheck, Key, Lock, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Officer Profile
          </h1>
        </div>
      </div>

      {user && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Profile Card */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 text-center shadow-sm transition-colors">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-cyan-100 dark:bg-cyan-950 border-2 border-cyan-400 dark:border-cyan-500/50 flex items-center justify-center text-3xl font-['Space_Grotesk'] font-bold text-cyan-800 dark:text-cyan-300 overflow-hidden shadow-md">
              {user.registeredPhoto || user.avatar ? (
                <img
                  src={user.registeredPhoto || user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-bold">{user.role}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{user.department || user.station}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono text-left">
              <div className="text-slate-500 dark:text-slate-400 font-medium">BADGE ID:</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{user.badgeNumber || user.badgeId}</div>
              <div className="text-slate-500 dark:text-slate-400 pt-1.5 font-medium">EMAIL:</div>
              <div className="text-slate-800 dark:text-slate-300">{user.email}</div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <BadgeCheck className="w-4 h-4" />
              <span>CLEARANCE LEVEL 3 (ACTIVE)</span>
            </div>
          </div>

          {/* Security & Activity Overview */}
          <div className="md:col-span-7 space-y-5">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors text-xs">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Authorizations</span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-300 font-mono">1930 / I4C Portal Sync</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">AUTHORIZED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-300 font-mono">Section 91 CrPC Notice Generation</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">AUTHORIZED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-300 font-mono">Bank Debit Freeze Requests</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">AUTHORIZED</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-800 dark:text-slate-300 font-mono">AI Forensic Analysis</span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-bold font-mono">AUTHORIZED</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

