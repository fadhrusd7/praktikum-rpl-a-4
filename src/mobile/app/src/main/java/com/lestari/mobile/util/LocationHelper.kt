package com.lestari.mobile.util

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource

object LocationHelper {

    fun isGpsEnabled(context: Context): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        return locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true ||
                locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true
    }

    fun hasLocationPermission(context: Context): Boolean {
        val fineLocation = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarseLocation = ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
        return fineLocation == PackageManager.PERMISSION_GRANTED || coarseLocation == PackageManager.PERMISSION_GRANTED
    }

    fun getCurrentLocation(
        context: Context,
        onSuccess: (latitude: Double, longitude: Double) -> Unit,
        onFailure: (message: String) -> Unit
    ) {
        if (!hasLocationPermission(context)) {
            onFailure("Izin lokasi belum diberikan.")
            return
        }

        if (!isGpsEnabled(context)) {
            onFailure("GPS tidak aktif. Mohon aktifkan GPS Anda.")
            return
        }

        try {
            val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
            val cts = CancellationTokenSource()

            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cts.token)
                .addOnSuccessListener { location ->
                    if (location != null) {
                        onSuccess(location.latitude, location.longitude)
                    } else {
                        // Coba ambil lastLocation sebagai fallback
                        fusedLocationClient.lastLocation
                            .addOnSuccessListener { lastLoc ->
                                if (lastLoc != null) {
                                    onSuccess(lastLoc.latitude, lastLoc.longitude)
                                } else {
                                    onFailure("Gagal mendapatkan lokasi saat ini. Silakan coba lagi.")
                                }
                            }
                            .addOnFailureListener { e ->
                                onFailure("Gagal mendapatkan lokasi: ${e.localizedMessage}")
                            }
                    }
                }
                .addOnFailureListener { e ->
                    onFailure("Gagal mendapatkan lokasi: ${e.localizedMessage}")
                }
        } catch (e: SecurityException) {
            onFailure("Izin lokasi tidak tersedia: ${e.localizedMessage}")
        } catch (e: Exception) {
            onFailure("Terjadi kesalahan: ${e.localizedMessage}")
        }
    }
}
