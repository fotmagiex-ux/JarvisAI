/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { HeaderNav, NavTab } from "./components/HeaderNav";
import { ArcReactor } from "./components/ArcReactor";
import { PhoneSimulator, SimulatedApp } from "./components/PhoneSimulator";
import { TaskProgressTracker } from "./components/TaskProgressTracker";
import { StructuredLogsView } from "./components/StructuredLogsView";
import { JarvisControls } from "./components/JarvisControls";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { ErrorRecoveryModal } from "./components/ErrorRecoveryModal";
import { OfflineCommandsPanel } from "./components/OfflineCommandsPanel";
import { AndroidCodebaseExplorer } from "./components/AndroidCodebaseExplorer";
import { ArchitectureSpecs } from "./components/ArchitectureSpecs";
import {
  JarvisState,
  TaskStep,
  AuditLog,
  LanguageMode,
  OperationMode,
  TaskPlan,
  IntentData,
  OfflineCommand,
  FailureReason,
  DiagnosticResult,
} from "./types";
import { WifiOff, Bug, CheckCircle2, ShieldCheck } from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>("simulator");

  // Assistant State
  const [jarvisState, setJarvisState] = useState<JarvisState>("IDLE");
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.4);
  const [languageMode, setLanguageMode] = useState<LanguageMode>("auto");
  const [operationMode, setOperationMode] = useState<OperationMode>("online");
  const [speechOutputEnabled, setSpeechOutputEnabled] = useState(true);

  // Phone Simulator State
  const [currentApp, setCurrentApp] = useState<SimulatedApp>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState(
    "Alexandra Daddario New Action Thriller (2025/2026) Official First Look"
  );
  const [whatsappRecipient, setWhatsappRecipient] = useState("Rahul");
  const [whatsappDraft, setWhatsappDraft] = useState("");
  const [whatsappMessages, setWhatsappMessages] = useState<
    Array<{ sender: "user" | "other"; text: string; time: string }>
  >([
    {
      sender: "other",
      text: "Hey, what time will you be arriving tonight?",
      time: "12:40",
    },
  ]);
  const [showAccessibilityOverlay, setShowAccessibilityOverlay] = useState(false);
  const [pointerCoordinates, setPointerCoordinates] = useState<{
    x: number;
    y: number;
    active: boolean;
  } | null>(null);

  // System Device State (Volume, Lock Screen, Gestures)
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [scrollIndicator, setScrollIndicator] = useState<"UP" | "DOWN" | null>(null);
  const [diagnosticAlert, setDiagnosticAlert] = useState<string | null>(null);

  // Error Recovery & Testing Controls
  const [simulateFailureMode, setSimulateFailureMode] = useState(false);
  const [errorRecoveryModalData, setErrorRecoveryModalData] = useState<{
    isOpen: boolean;
    failedStepTitle: string;
    failedStepTitleBn?: string;
    errorReason: string;
    errorReasonBn?: string;
    diagnosticsLog: string[];
    retriesAttempted: number;
    maxRetries: number;
    stepIndex: number;
    plan: TaskPlan | null;
  }>({
    isOpen: false,
    failedStepTitle: "",
    errorReason: "",
    diagnosticsLog: [],
    retriesAttempted: 0,
    maxRetries: 2,
    stepIndex: 0,
    plan: null,
  });

  // Offline Commands Registry
  const [offlineCommands, setOfflineCommands] = useState<OfflineCommand[]>([]);

  // Task & Logs
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Confirmation Modal
  const [confirmationData, setConfirmationData] = useState<{
    isOpen: boolean;
    appName: string;
    recipient?: string;
    messageText?: string;
    actionCategory?: "MESSAGING" | "CALLING" | "FILE_DELETION" | "SETTINGS";
    promptText: string;
    promptTextBn?: string;
    stepToResume?: number;
    planToResume?: TaskPlan;
  }>({
    isOpen: false,
    appName: "",
    promptText: "",
  });

  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Fetch offline commands from backend
  const fetchOfflineCommands = async () => {
    try {
      const res = await fetch("/api/jarvis/offline-commands");
      const json = await res.json();
      if (json.data) {
        setOfflineCommands(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch offline commands", e);
    }
  };

  useEffect(() => {
    fetchOfflineCommands();
  }, []);

  // Helper to add audit log
  const addLog = (
    type: string,
    message: string,
    level: "info" | "action" | "verify" | "alert" | "error" = "info",
    message_bn?: string
  ) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      message_bn,
      level,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Text to Speech
  const speakJarvis = (text: string, isBn = false) => {
    if (!speechOutputEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      if (isBn) {
        utterance.lang = "bn-BD";
      } else {
        utterance.lang = "en-GB";
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error", e);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = languageMode === "bn" ? "bn-BD" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setJarvisState("LISTENING");
        addLog(
          "VOICE_LISTENING",
          "Listening for speech input...",
          "info",
          "ভয়েস ইনপুট শুনছি..."
        );
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        addLog(
          "VOICE_RECEIVED",
          `Captured speech transcript: "${transcript}"`,
          "info"
        );
        handleExecuteCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error", event.error);
        setIsListening(false);
        setJarvisState("IDLE");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [languageMode]);

  // Toggle Voice Listening
  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setJarvisState("IDLE");
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = languageMode === "bn" ? "bn-BD" : "en-US";
          recognitionRef.current.start();
        } else {
          // Fallback simulation if browser speech recognition is not supported
          setIsListening(true);
          setJarvisState("LISTENING");
          setTimeout(() => {
            setIsListening(false);
            handleExecuteCommand("Open YouTube and play Alexandra Daddario new movies");
          }, 2500);
        }
      } catch (e) {
        console.error("Mic start failed", e);
        setIsListening(false);
      }
    }
  };

  // Simulates pointer touch on device
  const animateTouchAt = async (x: number, y: number, durationMs = 600) => {
    setPointerCoordinates({ x, y, active: true });
    await new Promise((r) => setTimeout(r, durationMs));
    setPointerCoordinates(null);
  };

  // Register a new offline command dynamically
  const handleAddNewOfflineCommand = async (newCmd: Omit<OfflineCommand, "id">) => {
    try {
      const res = await fetch("/api/jarvis/offline-commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCmd),
      });
      const data = await res.json();
      if (data.success && data.command) {
        setOfflineCommands((prev) => [...prev, data.command]);
        addLog(
          "OFFLINE_COMMAND_REGISTERED",
          `Successfully registered new offline command: "${data.command.name}"`,
          "info",
          `নতুন অফলাইন কমান্ড নিবন্ধিত: "${data.command.name}"`
        );
      }
    } catch (err) {
      console.error("Failed to add offline command", err);
    }
  };

  // Main Command Execution Flow
  const handleExecuteCommand = async (command: string) => {
    setJarvisState("UNDERSTANDING");
    addLog(
      "TASK_STARTED",
      `Initiated user command: "${command}"`,
      "info",
      `টাস্ক শুরু: "${command}"`
    );

    try {
      // 1. Send command to backend server for NLU & Intent Analysis
      const understandRes = await fetch("/api/jarvis/understand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command,
          languageMode,
          operationMode,
          currentApp,
        }),
      });

      const understandJson = await understandRes.json();
      const intentData: IntentData = understandJson.data || {
        intent: "open_app_search",
        application: "youtube",
        appName: "YouTube",
        parameters: { query: command },
        requires_confirmation: false,
        voice_response: `Processing command: "${command}"`,
        plan_summary: [],
      };

      addLog(
        "INTENT_PARSED",
        `Parsed intent: ${intentData.intent}. App: ${intentData.appName || intentData.application}`,
        "info"
      );

      // Handle direct offline device & navigation actions
      const paramAction = intentData.parameters?.action || intentData.parameters?.target;

      // Volume Up
      if (intentData.intent === "device_volume_up" || paramAction === "VOLUME_UP") {
        setJarvisState("EXECUTING");
        setVolumeLevel((prev) => Math.min(100, prev + 10));
        setShowVolumeToast(true);
        setTimeout(() => setShowVolumeToast(false), 2500);
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Volume increased (+10%)", "verify", "ভলিউম বাড়ানো সম্পন্ন (+10%)");
        speakJarvis(
          languageMode === "bn" ? "ভলিউম বাড়িয়ে দিচ্ছি।" : "Increasing volume, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // Volume Down
      if (intentData.intent === "device_volume_down" || paramAction === "VOLUME_DOWN") {
        setJarvisState("EXECUTING");
        setVolumeLevel((prev) => Math.max(0, prev - 10));
        setShowVolumeToast(true);
        setTimeout(() => setShowVolumeToast(false), 2500);
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Volume decreased (-10%)", "verify", "ভলিউম কমানো সম্পন্ন (-10%)");
        speakJarvis(
          languageMode === "bn" ? "ভলিউম কমিয়ে দিচ্ছি।" : "Decreasing volume, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // Lock Screen
      if (intentData.intent === "device_lock_screen" || paramAction === "LOCK_SCREEN") {
        setJarvisState("EXECUTING");
        setIsScreenLocked(true);
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Device screen locked via Accessibility API", "verify", "ডিভাইস স্ক্রিন লক সম্পন্ন");
        speakJarvis(
          languageMode === "bn" ? "স্ক্রিন লক করা হচ্ছে।" : "Locking device screen, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // Scroll Down
      if (intentData.intent === "system_scroll_down" || paramAction === "SCROLL_DOWN") {
        setJarvisState("EXECUTING");
        setScrollIndicator("DOWN");
        setTimeout(() => setScrollIndicator(null), 1500);
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Accessibility performScroll(forward=true) executed", "verify", "নিচে স্ক্রোল সম্পন্ন");
        speakJarvis(
          languageMode === "bn" ? "নিচে স্ক্রোল করছি।" : "Scrolling downwards, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // Scroll Up
      if (intentData.intent === "system_scroll_up" || paramAction === "SCROLL_UP") {
        setJarvisState("EXECUTING");
        setScrollIndicator("UP");
        setTimeout(() => setScrollIndicator(null), 1500);
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Accessibility performScroll(forward=false) executed", "verify", "উপরে স্ক্রোল সম্পন্ন");
        speakJarvis(
          languageMode === "bn" ? "উপরে স্ক্রোল করছি।" : "Scrolling upwards, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // Back navigation
      if (intentData.application === "system" && (paramAction === "BACK" || intentData.intent === "system_navigation_back")) {
        setJarvisState("EXECUTING");
        await animateTouchAt(20, 98);
        if (isVideoPlaying) setIsVideoPlaying(false);
        else if (isSearchActive) setIsSearchActive(false);
        else setCurrentApp("home");
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Global Back navigation executed", "verify", "পিছনে ফিরে যাওয়া সম্পন্ন");
        speakJarvis(
          languageMode === "bn" ? "পিছনে যাচ্ছি।" : "Going back, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // Home navigation
      if (intentData.application === "system" && (paramAction === "HOME" || intentData.intent === "system_navigation_home")) {
        setJarvisState("EXECUTING");
        await animateTouchAt(50, 98);
        setCurrentApp("home");
        setIsVideoPlaying(false);
        setIsSearchActive(false);
        setJarvisState("COMPLETED");
        addLog("ACTION_VERIFIED", "Global Home navigation executed", "verify", "হোম স্ক্রিনে প্রত্যাবর্তন সম্পন্ন");
        speakJarvis(
          languageMode === "bn" ? "হোম স্ক্রিনে ফিরে যাচ্ছি।" : "Returning home, Sir.",
          languageMode === "bn"
        );
        setTimeout(() => setJarvisState("IDLE"), 2000);
        return;
      }

      // 2. Fetch or generate task plan
      setJarvisState("PLANNING");
      const planRes = await fetch("/api/jarvis/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intentData,
          operationMode,
          currentApp,
        }),
      });

      const planJson = await planRes.json();
      const rawSteps: TaskStep[] = planJson.steps || [];
      const planData: TaskPlan = {
        app: intentData.application || "youtube",
        steps: rawSteps.map((s, idx) => ({
          ...s,
          status: idx === 0 ? "active" : "pending",
          targetApp: intentData.application,
          recipient: intentData.parameters?.recipient,
          inputText: s.inputValue || intentData.parameters?.query || intentData.parameters?.message,
        })),
      };

      setTaskSteps(planData.steps);
      addLog(
        "PLAN_CREATED",
        `Generated ${planData.steps.length}-step execution sequence for ${intentData.appName}`,
        "info"
      );

      if (intentData.voice_response) {
        speakJarvis(
          languageMode === "bn" && intentData.voice_response_bn
            ? intentData.voice_response_bn
            : intentData.voice_response,
          languageMode === "bn"
        );
      }

      // 3. Execute Steps Sequentially
      await runPlanSteps(planData, 0, intentData);
    } catch (err: any) {
      console.error("Task execution error:", err);
      setJarvisState("FAILED");
      addLog(
        "TASK_FAILED",
        `Execution failure: ${err.message || "Unknown error"}`,
        "error"
      );
    }
  };

  // Sequentially executes steps with UI updates, touch indicators, error diagnostics, and verification
  const runPlanSteps = async (plan: TaskPlan, startIndex = 0, intentData?: IntentData) => {
    for (let i = startIndex; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      setActiveStepIndex(i);

      // Mark step active
      setTaskSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "active" } : s))
      );

      // Check if step is a confirmation checkpoint for sensitive actions
      if (
        step.actionType === "REQUEST_CONFIRMATION" ||
        (step.requiresConfirmation && intentData?.requires_confirmation)
      ) {
        setJarvisState("WAITING_FOR_CONFIRMATION");
        const recipient = step.recipient || intentData?.parameters?.recipient || "Rahul";
        const message = step.inputText || intentData?.parameters?.message || whatsappDraft || "I'll be home at 8";

        addLog(
          "CONFIRMATION_REQUESTED",
          `Sensitive action paused: Sending message to ${recipient}`,
          "alert",
          `নিশ্চিতকরণ প্রয়োজন: ${recipient} কে বার্তা পাঠানো হবে`
        );

        const promptText =
          intentData?.confirmation_prompt ||
          `I have prepared this message for ${recipient}: "${message}". Shall I send it, Sir?`;

        const promptTextBn =
          intentData?.confirmation_prompt_bn ||
          `${recipient}-এর জন্য বার্তা প্রস্তুত: "${message}"। পাঠিয়ে দেব কি?`;

        speakJarvis(languageMode === "bn" ? promptTextBn : promptText, languageMode === "bn");

        setConfirmationData({
          isOpen: true,
          appName: intentData?.appName || "WhatsApp",
          recipient,
          messageText: message,
          actionCategory: "MESSAGING",
          promptText,
          promptTextBn,
          stepToResume: i,
          planToResume: plan,
        });

        // Pause execution loop until user confirms
        return;
      }

      // Check for Simulated Failure / Error Recovery
      if (simulateFailureMode && i === 1) {
        setJarvisState("RECOVERING");
        addLog(
          "ACTION_FAILED",
          `Step failed observation: Target element '${step.targetElement?.text || step.title}' obscured or missing`,
          "error",
          `অ্যাকশন ব্যর্থ: স্ক্রিনে লক্ষ্য উপাদানটি পাওয়া যায়নি`
        );

        // Attempt 1: Diagnose Keyboard Obstruction -> Apply Tactic: Dismiss Keyboard & Rescan
        setDiagnosticAlert("Diagnostic: Soft keyboard obstruction detected. Dismissing keyboard (Retry 1/2)...");
        addLog(
          "DIAGNOSTIC_ATTEMPT",
          "Attempt 1/2: Dismissed soft keyboard and rescanned accessibility node hierarchy",
          "alert"
        );
        await new Promise((r) => setTimeout(r, 1200));

        // Attempt 2: Diagnose Element Below Fold -> Apply Tactic: Micro-scroll down
        setDiagnosticAlert("Diagnostic: Target below fold. Performing micro-scroll down to reveal (Retry 2/2)...");
        setScrollIndicator("DOWN");
        addLog(
          "DIAGNOSTIC_ATTEMPT",
          "Attempt 2/2: Executed performScroll(forward=true) to reveal hidden viewport elements",
          "alert"
        );
        await new Promise((r) => setTimeout(r, 1400));
        setScrollIndicator(null);
        setDiagnosticAlert(null);

        // Max retries (2) exhausted!
        setJarvisState("FAILED");
        addLog(
          "RECOVERY_EXHAUSTED",
          "Diagnostic & retry strategy exhausted (2 retries). Requesting user instructions.",
          "error",
          "রিকভারি ব্যর্থ: ব্যবহারকারীর নির্দেশনার জন্য অপেক্ষা"
        );

        speakJarvis(
          languageMode === "bn"
            ? "স্যার, স্বয়ংক্রিয় রিকভারি ব্যর্থ হয়েছে। আমি কি নিচে স্ক্রোল করব নাকি বাতিল করব?"
            : "Sir, automatic recovery failed after 2 retries. How would you like me to proceed?",
          languageMode === "bn"
        );

        setErrorRecoveryModalData({
          isOpen: true,
          failedStepTitle: step.title,
          failedStepTitleBn: "কাঙ্ক্ষিত উপাদানে ট্যাপ করা",
          errorReason: "Target view could not be resolved in the accessibility hierarchy after dismissing keyboard and scrolling.",
          errorReasonBn: "কিবোর্ড সরানো এবং স্ক্রোল করার পরও স্ক্রিনে উপাদানটি পাওয়া যায়নি।",
          diagnosticsLog: [
            "Attempt #1: Dismissed soft keyboard via GLOBAL_ACTION_BACK & refreshed accessibility cache.",
            "Attempt #2: Executed performScroll(forward=true) to bring element into visible viewport.",
            "Failure: Node not identified in AccessibilityNodeInfo tree.",
          ],
          retriesAttempted: 2,
          maxRetries: 2,
          stepIndex: i,
          plan: plan,
        });

        return; // Halt execution until user instructs
      }

      // Normal Execute Step Action
      setJarvisState("EXECUTING");
      addLog(
        "ACTION_REQUESTED",
        `Executing step ${i + 1}/${plan.steps.length}: ${step.title}`,
        "action"
      );

      // Action Handlers
      if (step.actionType === "OPEN_APP" || step.actionType === "LAUNCH_APP") {
        await animateTouchAt(25, 88);
        const app = (step.targetApp || plan.app) as SimulatedApp;
        if (app === "youtube" || app === "whatsapp" || app === "maps" || app === "settings") {
          setCurrentApp(app);
        }
      } else if (step.actionType === "FIND_AND_CLICK" || step.actionType === "CLICK_NODE") {
        const resId = step.targetElement?.resourceId || "";
        const text = step.targetElement?.text || "";

        if (plan.app === "youtube") {
          if (resId.includes("menu_item_search") || text.toLowerCase().includes("search")) {
            await animateTouchAt(78, 8);
            setIsSearchActive(true);
          } else if (resId.includes("player_view") || text || step.title.toLowerCase().includes("video")) {
            await animateTouchAt(50, 24);
            setIsVideoPlaying(true);
            if (step.inputValue) setSelectedVideoTitle(step.inputValue);
          }
        } else if (plan.app === "whatsapp") {
          if (resId.includes("send") || text.toLowerCase().includes("send")) {
            await animateTouchAt(90, 94);
            const msgToSend = whatsappDraft || step.inputValue || "I'll reach home at 8 PM";
            setWhatsappMessages((prev) => [
              ...prev,
              {
                sender: "user",
                text: msgToSend,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            setWhatsappDraft("");
          } else if (resId.includes("contact") || text) {
            await animateTouchAt(40, 20);
            if (step.recipient) setWhatsappRecipient(step.recipient);
          }
        }
      } else if (step.actionType === "TYPE_TEXT") {
        const textToType = step.inputValue || step.inputText || "";
        if (plan.app === "youtube") {
          await animateTouchAt(50, 11);
          setSearchQuery(textToType);
          setIsSearchActive(true);
        } else if (plan.app === "whatsapp") {
          await animateTouchAt(45, 94);
          setWhatsappDraft(textToType);
        } else if (plan.app === "maps") {
          await animateTouchAt(50, 8);
          setSearchQuery(textToType);
        }
      } else if (step.actionType === "SUBMIT") {
        if (plan.app === "youtube") {
          await animateTouchAt(90, 11);
        }
      } else if (step.actionType === "VERIFY_ELEMENT") {
        if (plan.app === "youtube") {
          setIsVideoPlaying(true);
        }
      }

      // Step Verification Phase
      setJarvisState("VERIFYING");
      addLog(
        "ACTION_VERIFIED",
        `Verified state condition: ${step.verificationCriteria || "Accessibility tree confirmed"}`,
        "verify"
      );
      await new Promise((r) => setTimeout(r, 650));

      // Mark step completed
      setTaskSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: "completed" } : s))
      );
    }

    // All steps completed!
    setJarvisState("COMPLETED");
    const completionMsg =
      plan.app === "youtube"
        ? "Task completed, Sir. Alexandra Daddario movie trailer is now playing."
        : plan.app === "whatsapp"
        ? "Task completed, Sir. Message has been successfully delivered."
        : "Task completed successfully, Sir.";

    addLog("TASK_COMPLETED", completionMsg, "verify");
    speakJarvis(completionMsg);

    setTimeout(() => {
      setJarvisState("IDLE");
    }, 4000);
  };

  // Handle User Recovery Decision: Scroll Down & Retry
  const handleRecoveryScrollRetry = async () => {
    const { stepIndex, plan } = errorRecoveryModalData;
    setErrorRecoveryModalData((prev) => ({ ...prev, isOpen: false }));
    setSimulateFailureMode(false); // Clear simulated failure so it succeeds now

    setJarvisState("EXECUTING");
    setScrollIndicator("DOWN");
    addLog("USER_RECOVERY_APPLIED", "User instructed: Scroll Down & Retry", "action");
    await new Promise((r) => setTimeout(r, 1000));
    setScrollIndicator(null);

    if (plan) {
      await runPlanSteps(plan, stepIndex);
    }
  };

  // Handle User Recovery Decision: Force Rescan
  const handleRecoveryForceRescan = async () => {
    const { stepIndex, plan } = errorRecoveryModalData;
    setErrorRecoveryModalData((prev) => ({ ...prev, isOpen: false }));
    setSimulateFailureMode(false);

    setJarvisState("VERIFYING");
    addLog("USER_RECOVERY_APPLIED", "User instructed: Re-scan accessibility tree", "verify");
    await new Promise((r) => setTimeout(r, 800));

    if (plan) {
      await runPlanSteps(plan, stepIndex);
    }
  };

  // Handle User Recovery Decision: Abort Task
  const handleRecoveryAbort = () => {
    setErrorRecoveryModalData((prev) => ({ ...prev, isOpen: false }));
    setJarvisState("IDLE");
    addLog("TASK_ABORTED", "Task gracefully aborted after diagnostic failure", "alert");
    speakJarvis("Task aborted as requested, Sir.");
  };

  // User confirmed the sensitive action
  const handleConfirmAction = async () => {
    const { stepToResume, planToResume } = confirmationData;
    setConfirmationData((prev) => ({ ...prev, isOpen: false }));

    addLog(
      "CONFIRMATION_RECEIVED",
      "Explicit user authorization received. Resuming message transmission.",
      "action",
      "ব্যবহারকারীর নিশ্চিতকরণ গৃহীত হয়েছে। বার্তা পাঠানো হচ্ছে।"
    );

    if (planToResume && stepToResume !== undefined) {
      // Execute the send step directly
      await animateTouchAt(90, 94);
      if (confirmationData.messageText) {
        setWhatsappMessages((prev) => [
          ...prev,
          {
            sender: "user",
            text: confirmationData.messageText || "I'll reach home at 8",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setWhatsappDraft("");
      }

      // Mark that step complete and continue
      setTaskSteps((prev) =>
        prev.map((s, idx) => (idx === stepToResume ? { ...s, status: "completed" } : s))
      );

      await runPlanSteps(planToResume, stepToResume + 1);
    }
  };

  // User rejected the sensitive action
  const handleRejectAction = () => {
    setConfirmationData((prev) => ({ ...prev, isOpen: false }));
    setJarvisState("IDLE");
    addLog(
      "TASK_ABORTED",
      "User aborted sensitive transmission. Safe state maintained.",
      "alert",
      "ব্যবহারকারী বার্তা পাঠানো বাতিল করেছেন।"
    );
    speakJarvis("Understood, Sir. Action aborted.");
  };

  return (
    <div className="min-h-screen bg-[#04070d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <HeaderNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isServiceActive={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {activeTab === "simulator" && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Arc Reactor HUD, Voice Controls & Execution Steps */}
            <div className="lg:col-span-7 flex flex-col space-y-5">
              {/* Arc Reactor & Voice Status Card */}
              <div className="rounded-2xl bg-[#090e18] border border-slate-800 p-5 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                <ArcReactor
                  state={jarvisState}
                  isListening={isListening}
                  audioLevel={audioLevel}
                  onClick={handleToggleListening}
                />

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      J.A.R.V.I.S. Core Neural Voice Interface
                    </span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>

                  <h2 className="text-lg font-bold text-white tracking-tight mt-1">
                    {jarvisState === "LISTENING"
                      ? "Listening to voice input..."
                      : jarvisState === "UNDERSTANDING"
                      ? "Analyzing bilingual intent with Gemini..."
                      : jarvisState === "WAITING_FOR_CONFIRMATION"
                      ? "Awaiting your explicit confirmation..."
                      : jarvisState === "EXECUTING"
                      ? "Interacting with Android UI elements..."
                      : jarvisState === "VERIFYING"
                      ? "Verifying screen state changes..."
                      : jarvisState === "RECOVERING"
                      ? "Diagnosing action failure & retrying..."
                      : jarvisState === "COMPLETED"
                      ? "Task verified & completed, Sir."
                      : "Ready for vocal or text commands, Sir."}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1 font-mono leading-relaxed">
                    Understands English, বাংলা (Bengali script), and Banglish. Operates through
                    native Android Accessibility Nodes without blind coordinate taps.
                  </p>
                </div>
              </div>

              {/* Interactive Voice & Text Controls */}
              <JarvisControls
                isListening={isListening}
                onToggleListening={handleToggleListening}
                onSubmitCommand={handleExecuteCommand}
                languageMode={languageMode}
                onChangeLanguageMode={setLanguageMode}
                operationMode={operationMode}
                onToggleOperationMode={() =>
                  setOperationMode((prev) => (prev === "online" ? "offline" : "online"))
                }
                speechOutputEnabled={speechOutputEnabled}
                onToggleSpeechOutput={() => setSpeechOutputEnabled(!speechOutputEnabled)}
              />

              {/* Quick Offline Voice Command Bar & Error Simulation Toggle */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline Voice Commands:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleExecuteCommand("Go home")}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      "Go home"
                    </button>
                    <button
                      onClick={() => handleExecuteCommand("Go back")}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      "Go back"
                    </button>
                    <button
                      onClick={() => handleExecuteCommand("Increase volume")}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      "Volume up"
                    </button>
                    <button
                      onClick={() => handleExecuteCommand("Lock screen")}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      "Lock screen"
                    </button>
                    <button
                      onClick={() => handleExecuteCommand("Scroll down")}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 text-[11px] font-mono transition-colors cursor-pointer"
                    >
                      "Scroll down"
                    </button>
                  </div>
                </div>

                {/* Error Recovery Simulation Toggle */}
                <button
                  onClick={() => setSimulateFailureMode(!simulateFailureMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    simulateFailureMode
                      ? "bg-red-950 text-red-300 border border-red-500 shadow-xs"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                  title="Toggle error simulation to test automatic 2-retry recovery diagnostics"
                >
                  <Bug className={`w-3.5 h-3.5 ${simulateFailureMode ? "text-red-400" : "text-slate-400"}`} />
                  <span>Test Error Recovery: {simulateFailureMode ? "ON" : "OFF"}</span>
                </button>
              </div>

              {/* Task Progress Execution Steps */}
              <div className="h-64">
                <TaskProgressTracker
                  state={jarvisState}
                  taskSteps={taskSteps}
                  activeStepIndex={activeStepIndex}
                />
              </div>

              {/* Structured Transparent Audit Logs */}
              <div className="h-64">
                <StructuredLogsView
                  logs={auditLogs}
                  onClearLogs={() => setAuditLogs([])}
                />
              </div>
            </div>

            {/* Right Column: Interactive Android Phone Simulator */}
            <div className="lg:col-span-5 flex flex-col items-center sticky top-20">
              <PhoneSimulator
                currentApp={currentApp}
                onNavigateApp={setCurrentApp}
                searchQuery={searchQuery}
                isSearchActive={isSearchActive}
                isVideoPlaying={isVideoPlaying}
                selectedVideoTitle={selectedVideoTitle}
                whatsappRecipient={whatsappRecipient}
                whatsappDraft={whatsappDraft}
                whatsappMessages={whatsappMessages}
                showAccessibilityOverlay={showAccessibilityOverlay}
                onToggleOverlay={() =>
                  setShowAccessibilityOverlay(!showAccessibilityOverlay)
                }
                pointerCoordinates={pointerCoordinates}
                volumeLevel={volumeLevel}
                showVolumeToast={showVolumeToast}
                isScreenLocked={isScreenLocked}
                onUnlockScreen={() => setIsScreenLocked(false)}
                scrollIndicator={scrollIndicator}
                diagnosticAlert={diagnosticAlert}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Offline Commands Registry */}
        {activeTab === "offline_commands" && (
          <div className="max-w-4xl mx-auto w-full">
            <OfflineCommandsPanel
              commands={offlineCommands}
              onExecuteCommand={(cmd) => {
                setActiveTab("simulator");
                handleExecuteCommand(cmd);
              }}
              onAddNewCommand={handleAddNewOfflineCommand}
              isOfflineMode={operationMode === "offline"}
              onToggleOfflineMode={() =>
                setOperationMode((prev) => (prev === "online" ? "offline" : "online"))
              }
            />
          </div>
        )}

        {/* Tab 3: Android Kotlin Codebase Explorer */}
        {activeTab === "codebase" && <AndroidCodebaseExplorer />}

        {/* Tab 4: Safety & Architecture Specifications */}
        {activeTab === "architecture" && <ArchitectureSpecs />}
      </main>

      {/* Sensitive Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationData.isOpen}
        appName={confirmationData.appName}
        recipient={confirmationData.recipient}
        messageText={confirmationData.messageText}
        actionCategory={confirmationData.actionCategory}
        promptText={confirmationData.promptText}
        promptTextBn={confirmationData.promptTextBn}
        isListening={isListening}
        onConfirm={handleConfirmAction}
        onReject={handleRejectAction}
      />

      {/* Error Recovery Diagnostic Escalation Modal */}
      <ErrorRecoveryModal
        isOpen={errorRecoveryModalData.isOpen}
        failedStepTitle={errorRecoveryModalData.failedStepTitle}
        failedStepTitleBn={errorRecoveryModalData.failedStepTitleBn}
        errorReason={errorRecoveryModalData.errorReason}
        errorReasonBn={errorRecoveryModalData.errorReasonBn}
        diagnosticsLog={errorRecoveryModalData.diagnosticsLog}
        retriesAttempted={errorRecoveryModalData.retriesAttempted}
        maxRetries={errorRecoveryModalData.maxRetries}
        onRetryWithScroll={handleRecoveryScrollRetry}
        onForceRescan={handleRecoveryForceRescan}
        onAbortTask={handleRecoveryAbort}
      />
    </div>
  );
}

