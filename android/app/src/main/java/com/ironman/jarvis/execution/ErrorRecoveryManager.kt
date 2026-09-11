package com.ironman.jarvis.execution

import android.util.Log
import android.view.accessibility.AccessibilityNodeInfo
import com.ironman.jarvis.model.ActionStep
import com.ironman.jarvis.model.TargetElement
import com.ironman.jarvis.service.JarvisAccessibilityService
import kotlinx.coroutines.delay

class ErrorRecoveryManager(
    private val accessibilityService: JarvisAccessibilityService,
    private val onAskUserForInstructions: (step: ActionStep, reason: String, reasonBn: String) -> Unit
) {
    companion object {
        private const val TAG = "ErrorRecovery"
        const val MAX_RETRIES_PER_ACTION = 2
    }

    sealed class DiagnosticResult {
        object Success : DiagnosticResult()
        data class Recoverable(val tactic: RecoveryTactic, val explanation: String) : DiagnosticResult()
        data class Unrecoverable(val reasonEn: String, val reasonBn: String) : DiagnosticResult()
    }

    enum class RecoveryTactic {
        DISMISS_KEYBOARD_AND_RESCAN,
        MICRO_SCROLL_DOWN_TO_REVEAL,
        FUZZY_TEXT_MATCHING,
        WAIT_FOR_TRANSITION
    }

    suspend fun executeWithObservation(step: ActionStep): Boolean {
        var currentAttempt = 0

        while (currentAttempt <= MAX_RETRIES_PER_ACTION) {
            val isAttemptSuccess = attemptAction(step)

            if (isAttemptSuccess) {
                delay(400)
                val verificationPassed = verifyStepOutcome()
                if (verificationPassed) {
                    Log.i(TAG, "Step '${step.title}' successfully executed and verified.")
                    return true
                }
            }

            currentAttempt++

            if (currentAttempt <= MAX_RETRIES_PER_ACTION) {
                val diagnostic = diagnoseFailure(currentAttempt)
                Log.w(TAG, "Action failed. Attempting recovery #$currentAttempt: $diagnostic")

                when (diagnostic) {
                    is DiagnosticResult.Recoverable -> {
                        applyRecoveryTactic(diagnostic.tactic)
                    }
                    is DiagnosticResult.Unrecoverable -> {
                        break
                    }
                    DiagnosticResult.Success -> return true
                }
            }
        }

        Log.e(TAG, "Recovery exhausted after $MAX_RETRIES_PER_ACTION retries for: ${step.title}")
        val reasonEn = "Target element '${step.targetElement?.text ?: "button"}' was not found on screen."
        val reasonBn = "স্ক্রিনে কাঙ্ক্ষিত উপাদানটি খুঁজে পাওয়া যায়নি।"

        onAskUserForInstructions(step, reasonEn, reasonBn)
        return false
    }

    private fun attemptAction(step: ActionStep): Boolean {
        val rootNode = accessibilityService.rootInActiveWindow ?: return false
        val target = step.targetElement ?: return true

        val node = findMatchingNode(rootNode, target)
        return if (node != null && node.isClickable) {
            node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        } else false
    }

    private fun verifyStepOutcome(): Boolean {
        return accessibilityService.rootInActiveWindow != null
    }

    private fun diagnoseFailure(attempt: Int): DiagnosticResult {
        if (attempt == 1) {
            return DiagnosticResult.Recoverable(
                RecoveryTactic.DISMISS_KEYBOARD_AND_RESCAN,
                "Element might be hidden behind soft keyboard"
            )
        }

        if (attempt == 2) {
            return DiagnosticResult.Recoverable(
                RecoveryTactic.MICRO_SCROLL_DOWN_TO_REVEAL,
                "Element might be below the fold; scrolling to reveal"
            )
        }

        return DiagnosticResult.Unrecoverable(
            "Target element not rendered after multiple passes",
            "বারবার চেষ্টা করার পরও স্ক্রিনে উপাদানটি পাওয়া যায়নি"
        )
    }

    private suspend fun applyRecoveryTactic(tactic: RecoveryTactic) {
        when (tactic) {
            RecoveryTactic.DISMISS_KEYBOARD_AND_RESCAN -> {
                accessibilityService.performGlobalAction(android.accessibilityservice.AccessibilityService.GLOBAL_ACTION_BACK)
                delay(300)
            }
            RecoveryTactic.MICRO_SCROLL_DOWN_TO_REVEAL -> {
                accessibilityService.performScroll(forward = true)
                delay(500)
            }
            RecoveryTactic.FUZZY_TEXT_MATCHING -> {
                delay(200)
            }
            RecoveryTactic.WAIT_FOR_TRANSITION -> {
                delay(600)
            }
        }
    }

    private fun findMatchingNode(root: AccessibilityNodeInfo, target: TargetElement): AccessibilityNodeInfo? {
        target.resourceId?.let { id ->
            val nodes = root.findAccessibilityNodeInfosByViewId(id)
            if (nodes.isNotEmpty()) return nodes[0]
        }
        target.text?.let { txt ->
            val nodes = root.findAccessibilityNodeInfosByText(txt)
            if (nodes.isNotEmpty()) return nodes[0]
        }
        return null
    }
}
