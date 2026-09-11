import React, { useState } from "react";
import { Terminal, Shield, CheckCircle, AlertTriangle, Info, Trash2, Download } from "lucide-react";
import { AuditLog, AuditLogLevel } from "../types";

interface StructuredLogsViewProps {
  logs: AuditLog[];
  onClearLogs: () => void;
}

export const StructuredLogsView: React.FC<StructuredLogsViewProps> = ({
  logs,
  onClearLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<AuditLogLevel | "all">("all");

  const filteredLogs = logs.filter(
    (l) => filterLevel === "all" || l.level === filterLevel
  );

  const exportLogsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jarvis_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLevelBadge = (level: AuditLogLevel) => {
    switch (level) {
      case "action":
        return <span className="text-cyan-400 bg-cyan-950/60 px-1 rounded">ACT</span>;
      case "verify":
        return <span className="text-emerald-400 bg-emerald-950/60 px-1 rounded">VERIFIED</span>;
      case "alert":
        return <span className="text-amber-400 bg-amber-950/60 px-1 rounded">SECURITY</span>;
      case "error":
        return <span className="text-red-400 bg-red-950/60 px-1 rounded">ERR</span>;
      default:
        return <span className="text-slate-400 bg-slate-800 px-1 rounded">INFO</span>;
    }
  };

  return (
    <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-4 flex flex-col h-full font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 tracking-wider">
            TRANSPARENT SYSTEM AUDIT LOGS
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsJson}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Export JSON Logs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearLogs}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-300 transition-colors"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log level filter pills */}
      <div className="flex items-center gap-1.5 mb-2 text-[10px]">
        {(["all", "action", "verify", "alert", "info"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilterLevel(level)}
            className={`px-2 py-0.5 rounded capitalize transition-colors ${
              filterLevel === level
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Logs Scroll container */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            No audit records logged yet. Run a command to stream actions.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-1.5 rounded bg-black/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="text-slate-500">{log.timestamp}</span>
                {getLevelBadge(log.level)}
                <span className="font-semibold text-slate-300">{log.type}</span>
              </div>
              <p className="text-slate-200 mt-1 pl-1 text-[11px] leading-relaxed">
                {log.message}
              </p>
              {log.message_bn && (
                <p className="text-cyan-400/80 mt-0.5 pl-1 text-[10px] font-serif">
                  {log.message_bn}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
