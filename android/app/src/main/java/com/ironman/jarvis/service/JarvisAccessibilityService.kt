package com.ironman.jarvis.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.ironman.jarvis.model.ScreenContext
import com.ironman.jarvis.model.UIElement
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class JarvisAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "JarvisA11y"
        private var instance: JarvisAccessibilityService? = null

        fun getInstance(): JarvisAccessibilityService? = instance

        private val _currentScreenState = MutableStateFlow<ScreenContext?>(null)
        val currentScreenState = _currentScreenState.asStateFlow()
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "JARVIS Accessibility Service connected and operational.")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event ?: return
        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED,
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                captureCurrentScreen()
            }
        }
    }

    override fun onInterrupt() {
        Log.w(TAG, "JARVIS Accessibility Service interrupted.")
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    fun captureCurrentScreen(): ScreenContext? {
        val rootNode = rootInActiveWindow ?: return null
        val visibleTexts = mutableListOf<String>()
        val clickableElements = mutableListOf<UIElement>()
        val editableElements = mutableListOf<UIElement>()
        val scrollableElements = mutableListOf<UIElement>()

        traverseNode(rootNode) { node ->
            val text = node.text?.toString() ?: ""
            val desc = node.contentDescription?.toString() ?: ""
            val resourceId = node.viewIdResourceName ?: ""
            val className = node.className?.toString() ?: ""
            val bounds = Rect()
            node.getBoundsInScreen(bounds)

            if (text.isNotBlank()) visibleTexts.add(text)
            if (desc.isNotBlank() && desc != text) visibleTexts.add(desc)

            val element = UIElement(
                id = "${resourceId}_${bounds.left}_${bounds.top}",
                resourceId = resourceId,
                text = text,
                contentDescription = desc,
                className = className,
                bounds = bounds,
                isClickable = node.isClickable,
                isEditable = node.isEditable,
                isScrollable = node.isScrollable
            )

            if (node.isClickable) clickableElements.add(element)
            if (node.isEditable) editableElements.add(element)
            if (node.isScrollable) scrollableElements.add(element)
        }

        val context = ScreenContext(
            packageName = rootNode.packageName?.toString() ?: "",
            appName = resolveAppName(rootNode.packageName?.toString()),
            visibleText = visibleTexts,
            clickableElements = clickableElements,
            editableElements = editableElements,
            scrollableElements = scrollableElements,
            timestamp = System.currentTimeMillis()
        )

        _currentScreenState.value = context
        return context
    }

    private fun traverseNode(node: AccessibilityNodeInfo, onVisit: (AccessibilityNodeInfo) -> Unit) {
        onVisit(node)
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            traverseNode(child, onVisit)
        }
    }

    fun findTargetNode(
        resourceId: String? = null,
        text: String? = null,
        contentDescription: String? = null
    ): AccessibilityNodeInfo? {
        val root = rootInActiveWindow ?: return null

        if (!resourceId.isNullOrBlank()) {
            val nodes = root.findAccessibilityNodeInfosByViewId(resourceId)
            if (nodes.isNotEmpty()) return nodes[0]
        }

        if (!text.isNullOrBlank()) {
            val nodes = root.findAccessibilityNodeInfosByText(text)
            if (nodes.isNotEmpty()) return nodes[0]
        }

        var match: AccessibilityNodeInfo? = null
        traverseNode(root) { node ->
            if (match != null) return@traverseNode
            val nodeDesc = node.contentDescription?.toString()
            val nodeText = node.text?.toString()

            if (!contentDescription.isNullOrBlank() &&
                nodeDesc?.contains(contentDescription, ignoreCase = true) == true) {
                match = node
            } else if (!text.isNullOrBlank() &&
                nodeText?.contains(text, ignoreCase = true) == true) {
                match = node
            }
        }
        return match
    }

    fun clickNode(node: AccessibilityNodeInfo): Boolean {
        if (node.isClickable && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
            return true
        }

        var parent = node.parent
        while (parent != null) {
            if (parent.isClickable && parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                return true
            }
            parent = parent.parent
        }

        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        return clickCoordinates(bounds.centerX().toFloat(), bounds.centerY().toFloat())
    }

    fun clickCoordinates(x: Float, y: Float): Boolean {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 50))
            .build()
        return dispatchGesture(gesture, null, null)
    }

    fun typeText(node: AccessibilityNodeInfo, text: String): Boolean {
        node.performAction(AccessibilityNodeInfo.ACTION_FOCUS)
        val arguments = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
        }
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, arguments)
    }

    fun scroll(forward: Boolean = true): Boolean {
        val root = rootInActiveWindow ?: return false
        var targetNode: AccessibilityNodeInfo? = null
        traverseNode(root) { node ->
            if (targetNode == null && node.isScrollable) {
                targetNode = node
            }
        }
        val action = if (forward) AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
                     else AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD
        return targetNode?.performAction(action) ?: false
    }

    fun performScroll(forward: Boolean = true): Boolean = scroll(forward)

    fun performBack(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun performHome(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performRecents(): Boolean = performGlobalAction(GLOBAL_ACTION_RECENTS)
    fun performNotifications(): Boolean = performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)

    private fun resolveAppName(pkg: String?): String {
        return when (pkg) {
            "com.google.android.youtube" -> "YouTube"
            "com.whatsapp" -> "WhatsApp"
            "com.google.android.apps.maps" -> "Google Maps"
            "com.android.settings" -> "Settings"
            "com.android.chrome" -> "Chrome"
            else -> pkg ?: "System"
        }
    }
}
