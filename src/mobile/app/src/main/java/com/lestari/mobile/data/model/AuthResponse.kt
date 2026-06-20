package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

// Menyesuaikan response login dan register dari Laravel Sanctum:
// { "success": true, "message": "...", "data": {...}, "token": "..." }
data class AuthResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: com.lestari.mobile.data.model.UserData?,
    @SerializedName("token") val token: String? = null
)

data class VerifyOtpRequest(
    @SerializedName("email") val email: String,
    @SerializedName("otp")   val otp: String
)

data class ResendOtpRequest(
    @SerializedName("email") val email: String
)

// ── New: OTP response ─────────────────────────────────────────────────────────
data class OtpResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String
)

data class ForgotPasswordRequest(
    @SerializedName("email") val email: String
)

data class VerifyResetOtpResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("reset_token") val resetToken: String? = null
)

data class ResetPasswordRequest(
    @SerializedName("email") val email: String,
    @SerializedName("reset_token") val resetToken: String,
    @SerializedName("password") val password: String,
    @SerializedName("password_confirmation") val passwordConfirmation: String
)

// ── Google Login (Socialite redirect) ───────────────────────────────────────
// Response dari GET auth/google: { "success": true, "url": "https://accounts.google.com/..." }
data class GoogleAuthUrlResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("url") val url: String?
)