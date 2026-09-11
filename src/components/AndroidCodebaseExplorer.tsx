import React, { useState } from "react";
import { Copy, Check, Download, FileCode, Folder, ChevronRight, Info, PackageCheck, Smartphone, HelpCircle, X, ExternalLink, Terminal } from "lucide-react";
import { ANDROID_CODEBASE_FILES } from "../data/androidProjectCode";
import { AndroidCodeFile } from "../types";

export const AndroidCodebaseExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_CODEBASE_FILES[3]); // JarvisAccessibilityService.kt
  const [copied, setCopied] = useState(false);
  const [showApkGuide, setShowApkGuide] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([selectedFile.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = selectedFile.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadZip = () => {
    setIsDownloadingZip(true);
    window.location.href = "/api/jarvis/download-project-zip";
    setTimeout(() => setIsDownloadingZip(false), 3000);
  };

  const categories = Array.from(new Set(ANDROID_CODEBASE_FILES.map((f) => f.category)));

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#080d16] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl min-h-[640px] relative">
      {/* File Sidebar Tree */}
      <div className="w-full md:w-80 bg-[#0a101d] border-b md:border-b-0 md:border-r border-slate-800 p-3 flex flex-col shrink-0">
        <div className="pb-3 border-b border-slate-800/80 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Folder className="w-4 h-4" />
              <span>Android Project Tree</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
              {ANDROID_CODEBASE_FILES.length} files
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Full Production Kotlin & Jetpack Compose Codebase
          </p>

          {/* Quick Action: Download Complete Project ZIP */}
          <div className="mt-3 space-y-1.5">
            <button
              onClick={handleDownloadZip}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-98"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{isDownloadingZip ? "Generating ZIP..." : "Download Full Project (.ZIP)"}</span>
            </button>

            <button
              onClick={() => setShowApkGuide(true)}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>How to Build APK on Android Phone</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider px-2 mb-1">
                {cat}
              </div>
              <div className="space-y-0.5">
                {ANDROID_CODEBASE_FILES.filter((f) => f.category === cat).map((file) => {
                  const isSelected = selectedFile.id === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                      <span className="truncate">{file.filename}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070b13]">
        {/* File Header Bar */}
        <div className="h-12 border-b border-slate-800/90 px-4 flex items-center justify-between bg-[#0a111f]/60 backdrop-blur-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-cyan-400 font-semibold truncate">
              {selectedFile.path}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono hidden sm:inline-block">
              {selectedFile.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download File</span>
            </button>
          </div>
        </div>

        {/* File Description Tag */}
        <div className="px-4 py-2 bg-cyan-950/20 border-b border-cyan-900/30 flex items-center gap-2 text-xs text-cyan-300 font-mono">
          <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
          <span>{selectedFile.description}</span>
        </div>

        {/* Code View Canvas with Line Numbers */}
        <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed custom-scrollbar bg-[#05080f]">
          <pre className="select-text whitespace-pre">
            <code>
              {selectedFile.code.split("\n").map((line, i) => (
                <div key={i} className="table-row">
                  <span className="table-cell pr-4 text-slate-600 select-none text-right w-8 text-[11px]">
                    {i + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Modal: How to Build & Install APK on Android Phone */}
      {showApkGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-cyan-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyan-300 font-mono">
                    Build & Install JARVIS APK on Android
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    3 Easy Methods from your Android Phone or PC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApkGuide(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method 1: Cloud Build with GitHub Actions (Zero PC required) */}
            <div className="bg-[#080d16] border border-cyan-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">1</span>
                  <span>Recommended: 1-Click Cloud Build (GitHub Actions)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                  No PC Required
                </span>
              </div>
              <p className="text-xs text-slate-300">
                The project includes a ready-to-run GitHub Actions workflow (<code className="text-cyan-400">.github/workflows/build-apk.yml</code>).
              </p>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside font-mono">
                <li>Download the project ZIP by clicking <strong className="text-cyan-300">"Download Full Project (.ZIP)"</strong>.</li>
                <li>Go to <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a> from your phone browser and create a repository.</li>
                <li>Upload the unzipped project files or export via AI Studio Settings &gt; GitHub.</li>
                <li>Open the <strong className="text-slate-200">Actions</strong> tab: GitHub automatically builds <code className="text-cyan-400">app-debug.apk</code> in ~90 seconds.</li>
                <li>Tap the completed run &gt; Download <strong className="text-cyan-300">jarvis-assistant-debug-apk</strong> directly to your phone and install!</li>
              </ol>
            </div>

            {/* Method 2: Termux on Android Phone */}
            <div className="bg-[#080d16] border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold uppercase">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">2</span>
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Compile Locally on Phone via Termux</span>
              </div>
              <p className="text-xs text-slate-300">
                If you have Termux installed on your Android phone:
              </p>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                <code>pkg update && pkg install openjdk-17 gradle git<br/>
unzip jarvis-android-assistant-project.zip<br/>
cd JarvisAssistant<br/>
gradle assembleDebug</code>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                The compiled APK is placed at: <code className="text-cyan-400">app/build/outputs/apk/debug/app-debug.apk</code>
              </p>
            </div>

            {/* Method 3: Android Studio on PC */}
            <div className="bg-[#080d16] border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-mono text-xs font-bold uppercase">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">3</span>
                <span>Standard Android Studio Build</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Extract the ZIP &gt; Open folder in Android Studio &gt; Click <strong className="text-slate-200">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={handleDownloadZip}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Project ZIP Now</span>
              </button>
              <button
                onClick={() => setShowApkGuide(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

