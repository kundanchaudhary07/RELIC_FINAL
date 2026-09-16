import React, { useState } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles 
} from 'lucide-react';
import { useFullscreen } from '../../context/FullscreenContext';

export const FullscreenHud: React.FC = () => {
  const { isFullscreen, zoomLevel, exitFullscreen, zoomIn, zoomOut, resetZoom, setZoomLevel } = useFullscreen();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isFullscreen) return null;

  const percentage = Math.round(zoomLevel * 100);

  // Quick cycle presets
  const cyclePreset = () => {
    if (percentage <= 75) setZoomLevel(0.85);
    else if (percentage <= 85) setZoomLevel(0.90);
    else if (percentage <= 90) setZoomLevel(1.00);
    else setZoomLevel(0.75);
  };

  return (
    <div
      id="garuda-fullscreen-hud"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto select-none transition-all duration-300"
    >
      {isMinimized ? (
        /* Minimized Tactical Trigger Pill */
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 text-amber-400 border border-amber-500/40 shadow-xl backdrop-blur-md hover:bg-slate-900 transition-all hover:scale-105 cursor-pointer text-xs font-mono font-bold"
          title="Expand Full Screen & Zoom Controls"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>FULLSCREEN ({percentage}%)</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      ) : (
        /* Expanded Tactical HUD Control Bar */
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/95 text-slate-200 border border-amber-500/30 shadow-2xl backdrop-blur-xl transition-all">
          
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="hidden sm:inline">FULLSCREEN</span>
            <span className="text-[10px] text-amber-500/80">TACTICAL</span>
          </div>

          {/* Divider */}
          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Zoom Out Button */}
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out (View More)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Clickable Zoom Percentage Preset */}
          <button
            onClick={cyclePreset}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
            title="Click to cycle presets (75% / 85% / 90% / 100%)"
          >
            {percentage}%
          </button>

          {/* Zoom In Button */}
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset Zoom Button */}
          {percentage !== 100 && (
            <button
              onClick={resetZoom}
              className="px-2 py-1 rounded-xl text-[10px] font-mono uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom to 100%"
            >
              Reset
            </button>
          )}

          {/* Divider */}
          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Exit Fullscreen Button */}
          <button
            onClick={exitFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-102"
            title="Exit Full Screen (or press Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>

          {/* Minimize HUD Chevron */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors ml-0.5 cursor-pointer"
            title="Minimize this bar"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

        </div>
      )}
    </div>
  );
};
