# JARVIS Android Assistant - Autonomous Mobile AI

JARVIS is an autonomous Android AI assistant built in Kotlin and Jetpack Compose.
It operates via Android AccessibilityService, MediaProjection, and Speech Recognition
to execute complex multi-step user workflows (such as YouTube search & play, WhatsApp drafting)
in Bengali (বাংলা), English, and Banglish.

## How to Build the Debug APK on Android Phone

### Method 1: 1-Click GitHub Actions (Cloud Build - Recommended)
1. Push or fork this repository into your personal GitHub account.
2. Go to **Actions** tab in GitHub.
3. The `Build JARVIS Android APK` workflow runs automatically on GitHub's Ubuntu servers.
4. When finished (approx 2 minutes), download the `jarvis-assistant-debug-apk` artifact.
5. Tap and install `app-debug.apk` directly on your phone!

### Method 2: Termux on Android Phone
1. Install Termux from F-Droid.
2. Run:
   ```bash
   pkg update && pkg install openjdk-17 gradle git
   cd JarvisAssistant
   gradle assembleDebug
   ```
3. Your compiled APK will be located at:
   `app/build/outputs/apk/debug/app-debug.apk`

### Method 3: Android Studio (PC/Mac/Linux)
1. Open this folder in Android Studio (Hedgehog or newer).
2. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Transfer `app-debug.apk` to your phone via USB or Google Drive.
