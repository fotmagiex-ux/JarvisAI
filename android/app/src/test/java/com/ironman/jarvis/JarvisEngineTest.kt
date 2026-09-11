package com.ironman.jarvis

import com.ironman.jarvis.ai.OfflineRuleAiEngine
import com.ironman.jarvis.model.IntentData
import com.ironman.jarvis.model.TaskPlan
import com.ironman.jarvis.model.TaskStep
import com.ironman.jarvis.safety.ActionValidator
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test

class JarvisEngineTest {

    private val offlineAi = OfflineRuleAiEngine()
    private val safetyValidator = ActionValidator()

    @Test
    fun testBengaliNavigationCommandGoBack() = runBlocking {
        val result = offlineAi.understand("পিছনে যাও", null)
        assertEquals("navigate", result.intent)
        assertEquals("BACK", result.parameters["action"])
        assertFalse("Navigation should not require confirmation", result.requiresConfirmation)
    }

    @Test
    fun testBengaliNavigationCommandGoHome() = runBlocking {
        val result = offlineAi.understand("হোমে যাও", null)
        assertEquals("navigate", result.intent)
        assertEquals("HOME", result.parameters["action"])
    }

    @Test
    fun testConfirmationAffirmativeBengali() = runBlocking {
        assertTrue(offlineAi.evaluateConfirmation("হ্যাঁ, করো"))
        assertTrue(offlineAi.evaluateConfirmation("পাঠিয়ে দাও"))
        assertTrue(offlineAi.evaluateConfirmation("ঠিক আছে"))
    }

    @Test
    fun testConfirmationRejectionBengali() = runBlocking {
        assertFalse(offlineAi.evaluateConfirmation("না"))
        assertFalse(offlineAi.evaluateConfirmation("বাতিল করো"))
    }

    @Test
    fun testSensitiveActionSafetyEnforcement() {
        val sensitiveIntent = IntentData(
            intent = "send_message",
            application = "whatsapp",
            appName = "WhatsApp",
            parameters = mapOf("recipient" to "Rahul", "message" to "Meeting at 8"),
            requiresConfirmation = true
        )
        val plan = TaskPlan(listOf(TaskStep("1", "Send WhatsApp message", "", "FIND_AND_CLICK", "", 1)))

        val validation = safetyValidator.validatePlan(plan, sensitiveIntent)
        assertTrue("Sensitive messaging must require explicit user confirmation", validation.requiresUserConfirmation)
    }

    @Test
    fun testMaxExecutionStepsExceededRejection() {
        val dummySteps = (1..35).map { TaskStep(it.toString(), "Step $it", "", "CLICK", "", 1) }
        val bigPlan = TaskPlan(dummySteps)
        val intent = IntentData("youtube_search", "youtube", "YouTube", emptyMap(), false)

        val validation = safetyValidator.validatePlan(bigPlan, intent)
        assertFalse("Plans exceeding MAX_STEPS (30) must be rejected to prevent infinite loops", validation.isAllowed)
    }
}
