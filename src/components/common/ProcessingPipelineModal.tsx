import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  BrainCircuit, 
  GitFork, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Loader2,
  ArrowRight
} from 'lucide-react';

interface ProcessingPipelineModalProps {
  isOpen: boolean;
  onComplete: () => void;
  caseNumber?: string;
  amount?: number;
}

export const ProcessingPipelineModal: React.FC<ProcessingPipelineModalProps> = ({
  isOpen,
  onComplete,
  caseNumber = 'GRD/2026/CY-NEW',
  amount = 500000,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const pipelineStages = [
    {
      title: 'Data Intake & Verification',
      detail: 'Verifying IFSC codes, bank routing, and complainant identity.',
      icon: ShieldCheck,
      color: 'text-cyan-400',
    },
    {
      title: 'Money Trail Graphing',
      detail: `Tracking ₹${amount.toLocaleString('en-IN')} across Layer 1, 2, and 3 accounts.`,
      icon: GitFork,
      color: 'text-sky-400',
    },
    {
      title: 'Velocity & Geo Modeling',
      detail: 'Evaluating transfer timestamps, transaction cadence, and patterns.',
      icon: BrainCircuit,
      color: 'text-indigo-400',
    },
    {
      title: 'Cash-Out Region Forecasting',
      detail: 'Estimating target district, city, and active cash extraction window.',
      icon: MapPin,
      color: 'text-rose-400',
    },
    {
      title: 'ATM Ranking',
      detail: 'Ranking cash dispensers and nearby response zones.',
      icon: Building2,
      color: 'text-emerald-400',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < pipelineStages.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isDone = currentStep >= pipelineStages.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-950 border border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/80 space-y-6"
      >
        {/* Header */}
        <div className="space-y-1.5 text-center">
          <h3 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
            Processing Investigation Lead
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Case: {caseNumber} | Staged Loss: ₹{amount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Multi-Stage Step Progress */}
        <div className="space-y-3">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;

            return (
              <div
                key={stage.title}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/40 text-slate-200'
                    : isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div className="space-y-0.5 text-xs">
                  <div className="font-['Space_Grotesk'] font-bold flex items-center gap-2">
                    <span>{stage.title}</span>
                    {isCompleted && (
                      <span className="text-[10px] font-mono text-emerald-400 font-normal">
                        ✓ PROCESSED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-['Inter']">{stage.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA when done */}
        {isDone ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 text-center"
          >
            <button
              onClick={onComplete}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-['Space_Grotesk'] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all"
            >
              <span>VIEW CASE & MONEY TRAIL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="text-center font-mono text-[11px] text-slate-400 animate-pulse">
            Processing lead data... Please wait.
          </div>
        )}
      </motion.div>
    </div>
  );
};
