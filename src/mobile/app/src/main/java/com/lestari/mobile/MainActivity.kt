package com.lestari.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.lestari.mobile.ui.screen.auth.AuthNavGraph
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.ui.theme.MobileTheme
import com.lestari.mobile.ui.screen.auth.AuthRoutes

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // ── SESSION CHECK ─────────────────────────────────────────────────────
        // Cek apakah ada token valid di SharedPreferences.
        // Ini harus dilakukan SEBELUM Compose dimulai, agar startDestination
        // sudah benar sejak frame pertama (tidak ada flash Login → Home).
        //
        // Logika:
        //   - Token ada  → startDestination = "main" (langsung ke Home)
        //   - Token tidak ada / sudah logout → startDestination = "login"
        // ─────────────────────────────────────────────────────────────────────
        val tokenPreferences  =
            TokenPreferences(applicationContext)
        val startDestination  = if (tokenPreferences.isLoggedIn()) {
            AuthRoutes.MAIN
        } else {
            AuthRoutes.LOGIN
        }

        setContent {
            MobileTheme {
                AuthNavGraph(startDestination = startDestination)
            }
        }
    }
}