package com.ironman.jarvis.ai

import com.ironman.jarvis.model.IntentData
import com.ironman.jarvis.model.ScreenContext
import com.ironman.jarvis.model.TaskPlan
import com.ironman.jarvis.model.TaskStep
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

interface AIEngine {
    suspend fun understand(command: String, screenContext: ScreenContext?): IntentData
    suspend fun plan(intentData: IntentData, screenContext: ScreenContext?): TaskPlan
    suspend fun evaluateConfirmation(spokenText: String): Boolean
}

class GeminiCloudAiEngine(private val serverUrl: String) : AIEngine {

    override suspend fun understand(command: String, screenContext: ScreenContext?): IntentData = withContext(Dispatchers.IO) {
        val endpoint = URL("$serverUrl/api/jarvis/understand")
        val conn = endpoint.openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.doOutput = true

        val requestJson = JSONObject().apply {
            put("command", command)
            put("currentApp", screenContext?.packageName ?: "home")
            screenContext?.let {
                put("screenContext", JSONObject().apply {
                    put("appName", it.appName)
                    put("visibleTextCount", it.visibleText.size)
                })
            }
        }

        conn.outputStream.use { os ->
            os.write(requestJson.toString().toByteArray())
        }

        val responseText = conn.inputStream.bufferedReader().use { it.readText() }
        val json = JSONObject(responseText)
        val data = json.getJSONObject("data")

        IntentData(
            intent = data.getString("intent"),
            application = data.optString("application", "youtube"),
            appName = data.optString("appName", "YouTube"),
            parameters = parseParams(data.optJSONObject("parameters")),
            requiresConfirmation = data.optBoolean("requires_confirmation", false),
            confirmationPrompt = data.optString("confirmation_prompt", null),
            confirmationPromptBn = data.optString("confirmation_prompt_bn", null),
            voiceResponse = data.optString("voice_response", "Understood, sir."),
            voiceResponseBn = data.optString("voice_response_bn", null),
            planSummary = parseList(data.optJSONArray("plan_summary"))
        )
    }

    override suspend fun plan(intentData: IntentData, screenContext: ScreenContext?): TaskPlan = withContext(Dispatchers.IO) {
        val endpoint = URL("$serverUrl/api/jarvis/plan")
        val conn = endpoint.openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.doOutput = true

        val requestJson = JSONObject().apply {
            put("intentData", JSONObject().apply {
                put("intent", intentData.intent)
                put("application", intentData.application)
                put("parameters", JSONObject(intentData.parameters))
            })
        }

        conn.outputStream.use { it.write(requestJson.toString().toByteArray()) }
        val responseText = conn.inputStream.bufferedReader().use { it.readText() }
        val json = JSONObject(responseText)
        val stepsArray = json.getJSONArray("steps")

        val steps = mutableListOf<TaskStep>()
        for (i in 0 until stepsArray.length()) {
            val stepObj = stepsArray.getJSONObject(i)
            steps.add(
                TaskStep(
                    id = stepObj.getString("id"),
                    title = stepObj.getString("title"),
                    titleBn = stepObj.optString("title_bn", ""),
                    actionType = stepObj.getString("actionType"),
                    verificationCriteria = stepObj.optString("verificationCriteria", ""),
                    maxRetries = stepObj.optInt("maxRetries", 2)
                )
            )
        }
        TaskPlan(steps)
    }

    override suspend fun evaluateConfirmation(spokenText: String): Boolean = withContext(Dispatchers.IO) {
        val endpoint = URL("$serverUrl/api/jarvis/confirmation-eval")
        val conn = endpoint.openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.doOutput = true

        val payload = JSONObject().apply { put("spokenText", spokenText) }
        conn.outputStream.use { it.write(payload.toString().toByteArray()) }

        val res = conn.inputStream.bufferedReader().use { it.readText() }
        val json = JSONObject(res)
        json.optBoolean("confirmed", false)
    }

    private fun parseParams(json: JSONObject?): Map<String, String> {
        json ?: return emptyMap()
        val map = mutableMapOf<String, String>()
        json.keys().forEach { key ->
            map[key] = json.optString(key)
        }
        return map
    }

    private fun parseList(arr: org.json.JSONArray?): List<String> {
        arr ?: return emptyList()
        val list = mutableListOf<String>()
        for (i in 0 until arr.length()) {
            list.add(arr.getString(i))
        }
        return list
    }
}

class OfflineRuleAiEngine : AIEngine {

    override suspend fun understand(command: String, screenContext: ScreenContext?): IntentData {
        val lower = command.lowercase().trim()

        if (lower.contains("back") || lower.contains("পিছনে যাও") || lower.contains("ফিরে যাও")) {
            return IntentData("navigate", "system", "System", mapOf("action" to "BACK"), false, voiceResponse = "Going back, sir.", voiceResponseBn = "পিছনে যাচ্ছি।")
        }
        if (lower.contains("home") || lower.contains("হোমে যাও")) {
            return IntentData("navigate", "system", "System", mapOf("action" to "HOME"), false, voiceResponse = "Home screen, sir.", voiceResponseBn = "হোম স্ক্রিনে ফিরে যাচ্ছি।")
        }
        if (lower.contains("scroll down") || lower.contains("নিচে যাও")) {
            return IntentData("navigate", "system", "System", mapOf("direction" to "DOWN"), false, voiceResponse = "Scrolling down.", voiceResponseBn = "নিচে স্ক্রোল করছি।")
        }
        if (lower.contains("scroll up") || lower.contains("উপরে যাও")) {
            return IntentData("navigate", "system", "System", mapOf("direction" to "UP"), false, voiceResponse = "Scrolling up.", voiceResponseBn = "উপরে স্ক্রোল করছি।")
        }

        return IntentData("open_app", "youtube", "YouTube", emptyMap(), false, voiceResponse = "Executing offline routine.")
    }

    override suspend fun plan(intentData: IntentData, screenContext: ScreenContext?): TaskPlan {
        return TaskPlan(listOf(
            TaskStep("step_1", "Execute System Action", "সিস্টেম নির্দেশ কার্যকর করা হচ্ছে", "SYSTEM_NAV", "Action completed", 1)
        ))
    }

    override suspend fun evaluateConfirmation(spokenText: String): Boolean {
        val clean = spokenText.lowercase().trim()
        val affirmatives = listOf("yes", "yeah", "send", "confirm", "ok", "হ্যাঁ", "করো", "ঠিক আছে", "পাঠাও")
        return affirmatives.any { clean.contains(it) }
    }
}
