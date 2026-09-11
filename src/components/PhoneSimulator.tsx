import React, { useState, useEffect } from "react";
import {
  Wifi,
  Battery,
  Search,
  ArrowLeft,
  MoreVertical,
  Play,
  Pause,
  Send,
  CheckCheck,
  MapPin,
  Compass,
  Layers,
  Sparkles,
  Volume2,
  Lock,
  Smartphone,
  Eye,
  Sliders,
  ChevronRight,
  User,
  ThumbsUp,
  Share2,
} from "lucide-react";
import { UIElement } from "../types";

export type SimulatedApp = "home" | "youtube" | "whatsapp" | "maps" | "settings";

interface PhoneSimulatorProps {
  currentApp: SimulatedApp;
  onNavigateApp: (app: SimulatedApp) => void;
  searchQuery?: string;
  isSearchActive?: boolean;
  isVideoPlaying?: boolean;
  selectedVideoTitle?: string;
  whatsappRecipient?: string;
  whatsappDraft?: string;
  whatsappMessages?: Array<{ sender: "user" | "other"; text: string; time: string }>;
  activeTargetElement?: {
    resourceId?: string;
    text?: string;
    contentDescription?: string;
  } | null;
  showAccessibilityOverlay: boolean;
  onToggleOverlay: () => void;
  pointerCoordinates?: { x: number; y: number; active: boolean } | null;
  volumeLevel?: number;
  showVolumeToast?: boolean;
  isScreenLocked?: boolean;
  onUnlockScreen?: () => void;
  scrollIndicator?: "UP" | "DOWN" | null;
  diagnosticAlert?: string | null;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  currentApp,
  onNavigateApp,
  searchQuery = "Alexandra Daddario new movies",
  isSearchActive = false,
  isVideoPlaying = false,
  selectedVideoTitle = "Alexandra Daddario New Action Thriller (2025/2026) Official First Look",
  whatsappRecipient = "Mom",
  whatsappDraft = "",
  whatsappMessages = [],
  activeTargetElement,
  showAccessibilityOverlay,
  onToggleOverlay,
  pointerCoordinates,
  volumeLevel = 80,
  showVolumeToast = false,
  isScreenLocked = false,
  onUnlockScreen,
  scrollIndicator = null,
  diagnosticAlert = null,
}) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState(isVideoPlaying);
  const [currentTime, setCurrentTime] = useState("12:45");

  useEffect(() => {
    setIsPlayingLocal(isVideoPlaying);
  }, [isVideoPlaying]);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Simulator Tools Bar */}
      <div className="w-full max-w-[360px] mb-2 flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-1.5 font-mono">
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pixel 9 Pro • Android 15</span>
        </div>
        <button
          onClick={onToggleOverlay}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
            showAccessibilityOverlay
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200"
          }`}
          title="Toggle Android AccessibilityNodeInfo bounding boxes and resource IDs"
        >
          <Eye className="w-3 h-3" />
          <span>A11y Tree Overlay</span>
        </button>
      </div>

      {/* Phone Hardware Chassis */}
      <div className="relative w-[340px] h-[690px] rounded-[44px] bg-[#0c1018] p-3 border-4 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] shadow-cyan-950/30 select-none overflow-hidden">
        {/* Hardware side buttons */}
        <div className="absolute -left-[6px] top-28 w-[3px] h-12 bg-slate-600 rounded-l" />
        <div className="absolute -left-[6px] top-44 w-[3px] h-12 bg-slate-600 rounded-l" />
        <div className="absolute -right-[6px] top-32 w-[3px] h-16 bg-slate-600 rounded-r" />

        {/* Screen Bezel / Viewport */}
        <div className="relative w-full h-full rounded-[34px] bg-black overflow-hidden flex flex-col text-white font-sans">
          {/* Status Bar */}
          <div className="h-7 w-full bg-black/60 backdrop-blur-xs flex items-center justify-between px-6 z-30 shrink-0 text-[11px] font-mono font-medium text-slate-300">
            <span>{currentTime}</span>

            {/* Dynamic Camera Punch Hole Notch */}
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-400 font-bold">
                JARVIS
              </span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Active Application Viewport */}
          <div className="flex-1 relative overflow-hidden bg-slate-950 flex flex-col">
            {/* APP: HOME SCREEN */}
            {currentApp === "home" && (
              <div className="flex-1 flex flex-col justify-between p-4 bg-radial from-slate-900 to-black">
                {/* Clock & Weather Widget */}
                <div className="mt-8 text-center">
                  <div className="text-5xl font-light tracking-tight font-mono text-cyan-100">
                    {currentTime}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">
                    Friday, Sep 11 • 28°C Clear
                  </div>
                </div>

                {/* Google Search Pill */}
                <div
                  id="com.google.android.googlequicksearchbox:id/search_box"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">G</span>
                    <span>Search or ask JARVIS...</span>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>

                {/* App Grid Launcher */}
                <div className="grid grid-cols-4 gap-4 px-2 mb-2">
                  <button
                    onClick={() => onNavigateApp("youtube")}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                    </div>
                    <span className="text-[11px] text-slate-300">YouTube</span>
                  </button>

                  <button
                    onClick={() => onNavigateApp("whatsapp")}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] text-slate-300">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onNavigateApp("maps")}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] text-slate-300">Maps</span>
                  </button>

                  <button
                    onClick={() => onNavigateApp("settings")}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Sliders className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] text-slate-300">Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* APP: YOUTUBE */}
            {currentApp === "youtube" && (
              <div className="flex-1 flex flex-col bg-[#0f0f0f] text-white">
                {/* YouTube Top Bar */}
                <div className="h-12 border-b border-white/10 px-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-4 bg-red-600 rounded flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                    </div>
                    <span className="font-bold text-sm tracking-tighter">YouTube</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="com.google.android.youtube:id/menu_item_search"
                      className={`p-1.5 rounded-full transition-colors ${
                        isSearchActive ? "bg-white/20 text-cyan-400" : "text-white"
                      }`}
                      title="Search YouTube"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <div className="w-6 h-6 rounded-full bg-cyan-700 flex items-center justify-center text-[11px] font-bold">
                      T
                    </div>
                  </div>
                </div>

                {/* If Search Active: In-App Search Bar */}
                {isSearchActive && (
                  <div className="bg-[#212121] px-3 py-2 border-b border-white/10 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                    <div
                      id="com.google.android.youtube:id/search_edit_text"
                      className="flex-1 bg-black/50 border border-white/20 rounded-full px-3 py-1 text-xs text-white flex items-center justify-between"
                    >
                      <span className="truncate">{searchQuery || "Search YouTube"}</span>
                      {searchQuery && (
                        <span className="text-[10px] text-slate-400">✕</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Player or Results Feed */}
                <div className="flex-1 overflow-y-auto">
                  {/* If video selected & playing */}
                  {isVideoPlaying ? (
                    <div className="flex flex-col">
                      {/* Video Player Canvas */}
                      <div
                        id="com.google.android.youtube:id/player_view"
                        className="relative w-full h-44 bg-slate-900 flex items-center justify-center overflow-hidden"
                      >
                        {/* Video Backdrop Art */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 opacity-90" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
                          <button
                            onClick={() => setIsPlayingLocal(!isPlayingLocal)}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform mb-2 text-cyan-300"
                          >
                            {isPlayingLocal ? (
                              <Pause className="w-6 h-6 fill-current" />
                            ) : (
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            )}
                          </button>
                          <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            VERIFIED PLAYING • 1080p60
                          </span>
                        </div>

                        {/* Animated Video Scrubber */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                          <div className="h-full bg-red-600 animate-[pulse_2s_infinite] w-2/5" />
                        </div>
                      </div>

                      {/* Video Info Card */}
                      <div className="p-3 border-b border-white/10">
                        <h4 className="text-xs font-semibold leading-tight line-clamp-2">
                          {selectedVideoTitle}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>1.4M views • 3 days ago</span>
                          <span className="text-cyan-400 font-mono">#Movies #Trailer</span>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>84K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto text-emerald-400 font-mono text-[10px]">
                            JARVIS Synced
                          </div>
                        </div>
                      </div>

                      {/* Up Next / Recommendations */}
                      <div className="p-2 space-y-2">
                        <div className="text-[11px] font-bold text-slate-400 px-1">
                          Related Videos
                        </div>
                        <div className="flex gap-2 p-1.5 rounded bg-white/5">
                          <div className="w-20 h-12 rounded bg-slate-800 shrink-0 relative overflow-hidden flex items-center justify-center">
                            <Play className="w-4 h-4 text-white/50" />
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/80 px-0.5 rounded font-mono">
                              14:22
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium leading-tight truncate">
                              Alexandra Daddario - Career Retrospective & New Roles
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Cinema Universe • 890K views
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Search Results List */
                    <div className="p-2 space-y-3">
                      {/* Video Result Card 1 */}
                      <div
                        id="com.google.android.youtube:id/video_item_1"
                        className="group flex flex-col gap-1.5 cursor-pointer rounded-lg p-1 hover:bg-white/5 transition-colors border border-transparent hover:border-cyan-500/30"
                      >
                        <div className="relative w-full h-36 rounded-lg bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center">
                          <div className="text-center p-2">
                            <span className="text-xs font-semibold text-cyan-200">
                              NEW RELEASES 2025/2026
                            </span>
                            <p className="text-[10px] text-slate-400">
                              Alexandra Daddario Movie Highlights
                            </p>
                          </div>
                          <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/80 text-white px-1 rounded font-mono font-medium">
                            12:45
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-700 shrink-0 flex items-center justify-center text-[10px] font-bold">
                            AD
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-semibold leading-tight line-clamp-2 text-white">
                              {selectedVideoTitle}
                            </h5>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Hollywood Insider • 1.4M views • 3 days ago
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Video Result Card 2 */}
                      <div className="flex flex-col gap-1.5 rounded-lg p-1 opacity-75">
                        <div className="relative w-full h-32 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                          <span className="text-[11px] text-slate-400">
                            Upcoming Hollywood Thrillers
                          </span>
                          <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/80 text-white px-1 rounded font-mono">
                            8:10
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-700 shrink-0 flex items-center justify-center text-[10px] font-bold">
                            F
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-semibold leading-tight line-clamp-2 text-slate-300">
                              Top 10 Most Anticipated Mystery Movies of 2026
                            </h5>
                            <p className="text-[9px] text-slate-500 mt-0.5">
                              FilmZone • 450K views • 1 week ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* APP: WHATSAPP */}
            {currentApp === "whatsapp" && (
              <div className="flex-1 flex flex-col bg-[#0b141a] text-white">
                {/* WhatsApp Chat Header */}
                <div className="h-12 bg-[#1f2c34] px-3 flex items-center justify-between shrink-0 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <ArrowLeft
                      onClick={() => onNavigateApp("home")}
                      className="w-4 h-4 text-slate-300 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-xs font-bold text-white">
                      {whatsappRecipient.charAt(0)}
                    </div>
                    <div>
                      <div
                        id="com.whatsapp:id/conversation_contact_name"
                        className="text-xs font-semibold leading-tight"
                      >
                        {whatsappRecipient}
                      </div>
                      <div className="text-[9px] text-emerald-400">online</div>
                    </div>
                  </div>
                  <MoreVertical className="w-4 h-4 text-slate-300" />
                </div>

                {/* Messages Thread Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                  {/* Historical message from contact */}
                  <div className="flex justify-start">
                    <div className="max-w-[75%] bg-[#202c33] rounded-lg rounded-tl-xs p-2 text-xs text-slate-100 shadow">
                      <p>Hey, what time will you be arriving tonight?</p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">
                        12:40
                      </span>
                    </div>
                  </div>

                  {/* Dynamically sent messages */}
                  {whatsappMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-2 text-xs shadow ${
                          msg.sender === "user"
                            ? "bg-[#005c4b] text-white rounded-tr-xs"
                            : "bg-[#202c33] text-slate-100 rounded-tl-xs"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200">
                          <span>{msg.time}</span>
                          <CheckCheck className="w-3 h-3 text-cyan-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Chat Input Bar */}
                <div className="p-2 bg-[#1f2c34] flex items-center gap-2">
                  <div
                    id="com.whatsapp:id/entry"
                    className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-xs text-slate-100 flex items-center min-h-[32px]"
                  >
                    {whatsappDraft ? (
                      <span className="font-medium text-white">{whatsappDraft}</span>
                    ) : (
                      <span className="text-slate-400">Message</span>
                    )}
                  </div>

                  <button
                    id="com.whatsapp:id/send"
                    className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow hover:scale-105 transition-transform"
                    title="Send WhatsApp Message"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            )}

            {/* APP: GOOGLE MAPS */}
            {currentApp === "maps" && (
              <div className="flex-1 flex flex-col bg-slate-900 relative">
                {/* Search Bar Floating */}
                <div className="p-3 z-10">
                  <div
                    id="com.google.android.apps.maps:id/search_bar"
                    className="bg-slate-800/95 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700 flex items-center justify-between text-xs text-slate-200 shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{searchQuery || "Nearest coffee shop"}</span>
                    </div>
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Simulated Map Canvas */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                  {/* Route & Destination Pins */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-2 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-center shadow-xl mb-2">
                      <p className="text-xs font-bold text-cyan-300">Blue Tokai Coffee Roasters</p>
                      <p className="text-[10px] text-slate-400">4.7 ★ • 450m (6 min walk)</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center text-black shadow-lg shadow-cyan-500/50 animate-bounce">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APP: SETTINGS */}
            {currentApp === "settings" && (
              <div className="flex-1 flex flex-col bg-slate-950 p-4 text-white">
                <h3 className="text-base font-bold text-white mb-4">Settings</h3>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs font-semibold text-cyan-200">
                          JARVIS Accessibility Service
                        </p>
                        <p className="text-[10px] text-emerald-400">Active & Observing UI Tree</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold font-mono">
                      ON
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Media & Voice Volume</p>
                        <p className="text-[10px] text-slate-400">85% Level</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Safety & Confirmations</p>
                        <p className="text-[10px] text-slate-400">Messaging & Calls Protected</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                      STRICT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Inspector Overlay */}
            {showAccessibilityOverlay && (
              <div className="absolute inset-0 pointer-events-none z-40 border-2 border-cyan-500/40 p-2">
                <div className="bg-black/80 backdrop-blur-xs border border-cyan-500/60 rounded p-1.5 text-[9px] font-mono text-cyan-300 space-y-0.5">
                  <div className="text-emerald-400 font-bold">
                    [AccessibilityNodeInfo Tree: {currentApp.toUpperCase()}]
                  </div>
                  <div>pkg: com.google.android.{currentApp}</div>
                  <div>clickableNodes: 14 | editableNodes: 2</div>
                  {activeTargetElement && (
                    <div className="text-amber-300 font-bold border-t border-amber-500/30 pt-0.5 mt-0.5">
                      Target: {activeTargetElement.resourceId || activeTargetElement.text || "node"}
                    </div>
                  )}
                </div>

                {/* Highlight active target element bounds */}
                {activeTargetElement && (
                  <div className="absolute inset-x-4 top-14 h-10 border-2 border-amber-400 bg-amber-400/10 rounded animate-pulse flex items-center justify-end px-2">
                    <span className="text-[8px] font-mono bg-amber-400 text-black font-bold px-1 rounded">
                      FOCUSED
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Simulated Animated Pointer / Tap Cursor */}
            {pointerCoordinates && pointerCoordinates.active && (
              <div
                className="absolute z-50 pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pointerCoordinates.x}%`,
                  top: `${pointerCoordinates.y}%`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-cyan-400/80 border-2 border-white shadow-[0_0_15px_#00f0ff] animate-ping" />
                <div className="w-3 h-3 rounded-full bg-white absolute top-1.5 left-1.5" />
              </div>
            )}

            {/* Scroll Indicator Feedback Overlay */}
            {scrollIndicator && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-cyan-950/50 animate-bounce">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    {scrollIndicator === "UP" ? "↑ Scrolling Up" : "↓ Scrolling Down"}
                  </span>
                </div>
              </div>
            )}

            {/* Floating Android Volume HUD Slider */}
            {showVolumeToast && (
              <div className="absolute top-20 right-3 z-40 w-11 h-44 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 flex flex-col items-center justify-between shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-right-2 duration-200">
                <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                {/* Vertical slider track */}
                <div className="w-2.5 flex-1 my-2 bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-cyan-400 rounded-full transition-all duration-300"
                    style={{ height: `${Math.min(Math.max(volumeLevel, 0), 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-200">
                  {volumeLevel}%
                </span>
              </div>
            )}

            {/* Diagnostic Alert Banner (Error Recovery Engine) */}
            {diagnosticAlert && (
              <div className="absolute top-8 inset-x-2 z-40 bg-amber-950/95 border border-amber-500/60 rounded-lg p-2.5 shadow-xl shadow-black/70 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1 animate-ping shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wide">
                      Diagnostics & Recovery Tactic
                    </div>
                    <div className="text-[11px] text-amber-100 font-sans mt-0.5 leading-tight">
                      {diagnosticAlert}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lock Screen Overlay */}
            {isScreenLocked && (
              <div
                onClick={onUnlockScreen}
                className="absolute inset-0 z-50 bg-[#060910]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 cursor-pointer select-none animate-in fade-in duration-300"
              >
                {/* Top Status */}
                <div className="w-full flex items-center justify-between text-slate-500 text-xs font-mono">
                  <span>Android Security</span>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </div>
                </div>

                {/* Center Clock & Date */}
                <div className="text-center my-auto">
                  <div className="text-6xl font-light font-mono text-slate-100 tracking-tight">
                    {currentTime}
                  </div>
                  <div className="text-sm font-medium text-slate-400 mt-1">
                    Friday, September 11
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    JARVIS Offline Voice Active
                  </div>
                </div>

                {/* Bottom Unlock Prompt */}
                <div className="text-center mb-4">
                  <div className="text-xs text-slate-400 font-sans animate-pulse">
                    Tap anywhere or swipe up to unlock
                  </div>
                  <div className="text-[11px] text-cyan-400/80 font-bangla mt-0.5">
                    আনলক করতে ট্যাপ করুন
                  </div>
                  <div className="w-8 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
                </div>
              </div>
            )}
          </div>

          {/* Android 3-Button Navigation Bar */}
          <div className="h-10 bg-black/90 px-8 flex items-center justify-around shrink-0 border-t border-white/5 z-30">
            <button
              onClick={() => onNavigateApp("home")}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Android Back Navigation"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateApp("home")}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Android Home"
            >
              <div className="w-3 h-3 rounded-full border border-current" />
            </button>
            <button
              onClick={() => onNavigateApp("settings")}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Android Recents"
            >
              <div className="w-3 h-3 border border-current rounded-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
