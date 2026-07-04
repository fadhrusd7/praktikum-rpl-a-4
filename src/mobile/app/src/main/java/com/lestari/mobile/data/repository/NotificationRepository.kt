package com.lestari.mobile.data.repository
import android.util.Log
import com.lestari.mobile.data.api.NotificationApiService
import com.lestari.mobile.data.model.NotificationData
import com.lestari.mobile.util.Resource
class NotificationRepository(
    private val apiService: NotificationApiService,
    private val token: String
) {
    suspend fun getNotifications(): Resource<List<NotificationData>> {
        return try {
            val response = apiService.getNotifications("Bearer $token")
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(body.data ?: emptyList())
                } else {
                    Resource.Error(body.message ?: "Gagal mengambil notifikasi.")
                }
            } else {
                Resource.Error("Error ${response.code()}: Gagal mengambil notifikasi.")
            }
        } catch (e: Exception) {
            Log.e("NotificationRepo", "getNotifications Error: ${e.message}")
            Resource.Error("Tidak dapat terhubung ke server.")
        }
    }
    suspend fun getUnreadCount(): Resource<Int> {
        return try {
            val response = apiService.getUnreadCount("Bearer $token")
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(body.count)
                } else {
                    Resource.Error("Gagal mengambil jumlah notifikasi.")
                }
            } else {
                Resource.Error("Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("NotificationRepo", "getUnreadCount Error: ${e.message}")
            Resource.Error("Terjadi kesalahan koneksi.")
        }
    }
    suspend fun markAllRead(): Resource<String> {
        return try {
            val response = apiService.markAllRead("Bearer $token")
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(body.message ?: "Berhasil menandai semua dibaca.")
                } else {
                    Resource.Error(body.message ?: "Gagal menandai notifikasi dibaca.")
                }
            } else {
                Resource.Error("Error ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("NotificationRepo", "markAllRead Error: ${e.message}")
            Resource.Error("Terjadi kesalahan koneksi.")
        }
    }
}