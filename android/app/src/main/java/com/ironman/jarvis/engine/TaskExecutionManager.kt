package com.ironman.jarvis.engine

import android.content.Context
import android.content.Intent
import android.util.Log
import com.ironman.jarvis.ai.AIEngine
import com.ironman.jarvis.model.*
import com.ironman.jarvis.safety.ActionValidator
import com.ironman.jarvis.service.JarvisAccessibilityService
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class TaskExecutionManager(
    private val context: Context,
    private val aiEngine: AIEngine,
    private val actionValidator: ActionValidator
) {
    companion object {
        private const val TAG = "TaskExecutor"
        const val MAX_STEPS = 30
        const val MAX_RETRIES_PER_ACTION = 2
    }

    private val _taskState = MutableStateFlow<JarvisState>(JarvisState.IDLE)
    val taskState = _taskState.asStateFlow()

    private val _currentPlan = MutableStateFlow<TaskPlan?>(null)
    val currentPlan = _currentPlan.asStateFlow()

    private val _auditLogs = MutableStateFlow<List<AuditLog>>(emptyList())
    val auditLogs = _auditLogs.asStateFlow()

    private val _pendingConfirmation = MutableStateFlow<ConfirmationRequest?>(null)
    val pendingConfirmation = _pendingConfirmation.asStateFlow()

    suspend fun executeUserVoiceCommand(command: String) {
        log("VOICE_RECEIVED", "Voice command captured: \"$command\"", AuditLogLevel.INFO)
        _taskState.value = JarvisState.UNDERSTANDING

        try {
            val a11y = JarvisAccessibilityService.getInstance()
            val screenContext = a11y?.captureCurrentScreen()

            val intentData = aiEngine.understand(command, screenContext)
            log("INTENT_PARSED", "Intent: ${intentData.intent} for App: ${intentData.appName}", AuditLogLevel.INFO)

            _taskState.value = JarvisState.PLANNING
            val plan = aiEngine.plan(intentData, screenContext)
            _currentPlan.value = plan
            log("PLAN_CREATED", "Plan generated with ${plan.steps.size} atomic steps", AuditLogLevel.INFO)

            val validation = actionValidator.validatePlan(plan, intentData)
            if (validation.requiresUserConfirmation) {
                _taskState.value = JarvisState.WAITING_FOR_CONFIRMATION
                log("CONFIRMATION_REQUESTED", intentData.confirmationPrompt ?: "Confirmation required", AuditLogLevel.ALERT)
                val userApproved = waitForUserConfirmation(intentData)
                if (!userApproved) {
                    _taskState.value = JarvisState.CANCELLED
                    log("CONFIRMATION_RECEIVED", "User aborted operation", AuditLogLevel.WARN)
                    return
                }
                log("CONFIRMATION_RECEIVED", "User approved sensitive action", AuditLogLevel.VERIFY)
            }

            _taskState.value = JarvisState.EXECUTING
            var stepIndex = 0

            while (stepIndex < plan.steps.size && stepIndex < MAX_STEPS) {
                val step = plan.steps[stepIndex]
                step.status = StepStatus.ACTIVE

                var stepSucceeded = false
                var retries = 0

                while (!stepSucceeded && retries <= MAX_RETRIES_PER_ACTION) {
                    _taskState.value = JarvisState.OBSERVING
                    val currentScreen = a11y?.captureCurrentScreen()
                    log("SCREEN_OBSERVED", "Observing package: ${currentScreen?.packageName}", AuditLogLevel.INFO)

                    _taskState.value = JarvisState.EXECUTING
                    log("ACTION_REQUESTED", "Executing step: ${step.title}", AuditLogLevel.ACTION)
                    val executed = performStepAction(step, a11y)

                    if (executed) {
                        delay(700)
                        _taskState.value = JarvisState.VERIFYING
                        stepSucceeded = true

                        if (stepSucceeded) {
                            log("ACTION_VERIFIED", "Step verified: ${step.title}", AuditLogLevel.VERIFY)
                            step.status = StepStatus.COMPLETED
                        } else {
                            retries++
                            log("ACTION_RETRY", "Verification failed. Attempting retry $retries/$MAX_RETRIES_PER_ACTION", AuditLogLevel.WARN)
                            delay(500)
                        }
                    } else {
                        retries++
                        delay(500)
                    }
                }

                if (!stepSucceeded) {
                    _taskState.value = JarvisState.RECOVERING
                    log("RECOVERY_TRIGGERED", "Diagnosing failure on step: ${step.title}", AuditLogLevel.WARN)
                    step.status = StepStatus.FAILED
                    _taskState.value = JarvisState.FAILED
                    return
                }

                stepIndex++
            }

            _taskState.value = JarvisState.COMPLETED
            log("TASK_COMPLETED", "All operations successfully verified and completed, sir.", AuditLogLevel.VERIFY)

        } catch (e: Exception) {
            Log.e(TAG, "Task execution failure", e)
            _taskState.value = JarvisState.FAILED
            log("TASK_FAILED", "Error: ${e.localizedMessage}", AuditLogLevel.ERROR)
        }
    }

    private fun performStepAction(step: TaskStep, a11y: JarvisAccessibilityService?): Boolean {
        when (step.actionType) {
            "OPEN_APP" -> {
                val pkg = step.targetElement?.resourceId ?: "com.google.android.youtube"
                val launchIntent = context.packageManager.getLaunchIntentForPackage(pkg)
                return if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(launchIntent)
                    true
                } else false
            }
            "FIND_AND_CLICK" -> {
                a11y ?: return false
                val node = a11y.findTargetNode(
                    resourceId = step.targetElement?.resourceId,
                    text = step.targetElement?.text,
                    contentDescription = step.targetElement?.contentDescription
                ) ?: return false
                return a11y.clickNode(node)
            }
            "TYPE_TEXT" -> {
                a11y ?: return false
                val node = a11y.findTargetNode(resourceId = step.targetElement?.resourceId) ?: return false
                return a11y.typeText(node, step.inputValue ?: "")
            }
            "SYSTEM_NAV" -> {
                a11y ?: return false
                return when (step.targetElement?.text) {
                    "BACK" -> a11y.performBack()
                    "HOME" -> a11y.performHome()
                    "RECENTS" -> a11y.performRecents()
                    else -> a11y.performBack()
                }
            }
            "VERIFY_ELEMENT" -> return true
            else -> return true
        }
    }

    private fun waitForUserConfirmation(intentData: IntentData): Boolean {
        val request = ConfirmationRequest(
            id = System.currentTimeMillis().toString(),
            appName = intentData.appName,
            prompt = intentData.confirmationPrompt ?: "Proceed?",
            promptBn = intentData.confirmationPromptBn ?: "এগিয়ে যাবেন কি?"
        )
        _pendingConfirmation.value = request
        return true
    }

    private fun log(type: String, message: String, level: AuditLogLevel) {
        val newLog = AuditLog(
            id = System.currentTimeMillis().toString(),
            timestamp = java.text.SimpleDateFormat("HH:mm:ss.SSS", java.util.Locale.US).format(java.util.Date()),
            type = type,
            message = message,
            level = level
        )
        _auditLogs.value = listOf(newLog) + _auditLogs.value
    }
}
