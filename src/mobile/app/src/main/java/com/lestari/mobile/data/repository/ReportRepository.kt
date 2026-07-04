package com.lestari.mobile.data.repository

import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.model.toReportItem
import com.lestari.mobile.data.api.ReportApiService
import com.lestari.mobile.util.Resource
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.InputStream
import android.content.Context
import android.net.Uri
import android.util.Log

class ReportRepository(
    private val apiService: com.lestari.mobile.data.api.ReportApiService,
    private val token: String
) {
    suspend fun getMyReports(): Resource<List<ReportItem>> {
        return try {
            val response = apiService.getMyReports("Bearer $token")
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    val items = body.data?.map { it.toReportItem() } ?: emptyList()
                    Resource.Success(items)
                } else {
                    Resource.Error(body.message ?: "Gagal mengambil riwayat.")
                }
            } else {
                Resource.Error("Error ${response.code()}: Gagal mengambil riwayat.")
            }
        } catch (e: Exception) {
            Log.e("ReportRepo", "getMyReports Error: ${e.message}")
            Resource.Error("Terjadi kesalahan saat memproses data.")
        }
    }

    suspend fun createReport(
        context: Context,
        judul: String,
        kategori: String,
        deskripsi: String,
        lokasi: String,
        latitude: Double,
        longitude: Double,
        isAnonymous: Boolean,
        photoUri: Uri?
    ): Resource<ReportItem> {
        return try {
            val toBody = { s: String ->
                s.toRequestBody("text/plain".toMediaTypeOrNull())
            }

            // Siapkan part foto (nullable)
            val fotoPart: MultipartBody.Part? = photoUri?.let { uri ->
                val stream: InputStream = context.contentResolver.openInputStream(uri)
                    ?: return Resource.Error("Gagal membaca foto.")
                val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
                val bytes = stream.readBytes()
                stream.close()

                val requestBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
                MultipartBody.Part.createFormData("foto", "foto.jpg", requestBody)
            }

            val response = apiService.createReport(
                token     = "Bearer $token",
                judul     = toBody(judul),
                kategori  = toBody(kategori),
                deskripsi = toBody(deskripsi),
                lokasi    = toBody(lokasi),
                latitude  = toBody(latitude.toString()),
                longitude = toBody(longitude.toString()),
                isAnonymous = toBody(if (isAnonymous) "1" else "0"),
                foto      = fotoPart
            )

            if (response.isSuccessful && response.body()?.success == true) {
                val reportData = response.body()!!.data
                    ?: return Resource.Error("Data laporan kosong dari server.")
                Resource.Success(reportData.toReportItem())
            } else {
                val msg = response.body()?.message ?: "Gagal membuat laporan."
                Resource.Error(msg)
            }

        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server.")
        }
    }

    suspend fun getAllReports(): Resource<List<ReportItem>> {
        return try {
            val response = apiService.getMapReports()
            val body = response.body()
            
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    val items = body.data?.map { it.toReportItem() } ?: emptyList()
                    Log.d("MapDebug", "Total items: ${items.size}")
                    Resource.Success(items)
                } else {
                    Resource.Error(body.message ?: "Gagal mengambil data peta.")
                }
            } else {
                Log.e("MapDebug", "Response fail: ${response.code()} ${response.message()}")
                Resource.Error("Server bermasalah (${response.code()})")
            }
        } catch (e: Exception) {
            Log.e("MapDebug", "Exception: ${e.message}", e)
            Resource.Error("Kesalahan aplikasi: ${e.localizedMessage}")
        }
    }

    suspend fun getReportDetail(id: Int): Resource<ReportItem> {
        return try {
            val response = apiService.getReportDetail("Bearer $token", id)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()!!.data
                    ?: return Resource.Error("Data laporan tidak ditemukan.")
                Resource.Success(data.toReportItem())
            } else {
                Resource.Error("Gagal mengambil detail laporan.")
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server.")
        }
    }

}
