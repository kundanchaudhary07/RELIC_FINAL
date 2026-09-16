import React from 'react';
import { RelicLogo } from './RelicLogo';

export const Footer: React.FC<{ onNavigate?: (route: string) => void }> = () => {
  return (
    <footer className="w-full bg-[#030303] border-t border-[#222222] text-[#929292] text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RelicLogo size="sm" showText={true} showSubtitle={true} />
        </div>
        <div className="text-[11px] font-mono text-[#929292]">
          &copy; 2026 RELIC. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
