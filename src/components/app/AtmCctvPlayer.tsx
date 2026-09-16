import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  Camera,
  Layers,
  Clock,
  Eye
} from 'lucide-react';

export interface CctvTimelineEvent {
  timeStr: string;
  secondsOffset: number; // offset in seconds from start
  title: string;
  description: string;
  eventType: 'ENTRY' | 'APPROACH' | 'TRANSACTION' | 'INTERACTION' | 'EXIT' | 'SUSPICIOUS';
  confidenceScore: number;
}

interface AtmCctvPlayerProps {
  cameraId: string;
  atmId: string;
  atmLocation: string;
  recordingDate: string;
  windowStart: string;
  windowEnd: string;
  transactionTime: string;
  evidenceId: string;
  events: CctvTimelineEvent[];
  onSeekToEvent?: (event: CctvTimelineEvent) => void;
  selectedEventIndex?: number | null;
}

export const AtmCctvPlayer: React.FC<AtmCctvPlayerProps> = ({
  cameraId,
  atmId,
  atmLocation,
  recordingDate,
  windowStart,
  windowEnd,
  transactionTime,
  evidenceId,
  events,
  onSeekToEvent,
  selectedEventIndex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Total simulated duration in seconds (e.g., 600 seconds for a 10-minute window)
  const totalDuration = 600; // 10 minutes default
  const [currentTime, setCurrentTime] = useState<number>(300); // start near transaction (5m in)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'NIGHT_VISION' | 'TACTICAL_BW' | 'LOW_LIGHT_COLOR'>('TACTICAL_BW');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Time format helper: adds seconds to windowStart
  const formatCurrentTimestamp = (seconds: number) => {
    // Parse windowStart "HH:MM:SS"
    const parts = windowStart.split(':').map(Number);
    let totalSec = (parts[0] || 16) * 3600 + (parts[1] || 17) * 60 + (parts[2] || 15) + Math.floor(seconds);
    const h = Math.floor((totalSec / 3600) % 24).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
    return `${h}:${m}:${s}.${ms}`;
  };

  // Playback timer loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Render CCTV Canvas View
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#050912';
    ctx.fillRect(0, 0, width, height);

    // Color tones based on filterMode
    let baseTint = '#0c1427';
    let wallColor = '#1e293b';
    let floorColor = '#0f172a';
    let highlightColor = '#38bdf8';
    
    if (filterMode === 'NIGHT_VISION') {
      baseTint = '#031a0a';
      wallColor = '#064e3b';
      floorColor = '#022c22';
      highlightColor = '#34d399';
    } else if (filterMode === 'TACTICAL_BW') {
      baseTint = '#111827';
      wallColor = '#374151';
      floorColor = '#1f2937';
      highlightColor = '#9ca3af';
    }

    // 1. Perspective Background: ATM Lobby Architecture
    ctx.fillStyle = baseTint;
    ctx.fillRect(0, 0, width, height);

    // Back wall
    ctx.fillStyle = wallColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.15);
    ctx.lineTo(width * 0.85, height * 0.15);
    ctx.lineTo(width * 0.85, height * 0.75);
    ctx.lineTo(width * 0.15, height * 0.75);
    ctx.closePath();
    ctx.fill();

    // Side walls perspective lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.15, height * 0.15);
    ctx.moveTo(width, 0);
    ctx.lineTo(width * 0.85, height * 0.15);
    ctx.moveTo(0, height);
    ctx.lineTo(width * 0.15, height * 0.75);
    ctx.moveTo(width, height);
    ctx.lineTo(width * 0.85, height * 0.75);
    ctx.stroke();

    // Floor Grid
    ctx.fillStyle = floorColor;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width * 0.15, height * 0.75);
    ctx.lineTo(width * 0.85, height * 0.75);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Floor tile perspective lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 1; i <= 6; i++) {
      const xStart = width * (i / 7);
      const xEnd = width * 0.15 + (width * 0.7) * (i / 7);
      ctx.beginPath();
      ctx.moveTo(xStart, height);
      ctx.lineTo(xEnd, height * 0.75);
      ctx.stroke();
    }

    // 2. ATM Kiosk & Screen Unit (Center-Right)
    const atmX = width * 0.55;
    const atmY = height * 0.28;
    const atmW = width * 0.26;
    const atmH = height * 0.52;

    // ATM Cabinet Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(atmX + 15, atmY + atmH - 10, atmW, 20);

    // ATM Cabinet Main Body
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(atmX, atmY, atmW, atmH);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.strokeRect(atmX, atmY, atmW, atmH);

    // Top Brand Panel
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(atmX + 5, atmY + 5, atmW - 10, height * 0.06);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('BANK 24/7 ATM', atmX + 15, atmY + height * 0.042);

    // ATM CRT / LCD Screen
    const screenX = atmX + width * 0.03;
    const screenY = atmY + height * 0.09;
    const screenW = atmW * 0.65;
    const screenH = height * 0.16;

    // Pulsing ATM Screen glow
    const screenGlow = 0.6 + 0.2 * Math.sin(Date.now() / 400);
    ctx.fillStyle = `rgba(14, 165, 233, ${screenGlow})`;
    ctx.fillRect(screenX, screenY, screenW, screenH);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(screenX + 3, screenY + 3, screenW - 6, screenH - 6);

    // ATM Screen text simulation
    ctx.fillStyle = '#38bdf8';
    ctx.font = '8px monospace';
    if (currentTime >= 280 && currentTime <= 340) {
      ctx.fillText('> PROCESSING TXN...', screenX + 8, screenY + 22);
      ctx.fillText('DISPENSING CASH', screenX + 8, screenY + 38);
    } else {
      ctx.fillText('WELCOME / INSERT CARD', screenX + 6, screenY + 22);
      ctx.fillText('PLEASE SELECT SERVICE', screenX + 6, screenY + 38);
    }

    // ATM Keypad & Cash Slot
    ctx.fillStyle = '#334155';
    ctx.fillRect(atmX + width * 0.03, atmY + height * 0.27, atmW * 0.45, height * 0.07);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(atmX + width * 0.03, atmY + height * 0.36, atmW * 0.55, height * 0.025); // Cash slot

    // 3. Glass Door Entryway (Left)
    const doorX = width * 0.18;
    const doorY = height * 0.20;
    const doorW = width * 0.18;
    const doorH = height * 0.55;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.strokeRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(doorX, doorY, doorW, doorH);

    // Glass reflection line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(doorX + 5, doorY + 5);
    ctx.lineTo(doorX + doorW - 5, doorY + doorH - 5);
    ctx.stroke();

    // 4. Dynamic Subject & Behavior Animation depending on currentTime
    // Scenario timeline (600s total duration):
    // 0 -> 195s: Empty ATM kiosk
    // 196s -> 260s: Person enters through glass door
    // 261s -> 300s: Person approaches ATM keypad
    // 300s -> 340s: Transaction happening at ATM (unauthorized cash-out)
    // 341s -> 420s: Person collects cash and leaves
    // 421s -> 600s: Empty kiosk

    let subjectX = -100;
    let subjectY = -100;
    let subjectVisible = false;
    let actionLabel = '';

    if (currentTime >= 196 && currentTime < 260) {
      // Entering
      const progress = (currentTime - 196) / 64;
      subjectX = doorX + 15 + progress * (width * 0.12);
      subjectY = height * 0.48;
      subjectVisible = true;
      actionLabel = '[MOTION 01: SUBJECT ENTERING]';
    } else if (currentTime >= 260 && currentTime < 300) {
      // Approaching ATM
      const progress = (currentTime - 260) / 40;
      subjectX = doorX + 15 + width * 0.12 + progress * (atmX - (doorX + 15 + width * 0.12) - 20);
      subjectY = height * 0.48;
      subjectVisible = true;
      actionLabel = '[MOTION 02: APPROACHING KIOSK]';
    } else if (currentTime >= 300 && currentTime < 340) {
      // Transaction happening
      subjectX = atmX - 25;
      subjectY = height * 0.48;
      subjectVisible = true;
      actionLabel = '[EVENT: UNAUTHORIZED TXN DETECTED]';
    } else if (currentTime >= 340 && currentTime < 425) {
      // Exiting
      const progress = (currentTime - 340) / 85;
      subjectX = (atmX - 25) - progress * (atmX - 25 - doorX + 40);
      subjectY = height * 0.48;
      subjectVisible = true;
      actionLabel = '[MOTION 03: SUBJECT DEPARTING]';
    }

    if (subjectVisible) {
      // Draw Subject Silhouette (Tactical CCTV look)
      ctx.fillStyle = '#090d16';
      
      // Head
      ctx.beginPath();
      ctx.arc(subjectX + 22, subjectY - 50, 16, 0, Math.PI * 2);
      ctx.fill();

      // Cap / Hood outline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Body (Jacket)
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(subjectX + 2, subjectY - 30, 40, 75, [8, 8, 4, 4]);
      ctx.fill();

      // Legs
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(subjectX + 6, subjectY + 45, 14, 60);
      ctx.fillRect(subjectX + 24, subjectY + 45, 14, 60);

      // AI Bounding Box & Target Track
      if (showBoundingBoxes) {
        const boxX = subjectX - 5;
        const boxY = subjectY - 75;
        const boxW = 54;
        const boxH = 185;

        // Bounding box border
        ctx.strokeStyle = currentTime >= 300 && currentTime <= 340 ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]);
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.setLineDash([]);

        // Corner brackets
        const cornerLen = 8;
        ctx.strokeStyle = currentTime >= 300 && currentTime <= 340 ? '#f87171' : '#4ade80';
        ctx.lineWidth = 2.5;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY);
        ctx.lineTo(boxX + boxW, boxY);
        ctx.lineTo(boxX + boxW, boxY + cornerLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + boxH - cornerLen);
        ctx.lineTo(boxX, boxY + boxH);
        ctx.lineTo(boxX + cornerLen, boxY + boxH);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
        ctx.stroke();

        // Label above bounding box
        ctx.fillStyle = currentTime >= 300 && currentTime <= 340 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)';
        ctx.fillRect(boxX, boxY - 18, boxW + 80, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(actionLabel || 'TARGET: HUMAN', boxX + 4, boxY - 6);
      }
    }

    // 5. CCTV Camera Scanlines & Noise FX
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }

    // Subtle CCTV grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 16) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // 6. Professional CCTV On-Screen Display (OSD) Overlay
    // Top Left: Camera ID & REC Status
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`CAM: ${cameraId} [LOBBY_OVERVIEW]`, 20, 30);
    
    // Blinking REC dot
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(200, 26, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ef4444';
    ctx.fillText('REC', 212, 30);

    // Top Right: Live Date & Timestamp
    const formattedStamp = formatCurrentTimestamp(currentTime);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    const timeText = `${recordingDate} ${formattedStamp} IST`;
    ctx.fillText(timeText, width - ctx.measureText(timeText).width - 20, 30);

    // Bottom Left: ATM ID & Location
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`ATM_ID: ${atmId} | LOC: ${atmLocation.toUpperCase()}`, 20, height - 25);
    ctx.fillText(`STREAM_SOURCE: SECURE_BANK_NOC_FEED (AES-256)`, 20, height - 12);

    // Bottom Right: Evidence Watermark & FPS
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px "JetBrains Mono", monospace';
    const evdText = `EVD: ${evidenceId} • FPS: ${(25 * playbackSpeed).toFixed(1)}`;
    ctx.fillText(evdText, width - ctx.measureText(evdText).width - 20, height - 20);

  }, [currentTime, playbackSpeed, filterMode, showBoundingBoxes, cameraId, atmId, atmLocation, recordingDate, windowStart, evidenceId]);

  // Jump to specific event
  const handleSeek = (event: CctvTimelineEvent) => {
    setCurrentTime(event.secondsOffset);
    if (onSeekToEvent) {
      onSeekToEvent(event);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-4 font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
      
      {/* CCTV Screen Container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        
        {/* Top Disclaimer Banner */}
        <div className="bg-amber-950/80 border-b border-amber-600/30 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">SIMULATED ATM CCTV EVIDENCE</span>
            <span className="hidden sm:inline opacity-80">— DEMO / REFERENCE FOOTAGE ONLY (NOT REAL BANK SURVEILLANCE DATA)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-500/30 text-[10px]">
              EVIDENCE VERIFIED
            </span>
          </div>
        </div>

        {/* Video Canvas Element */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={854}
            height={480}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          />

          {/* Center Play Overlay when paused */}
          {!isPlaying && (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 backdrop-blur-md flex items-center justify-center text-cyan-300 hover:scale-105 transition-all shadow-lg cursor-pointer"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          )}

          {/* Quick Filter & OSD Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                showBoundingBoxes
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-700'
              }`}
            >
              AI BBOX {showBoundingBoxes ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => {
                const modes: ('TACTICAL_BW' | 'NIGHT_VISION' | 'LOW_LIGHT_COLOR')[] = ['TACTICAL_BW', 'NIGHT_VISION', 'LOW_LIGHT_COLOR'];
                const nextIdx = (modes.indexOf(filterMode) + 1) % modes.length;
                setFilterMode(modes[nextIdx]);
              }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-cyan-300 border border-cyan-500/40 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              FILTER: {filterMode.replace('_', ' ')}
            </button>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="bg-slate-950/95 border-t border-slate-800 p-3 sm:p-4 space-y-3">
          
          {/* Progress Timeline Scrubber */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">{formatCurrentTimestamp(currentTime)}</span>
              <span>WINDOW: {windowStart} → {windowEnd} ({Math.floor(totalDuration / 60)} MIN)</span>
            </div>

            <div className="relative">
              <input
                type="range"
                min={0}
                max={totalDuration}
                step={0.5}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {/* Event Marker Pins on Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 pointer-events-none">
                {events.map((ev, i) => {
                  const pct = (ev.secondsOffset / totalDuration) * 100;
                  const isTxn = ev.eventType === 'TRANSACTION';
                  return (
                    <div
                      key={i}
                      style={{ left: `${pct}%` }}
                      className={`absolute -top-1 w-2.5 h-3.5 -translate-x-1/2 rounded-xs transition-transform ${
                        isTxn ? 'bg-red-500 ring-2 ring-red-400/50' : 'bg-cyan-400 ring-1 ring-cyan-300/40'
                      }`}
                      title={`${ev.timeStr} - ${ev.title}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            
            {/* Left Controls: Play, Rewind, Forward, Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold transition-all shadow-md cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentTime((t) => Math.max(0, t - 5))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Rewind 5s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentTime((t) => Math.min(totalDuration, t + 5))}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Forward 5s"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px] font-mono">
                {[0.5, 1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                      playbackSpeed === speed
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Right Controls: Volume & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Interactive Timeline Event Selector */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Interactive CCTV Timeline & Event Telemetry</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Click timestamp to jump player
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {events.map((ev, index) => {
            const isCurrent = Math.abs(currentTime - ev.secondsOffset) < 15;
            const isTxn = ev.eventType === 'TRANSACTION';

            return (
              <button
                key={index}
                onClick={() => handleSeek(ev)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                  isCurrent
                    ? 'bg-cyan-50 dark:bg-cyan-950/80 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                    : isTxn
                    ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800/80 hover:border-red-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold ${isTxn ? 'text-red-600 dark:text-red-400' : 'text-cyan-700 dark:text-cyan-400'}`}>
                    {ev.timeStr}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isTxn
                      ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {ev.eventType}
                  </span>
                </div>

                <div className="font-['Space_Grotesk'] text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {ev.title}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {ev.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
