package com.lestari.mobile.data.repository

import com.lestari.mobile.data.api.AuthApiService
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.api.UserApiService
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.model.*
import com.lestari.mobile.util.Resource

class AuthRepository(
    private val apiService: AuthApiService,
    private val tokenPreferences: TokenPreferences,
    private val userApiService: UserApiService = RetrofitClient.userApiService
) {

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────────────────────
    suspend fun login(email: String, password: String): Resource<UserData> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true && body.data != null) {
                    tokenPreferences.saveAuthData(
                        token    = body.token ?: "",
                        userId   = body.data.id,
                        username = body.data.namaLengkap,
                        role     = "user",
                        email    = body.data.email
                    )
                    Resource.Success(body.data)
                } else {
                    Resource.Error(body?.message ?: "Login gagal.")
                }
            } else {
                when (response.code()) {
                    401  -> Resource.Error("Email atau password salah.")
                    403  -> Resource.Error("Akun belum diverifikasi. Silakan cek email Anda.")
                    else -> Resource.Error("Login gagal. Coba lagi.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────────────────────
    suspend fun register(
        namaLengkap: String,
        email: String,
        password: String,
        passwordConfirmation: String
    ): Resource<UserData> {
        return try {
            val response = apiService.register(
                RegisterRequest(namaLengkap, email, password, passwordConfirmation)
            )
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true) {
                    Resource.Success(body.data ?: UserData(0, "", "", ""))
                } else {
                    Resource.Error(body?.message ?: "Registrasi gagal.")
                }
            } else {
                when (response.code()) {
                    422  -> Resource.Error("Email sudah terdaftar. Gunakan email lain.")
                    else -> Resource.Error("Registrasi gagal. Coba lagi.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY OTP
    // ─────────────────────────────────────────────────────────────────────────
    suspend fun verifyOtp(email: String, otp: String): Resource<Unit> {
        return try {
            val response = apiService.verifyOtp(VerifyOtpRequest(email, otp))
            val body = response.body()

            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(Unit)
                } else {
                    Resource.Error(body.message ?: "Kode OTP tidak valid.")
                }
            } else {
                when (response.code()) {
                    422 -> Resource.Error("OTP tidak valid atau sudah kadaluarsa.")
                    else -> Resource.Error("Verifikasi gagal. Coba lagi nanti.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RESEND OTP
    // ─────────────────────────────────────────────────────────────────────────
    suspend fun resendOtp(email: String): Resource<Unit> {
        return try {
            val response = apiService.resendOtp(ResendOtpRequest(email))
            val body = response.body()

            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(Unit)
                } else {
                    Resource.Error(body.message ?: "Gagal mengirim ulang OTP.")
                }
            } else {
                if (response.code() == 422) {
                    Resource.Error("Permintaan tidak valid. Pastikan email Anda benar.")
                } else {
                    Resource.Error("Gagal mengirim ulang OTP. Coba lagi.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FORGOT & RESET PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    suspend fun forgotPassword(email: String): Resource<Unit> {
        return try {
            val response = apiService.forgotPassword(ForgotPasswordRequest(email))
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(Unit)
                } else {
                    Resource.Error(body.message)
                }
            } else {
                when (response.code()) {
                    422 -> Resource.Error("Email tidak ditemukan atau tidak valid.")
                    else -> Resource.Error("Gagal mengirim OTP. Coba lagi.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    suspend fun verifyResetOtp(email: String, otp: String): Resource<String> {
        return try {
            val response = apiService.verifyResetOtp(VerifyOtpRequest(email, otp))
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success && body.resetToken != null) {
                    Resource.Success(body.resetToken)
                } else {
                    Resource.Error(body.message ?: "OTP tidak valid.")
                }
            } else {
                when (response.code()) {
                    422 -> Resource.Error("OTP tidak valid atau sudah kadaluarsa.")
                    else -> Resource.Error("Verifikasi gagal. Coba lagi nanti.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    suspend fun resetPassword(
        email: String,
        resetToken: String,
        password: String,
        passwordConfirmation: String
    ): Resource<Unit> {
        return try {
            val response = apiService.resetPassword(
                ResetPasswordRequest(email, resetToken, password, passwordConfirmation)
            )
            val body = response.body()
            if (response.isSuccessful && body != null) {
                if (body.success) {
                    Resource.Success(Unit)
                } else {
                    Resource.Error(body.message)
                }
            } else {
                when (response.code()) {
                    422 -> Resource.Error("Data tidak valid atau token kadaluarsa.")
                    else -> Resource.Error("Gagal mereset kata sandi. Coba lagi.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    suspend fun logoutApi(token: String): Resource<Unit> {
        return try {
            val response = apiService.logout("Bearer $token")
            val body = response.body()
            if (response.isSuccessful && body?.success == true) {
                Resource.Success(Unit)
            } else {
                Resource.Error(body?.message ?: "Gagal logout di server.")
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GOOGLE LOGIN
    // ─────────────────────────────────────────────────────────────────────────
    suspend fun getGoogleAuthUrl(): Resource<String> {
        return try {
            val response = apiService.getGoogleAuthUrl()
            val body = response.body()
            if (response.isSuccessful && body?.success == true && !body.url.isNullOrBlank()) {
                Resource.Success(body.url)
            } else {
                Resource.Error("Gagal memulai login Google. Coba lagi.")
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    suspend fun completeGoogleLogin(token: String, persistSession: Boolean = true): Resource<UserProfile> {
        return try {
            val profileResponse = userApiService.getProfile("Bearer $token")
            val profileBody = profileResponse.body()
            if (profileResponse.isSuccessful && profileBody?.success == true) {
                val profile = profileBody.data
                if (persistSession) {
                    tokenPreferences.saveAuthData(
                        token    = token,
                        userId   = profile.id,
                        username = profile.namaLengkap,
                        role     = "user",
                        email    = profile.email
                    )
                } else {
                    tokenPreferences.clearAuthData()
                }
                Resource.Success(profile)
            } else {
                when (profileResponse.code()) {
                    401  -> Resource.Error("Sesi Google tidak valid. Silakan coba lagi.")
                    else -> Resource.Error("Gagal mengambil data akun setelah login Google.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT & SESSION
    // ─────────────────────────────────────────────────────────────────────────
    fun logout() {
        tokenPreferences.clearAuthData()
    }

    suspend fun deleteAccount(token: String, password: String): Resource<Unit> {
        return try {
            val response = apiService.deleteAccount("Bearer $token", DeleteAccountRequest(password))
            val body = response.body()
            when {
                response.isSuccessful && body?.success == true ->
                    Resource.Success(Unit)
                response.code() == 401 ->
                    Resource.Error("Sesi tidak valid. Silakan login ulang.")
                response.code() == 403 ->
                    Resource.Error("Kata sandi yang Anda masukkan salah.")
                response.code() in 500..599 ->
                    Resource.Error("Terjadi kesalahan server. Coba lagi nanti.")
                else ->
                    Resource.Error(body?.message ?: "Gagal menghapus akun. Coba lagi.")
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    suspend fun changePassword(
        token: String,
        passwordLama: String,
        passwordBaru: String,
        passwordBaruConfirmation: String
    ): Resource<Unit> {
        return try {
            val request = ChangePasswordRequest(
                passwordLama,
                passwordBaru,
                passwordBaruConfirmation
            )
            val response = userApiService.changePassword("Bearer $token", request)
            val body = response.body()

            if (response.isSuccessful && body?.success == true) {
                Resource.Success(Unit)
            } else {
                when (response.code()) {
                    401 -> Resource.Error("Sesi tidak valid. Silakan login ulang.")
                    403 -> Resource.Error("Sandi lama yang Anda masukkan salah.")
                    422 -> Resource.Error(body?.message ?: "Data tidak valid.")
                    else -> Resource.Error(body?.message ?: "Gagal mengubah kata sandi.")
                }
            }
        } catch (e: Exception) {
            Resource.Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.")
        }
    }

    fun isLoggedIn(): Boolean = tokenPreferences.isLoggedIn()
}
