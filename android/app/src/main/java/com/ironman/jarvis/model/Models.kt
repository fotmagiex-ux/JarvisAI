package com.ironman.jarvis.model

import android.graphics.Rect

enum class JarvisState {
    IDLE,
    LISTENING,
    UNDERSTANDING,
    PLANNING,
    WAITING_FOR_CONFIRMATION,
    OBSERVING,
    EXECUTING,
    VERIFYING,
    RECOVERING,
    COMPLETED,
    CANCELLED,
    FAILED
}

enum class StepStatus {
    PENDING,
    ACTIVE,
    COMPLETED,
    FAILED
}

enum class AuditLogLevel {
    INFO,
    ALERT,
    WARN,
    VERIFY,
    ACTION,
    ERROR
}

data class TargetElement(
    val resourceId: String? = null,
    val text: String? = null,
    val contentDescription: String? = null,
    val bounds: Rect? = null
)

data class TaskStep(
    val id: String,
    val title: String,
    val titleBn: String = "",
    val actionType: String,
    val verificationCriteria: String = "",
    val maxRetries: Int = 2,
    var status: StepStatus = StepStatus.PENDING,
    val targetElement: TargetElement? = null,
    val inputValue: String? = null,
    val requiresConfirmation: Boolean = false
)

typealias ActionStep = TaskStep

data class TaskPlan(
    val steps: List<TaskStep>
)

data class IntentData(
    val intent: String,
    val application: String = "youtube",
    val appName: String = "YouTube",
    val parameters: Map<String, String> = emptyMap(),
    val requiresConfirmation: Boolean = false,
    val confirmationPrompt: String? = null,
    val confirmationPromptBn: String? = null,
    val voiceResponse: String = "Understood, sir.",
    val voiceResponseBn: String? = null,
    val planSummary: List<String> = emptyList()
)

data class UIElement(
    val id: String,
    val resourceId: String? = null,
    val text: String? = null,
    val contentDescription: String? = null,
    val className: String? = null,
    val bounds: Rect? = null,
    val isClickable: Boolean = false,
    val isEditable: Boolean = false,
    val isScrollable: Boolean = false
)

data class ScreenContext(
    val packageName: String,
    val appName: String,
    val visibleText: List<String>,
    val clickableElements: List<UIElement> = emptyList(),
    val editableElements: List<UIElement> = emptyList(),
    val scrollableElements: List<UIElement> = emptyList(),
    val timestamp: Long = System.currentTimeMillis()
)

data class AuditLog(
    val id: String,
    val timestamp: String,
    val type: String,
    val message: String,
    val level: AuditLogLevel,
    val messageBn: String? = null
)

data class ConfirmationRequest(
    val id: String,
    val appName: String,
    val prompt: String,
    val promptBn: String
)

data class ValidationResult(
    val isAllowed: Boolean,
    val requiresUserConfirmation: Boolean,
    val reason: String
)
