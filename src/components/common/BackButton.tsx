import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'subtle' | 'pill';
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  onClick,
  className = '',
  variant = 'default',
}) => {
  if (variant === 'pill') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] font-medium text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer ${className}`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'subtle') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 text-xs font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer ${className}`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
};

