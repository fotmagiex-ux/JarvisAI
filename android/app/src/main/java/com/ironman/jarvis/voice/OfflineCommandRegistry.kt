package com.ironman.jarvis.voice

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.media.AudioManager
import android.util.Log
import com.ironman.jarvis.service.JarvisAccessibilityService

data class OfflineCommandDefinition(
    val id: String,
    val name: String,
    val triggers: List<String>,
    val actionCategory: ActionCategory,
    val feedbackEn: String,
    val feedbackBn: String,
    val handler: (service: JarvisAccessibilityService, context: Context) -> Boolean
)

enum class ActionCategory {
    SYSTEM_NAVIGATION,
    DEVICE_CONTROL,
    MEDIA,
    CUSTOM
}

object OfflineCommandRegistry {
    private const val TAG = "OfflineRegistry"
    private val registeredCommands = mutableListOf<OfflineCommandDefinition>()

    init {
        registerCoreCommands()
    }

    private fun registerCoreCommands() {
        register(
            OfflineCommandDefinition(
                id = "cmd_home",
                name = "Go Home",
                triggers = listOf("go home", "home", "হোমে যাও", "হোম", "home e jao", "take me home"),
                actionCategory = ActionCategory.SYSTEM_NAVIGATION,
                feedbackEn = "Returning to home screen, sir.",
                feedbackBn = "হোম স্ক্রিনে ফিরে যাচ্ছি।",
                handler = { service, _ ->
                    service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)
                }
            )
        )

        register(
            OfflineCommandDefinition(
                id = "cmd_back",
                name = "Go Back",
                triggers = listOf("go back", "back", "পিছনে যাও", "ফিরে যাও", "pichone jao", "previous screen"),
                actionCategory = ActionCategory.SYSTEM_NAVIGATION,
                feedbackEn = "Going back, sir.",
                feedbackBn = "পিছনে যাচ্ছি।",
                handler = { service, _ ->
                    service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK)
                }
            )
        )

        register(
            OfflineCommandDefinition(
                id = "cmd_scroll_down",
                name = "Scroll Down",
                triggers = listOf("scroll down", "নিচে যাও", "niche jao", "নিচে স্ক্রোল করো", "move down"),
                actionCategory = ActionCategory.SYSTEM_NAVIGATION,
                feedbackEn = "Scrolling downwards, sir.",
                feedbackBn = "নিচে স্ক্রোল করছি।",
                handler = { service, _ ->
                    service.performScroll(forward = true)
                }
            )
        )

        register(
            OfflineCommandDefinition(
                id = "cmd_scroll_up",
                name = "Scroll Up",
                triggers = listOf("scroll up", "উপরে যাও", "upore jao", "উপরে স্ক্রোল করো", "move up"),
                actionCategory = ActionCategory.SYSTEM_NAVIGATION,
                feedbackEn = "Scrolling upwards, sir.",
                feedbackBn = "উপরে স্ক্রোল করছি।",
                handler = { service, _ ->
                    service.performScroll(forward = false)
                }
            )
        )

        register(
            OfflineCommandDefinition(
                id = "cmd_volume_up",
                name = "Increase Volume",
                triggers = listOf("increase volume", "volume up", "ভলিউম বাড়াও", "আওয়াজ বাড়াও", "sound up", "volume barao"),
                actionCategory = ActionCategory.DEVICE_CONTROL,
                feedbackEn = "Increasing volume, sir.",
                feedbackBn = "ভলিউম বাড়িয়ে দিচ্ছি।",
                handler = { _, context ->
                    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
                    audioManager.adjustStreamVolume(
                        AudioManager.STREAM_MUSIC,
                        AudioManager.ADJUST_RAISE,
                        AudioManager.FLAG_SHOW_UI
                    )
                    true
                }
            )
        )

        register(
            OfflineCommandDefinition(
                id = "cmd_volume_down",
                name = "Decrease Volume",
                triggers = listOf("decrease volume", "volume down", "ভলিউম কমাও", "আওয়াজ কমাও", "sound down", "volume komao"),
                actionCategory = ActionCategory.DEVICE_CONTROL,
                feedbackEn = "Decreasing volume, sir.",
                feedbackBn = "ভলিউম কমিয়ে দিচ্ছি।",
                handler = { _, context ->
                    val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
                    audioManager.adjustStreamVolume(
                        AudioManager.STREAM_MUSIC,
                        AudioManager.ADJUST_LOWER,
                        AudioManager.FLAG_SHOW_UI
                    )
                    true
                }
            )
        )

        register(
            OfflineCommandDefinition(
                id = "cmd_lock_screen",
                name = "Lock Screen",
                triggers = listOf("lock screen", "lock phone", "স্ক্রিন লক করো", "ফোন লক করো", "lock"),
                actionCategory = ActionCategory.DEVICE_CONTROL,
                feedbackEn = "Locking device screen, sir.",
                feedbackBn = "স্ক্রিন লক করা হচ্ছে।",
                handler = { service, _ ->
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                        service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_LOCK_SCREEN)
                    } else {
                        false
                    }
                }
            )
        )
    }

    fun register(command: OfflineCommandDefinition) {
        registeredCommands.add(command)
        Log.d(TAG, "Registered new offline command: ${command.name}")
    }

    fun matchCommand(spokenText: String): OfflineCommandDefinition? {
        val clean = spokenText.lowercase().trim().replace(Regex("[?!.,]"), "")
        return registeredCommands.firstOrNull { cmd ->
            cmd.triggers.any { trigger ->
                val t = trigger.lowercase().trim()
                clean == t || clean.contains(t)
            }
        }
    }

    fun getAllCommands(): List<OfflineCommandDefinition> = registeredCommands.toList()
}
