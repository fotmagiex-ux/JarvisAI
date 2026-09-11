import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, Sparkles, Globe, Wifi, WifiOff, Volume2 } from "lucide-react";
import { LanguageMode, OperationMode } from "../types";

interface JarvisControlsProps {
  isListening: boolean;
  onToggleListening: () => void;
  onSubmitCommand: (text: string) => void;
  languageMode: LanguageMode;
  onChangeLanguageMode: (mode: LanguageMode) => void;
  operationMode: OperationMode;
  onToggleOperationMode: () => void;
  speechOutputEnabled: boolean;
  onToggleSpeechOutput: () => void;
}

export const PRESET_COMMANDS = [
  {
    label: "YouTube: Search & Play (Bengali)",
    command: "YouTube খুলে Alexandra Daddario-এর new movies search করো",
    tag: "বাংলা",
    tagColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
  {
    label: "YouTube: Play Video (English)",
    command: "Open YouTube and play Alexandra Daddario new movies",
    tag: "English",
    tagColor: "bg-blue-950 text-blue-300 border-blue-800",
  },
  {
    label: "YouTube: Mixed Banglish",
    command: "YouTube kholo and Alexandra Daddario new movies search kore play koro",
    tag: "Banglish",
    tagColor: "bg-purple-950 text-purple-300 border-purple-800",
  },
  {
    label: "WhatsApp: Sensitive Message (English)",
    command: "Send Rahul a WhatsApp message saying I'll be home at 8",
    tag: "Sensitive",
    tagColor: "bg-amber-950 text-amber-300 border-amber-800",
  },
  {
    label: "WhatsApp: Mom Message (Bengali)",
    command: "Mom কে WhatsApp এ মেসেজ পাঠাও যে আমি ৮ টায় পৌঁছাব",
    tag: "বাংলা",
    tagColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
  {
    label: "Offline: Go Back (পিছনে যাও)",
    command: "পিছনে যাও",
    tag: "Offline",
    tagColor: "bg-slate-800 text-slate-300 border-slate-700",
  },
  {
    label: "Offline: Go Home (হোমে যাও)",
    command: "Go home",
    tag: "Offline",
    tagColor: "bg-slate-800 text-slate-300 border-slate-700",
  },
  {
    label: "Maps: Nearest Coffee Shop",
    command: "Open Google Maps and find nearest coffee shop",
    tag: "Maps",
    tagColor: "bg-cyan-950 text-cyan-300 border-cyan-800",
  },
];

export const JarvisControls: React.FC<JarvisControlsProps> = ({
  isListening,
  onToggleListening,
  onSubmitCommand,
  languageMode,
  onChangeLanguageMode,
  operationMode,
  onToggleOperationMode,
  speechOutputEnabled,
  onToggleSpeechOutput,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitCommand(inputText.trim());
    setInputText("");
  };

  return (
    <div className="rounded-2xl bg-[#0c121e]/95 border border-slate-800 p-4 shadow-xl flex flex-col space-y-3">
      {/* Control Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Online / Offline Toggle */}
          <button
            onClick={onToggleOperationMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              operationMode === "online"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            }`}
            title="Toggle between Gemini Cloud AI and Offline Local Rule Engine"
          >
            {operationMode === "online" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>ONLINE (Gemini Cloud)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>OFFLINE MODE</span>
              </>
            )}
          </button>

          {/* Speech Audio Output Toggle */}
          <button
            onClick={onToggleSpeechOutput}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              speechOutputEnabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title="Toggle JARVIS Voice Audio Readout"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Mode Selectors */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {(["auto", "bn", "en", "banglish"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeLanguageMode(mode)}
              className={`px-2 py-0.5 rounded capitalize transition-all cursor-pointer ${
                languageMode === mode
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {mode === "bn" ? "বাংলা" : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Spoken Text Input Field with Voice Mic Trigger */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? "Listening... Speak in Bengali or English..."
                : "Type command or speak (e.g., 'YouTube kholo and search Alexandra Daddario')..."
            }
            className={`w-full rounded-xl bg-black/50 border px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 font-sans focus:outline-none transition-all ${
              isListening
                ? "border-cyan-500 ring-2 ring-cyan-500/30"
                : "border-slate-700 focus:border-cyan-500/60"
            }`}
          />
        </div>

        {/* Mic Activation Button */}
        <button
          type="button"
          onClick={onToggleListening}
          className={`h-11 px-3.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? "bg-red-500/30 text-red-300 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
              : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40"
          }`}
          title={isListening ? "Stop listening" : "Click to speak voice command"}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-red-400" />
          ) : (
            <Mic className="w-5 h-5 text-cyan-400" />
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="h-11 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-black font-semibold flex items-center justify-center transition-all cursor-pointer"
          title="Send command"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* Preset Voice Command Shortcuts for Instant Testing */}
      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Voice Prompts (Click to Execute):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {PRESET_COMMANDS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(preset.command);
                onSubmitCommand(preset.command);
              }}
              className="text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-2 group cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                  {preset.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  "{preset.command}"
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${preset.tagColor}`}
              >
                {preset.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
