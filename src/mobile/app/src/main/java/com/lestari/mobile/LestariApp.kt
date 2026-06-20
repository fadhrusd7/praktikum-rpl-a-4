package com.lestari.mobile

import android.app.Application
import com.maptiler.maptilersdk.MTConfig
import com.lestari.mobile.BuildConfig

class LestariApp : Application() {
    override fun onCreate() {
        super.onCreate()
        MTConfig.apiKey = BuildConfig.MAPTILER_API_KEY
    }
}