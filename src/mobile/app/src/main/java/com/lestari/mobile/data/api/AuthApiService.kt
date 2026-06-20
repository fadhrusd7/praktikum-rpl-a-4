package com.lestari.mobile.data.api

import com.lestari.mobile.data.model.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Headers
import retrofit2.http.Header
import retrofit2.http.DELETE

interface AuthApiService {

    @Headers("Accept: application/json")
    @POST("auth/login")
    suspend fun login(
        @Body request: com.lestari.mobile.data.model.LoginRequest
    ): Response<com.lestari.mobile.data.model.AuthResponse>

    @Headers("Accept: application/json")
    @POST("auth/register")
    suspend fun register(
        @Body request: com.lestari.mobile.data.model.RegisterRequest
    ): Response<com.lestari.mobile.data.model.AuthResponse>

    @Headers("Accept: application/json")
    @POST("auth/register/verify-otp")
    suspend fun verifyOtp(
        @Body request: com.lestari.mobile.data.model.VerifyOtpRequest
    ): Response<com.lestari.mobile.data.model.AuthResponse>

    @Headers("Accept: application/json")
    @POST("auth/register/resend-otp")
    suspend fun resendOtp(
        @Body request: com.lestari.mobile.data.model.ResendOtpRequest
    ): Response<com.lestari.mobile.data.model.OtpResponse>

    @Headers("Accept: application/json")
    @POST("auth/forgot-password")
    suspend fun forgotPassword(
        @Body request: com.lestari.mobile.data.model.ForgotPasswordRequest
    ): Response<com.lestari.mobile.data.model.OtpResponse>

    @Headers("Accept: application/json")
    @POST("auth/verify-otp")
    suspend fun verifyResetOtp(
        @Body request: com.lestari.mobile.data.model.VerifyOtpRequest
    ): Response<com.lestari.mobile.data.model.VerifyResetOtpResponse>

    @Headers("Accept: application/json")
    @POST("auth/reset-password")
    suspend fun resetPassword(
        @Body request: com.lestari.mobile.data.model.ResetPasswordRequest
    ): Response<com.lestari.mobile.data.model.OtpResponse>

    @Headers("Accept: application/json")
    @POST("auth/logout")
    suspend fun logout(
        @Header("Authorization") token: String
    ): Response<com.lestari.mobile.data.model.OtpResponse>

    @Headers("Accept: application/json")
    @retrofit2.http.HTTP(method = "DELETE", path = "user/account", hasBody = true)
    suspend fun deleteAccount(
        @Header("Authorization") token: String,
        @Body request: com.lestari.mobile.data.model.DeleteAccountRequest
    ): Response<com.lestari.mobile.data.model.OtpResponse>

    // ── GOOGLE LOGIN ──────────────────────────────────────────────────────────
    @Headers("Accept: application/json")
    @GET("auth/google")
    suspend fun getGoogleAuthUrl(): Response<com.lestari.mobile.data.model.GoogleAuthUrlResponse>
}
