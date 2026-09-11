import React from "react";
import { Cpu, Smartphone, Code2, ShieldAlert, Sparkles, Activity, WifiOff, Download } from "lucide-react";

export type NavTab = "simulator" | "offline_commands" | "codebase" | "architecture";

interface HeaderNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  isServiceActive: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onChangeTab,
  isServiceActive,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#060a12]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-widest text-cyan-400 font-mono">
                J.A.R.V.I.S.
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/60">
                OS v2.5
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Bilingual Android Automation Assistant
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => onChangeTab("simulator")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Live Assistant & OS</span>
          </button>

          <button
            onClick={() => onChangeTab("offline_commands")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "offline_commands"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Commands</span>
          </button>

          <button
            onClick={() => onChangeTab("codebase")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "codebase"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Android Codebase</span>
          </button>

          <button
            onClick={() => onChangeTab("architecture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Safety Specs</span>
          </button>
        </nav>

        {/* Status Indicator & Download Button */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <button
            onClick={() => {
              window.location.href = "/api/jarvis/download-project-zip";
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Download the complete production Android Kotlin project ZIP"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Download Project (.ZIP)</span>
            <span className="sm:hidden">ZIP</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-300">Accessibility Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
