import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FullscreenContextType {
  isFullscreen: boolean;
  zoomLevel: number;
  toggleFullscreen: () => Promise<void>;
  enterFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  setZoomLevel: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

// Default zoom-out factor when entering fullscreen (85% gives an expanded, panoramic command center view)
const DEFAULT_FULLSCREEN_ZOOM = 0.85;
const NORMAL_ZOOM = 1.0;
const MIN_ZOOM = 0.65;
const MAX_ZOOM = 1.25;
const ZOOM_STEP = 0.05;

export const FullscreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isSimulatedFullscreen, setIsSimulatedFullscreen] = useState(false);
  const [zoomLevel, setZoomLevelState] = useState<number>(NORMAL_ZOOM);

  const isFullscreen = isNativeFullscreen || isSimulatedFullscreen;

  // Apply zoom cleanly to #root or fallback to document.body
  const applyZoom = useCallback((zoom: number) => {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    if (zoom === NORMAL_ZOOM && !isNativeFullscreen && !isSimulatedFullscreen) {
      // Clean up completely when normal
      rootEl.style.zoom = '';
      rootEl.style.transform = '';
      rootEl.style.transformOrigin = '';
      rootEl.style.width = '';
      rootEl.style.height = '';
      return;
    }

    // Check CSS zoom support (Chrome, Edge, Safari, Firefox 126+)
    if ('zoom' in (document.body.style as any)) {
      (rootEl.style as any).zoom = `${zoom}`;
    } else {
      rootEl.style.transform = `scale(${zoom})`;
      rootEl.style.transformOrigin = 'top center';
      rootEl.style.width = `${(100 / zoom).toFixed(2)}%`;
      rootEl.style.height = `${(100 / zoom).toFixed(2)}%`;
    }
  }, [isNativeFullscreen, isSimulatedFullscreen]);

  // Synchronize zoom whenever zoomLevel or fullscreen state changes
  useEffect(() => {
    applyZoom(zoomLevel);
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 80);
    return () => clearTimeout(timer);
  }, [zoomLevel, applyZoom]);

  // Listen to browser fullscreen changes (e.g. user pressed ESC or browser toggled)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      const isNowFullscreen = Boolean(activeElement);
      setIsNativeFullscreen(isNowFullscreen);

      if (!isNowFullscreen) {
        // Exited native fullscreen: restore normal zoom
        setZoomLevelState(NORMAL_ZOOM);
        setIsSimulatedFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Listen to Escape key to exit simulated fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSimulatedFullscreen) {
        setIsSimulatedFullscreen(false);
        setZoomLevelState(NORMAL_ZOOM);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSimulatedFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.style.zoom = '';
        rootEl.style.transform = '';
        rootEl.style.transformOrigin = '';
        rootEl.style.width = '';
        rootEl.style.height = '';
      }
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
      setIsNativeFullscreen(true);
    } catch {
      // In restricted iframe environments where requestFullscreen is denied, fall back to simulated fullscreen
      setIsSimulatedFullscreen(true);
    }
    // Zoom out automatically to give full-screen panoramic view
    setZoomLevelState(DEFAULT_FULLSCREEN_ZOOM);
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {
      // Ignore exit errors
    } finally {
      setIsNativeFullscreen(false);
      setIsSimulatedFullscreen(false);
      setZoomLevelState(NORMAL_ZOOM);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  const setZoomLevel = useCallback((zoom: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat(zoom.toFixed(2))));
    setZoomLevelState(clamped);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevelState((prev) => {
      const next = Math.min(MAX_ZOOM, parseFloat((prev + ZOOM_STEP).toFixed(2)));
      return next;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevelState((prev) => {
      const next = Math.max(MIN_ZOOM, parseFloat((prev - ZOOM_STEP).toFixed(2)));
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevelState(NORMAL_ZOOM);
  }, []);

  return (
    <FullscreenContext.Provider
      value={{
        isFullscreen,
        zoomLevel,
        toggleFullscreen,
        enterFullscreen,
        exitFullscreen,
        setZoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
      }}
    >
      <div
        className={
          isSimulatedFullscreen
            ? 'fixed inset-0 z-[9999] w-screen h-screen overflow-auto bg-slate-50 dark:bg-[#030712] transition-colors'
            : 'contents'
        }
      >
        {children}
      </div>
    </FullscreenContext.Provider>
  );
};

export const useFullscreen = (): FullscreenContextType => {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};
