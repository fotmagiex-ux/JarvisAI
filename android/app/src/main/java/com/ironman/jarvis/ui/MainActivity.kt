package com.ironman.jarvis.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.ironman.jarvis.ai.GeminiCloudAiEngine
import com.ironman.jarvis.engine.TaskExecutionManager
import com.ironman.jarvis.safety.ActionValidator
import com.ironman.jarvis.service.JarvisAccessibilityService
import com.ironman.jarvis.voice.OfflineCommandRegistry
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private var speechRecognizer: SpeechRecognizer? = null
    private lateinit var taskExecutionManager: TaskExecutionManager
    private val commandTextState = mutableStateOf("")

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        if (!recordAudioGranted) {
            Toast.makeText(this, "Microphone permission is required for voice commands", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val aiEngine = GeminiCloudAiEngine("https://ais-dev-crslwbuvmted3qwkypvhvr-214688971454.asia-southeast1.run.app")
        val validator = ActionValidator()
        taskExecutionManager = TaskExecutionManager(this, aiEngine, validator)

        checkAndRequestPermissions()
        initSpeechRecognizer()

        setContent {
            val taskState by taskExecutionManager.taskState.collectAsState()
            val plan by taskExecutionManager.currentPlan.collectAsState()
            val commandText by remember { commandTextState }

            JarvisHudScreen(
                state = taskState,
                commandText = commandText,
                taskSteps = plan?.steps ?: emptyList(),
                onMicClick = { startListening() },
                onConfirm = { }
            )
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(Manifest.permission.RECORD_AUDIO)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        }

        if (JarvisAccessibilityService.getInstance() == null) {
            Toast.makeText(this, "Please enable JARVIS in Accessibility Settings", Toast.LENGTH_LONG).show()
        }
    }

    private fun initSpeechRecognizer() {
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {}
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(error: Int) {
                        commandTextState.value = "Voice recognition error ($error)"
                    }
                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = matches?.firstOrNull() ?: return
                        commandTextState.value = text

                        val a11y = JarvisAccessibilityService.getInstance()
                        val offlineCmd = OfflineCommandRegistry.matchCommand(text)
                        if (offlineCmd != null && a11y != null) {
                            offlineCmd.handler(a11y, this@MainActivity)
                            Toast.makeText(this@MainActivity, offlineCmd.feedbackEn, Toast.LENGTH_SHORT).show()
                            return
                        }

                        lifecycleScope.launch {
                            taskExecutionManager.executeUserVoiceCommand(text)
                        }
                    }
                    override fun onPartialResults(partialResults: Bundle?) {}
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })
            }
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "bn-BD")
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, false)
            putExtra(RecognizerIntent.EXTRA_SUPPORTED_LANGUAGES, arrayListOf("bn-BD", "en-US"))
        }
        speechRecognizer?.startListening(intent)
    }

    override fun onDestroy() {
        speechRecognizer?.destroy()
        super.onDestroy()
    }
}
