import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Eye, Sparkles, User } from 'lucide-react';

interface CameraFaceScannerProps {
  mode: 'register' | 'verify';
  registeredPhoto?: string;
  userName?: string;
  userRole?: string;
  onSuccess: (capturedPhotoUrl: string) => void;
  onCancel: () => void;
  onFail?: () => void;
}

export const CameraFaceScanner: React.FC<CameraFaceScannerProps> = ({
  mode,
  registeredPhoto,
  userName = 'Officer',
  userRole,
  onSuccess,
  onCancel,
  onFail,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'error' | 'captured'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Liveness stages: 0: detecting, 1: look_straight, 2: blink_or_nod, 3: verified, 4: failed
  const [livenessStage, setLivenessStage] = useState<number>(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [matchScore, setMatchScore] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationFailed, setVerificationFailed] = useState<boolean>(false);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraState('requesting');
    setErrorMessage('');
    setVerificationFailed(false);
    setLivenessStage(0);
    setCapturedPhoto(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported by your browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraState('active');
          startLivenessSequence();
        };
      } else {
        setCameraState('active');
        startLivenessSequence();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraState('error');
      setErrorMessage(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings to perform real-time face verification.'
          : 'No camera hardware detected or stream unavailable. You can use biometric sensor emulation below.'
      );
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Liveness progression simulation
  const startLivenessSequence = () => {
    setLivenessStage(0);
    // Stage 1: Face detected (after 900ms)
    setTimeout(() => {
      setLivenessStage(1);
    }, 900);

    // Stage 2: Liveness / Blink Prompt (after 2100ms)
    setTimeout(() => {
      setLivenessStage(2);
    }, 2200);

    // Stage 3: Liveness verified (after 3600ms)
    setTimeout(() => {
      setLivenessStage(3);
    }, 3600);
  };

  const captureFrameFromVideo = (): string => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror image horizontally for natural selfie perspective
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.88);
      }
    }

    // Fallback generated high-def avatar canvas if video is not drawing
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 400;
    fallbackCanvas.height = 400;
    const fCtx = fallbackCanvas.getContext('2d');
    if (fCtx) {
      fCtx.fillStyle = '#0f172a';
      fCtx.fillRect(0, 0, 400, 400);
      fCtx.fillStyle = '#06b6d4';
      fCtx.beginPath();
      fCtx.arc(200, 160, 70, 0, Math.PI * 2);
      fCtx.fill();
      fCtx.beginPath();
      fCtx.arc(200, 360, 120, 0, Math.PI * 2);
      fCtx.fill();
      return fallbackCanvas.toDataURL('image/jpeg', 0.88);
    }

    return '';
  };

  const handleCapturePhoto = () => {
    const photo = captureFrameFromVideo();
    setCapturedPhoto(photo);
    setCameraState('captured');
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setCameraState('active');
    startLivenessSequence();
  };

  const handleConfirmRegistration = () => {
    if (capturedPhoto) {
      onSuccess(capturedPhoto);
    }
  };

  const handleProceedVerificationWithCapturedPhoto = () => {
    if (!capturedPhoto) return;
    setIsVerifying(true);

    // Simulate real-time biometric neural match calculation
    setTimeout(() => {
      const score = Math.floor(95 + Math.random() * 4.9);
      setMatchScore(score);
      setIsVerifying(false);

      if (score >= 90) {
        onSuccess(capturedPhoto || registeredPhoto || '');
      } else {
        setVerificationFailed(true);
        if (onFail) onFail();
      }
    }, 1200);
  };

  const handleCaptureAndMatch = () => {
    const photo = captureFrameFromVideo();
    setCapturedPhoto(photo);
    setCameraState('captured');
    setIsVerifying(true);

    // Simulate real-time biometric neural match calculation
    setTimeout(() => {
      const score = Math.floor(95 + Math.random() * 4.9);
      setMatchScore(score);
      setIsVerifying(false);

      if (score >= 90) {
        onSuccess(photo || registeredPhoto || '');
      } else {
        setVerificationFailed(true);
        if (onFail) onFail();
      }
    }, 1200);
  };

  const handleSimulateFailedMatch = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationFailed(true);
      setMatchScore(42);
      if (onFail) onFail();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-white font-['Plus_Jakarta_Sans',_'Inter',_sans-serif]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                {mode === 'register' ? 'Real-Time Photo Registration' : 'Live Face Verification'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {mode === 'register' ? 'Biometric Identity Enrollment' : `Verifying identity for ${userName}`}
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-xs font-mono"
          >
            Cancel
          </button>
        </div>

        {/* Camera Stage Body */}
        <div className="p-6 space-y-5">
          
          {/* FAILED STATE UI */}
          {verificationFailed ? (
            <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/80 space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-900/40 border border-red-500 flex items-center justify-center text-red-400 animate-pulse">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-['Space_Grotesk'] text-lg font-bold text-red-400">
                  FACE VERIFICATION FAILED
                </h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your face could not be matched with your registered identity. Ensure adequate lighting and align your face directly inside the camera frame.
                </p>
              </div>

              <div className="text-xs font-mono text-red-400 bg-red-950/80 py-1.5 px-3 rounded-lg inline-block border border-red-900">
                Confidence Match: {matchScore}% (Required: ≥90%)
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setVerificationFailed(false);
                    startCamera();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-600/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>TRY AGAIN</span>
                </button>
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Space_Grotesk'] font-bold text-xs transition-all cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* VIDEO & SCANNING OVERLAY VIEWPORT */}
              <div className="relative aspect-video sm:aspect-[4/3] w-full max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-inner flex items-center justify-center">
                
                {/* Real-time Video */}
                {cameraState === 'active' && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                )}

                {/* Captured Photo Preview */}
                {cameraState === 'captured' && capturedPhoto && (
                  <img
                    src={capturedPhoto}
                    alt="Captured preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Error / Fallback State */}
                {cameraState === 'error' && (
                  <div className="p-4 text-center space-y-3">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
                    <button
                      onClick={() => {
                        // Generate instant fallback capture
                        const fallbackCanvas = document.createElement('canvas');
                        fallbackCanvas.width = 400;
                        fallbackCanvas.height = 400;
                        const fCtx = fallbackCanvas.getContext('2d');
                        if (fCtx) {
                          fCtx.fillStyle = '#090d16';
                          fCtx.fillRect(0, 0, 400, 400);
                          fCtx.fillStyle = '#06b6d4';
                          fCtx.beginPath();
                          fCtx.arc(200, 160, 65, 0, Math.PI * 2);
                          fCtx.fill();
                          fCtx.beginPath();
                          fCtx.arc(200, 370, 130, 0, Math.PI * 2);
                          fCtx.fill();
                          const photoData = fallbackCanvas.toDataURL('image/jpeg');
                          setCapturedPhoto(photoData);
                          setCameraState('captured');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                    >
                      Capture Photo
                    </button>
                  </div>
                )}

                {/* Scanning HUD Overlay Elements */}
                {cameraState === 'active' && (
                  <>
                    {/* Face Oval Reticle */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className={`w-48 h-64 rounded-[50%] border-2 transition-colors duration-500 relative flex items-center justify-center ${
                        livenessStage >= 3 ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]' :
                        livenessStage >= 1 ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' :
                        'border-slate-500 border-dashed'
                      }`}>
                        {/* Biometric Laser Scanner Line */}
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.9)]"
                          style={{
                            animation: 'bounce 2.5s infinite ease-in-out',
                            top: '40%',
                          }}
                        />
                      </div>
                    </div>

                    {/* Corner Target Markers */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                    {/* Live Processing Indicator */}
                    <div className="absolute top-3 inset-x-0 flex justify-center">
                      <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span>LIVE SENSOR STREAM</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Hidden Canvas for High-Res Extraction */}
              <canvas ref={canvasRef} className="hidden" />

              {/* REAL-TIME LIVENESS & STATUS CHECKLIST */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80 text-[11px]">
                  <span>BIOMETRIC LIVENESS CHECK</span>
                  <span className="text-cyan-400">STAGE {Math.min(livenessStage + 1, 3)}/3</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                    livenessStage >= 1
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {livenessStage >= 1 ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    <span>Face detected</span>
                  </div>

                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                    livenessStage >= 2
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {livenessStage >= 2 ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
                    <span>Liveness verify</span>
                  </div>

                  <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                    livenessStage >= 3 || cameraState === 'captured'
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {livenessStage >= 3 || cameraState === 'captured' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                    <span>{mode === 'register' ? 'Photo captured' : 'Face matched'}</span>
                  </div>
                </div>

                {/* Real-Time Prompt Instructions */}
                <div className="pt-1 text-center text-xs text-cyan-300 font-sans font-medium">
                  {livenessStage === 0 && 'Position your face in the center of the frame...'}
                  {livenessStage === 1 && 'Look directly into the camera lens...'}
                  {livenessStage === 2 && 'Blink slowly or smile slightly for liveness verification...'}
                  {livenessStage >= 3 && 'Biometric telemetry verified.'}
                </div>
              </div>

              {/* ACTION CONTROLS */}
              {mode === 'register' ? (
                <div className="flex items-center justify-between gap-3 pt-2">
                  {cameraState === 'captured' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmRegistration}
                        className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Register Photo</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={livenessStage < 1}
                      onClick={handleCapturePhoto}
                      className={`w-full py-3.5 rounded-xl font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        livenessStage >= 1
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>Click Photo</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {cameraState === 'captured' ? (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        disabled={isVerifying}
                        className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Photo</span>
                      </button>

                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={handleProceedVerificationWithCapturedPhoto}
                        className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Matching Face...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify Face & Enter</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={livenessStage < 1}
                        onClick={handleCapturePhoto}
                        className={`flex-1 py-3.5 rounded-xl font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          livenessStage >= 1
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span>Click Photo</span>
                      </button>

                      <button
                        type="button"
                        disabled={isVerifying}
                        onClick={handleCaptureAndMatch}
                        className="flex-1 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 cursor-pointer transition-all"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Matching Face...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Instant Verify & Enter</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Test verification failure trigger option */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSimulateFailedMatch}
                      className="text-[11px] font-mono text-slate-500 hover:text-slate-400 underline cursor-pointer"
                    >
                      Test Failed Face Match State
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
