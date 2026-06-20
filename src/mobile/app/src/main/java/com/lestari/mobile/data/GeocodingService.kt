package com.lestari.mobile.data

import android.content.Context
import android.location.Geocoder
import com.lestari.mobile.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import java.util.Locale

suspend fun reverseGeocode(lat: Double, lng: Double): String {
    return withContext(Dispatchers.IO) {
        try {
            val url = "https://api.maptiler.com/geocoding/$lng,$lat.json?key=${BuildConfig.MAPTILER_API_KEY}"
            val response = URL(url).readText()
            val json = JSONObject(response)
            val features = json.getJSONArray("features")
            if (features.length() > 0) {
                features.getJSONObject(0).optString("place_name", "")
            } else ""
        } catch (e: Exception) {
            ""
        }
    }
}

suspend fun geocode(context: Context, query: String): Pair<Double, Double>? {
    return withContext(Dispatchers.IO) {
        // 1. Coba Android Geocoder bawaan
        try {
            if (Geocoder.isPresent()) {
                val geocoder = Geocoder(context, Locale.getDefault())
                // geocoder.getFromLocationName bisa mengembalikan daftar hasil
                val results = geocoder.getFromLocationName(query, 1)
                if (!results.isNullOrEmpty()) {
                    val address = results[0]
                    return@withContext Pair(address.latitude, address.longitude)
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("GeocodingService", "Android Geocoder error: ${e.message}")
        }

        // 2. Fallback ke MapTiler Geocoding API
        try {
            val encodedQuery = java.net.URLEncoder.encode(query, "UTF-8")
            val url = "https://api.maptiler.com/geocoding/$encodedQuery.json?key=${BuildConfig.MAPTILER_API_KEY}"
            val response = URL(url).readText()
            val json = JSONObject(response)
            val features = json.getJSONArray("features")
            if (features.length() > 0) {
                val geometry = features.getJSONObject(0).getJSONObject("geometry")
                val coordinates = geometry.getJSONArray("coordinates")
                val lng = coordinates.getDouble(0)
                val lat = coordinates.getDouble(1)
                Pair(lat, lng)
            } else null
        } catch (e: Exception) {
            android.util.Log.e("GeocodingService", "MapTiler Geocoder error: ${e.message}")
            null
        }
    }
}