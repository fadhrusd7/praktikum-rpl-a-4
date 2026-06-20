package com.lestari.mobile.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val LightColorScheme = lightColorScheme(
    primary = GreenPrimary,
    secondary = GreenSecondary,
    tertiary = GreenTertiary,
    background = BackgroundLight,
    surface = Color.White,
    onPrimary = Color.White,
    onSurface = Color(0xFF191C19),
    onSurfaceVariant = MutedTextLight, // Text yang butuh warna 'muted' tapi tetap terbaca
    outline = Color(0xFF727971)
)

private val DarkColorScheme = darkColorScheme(
    primary = GreenPrimaryDark,
    secondary = GreenSecondaryDark,
    tertiary = GreenSecondaryDark,
    background = BackgroundDark,
    surface = SurfaceDark,
    onPrimary = Color.Black,
    onSurface = Color.White,
    onSurfaceVariant = MutedTextDark
)

@Composable
fun MobileTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
