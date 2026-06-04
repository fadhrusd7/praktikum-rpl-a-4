package com.lestari.mobile.map

import android.annotation.SuppressLint
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.lestari.mobile.ui.theme.AppColors

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MapTilerView(
    apiKey: String,
    selectedCategories: Set<String>,
    modifier: Modifier = Modifier
) {
    if (apiKey.isBlank() || apiKey.contains("xxxxxxxx")) {
        MapFallback(modifier)
        return
    }

    val html = remember(apiKey) { mapTilerHtml(apiKey) }
    var isLoading by remember { mutableStateOf(true) }

    Box(modifier = modifier) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            // Map JS masih inisialisasi setelah page load,
                            // delay sedikit supaya tidak flicker
                            view?.postDelayed({ isLoading = false }, 800)
                        }
                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ) = false
                    }
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        databaseEnabled = true
                        cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK // cache CDN assets
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    }
                    loadDataWithBaseURL(
                        "https://api.maptiler.com/",
                        html,
                        "text/html",
                        "UTF-8",
                        null
                    )
                }
            },
            update = { webView ->
                val categoriesJson = selectedCategories.joinToString(",") { "'$it'" }
                webView.evaluateJavascript(
                    "if(window.updateMarkers) updateMarkers([$categoriesJson])",
                    null
                )
            }
        )

        // Loading overlay — fade out begitu map siap
        AnimatedVisibility(
            visible = isLoading,
            exit = fadeOut(),
            modifier = Modifier.fillMaxSize()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFDCE9DA)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    color = AppColors.Forest,
                    modifier = Modifier.size(32.dp),
                    strokeWidth = 3.dp
                )
            }
        }
    }
}

@Composable
fun MapFallback(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .background(Color(0xFFDCE9DA))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(Modifier.fillMaxSize()) { drawMapPattern() }
        Card(
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.94f)),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Text(
                text = "Isi MAPTILER_API_KEY yang valid di gradle.properties.",
                color = AppColors.ForestDark,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(18.dp)
            )
        }
    }
}

private fun mapTilerHtml(apiKey: String): String = """
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <script src="https://cdn.maptiler.com/maptiler-sdk-js/v3.0.1/maptiler-sdk.umd.min.js"></script>
      <link href="https://cdn.maptiler.com/maptiler-sdk-js/v3.0.1/maptiler-sdk.css" rel="stylesheet"/>
      <style>
        html, body, #map { width:100%; height:100%; margin:0; padding:0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        try {
          maptilersdk.config.apiKey = "$apiKey";
          const allData = [
            { category:"Sampah",     lng:110.8264, lat:-7.5587, color:"#e73d3d" },
            { category:"Banjir",     lng:110.8271, lat:-7.5592, color:"#3e8be4" },
            { category:"Polusi",     lng:110.8259, lat:-7.5590, color:"#8e8e8e" },
            { category:"Penebangan", lng:110.8269, lat:-7.5584, color:"#8b642d" },
            { category:"Isu Air",    lng:110.8261, lat:-7.5594, color:"#3e8be4" }
          ];
          const map = new maptilersdk.Map({
            container: "map",
            style: maptilersdk.MapStyle.STREETS,
            center: [110.8267, -7.5589],
            zoom: 14
          });
          let currentMarkers = [];
          window.updateMarkers = function(selectedCategories) {
            currentMarkers.forEach(m => m.remove());
            currentMarkers = [];
            allData.forEach(item => {
              if (selectedCategories.includes(item.category)) {
                currentMarkers.push(
                  new maptilersdk.Marker({ color: item.color })
                    .setLngLat([item.lng, item.lat])
                    .addTo(map)
                );
              }
            });
          };
          map.on('load', () => {
            window.updateMarkers(["Sampah","Banjir","Polusi","Penebangan","Isu Air"]);
          });
        } catch(e) { console.error(e); }
      </script>
    </body>
    </html>
""".trimIndent()

private fun DrawScope.drawMapPattern() {
    drawRect(Color(0xFFAEC9A6))
    repeat(9) { i ->
        val y = (i * 82).toFloat()
        drawLine(Color.White.copy(alpha = 0.7f), Offset(-80f, y), Offset(size.width + 80f, y + 150f), 18f)
    }
    repeat(18) { i ->
        val x = ((i * 73) % size.width.toInt()).toFloat()
        val y = ((i * 119) % size.height.toInt()).toFloat()
        drawRect(Color(0xFFB96C48), topLeft = Offset(x, y), size = androidx.compose.ui.geometry.Size(34f, 26f))
        drawRect(Color(0xFFEDE8DD), topLeft = Offset(x + 38f, y + 8f), size = androidx.compose.ui.geometry.Size(48f, 32f))
    }
}