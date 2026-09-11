import React from "react";
import { Shield, Cpu, RefreshCw, Layers, CheckCircle2, Lock, Eye, AlertTriangle } from "lucide-react";

export const ArchitectureSpecs: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-200">
      {/* Hero Overview */}
      <div className="rounded-2xl bg-[#0b101c] border border-cyan-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">
            <Cpu className="w-4 h-4" />
            <span>JARVIS System Architecture & Safety Protocols</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Production-Grade Android Autonomous Voice Agent
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Engineered to operate safely in real Android OS environments using official Accessibility Services,
            MediaProjection screen perception, bilingual Bengali & English NLU via Gemini 3.8 Flash, and cryptographic user confirmation gates.
          </p>
        </div>
      </div>

      {/* Grid of Key Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Execution Loop */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
            <RefreshCw className="w-4 h-4" />
            <span>1. Autonomous Execution Loop</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-300 bg-black/40 p-2.5 rounded-lg border border-slate-800/80">
            <div className="text-cyan-300">LISTEN → UNDERSTAND</div>
            <div className="text-blue-300">PLAN → OBSERVE SCREEN</div>
            <div className="text-purple-300">ACT → VERIFY STATE</div>
            <div className="text-emerald-400">CONTINUE / ASK → COMPLETE</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Actions are never assumed to have succeeded. Every UI gesture or text injection triggers an immediate accessibility tree re-inspection.
          </p>
        </div>

        {/* 2. Language Understanding */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Bilingual Bengali & English NLU</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300 bg-black/40 p-2.5 rounded-lg border border-slate-800/80 font-mono">
            <div>🇧🇩 "YouTube খুলে গান সার্চ করো"</div>
            <div>🔤 "YouTube kholo and play..."</div>
            <div>🇬🇧 "Open WhatsApp and message Mom"</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Understands native Bengali script, spoken Bengali, mixed Banglish, and English without brittle literal word-for-word translation.
          </p>
        </div>

        {/* 3. Safety & Confirmation */}
        <div className="rounded-xl bg-[#090e18] border border-amber-500/30 p-4 space-y-3 bg-amber-950/10">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
            <Lock className="w-4 h-4" />
            <span>3. Safety Architecture & Policy Gate</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-amber-200/90 bg-black/40 p-2.5 rounded-lg border border-amber-500/20">
            <div>• Low-Risk: Auto-execute (search, navigate, read)</div>
            <div className="text-amber-400 font-bold">• Sensitive: Explicit confirmation (messages, calls, deletions, finance)</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Prevents arbitrary unauthorized execution. A sensitive intent halts execution until verbal ("Yes" / "হ্যাঁ") or tactile approval.
          </p>
        </div>

        {/* 4. Screen Awareness Hierarchy */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
            <Eye className="w-4 h-4" />
            <span>4. Screen Awareness Priority</span>
          </div>
          <ol className="space-y-1 text-[11px] font-mono text-slate-300 list-decimal list-inside bg-black/40 p-2.5 rounded-lg border border-slate-800">
            <li>Accessibility Node / Semantic ID</li>
            <li>Resource ID / Content Description</li>
            <li>Visible Text Match</li>
            <li>UI Hierarchy Tree Relation</li>
            <li>OCR & Vision Coordinates (Fallback)</li>
          </ol>
          <p className="text-xs text-slate-400 leading-relaxed">
            Never relies exclusively on fixed pixel coordinates, ensuring stability across phones, tablets, and orientation changes.
          </p>
        </div>

        {/* 5. Reliability Boundaries */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold">
            <Shield className="w-4 h-4" />
            <span>5. Reliability & Loop Safeguards</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-300 bg-black/40 p-2.5 rounded-lg border border-slate-800">
            <div>MAX_STEPS = 30</div>
            <div>MAX_RETRIES_PER_ACTION = 2</div>
            <div>UNEXPECTED_SCREEN_RECOVERY = Active</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Prevents infinite loops or frozen states. If an app crashes or a permission dialog intercepts, JARVIS halts and asks for user guidance.
          </p>
        </div>

        {/* 6. Offline Navigation Engine */}
        <div className="rounded-xl bg-[#090e18] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>6. Offline Deterministic Engine</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-black/40 p-2.5 rounded-lg border border-slate-800">
            <div>"পিছনে যাও" / "Back" → GLOBAL_ACTION_BACK</div>
            <div>"হোমে যাও" / "Home" → GLOBAL_ACTION_HOME</div>
            <div>"নিচে যাও" / "Scroll" → SCROLL_FORWARD</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Maintains core navigation capabilities without internet access, conserving battery and operating with sub-50ms latency.
          </p>
        </div>
      </div>
    </div>
  );
};
