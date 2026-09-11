import express from "express";
import path from "path";
import fs from "fs";
import JSZip from "jszip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// Extensible Offline Command Registry Model
interface RegisteredOfflineCommand {
  id: string;
  name: string;
  triggers: string[];
  action: string;
  category: "navigation" | "device_control" | "media" | "custom";
  parameters?: Record<string, any>;
  feedback_en: string;
  feedback_bn: string;
  isCustom?: boolean;
}

// Initial built-in offline command definitions
const offlineCommandsRegistry: RegisteredOfflineCommand[] = [
  {
    id: "cmd_home",
    name: "Go Home",
    triggers: [
      "go home", "home", "হোমে যাও", "হোম", "home e jao", "হোমে চল", "take me home"
    ],
    action: "HOME",
    category: "navigation",
    parameters: { target: "HOME" },
    feedback_en: "Returning to home screen, sir.",
    feedback_bn: "হোম স্ক্রিনে ফিরে যাচ্ছি।",
  },
  {
    id: "cmd_back",
    name: "Go Back",
    triggers: [
      "go back", "back", "পিছনে যাও", "ফিরে যাও", "pichone jao", "পেছনে যাও", "previous screen"
    ],
    action: "BACK",
    category: "navigation",
    parameters: { target: "BACK" },
    feedback_en: "Going back, sir.",
    feedback_bn: "পিছনে যাচ্ছি।",
  },
  {
    id: "cmd_scroll_up",
    name: "Scroll Up",
    triggers: [
      "scroll up", "উপরে যাও", "upore jao", "উপরে স্ক্রোল করো", "move up", "page up"
    ],
    action: "SCROLL_UP",
    category: "navigation",
    parameters: { direction: "UP" },
    feedback_en: "Scrolling upwards, sir.",
    feedback_bn: "উপরে স্ক্রোল করছি।",
  },
  {
    id: "cmd_scroll_down",
    name: "Scroll Down",
    triggers: [
      "scroll down", "নিচে যাও", "niche jao", "নিচে স্ক্রোল করো", "move down", "page down"
    ],
    action: "SCROLL_DOWN",
    category: "navigation",
    parameters: { direction: "DOWN" },
    feedback_en: "Scrolling downwards, sir.",
    feedback_bn: "নিচে স্ক্রোল করছি।",
  },
  {
    id: "cmd_volume_up",
    name: "Increase Volume",
    triggers: [
      "increase volume", "volume up", "ভলিউম বাড়াও", "আওয়াজ বাড়াও", "sound up", "volume barao", "awaj barao", "louder"
    ],
    action: "VOLUME_UP",
    category: "device_control",
    parameters: { delta: 10 },
    feedback_en: "Increasing media volume, sir.",
    feedback_bn: "মিডিয়া ভলিউম বৃদ্ধি করছি।",
  },
  {
    id: "cmd_volume_down",
    name: "Decrease Volume",
    triggers: [
      "decrease volume", "volume down", "ভলিউম কমাও", "আওয়াজ কমাও", "sound down", "volume komao", "awaj komao", "quieter", "lower volume"
    ],
    action: "VOLUME_DOWN",
    category: "device_control",
    parameters: { delta: -10 },
    feedback_en: "Decreasing media volume, sir.",
    feedback_bn: "মিডিয়া ভলিউম কমাচ্ছি।",
  },
  {
    id: "cmd_lock_screen",
    name: "Lock Screen",
    triggers: [
      "lock screen", "lock phone", "স্ক্রিন লক করো", "ফোন লক করো", "screen lock", "lock", "phone lock koro", "sleep"
    ],
    action: "LOCK_SCREEN",
    category: "device_control",
    parameters: { state: "LOCKED" },
    feedback_en: "Locking device screen, sir.",
    feedback_bn: "স্ক্রিন লক করা হচ্ছে।",
  },
];

// Fallback deterministic bilingual parser for Bengali & English
function fallbackUnderstand(command: string) {
  const lower = command.toLowerCase().trim().replace(/[?!.,]/g, "");

  // 1. Check extensible offline command registry first
  for (const cmd of offlineCommandsRegistry) {
    const isMatched = cmd.triggers.some(trigger => {
      const t = trigger.toLowerCase().trim();
      return lower === t || lower.includes(t);
    });

    if (isMatched) {
      return {
        intent: "offline_command",
        application: "system",
        appName: "Android System",
        action: cmd.action,
        parameters: { ...cmd.parameters, commandId: cmd.id, commandName: cmd.name },
        requires_confirmation: false,
        voice_response: cmd.feedback_en,
        voice_response_bn: cmd.feedback_bn,
        plan_summary: [`Execute offline action: ${cmd.name}`],
      };
    }
  }

  // YouTube search & play: e.g. "open youtube and play alexandra daddario new movies" or "youtube kholo and..."
  if (
    lower.includes("youtube") ||
    lower.includes("ইউটিউব")
  ) {
    let query = "Alexandra Daddario new movies";
    const ytMatch = command.match(
      /(?:play|search for|search|search kore play koro|প্লে করো|সার্চ করো)\s*(?:the video with the title|for)?\s*(.+)/i
    );
    if (ytMatch && ytMatch[1]) {
      query = ytMatch[1].replace(/[-_.,!?]/g, " ").trim();
      // clean trailing bengali verbs like 'kholo', 'dekhao', 'play koro'
      query = query.replace(/\b(play koro|dekhao|kholo|search koro|চালিয়ে দাও|খুলে দাও)\b/gi, "").trim();
    }

    const isPlay = lower.includes("play") || lower.includes("চালিয়ে") || lower.includes("bajao");

    return {
      intent: isPlay ? "search_and_play_video" : "open_app_search",
      application: "youtube",
      appName: "YouTube",
      parameters: { query: query || "trending movies" },
      requires_confirmation: false,
      voice_response: `Opening YouTube and locating "${query || "trending"}" for you, sir.`,
      voice_response_bn: `ইউটিউব খুলছি এবং "${query}" সন্ধান করছি।`,
      plan_summary: [
        "Launch YouTube application",
        "Observe screen & locate Search button",
        `Enter search query: "${query}"`,
        "Submit search query",
        "Analyze video result cards",
        "Select and play most relevant video",
        "Verify video playback stream started",
      ],
    };
  }

  // WhatsApp messaging: e.g. "send rahul a whatsapp message saying I'll be home at 8" or "mom ke message pathao..."
  if (
    lower.includes("whatsapp") ||
    lower.includes("message") ||
    lower.includes("মেসেজ") ||
    lower.includes("পাঠাও") ||
    lower.includes("পাঠিয়ে দাও")
  ) {
    let recipient = "Rahul";
    if (lower.includes("mom") || lower.includes("মা") || lower.includes("আম্মু")) recipient = "Mom";
    else if (lower.includes("rahul") || lower.includes("রাহুল")) recipient = "Rahul";
    else if (lower.includes("boss") || lower.includes("বস")) recipient = "Boss";

    let message = "I'll reach home at 8 PM";
    const msgMatch = command.match(/(?:saying|that|মেসেজ পাঠাও যে|মেসেজ পাঠাও|বলে দাও)\s*(.+)/i);
    if (msgMatch && msgMatch[1]) {
      message = msgMatch[1].replace(/^(saying|that|যে)\s*/i, "").trim();
    }

    return {
      intent: "send_message",
      application: "whatsapp",
      appName: "WhatsApp",
      parameters: { recipient, message },
      requires_confirmation: true,
      confirmation_prompt: `I have prepared this message for ${recipient}: "${message}". Shall I send it?`,
      confirmation_prompt_bn: `${recipient}-এর জন্য মেসেজ প্রস্তুত: "${message}"। পাঠিয়ে দেব কি?`,
      voice_response: `I've prepared a WhatsApp message for ${recipient}. Please confirm if you'd like me to transmit it.`,
      voice_response_bn: `${recipient}-এর জন্য বার্তা প্রস্তুত। পাঠানোর অনুমতি দিচ্ছেন কি?`,
      plan_summary: [
        "Open WhatsApp",
        `Locate contact: ${recipient}`,
        `Draft message text: "${message}"`,
        "Request explicit user confirmation before transmission",
        "Send message upon user approval",
        "Verify message delivered checkmark",
      ],
    };
  }

  // Google Maps
  if (lower.includes("maps") || lower.includes("ম্যাপ") || lower.includes("directions") || lower.includes("coffee")) {
    return {
      intent: "search_places",
      application: "maps",
      appName: "Google Maps",
      parameters: { query: "nearest coffee shop" },
      requires_confirmation: false,
      voice_response: "Opening Google Maps and finding nearby locations, sir.",
      voice_response_bn: "গুগল ম্যাপস খুলছি এবং নিকটবর্তী স্থান অনুসন্ধান করছি।",
      plan_summary: [
        "Launch Google Maps",
        "Tap search bar",
        "Search for nearest coffee shop",
        "Display navigation results",
      ],
    };
  }

  // Settings
  if (lower.includes("settings") || lower.includes("সেটিংস")) {
    return {
      intent: "open_app",
      application: "settings",
      appName: "Android Settings",
      parameters: {},
      requires_confirmation: false,
      voice_response: "Opening system settings, sir.",
      voice_response_bn: "সিস্টেম সেটিংস খোলা হচ্ছে।",
      plan_summary: ["Launch Android System Settings"],
    };
  }

  // Default generic assistant response
  return {
    intent: "open_app_search",
    application: "youtube",
    appName: "YouTube",
    parameters: { query: command },
    requires_confirmation: false,
    voice_response: `Understood, sir. Processing your request for "${command}".`,
    voice_response_bn: `বুঝতে পেরেছি। "${command}" নিয়ে কাজ শুরু করছি।`,
    plan_summary: ["Analyze command", "Launch appropriate application", "Execute requested actions"],
  };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    service: "JARVIS Android AI Assistant Core",
    timestamp: Date.now(),
  });
});

// Endpoint: Understand Natural Language (Bengali, English, Banglish)
app.post("/api/jarvis/understand", async (req, res) => {
  try {
    const { command, currentApp, screenContext } = req.body;
    if (!command || typeof command !== "string") {
      return res.status(400).json({ error: "Missing or invalid command parameter" });
    }

    const client = getGeminiClient();

    if (!client) {
      // Fallback deterministic understanding when offline or no API key
      const parsed = fallbackUnderstand(command);
      return res.json({
        success: true,
        source: "offline_rules_engine",
        data: parsed,
      });
    }

    const systemPrompt = `You are JARVIS, Tony Stark's sophisticated personal voice assistant ported to Android.
You specialize in bilingual Bengali (বাংলা), English, and Banglish (Bengali written in English letters or mixed natural speech).
Your job is to parse the user's spoken command into a safe, structured Android automation task.

Rules:
1. Support English, pure Bengali (বাংলা লিপি), natural Bengali speech, and mixed Banglish (e.g. "YouTube kholo and Alexandra Daddario new movies search kore play koro", "Mom ke message pathao ami 8 tai ashbo", "Pichone jao").
2. DO NOT translate Bengali word-for-word. Understand the actual user intent.
3. Categorize safety:
   - Low-risk (requires_confirmation = false): open apps, search YouTube, scroll, read info, play video, navigation.
   - Sensitive (requires_confirmation = true): sending messages, making phone calls, deleting files, public posting, financial transactions, altering critical system settings.
4. If sensitive, generate an explicit confirmation prompt in both English and Bengali.
5. Provide a crisp, charismatic JARVIS voice response (addressing user as "sir").

Respond strictly in valid JSON with this exact schema:
{
  "intent": "search_and_play_video" | "send_message" | "make_call" | "open_app" | "navigate" | "system_control" | "search_places" | "general_query",
  "application": "youtube" | "whatsapp" | "maps" | "chrome" | "phone" | "settings" | "messages" | "system",
  "appName": string,
  "parameters": {
    "query": string,
    "recipient": string,
    "message": string,
    "direction": "UP" | "DOWN",
    "action": string
  },
  "requires_confirmation": boolean,
  "confirmation_prompt": string,
  "confirmation_prompt_bn": string,
  "voice_response": string,
  "voice_response_bn": string,
  "plan_summary": string[]
}`;

    const userPrompt = `User voice command: "${command}"
Current active application: ${currentApp || "com.android.launcher (Home)"}
Current screen context: ${JSON.stringify(screenContext || {})}

Analyze intent, extract parameters, assess safety, and generate the structured response.`;

    const aiResponse = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = aiResponse.text || "{}";
    try {
      const parsedData = JSON.parse(text.trim());
      return res.json({
        success: true,
        source: "gemini_3.8_flash",
        data: parsedData,
      });
    } catch {
      const fallback = fallbackUnderstand(command);
      return res.json({
        success: true,
        source: "fallback_recovery",
        data: fallback,
      });
    }
  } catch (error: any) {
    console.error("Gemini understand error:", error);
    const fallback = fallbackUnderstand(req.body.command || "");
    return res.json({
      success: true,
      source: "fallback_after_error",
      error: error?.message,
      data: fallback,
    });
  }
});

// Endpoint: Generate Step-by-Step Task Plan
app.post("/api/jarvis/plan", async (req, res) => {
  try {
    const { intentData } = req.body;
    if (!intentData) {
      return res.status(400).json({ error: "Missing intentData parameter" });
    }

    const client = getGeminiClient();

    if (!client) {
      // Offline fallback plans
      const steps = generateDeterministicSteps(intentData);
      return res.json({
        success: true,
        source: "offline_planner",
        steps,
      });
    }

    const systemPrompt = `You are the Task Planning Engine of the JARVIS Android Automation system.
You create deterministic, verifiable atomic Android UI steps for an AccessibilityService execution engine.
Each step must follow: LISTEN -> UNDERSTAND -> PLAN -> OBSERVE -> ACT -> VERIFY.

Output JSON with an array of steps:
{
  "steps": [
    {
      "id": string,
      "title": string,
      "title_bn": string,
      "actionType": "OPEN_APP" | "FIND_AND_CLICK" | "TYPE_TEXT" | "SUBMIT" | "WAIT_AND_OBSERVE" | "VERIFY_ELEMENT" | "REQUEST_CONFIRMATION" | "SCROLL" | "SYSTEM_NAV",
      "targetElement": {
        "text": string,
        "resourceId": string,
        "contentDescription": string,
        "className": string
      },
      "inputValue": string,
      "verificationCriteria": string,
      "maxRetries": number
    }
  ]
}`;

    const aiResponse = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Generate atomic execution steps for this intent: ${JSON.stringify(intentData)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(aiResponse.text || "{}");
    return res.json({
      success: true,
      source: "gemini_3.8_flash",
      steps: parsed.steps || generateDeterministicSteps(intentData),
    });
  } catch (error: any) {
    console.error("Gemini plan error:", error);
    const steps = generateDeterministicSteps(req.body.intentData || {});
    return res.json({
      success: true,
      source: "fallback_steps",
      steps,
    });
  }
});

function generateDeterministicSteps(intentData: any) {
  const app = intentData.application || "youtube";
  const intent = intentData.intent || "search_and_play_video";
  const query = intentData.parameters?.query || "Alexandra Daddario new movies";
  const recipient = intentData.parameters?.recipient || "Rahul";
  const message = intentData.parameters?.message || "I'll call you later";

  if (intent === "search_and_play_video" || app === "youtube") {
    return [
      {
        id: "step_1",
        title: "Launch YouTube Application",
        title_bn: "ইউটিউব অ্যাপ চালু করা হচ্ছে",
        actionType: "OPEN_APP",
        targetElement: { resourceId: "com.google.android.youtube" },
        verificationCriteria: "YouTube window active in foreground",
        maxRetries: 2,
      },
      {
        id: "step_2",
        title: "Locate Search Bar / Icon",
        title_bn: "সার্চ আইকন সনাক্ত করা হচ্ছে",
        actionType: "FIND_AND_CLICK",
        targetElement: {
          resourceId: "com.google.android.youtube:id/menu_item_search",
          contentDescription: "Search YouTube",
          text: "Search",
        },
        verificationCriteria: "Search input box focused with keyboard visible",
        maxRetries: 2,
      },
      {
        id: "step_3",
        title: `Enter Query: "${query}"`,
        title_bn: `অনুসন্ধান টেক্সট টাইপ: "${query}"`,
        actionType: "TYPE_TEXT",
        inputValue: query,
        targetElement: {
          resourceId: "com.google.android.youtube:id/search_edit_text",
        },
        verificationCriteria: `Input contains text "${query}"`,
        maxRetries: 1,
      },
      {
        id: "step_4",
        title: "Submit Search & Observe Results",
        title_bn: "সার্চ ফলাফল প্রদর্শন ও পর্যবেক্ষণ",
        actionType: "SUBMIT",
        targetElement: {
          resourceId: "com.google.android.youtube:id/search_edit_text",
        },
        verificationCriteria: "Video feed result items rendered",
        maxRetries: 2,
      },
      {
        id: "step_5",
        title: "Identify & Select Best Matching Video",
        title_bn: "সর্বাধিক প্রাসঙ্গিক ভিডিও নির্বাচন",
        actionType: "FIND_AND_CLICK",
        targetElement: {
          text: query,
          className: "android.view.ViewGroup",
        },
        verificationCriteria: "Video player view active",
        maxRetries: 2,
      },
      {
        id: "step_6",
        title: "Verify Playback & Report Completion",
        title_bn: "প্লেব্যাক যাচাই এবং সম্পন্ন ঘোষণা",
        actionType: "VERIFY_ELEMENT",
        targetElement: {
          resourceId: "com.google.android.youtube:id/player_view",
        },
        verificationCriteria: "Playback state is playing, elapsed > 0s",
        maxRetries: 1,
      },
    ];
  }

  if (intent === "send_message" || app === "whatsapp") {
    return [
      {
        id: "step_1",
        title: "Launch WhatsApp Application",
        title_bn: "হোয়াটসঅ্যাপ অ্যাপ চালু করা হচ্ছে",
        actionType: "OPEN_APP",
        targetElement: { resourceId: "com.whatsapp" },
        verificationCriteria: "WhatsApp main window visible",
        maxRetries: 2,
      },
      {
        id: "step_2",
        title: `Select Contact: "${recipient}"`,
        title_bn: `যোগাযোগকারী নির্বাচন: "${recipient}"`,
        actionType: "FIND_AND_CLICK",
        targetElement: {
          text: recipient,
          resourceId: "com.whatsapp:id/conversations_row_contact_name",
        },
        verificationCriteria: "Chat conversation window opened",
        maxRetries: 2,
      },
      {
        id: "step_3",
        title: `Draft Message: "${message}"`,
        title_bn: `বার্তা খসড়া প্রস্তুত: "${message}"`,
        actionType: "TYPE_TEXT",
        inputValue: message,
        targetElement: {
          resourceId: "com.whatsapp:id/entry",
        },
        verificationCriteria: `Chat entry contains "${message}"`,
        maxRetries: 1,
      },
      {
        id: "step_4",
        title: "Request Explicit User Confirmation",
        title_bn: "ব্যবহারকারীর স্পষ্ট নিশ্চিতকরণ অনুরোধ",
        actionType: "REQUEST_CONFIRMATION",
        targetElement: {
          text: `Send message to ${recipient}?`,
        },
        verificationCriteria: "User confirmed verbally or via touch",
        maxRetries: 1,
      },
      {
        id: "step_5",
        title: "Click Send Button",
        title_bn: "সেন্ড বোতামে ক্লিক করা হচ্ছে",
        actionType: "FIND_AND_CLICK",
        targetElement: {
          resourceId: "com.whatsapp:id/send",
          contentDescription: "Send",
        },
        verificationCriteria: "Message bubble rendered with sent checkmark",
        maxRetries: 1,
      },
      {
        id: "step_6",
        title: "Verify Delivery & Notify User",
        title_bn: "ডেলিভারি যাচাই এবং সম্পন্ন ঘোষণা",
        actionType: "VERIFY_ELEMENT",
        targetElement: {
          text: message,
        },
        verificationCriteria: "Message displayed in thread",
        maxRetries: 1,
      },
    ];
  }

  // System navigation & device control fallback
  const offlineAction = intentData.action || "BACK";
  let stepTitle = "Execute System Action";
  let stepTitleBn = "সিস্টেম নির্দেশ কার্যকর করা হচ্ছে";
  let criteria = "System state updated";

  if (offlineAction === "HOME") {
    stepTitle = "Navigate to Android Home Screen";
    stepTitleBn = "হোম স্ক্রিনে প্রত্যাবর্তন";
    criteria = "Launcher active in foreground";
  } else if (offlineAction === "BACK") {
    stepTitle = "Execute System Back Action";
    stepTitleBn = "পূর্ববর্তী স্ক্রিনে ফিরে যাওয়া";
    criteria = "Previous window or activity focused";
  } else if (offlineAction === "SCROLL_UP") {
    stepTitle = "Scroll Viewport Upwards";
    stepTitleBn = "ভিউ উপরে স্ক্রোল করা";
    criteria = "Accessibility scroll event dispatched";
  } else if (offlineAction === "SCROLL_DOWN") {
    stepTitle = "Scroll Viewport Downwards";
    stepTitleBn = "ভিউ নিচে স্ক্রোল করা";
    criteria = "Accessibility scroll event dispatched";
  } else if (offlineAction === "VOLUME_UP") {
    stepTitle = "Increase Audio Stream Volume (+10%)";
    stepTitleBn = "মিডিয়া ভলিউম বৃদ্ধি করা হচ্ছে";
    criteria = "AudioManager STREAM_MUSIC volume incremented";
  } else if (offlineAction === "VOLUME_DOWN") {
    stepTitle = "Decrease Audio Stream Volume (-10%)";
    stepTitleBn = "মিডিয়া ভলিউম কমানো হচ্ছে";
    criteria = "AudioManager STREAM_MUSIC volume decremented";
  } else if (offlineAction === "LOCK_SCREEN") {
    stepTitle = "Lock Device Screen (GLOBAL_ACTION_LOCK_SCREEN)";
    stepTitleBn = "ডিভাইস স্ক্রিন লক করা হচ্ছে";
    criteria = "KeyguardManager screen locked";
  }

  return [
    {
      id: "step_1",
      title: stepTitle,
      title_bn: stepTitleBn,
      actionType: "SYSTEM_NAV",
      targetElement: { text: offlineAction },
      verificationCriteria: criteria,
      maxRetries: 1,
    },
  ];
}

// Endpoint: List All Registered Offline Commands
app.get("/api/jarvis/offline-commands", (_req, res) => {
  res.json({
    success: true,
    count: offlineCommandsRegistry.length,
    commands: offlineCommandsRegistry,
  });
});

// Endpoint: Register New Offline Command (Extensible Architecture)
app.post("/api/jarvis/offline-commands", (req, res) => {
  const { name, triggers, action, category, feedback_en, feedback_bn } = req.body;
  if (!name || !triggers || !Array.isArray(triggers) || triggers.length === 0 || !action) {
    return res.status(400).json({
      error: "Missing required fields: name, triggers (non-empty array), action",
    });
  }

  const newCmd: RegisteredOfflineCommand = {
    id: `cmd_custom_${Date.now()}`,
    name,
    triggers: triggers.map((t: string) => t.trim().toLowerCase()),
    action,
    category: category || "custom",
    feedback_en: feedback_en || `Executing ${name}, sir.`,
    feedback_bn: feedback_bn || `${name} কার্যকর করা হচ্ছে।`,
    isCustom: true,
  };

  offlineCommandsRegistry.push(newCmd);

  res.json({
    success: true,
    message: "New offline command registered successfully",
    command: newCmd,
  });
});

// Endpoint: Evaluate Voice / Natural Language Confirmation (Bengali + English)
app.post("/api/jarvis/confirmation-eval", (req, res) => {
  const { spokenText } = req.body;
  if (!spokenText || typeof spokenText !== "string") {
    return res.status(400).json({ error: "Missing spokenText parameter" });
  }

  const clean = spokenText.toLowerCase().trim().replace(/[?!.,]/g, "");

  // Affirmative Bengali & English tokens: 'Yes', 'হ্যাঁ', 'Send it', 'করো', 'পাঠাও', 'Proceed', 'Do it', 'Sure', etc.
  const affirmative = [
    "yes", "yeah", "yep", "sure", "proceed", "send", "send it", "confirm", "do it", "ok", "okay",
    "go ahead", "affirmative", "absolutely", "please send", "send now",
    "হ্যাঁ", "হ্যাঁ করো", "করো", "ঠিক আছে", "পাঠাও", "পাঠিয়ে দাও", "চলবে", "নিশ্চিত", "অবশ্যই",
    "করুন", "পাঠিয়ে দিন", "পাঠান", "ha", "haa", "koro", "pathao", "pathiye dao", "thik ache", "nishchit"
  ];

  // Negative Bengali & English tokens: 'No', 'না', 'Don't send', 'Cancel', 'Abort', 'বাতিল', 'থামো', etc.
  const negative = [
    "no", "nope", "cancel", "stop", "don't", "don't do it", "don't send", "abort", "wait", "never mind",
    "না", "করবে না", "বাতিল", "বাতিল করো", "থাক", "থামো", "পাঠাবে না", "পাঠিও না",
    "na", "korbe na", "batil", "thamo", "pathio na"
  ];

  const isAffirmed = affirmative.some(token => clean === token || clean.includes(token));
  const isNegated = negative.some(token => clean === token || clean.includes(token));

  if (isAffirmed && !isNegated) {
    return res.json({ confirmed: true, decision: "CONFIRMED", matchedToken: clean });
  } else if (isNegated) {
    return res.json({ confirmed: false, decision: "REJECTED", matchedToken: clean });
  }

  return res.json({ confirmed: false, decision: "AMBIGUOUS", matchedToken: clean });
});

// Helper to recursively add files to JSZip
function addDirectoryToZip(zip: JSZip, localDir: string, zipDir: string) {
  if (!fs.existsSync(localDir)) return;
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullLocalPath = path.join(localDir, entry.name);
    const zipPath = zipDir ? `${zipDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      addDirectoryToZip(zip, fullLocalPath, zipPath);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullLocalPath);
      zip.file(zipPath, content);
    }
  }
}

// Endpoint to download the entire production Android Kotlin Project as a ZIP
app.get("/api/jarvis/download-project-zip", async (_req, res) => {
  try {
    const androidDir = path.join(process.cwd(), "android");
    if (!fs.existsSync(androidDir)) {
      return res.status(404).json({ error: "Android directory not found" });
    }

    const zip = new JSZip();
    addDirectoryToZip(zip, androidDir, "JarvisAssistant");

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="jarvis-android-assistant-project.zip"');
    res.setHeader("Content-Length", zipBuffer.length);
    res.send(zipBuffer);
  } catch (error: any) {
    console.error("Error creating project zip:", error);
    res.status(500).json({ error: "Failed to generate project zip", details: error.message });
  }
});

// Setup Vite middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Android Assistant Core Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
