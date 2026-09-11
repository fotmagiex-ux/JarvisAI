import React from "react";
import { CheckCircle2, Circle, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { TaskStep, JarvisState } from "../types";

interface TaskProgressTrackerProps {
  state: JarvisState;
  taskSteps: TaskStep[];
  activeStepIndex: number;
}

export const TaskProgressTracker: React.FC<TaskProgressTrackerProps> = ({
  state,
  taskSteps,
  activeStepIndex,
}) => {
  const getStateBadge = () => {
    switch (state) {
      case "LISTENING":
        return { label: "LISTENING • ভয়েস শুনছি", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "UNDERSTANDING":
        return { label: "UNDERSTANDING • অর্থ বিশ্লেষণ", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "PLANNING":
        return { label: "PLANNING • টাস্ক প্ল্যান তৈরি", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      case "WAITING_FOR_CONFIRMATION":
        return { label: "AWAITING CONFIRMATION • নিশ্চিতকরণ অপেক্ষা", color: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse" };
      case "EXECUTING":
        return { label: "EXECUTING • স্বয়ংক্রিয় পরিচালনা", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "OBSERVING":
        return { label: "OBSERVING SCREEN • স্ক্রিন পর্যবেক্ষণ", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" };
      case "VERIFYING":
        return { label: "VERIFYING ACTION • ফলাফল যাচাই", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "COMPLETED":
        return { label: "TASK COMPLETED • সম্পন্ন হয়েছে", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "FAILED":
        return { label: "TASK FAILED • ব্যর্থ", color: "bg-red-500/20 text-red-300 border-red-500/40" };
      default:
        return { label: "SYSTEM IDLE • প্রস্তুত", color: "bg-slate-800 text-slate-400 border-slate-700" };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="rounded-2xl bg-[#0d131f]/90 border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            Transparent Task Execution Sequence
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time step verification & screen observation
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${badge.color}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Task Steps Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {taskSteps.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500 font-mono text-xs">
            <Circle className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
            <p>Awaiting voice or automated task command...</p>
            <p className="text-[10px] text-slate-600 mt-1">
              Say "Open YouTube and play Alexandra Daddario new movies" or click a preset
            </p>
          </div>
        ) : (
          taskSteps.map((step, idx) => {
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";
            const isFailed = step.status === "failed";

            return (
              <div
                key={step.id || idx}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    : isCompleted
                    ? "bg-[#0b1622]/60 border-emerald-900/40"
                    : isFailed
                    ? "bg-red-950/30 border-red-800/50"
                    : "bg-slate-900/40 border-slate-800/60 opacity-60"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Status Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    ) : isFailed ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  {/* Step Titles & Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold leading-snug ${
                          isActive
                            ? "text-cyan-200"
                            : isCompleted
                            ? "text-slate-200"
                            : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {step.actionType}
                      </span>
                    </div>

                    {step.title_bn && (
                      <p className="text-[11px] text-cyan-400/80 font-serif mt-0.5">
                        {step.title_bn}
                      </p>
                    )}

                    {/* Verification Criteria */}
                    {step.verificationCriteria && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono">
                        <ShieldCheck
                          className={`w-3 h-3 ${
                            isCompleted ? "text-emerald-400" : "text-slate-500"
                          }`}
                        />
                        <span
                          className={
                            isCompleted ? "text-emerald-300" : "text-slate-400"
                          }
                        >
                          Verify: {step.verificationCriteria}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
