package com.lestari.mobile.data.repository

import com.lestari.mobile.data.api.UserApiService
import com.lestari.mobile.data.model.UserProfile
import com.lestari.mobile.data.model.UserStats
import com.lestari.mobile.util.Resource
import android.net.Uri
import android.content.Context
import android.util.Log
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import com.lestari.mobile.data.model.ChangePasswordRequest
import com.lestari.mobile.data.model.FeedbackRequest

class UserRepository(
    private val apiService: UserApiService,
    private val token: String,
    private val context: Context
) {
    suspend fun getProfile(): Resource<UserProfile> {
        return try {
            val response = apiService.getProfile("Bearer $token")
            Log.d("PROFILE_DEBUG", "getProfile response: code=${response.code()}, success=${response.body()?.success}, body=${response.body()}, error=${response.errorBody()?.string()}")
            if (response.isSuccessful && response.body()?.success == true) {
                val profile = response.body()!!.data
                Log.d("PROFILE_DEBUG", "getProfile data: id=${profile.id}, nama=${profile.namaLengkap}, fotoProfile=${profile.fotoProfile}, fotoProfilUrl=${profile.fotoProfilUrl}, displayPhotoUrl=${profile.displayPhotoUrl}")
                Resource.Success(profile)
            } else {
                Resource.Error("Gagal mengambil profil.")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Resource.Error("Tidak dapat terhubung ke server: ${e.message}")
        }
    }

    suspend fun getStats(): Resource<UserStats> {
        return try {
            val response = apiService.getStats("Bearer $token")
            if (response.isSuccessful && response.body()?.success == true) {
                Resource.Success(response.body()!!.data)
            } else {
                Resource.Error("Gagal mengambil statistik.")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Resource.Error("Tidak dapat terhubung ke server: ${e.message}")
        }
    }

    suspend fun updateProfile(
        namaLengkap: String,
        noTelepon: String,
        kota: String,
        photoUri: Uri? = null,
    ): Resource<UserProfile> {
        return updateProfileInternal(
            namaLengkap = namaLengkap,
            noTelepon = noTelepon,
            kota = kota,
            photoUri = photoUri,
        )
    }

    private suspend fun updateProfileInternal(
        namaLengkap: String,
        noTelepon: String,
        kota: String,
        photoUri: Uri?,
    ): Resource<UserProfile> {
        return try {
            val toText = { s: String -> s.toRequestBody("text/plain".toMediaTypeOrNull()) }
            val fotoPart: MultipartBody.Part? = photoUri?.let {
                val file = uriToTempFile(it)
                val mediaType = (context.contentResolver.getType(it) ?: "image/*")
                    .toMediaTypeOrNull()
                MultipartBody.Part.createFormData("foto_profil", file.name, file.asRequestBody(mediaType))
            }

            val response = apiService.updateProfile(
                token = "Bearer $token",
                namaLengkap = toText(namaLengkap),
                noTelepon = toText(noTelepon),
                kota = toText(kota),
                fotoProfile = fotoPart,
            )
            Log.d("PHOTO_UPLOAD_DEBUG", "updateProfile response: code=${response.code()}, success=${response.body()?.success}, body=${response.body()}, error=${response.errorBody()?.string()}")
            if (response.isSuccessful && response.body()?.success == true) {
                val profile = response.body()!!.data
                Log.d("PHOTO_UPLOAD_DEBUG", "updateProfile data: id=${profile.id}, nama=${profile.namaLengkap}, fotoProfile=${profile.fotoProfile}, fotoProfilUrl=${profile.fotoProfilUrl}, displayPhotoUrl=${profile.displayPhotoUrl}")
                Resource.Success(profile)
            } else {
                Resource.Error("Gagal memperbarui profil.")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Resource.Error("Tidak dapat terhubung ke server: ${e.message}")
        }
    }

    private fun uriToTempFile(uri: Uri): File {
        val inputStream = context.contentResolver.openInputStream(uri) ?: throw IllegalStateException("Tidak dapat membuka file dari URI")
        val ext = context.contentResolver.getType(uri)?.split("/")?.last() ?: "jpg"
        val temp = File.createTempFile("profile_", ".$ext", context.cacheDir)
        FileOutputStream(temp).use { out -> inputStream.use { it.copyTo(out)} }
        return temp
    }

    suspend fun changePassword(
        passwordLama: String,
        passwordBaru: String,
        passwordBaruConfirmation: String,
    ): Resource<String> {
        return try {
            val authHeader = "Bearer $token"
            val request = ChangePasswordRequest(
                passwordLama = passwordLama,
                passwordBaru = passwordBaru,
                passwordBaruConfirmation = passwordBaruConfirmation,
            )
            val response = apiService.changePassword(authHeader, request)

            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true) {
                    Resource.Success(body.message)
                } else {
                    Resource.Error(body?.message ?: "Gagal mengubah password.")
                }
            } else {
                // HTTP 422 = validasi server (password lama salah, dll.)
                val errorBody = response.errorBody()?.string()
                Resource.Error(
                    when (response.code()) {
                        422  -> "Password lama tidak sesuai."
                        401  -> "Sesi habis, silakan login ulang."
                        else -> "Terjadi kesalahan (${response.code()})."
                    }
                )
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.")
        }
    }

    suspend fun sendFeedback(
        rating: Int,
        isi:    String,
    ): Resource<String> {
        return try {
            val authHeader = "Bearer $token"
            val request = FeedbackRequest(
                rating = rating,
                isi = isi
            )
            val response = apiService.sendFeedback(authHeader, request)

            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true) {
                    Resource.Success(body.message)
                } else {
                    Resource.Error(body?.message ?: "Gagal mengirim feedback.")
                }
            } else {
                Resource.Error(
                    when (response.code()) {
                        401 -> "Sesi habis, silakan login ulang."
                        422 -> "Data tidak valid. Periksa kembali isian Anda."
                        else -> "Terjadi kesalahan (${response.code()})."
                    }
                )
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.")
        }
    }
}
