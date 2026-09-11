package com.ironman.jarvis.safety

import com.ironman.jarvis.model.IntentData
import com.ironman.jarvis.model.TaskPlan
import com.ironman.jarvis.model.ValidationResult

class ActionValidator {

    private val sensitiveIntents = setOf(
        "send_message",
        "make_call",
        "delete_file",
        "financial_transaction",
        "modify_system_setting",
        "uninstall_app",
        "post_publicly"
    )

    fun validatePlan(plan: TaskPlan, intentData: IntentData): ValidationResult {
        if (plan.steps.size > 30) {
            return ValidationResult(
                isAllowed = false,
                requiresUserConfirmation = false,
                reason = "Task plan exceeds maximum safety step limit (30 steps)"
            )
        }

        if (sensitiveIntents.contains(intentData.intent) || intentData.requiresConfirmation) {
            return ValidationResult(
                isAllowed = true,
                requiresUserConfirmation = true,
                reason = "Action has high sensitivity: ${intentData.intent}"
            )
        }

        return ValidationResult(
            isAllowed = true,
            requiresUserConfirmation = false,
            reason = "Standard low-risk operation"
        )
    }
}
