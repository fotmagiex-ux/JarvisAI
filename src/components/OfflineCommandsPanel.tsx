import React, { useState } from "react";
import {
  WifiOff,
  Plus,
  Play,
  CheckCircle2,
  Volume2,
  VolumeX,
  Lock,
  ArrowLeft,
  Home,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Command,
} from "lucide-react";
import { OfflineCommand } from "../types";

interface OfflineCommandsPanelProps {
  commands: OfflineCommand[];
  onExecuteCommand: (commandString: string) => void;
  onAddNewCommand: (newCmd: Omit<OfflineCommand, "id">) => Promise<void>;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
}

export const OfflineCommandsPanel: React.FC<OfflineCommandsPanelProps> = ({
  commands,
  onExecuteCommand,
  onAddNewCommand,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [action, setAction] = useState("SYSTEM_NAV");
  const [category, setCategory] = useState<OfflineCommand["category"]>("device_control");
  const [triggersText, setTriggersText] = useState("");
  const [feedbackEn, setFeedbackEn] = useState("");
  const [feedbackBn, setFeedbackBn] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !triggersText.trim()) return;

    const triggers = triggersText
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await onAddNewCommand({
        name,
        action,
        category,
        triggers,
        feedback_en: feedbackEn || `Executing ${name}, sir.`,
        feedback_bn: feedbackBn || `${name} কার্যকর করা হচ্ছে।`,
        isCustom: true,
      });
      setName("");
      setTriggersText("");
      setFeedbackEn("");
      setFeedbackBn("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add command", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "HOME":
        return <Home className="w-3.5 h-3.5 text-cyan-400" />;
      case "BACK":
        return <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />;
      case "SCROLL_UP":
        return <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />;
      case "SCROLL_DOWN":
        return <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />;
      case "VOLUME_UP":
        return <Volume2 className="w-3.5 h-3.5 text-amber-400" />;
      case "VOLUME_DOWN":
        return <VolumeX className="w-3.5 h-3.5 text-amber-400" />;
      case "LOCK_SCREEN":
        return <Lock className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Command className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#0b101c]/90 border border-slate-800 p-4 space-y-4">
      {/* Header with Offline Status Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Offline Voice Command System
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Extensible Architecture
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero-latency local intent recognition (Bengali & English) without internet
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Offline Command</span>
        </button>
      </div>

      {/* Add New Command Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold uppercase pb-1 border-b border-cyan-500/20">
            <span>Register New Offline Voice Command</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Command Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mute Audio"
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Action Identifier</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-hidden focus:border-cyan-500"
              >
                <option value="VOLUME_DOWN">VOLUME_DOWN</option>
                <option value="VOLUME_UP">VOLUME_UP</option>
                <option value="LOCK_SCREEN">LOCK_SCREEN</option>
                <option value="HOME">HOME</option>
                <option value="BACK">BACK</option>
                <option value="SCROLL_UP">SCROLL_UP</option>
                <option value="SCROLL_DOWN">SCROLL_DOWN</option>
                <option value="CUSTOM_INTENT">CUSTOM_INTENT</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-hidden focus:border-cyan-500"
              >
                <option value="device_control">Device Control</option>
                <option value="navigation">Navigation</option>
                <option value="media">Media</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              Triggers & Synonyms (Comma separated English, Bengali, Banglish)
            </label>
            <input
              type="text"
              required
              value={triggersText}
              onChange={(e) => setTriggersText(e.target.value)}
              placeholder="e.g. mute, silent, মিউট করো, শব্দ বন্ধ করো, shobdo bondho koro"
              className="w-full bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Feedback Voice (English)</label>
              <input
                type="text"
                value={feedbackEn}
                onChange={(e) => setFeedbackEn(e.target.value)}
                placeholder="e.g. Media audio muted, sir."
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-hidden focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Feedback Voice (Bengali)</label>
              <input
                type="text"
                value={feedbackBn}
                onChange={(e) => setFeedbackBn(e.target.value)}
                placeholder="e.g. অডিও মিউট করা হয়েছে।"
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-serif outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs shadow-md shadow-cyan-500/20"
            >
              {isSubmitting ? "Registering..." : "Save Command to Registry"}
            </button>
          </div>
        </form>
      )}

      {/* Commands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {getActionIcon(cmd.action)}
                  <span className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                    {cmd.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {cmd.action}
                </span>
              </div>

              {/* Triggers list */}
              <div className="flex flex-wrap gap-1 my-2">
                {cmd.triggers.slice(0, 3).map((trigger, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-400/90 border border-cyan-500/20"
                  >
                    "{trigger}"
                  </span>
                ))}
                {cmd.triggers.length > 3 && (
                  <span className="text-[9px] font-mono text-slate-500 self-center">
                    +{cmd.triggers.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Quick Test Trigger Button */}
            <button
              onClick={() => onExecuteCommand(cmd.triggers[0])}
              className="mt-2 w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-700/60 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title={`Test offline command: "${cmd.triggers[0]}"`}
            >
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400/20" />
              <span>Test: "{cmd.triggers[0]}"</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
