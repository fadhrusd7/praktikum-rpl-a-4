package com.lestari.mobile.ui.component

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.view.ViewGroup
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.lestari.mobile.data.GoogleAuthConfig

/**
 * Hasil dari alur Google OAuth via WebView. Modular & reusable — bisa dipanggil dari
 * layar mana pun yang membutuhkan login Google.
 */
sealed class GoogleAuthWebResult {
    data class Success(val token: String, val role: String?) : GoogleAuthWebResult()
    data class Failed(val message: String) : GoogleAuthWebResult()
    object Cancelled : GoogleAuthWebResult()
}

/**
 * WebView yang menjalankan alur Google OAuth (Laravel Socialite) di dalam aplikasi,
 * tanpa membuka browser eksternal.
 *
 * Alur:
 * 1. [authUrl] (dari GET auth/google) dimuat — halaman pemilihan akun Google.
 * 2. User memilih akun & menyetujui akses.
 * 3. Google mengarahkan kembali ke backend (auth/google/callback).
 * 4. Backend redirect ke "<FRONTEND_URL>/users/auth/google-callback.html?token=...".
 * 5. WebView ini mencegat redirect tersebut HANYA berdasarkan path
 *    ([GoogleAuthConfig.CALLBACK_PATH]), bukan domain penuh.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GoogleAuthWebView(
    authUrl: String,
    onResult: (GoogleAuthWebResult) -> Unit,
    modifier: Modifier = Modifier
) {
    var isPageLoading by remember { mutableStateOf(true) }
    var resultDelivered by remember { mutableStateOf(false) }

    fun deliver(result: GoogleAuthWebResult) {
        if (!resultDelivered) {
            resultDelivered = true
            onResult(result)
        }
    }

    fun interceptIfCallback(url: String?): Boolean {
        if (url == null) return false
        val uri = runCatching { Uri.parse(url) }.getOrNull() ?: return false
        val path = uri.path ?: return false
        if (!path.endsWith(GoogleAuthConfig.CALLBACK_PATH)) return false

        val token = uri.getQueryParameter("token")
        if (!token.isNullOrBlank()) {
            deliver(GoogleAuthWebResult.Success(token, uri.getQueryParameter("role")))
        } else {
            deliver(GoogleAuthWebResult.Failed("Login Google gagal. Silakan coba lagi."))
        }
        return true
    }

    Column(modifier = modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { deliver(GoogleAuthWebResult.Cancelled) }) {
                Icon(
                    imageVector = Icons.Filled.Close,
                    contentDescription = "Batalkan login Google"
                )
            }
        }

        Box(modifier = Modifier.weight(1f)) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { context ->
                    WebView(context).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        
                        // Aktifkan penyimpanan cookie agar sesi Google tetap tersimpan
                        val cookieManager = android.webkit.CookieManager.getInstance()
                        cookieManager.setAcceptCookie(true)
                        cookieManager.setAcceptThirdPartyCookies(this, true)
                        
                        // Hapus session lama agar user selalu bisa memilih akun (Account Picker)
                        // Terutama berguna untuk flow testing Login vs Register
                        cookieManager.removeAllCookies(null)
                        cookieManager.flush()

                        // Workaround untuk error "403: disallowed_useragent"
                        settings.userAgentString = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"

                        webViewClient = object : WebViewClient() {
                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                return interceptIfCallback(request?.url?.toString())
                            }

                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                super.onPageStarted(view, url, favicon)
                                isPageLoading = true
                                // Jaring pengaman: beberapa implementasi WebView tidak selalu
                                // memanggil shouldOverrideUrlLoading untuk redirect server (3xx).
                                if (interceptIfCallback(url)) {
                                    view?.stopLoading()
                                }
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isPageLoading = false
                            }

                            override fun onReceivedError(
                                view: WebView?,
                                request: WebResourceRequest?,
                                error: WebResourceError?
                            ) {
                                super.onReceivedError(view, request, error)
                                if (request?.isForMainFrame == true && !resultDelivered) {
                                    deliver(
                                        GoogleAuthWebResult.Failed(
                                            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
                                        )
                                    )
                                }
                            }
                        }
                        loadUrl(authUrl)
                    }
                }
            )

            if (isPageLoading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            }
        }
    }
}