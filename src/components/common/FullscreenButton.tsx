import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '../../context/FullscreenContext';

interface FullscreenButtonProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  className = '',
  showLabel = false,
  size = 'md',
}) => {
  const { isFullscreen, toggleFullscreen, zoomLevel } = useFullscreen();

  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5 text-xs',
    md: 'w-9 h-9 p-2 text-xs sm:w-10 sm:h-10',
    lg: 'px-4 py-2 text-sm',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  }[size];

  return (
    <button
      onClick={toggleFullscreen}
      type="button"
      id="garuda-fullscreen-toggle-btn"
      aria-label={isFullscreen ? 'Exit full screen and reset zoom' : 'Enter full screen and zoom out'}
      title={
        isFullscreen
          ? `Exit Full Screen (Current Zoom: ${Math.round(zoomLevel * 100)}%)`
          : 'Full Screen & Zoom Out (Expanded View)'
      }
      className={`relative flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none group ${
        isFullscreen
          ? 'border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm shadow-amber-500/20'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 shadow-xs'
      } ${sizeClasses} ${className}`}
    >
      {isFullscreen ? (
        <Minimize2 className={`${iconSizes} transition-transform group-hover:scale-95 text-amber-600 dark:text-amber-400`} />
      ) : (
        <Maximize2 className={`${iconSizes} transition-transform group-hover:scale-110 text-current`} />
      )}

      {showLabel && (
        <span className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider">
          {isFullscreen ? 'Exit Screen' : 'Full Screen'}
        </span>
      )}

      {/* Pulsing indicator when fullscreen / zoom-out is active */}
      {isFullscreen && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
      )}
    </button>
  );
};
