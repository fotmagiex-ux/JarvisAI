package com.ironman.jarvis

import android.app.Application
import android.util.Log

class JarvisApplication : Application() {
    companion object {
        const val TAG = "JarvisApplication"
    }

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "JARVIS Autonomous Android Assistant application started.")
    }
}
