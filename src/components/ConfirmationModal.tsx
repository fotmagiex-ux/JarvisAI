import React, { useState, useEffect } from "react";
import { AlertTriangle, Check, X, ShieldAlert, Mic, CornerDownLeft, Sparkles } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  appName: string;
  recipient?: string;
  messageText?: string;
  actionCategory?: "MESSAGING" | "CALLING" | "FILE_DELETION" | "SETTINGS";
  promptText: string;
  promptTextBn?: string;
  isListening: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  appName,
  recipient,
  messageText,
  actionCategory = "MESSAGING",
  promptText,
  promptTextBn,
  isListening,
  onConfirm,
  onReject,
}) => {
  const [inputText, setInputText] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<"CONFIRM" | "REJECT" | "UNKNOWN" | null>(null);

  // Evaluate natural language input (Bengali & English)
  useEffect(() => {
    if (!inputText.trim()) {
      setDetectedIntent(null);
      return;
    }

    const clean = inputText.toLowerCase().trim().replace(/[?!.,]/g, "");

    const affirmativeTokens = [
      "yes", "yeah", "yep", "sure", "proceed", "send", "send it", "confirm", "do it", "ok", "okay",
      "go ahead", "affirmative", "absolutely", "please send", "send now",
      "হ্যাঁ", "হ্যাঁ করো", "করো", "ঠিক আছে", "পাঠাও", "পাঠিয়ে দাও", "চলবে", "নিশ্চিত", "অবশ্যই",
      "করুন", "পাঠিয়ে দিন", "পাঠান", "ha", "haa", "koro", "pathao", "pathiye dao", "thik ache", "nishchit"
    ];

    const negativeTokens = [
      "no", "nope", "cancel", "stop", "don't", "don't do it", "don't send", "abort", "wait", "never mind",
      "না", "করবে না", "বাতিল", "বাতিল করো", "থাক", "থামো", "পাঠাবে না", "পাঠিও না",
      "na", "korbe na", "batil", "thamo", "pathio na"
    ];

    const isAffirmed = affirmativeTokens.some(t => clean === t || clean.includes(t));
    const isNegated = negativeTokens.some(t => clean === t || clean.includes(t));

    if (isAffirmed && !isNegated) {
      setDetectedIntent("CONFIRM");
    } else if (isNegated) {
      setDetectedIntent("REJECT");
    } else {
      setDetectedIntent("UNKNOWN");
    }
  }, [inputText]);

  const handleSubmitText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (detectedIntent === "CONFIRM") {
      onConfirm();
    } else if (detectedIntent === "REJECT") {
      onReject();
    }
  };

  const handleQuickChip = (text: string) => {
    setInputText(text);
    const clean = text.toLowerCase().trim();
    if (["yes", "send it", "করো", "পাঠাও", "হ্যাঁ"].some(t => clean.includes(t))) {
      onConfirm();
    } else {
      onReject();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1726] border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)] p-5 overflow-hidden">
        {/* Glow Header bar */}
        <div className="flex items-center gap-2.5 text-amber-400 font-mono text-xs font-bold tracking-wider uppercase pb-3 border-b border-amber-500/20">
          <ShieldAlert className="w-4 h-4 animate-bounce text-amber-400" />
          <span>JARVIS Safety Protocol • Sensitive Action Confirmation</span>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-3">
          <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3.5 space-y-1.5">
            <div className="text-xs font-mono text-amber-200/90 font-semibold uppercase">
              Action: {actionCategory === "MESSAGING" ? "Send Outgoing Message" : actionCategory === "CALLING" ? "Initiate Phone Call" : actionCategory === "FILE_DELETION" ? "Permanently Delete File" : "Modify Sensitive System Settings"}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div>
                <span className="text-slate-400">Application:</span>{" "}
                <span className="text-white font-bold">{appName}</span>
              </div>
              {recipient && (
                <div>
                  <span className="text-slate-400">Target / Recipient:</span>{" "}
                  <span className="text-cyan-300 font-bold">{recipient}</span>
                </div>
              )}
            </div>

            {messageText && (
              <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-white">
                <span className="text-[10px] text-slate-400 block font-mono">
                  Drafted Content:
                </span>
                <p className="mt-0.5 italic">"{messageText}"</p>
              </div>
            )}
          </div>

          {/* JARVIS Vocal Query */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs font-medium text-slate-100 leading-relaxed">
              💬 {promptText}
            </div>
            {promptTextBn && (
              <div className="text-xs font-serif text-amber-300/90 mt-1 leading-relaxed">
                🇧🇩 {promptTextBn}
              </div>
            )}
          </div>

          {/* Natural Language Voice or Text Input Field */}
          <form onSubmit={handleSubmitText} className="space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Speak or type: 'Yes', 'হ্যাঁ', 'Send it', 'করো', 'না'..."
                className="w-full bg-slate-900/90 border border-amber-500/40 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 font-mono outline-hidden pr-20"
                autoFocus
              />
              <div className="absolute right-2 flex items-center gap-1">
                {detectedIntent === "CONFIRM" && (
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.5 rounded">
                    AFFIRMED
                  </span>
                )}
                {detectedIntent === "REJECT" && (
                  <span className="text-[10px] font-mono bg-red-950 text-red-300 border border-red-500/50 px-1.5 py-0.5 rounded">
                    REJECTED
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!detectedIntent || detectedIntent === "UNKNOWN"}
                  className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 disabled:opacity-30 cursor-pointer"
                  title="Submit natural language confirmation"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Natural Language Chips in English & Bengali */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-400 mr-1">Quick responses:</span>
              <button
                type="button"
                onClick={() => handleQuickChip("Send it")}
                className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors"
              >
                "Send it"
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip("হ্যাঁ, করো")}
                className="px-2 py-0.5 text-[11px] font-bangla rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors"
              >
                "হ্যাঁ, করো"
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip("Yes")}
                className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors"
              >
                "Yes"
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip("পাঠাও")}
                className="px-2 py-0.5 text-[11px] font-bangla rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors"
              >
                "পাঠাও"
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip("না, বাতিল করো")}
                className="px-2 py-0.5 text-[11px] font-bangla rounded-md bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 cursor-pointer transition-colors"
              >
                "না (Cancel)"
              </button>
            </div>
          </form>

          {/* Listening for Voice Confirmation indicator */}
          <div className="flex items-center justify-center gap-2 py-1 text-xs font-mono text-slate-400">
            <Mic className={`w-3.5 h-3.5 ${isListening ? "text-amber-400 animate-pulse" : "text-slate-500"}`} />
            <span>Voice & Text Natural Language Recognition Active</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onReject}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span>REJECT (না, বাতিল)</span>
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono text-xs font-bold shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>CONFIRM (হ্যাঁ, অনুমতি দিন)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
