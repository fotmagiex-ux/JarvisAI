import React from "react";
import { AlertOctagon, RotateCcw, ArrowDown, XCircle, HelpCircle, Activity } from "lucide-react";

interface ErrorRecoveryModalProps {
  isOpen: boolean;
  failedStepTitle: string;
  failedStepTitleBn?: string;
  errorReason: string;
  errorReasonBn?: string;
  diagnosticsLog: string[];
  retriesAttempted: number;
  maxRetries: number;
  onRetryWithScroll: () => void;
  onForceRescan: () => void;
  onAbortTask: () => void;
}

export const ErrorRecoveryModal: React.FC<ErrorRecoveryModalProps> = ({
  isOpen,
  failedStepTitle,
  failedStepTitleBn,
  errorReason,
  errorReasonBn,
  diagnosticsLog,
  retriesAttempted,
  maxRetries,
  onRetryWithScroll,
  onForceRescan,
  onAbortTask,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0f1422] border-2 border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.25)] p-5 overflow-hidden">
        {/* Glow Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
          <div className="flex items-center gap-2.5 text-red-400 font-mono text-xs font-bold tracking-wider uppercase">
            <AlertOctagon className="w-4 h-4 animate-pulse text-red-400" />
            <span>JARVIS Error Diagnostic Engine • Action Failure</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
            Retries Exhausted: {retriesAttempted}/{maxRetries}
          </span>
        </div>

        {/* Failure Summary */}
        <div className="py-4 space-y-3">
          <div className="rounded-xl bg-red-950/30 border border-red-500/30 p-3.5 space-y-1.5">
            <div className="text-xs font-mono text-red-300 font-semibold uppercase">
              Target Step: {failedStepTitle}
            </div>
            {failedStepTitleBn && (
              <div className="text-xs font-serif text-red-200/80">
                {failedStepTitleBn}
              </div>
            )}

            <div className="mt-2 text-xs font-sans text-slate-200 bg-black/40 p-2.5 rounded-lg border border-red-500/20">
              <span className="text-[10px] font-mono text-red-400 uppercase block font-bold">
                Observed Diagnostic Root Cause:
              </span>
              <p className="mt-0.5">{errorReason}</p>
              {errorReasonBn && (
                <p className="mt-1 font-serif text-amber-200/90 text-[11px]">
                  {errorReasonBn}
                </p>
              )}
            </div>
          </div>

          {/* Diagnostic History Log */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 font-semibold uppercase">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Automated Recovery Attempts & Diagnostics:</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] max-h-24 overflow-y-auto pr-1">
              {diagnosticsLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-amber-400 font-bold shrink-0">#{idx + 1}</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assistant Prompt asking user for further instructions */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed">
              <div>
                <b>JARVIS:</b> "Sir, automatic recovery failed after 2 retries. How would you like me to proceed?"
              </div>
              <div className="text-cyan-300/90 font-serif text-[11px] mt-0.5">
                "স্যার, স্বয়ংক্রিয় রিকভারি ব্যর্থ হয়েছে। আমি কীভাবে অগ্রসর হব?"
              </div>
            </div>
          </div>
        </div>

        {/* Interactive User Decision Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRetryWithScroll}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 hover:text-white font-mono text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Scroll Down & Retry (নিচে যাও)</span>
            </button>

            <button
              onClick={onForceRescan}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/50 text-amber-300 hover:text-white font-mono text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-Scan Hierarchy (পুনরায় স্ক্যান)</span>
            </button>
          </div>

          <button
            onClick={onAbortTask}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-red-300 hover:text-white font-mono text-xs font-bold border border-red-500/30 transition-all cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Abort Task & Return to Standby (টাস্ক বাতিল করুন)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
