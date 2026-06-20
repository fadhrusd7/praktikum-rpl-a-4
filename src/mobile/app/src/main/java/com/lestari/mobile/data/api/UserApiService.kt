package com.lestari.mobile.data.api

import okhttp3.MultipartBody
import okhttp3.RequestBody
import com.lestari.mobile.data.model.UserProfileResponse
import com.lestari.mobile.data.model.UserStatsResponse
import retrofit2.Response
import retrofit2.http.*
import com.lestari.mobile.data.model.ChangePasswordRequest
import com.lestari.mobile.data.model.ChangePasswordResponse
import com.lestari.mobile.data.model.FeedbackRequest
import com.lestari.mobile.data.model.FeedbackResponse

interface UserApiService {
    @Headers("Accept: application/json")
    @GET("user/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<com.lestari.mobile.data.model.UserProfileResponse>

    @Headers("Accept: application/json")
    @GET("user/stats")
    suspend fun getStats(
        @Header("Authorization") token: String
    ): Response<com.lestari.mobile.data.model.UserStatsResponse>

    @Headers("Accept: application/json")
    @Multipart
    @POST("user/profile")
    suspend fun updateProfile(
        @Header("Authorization") token: String,
        @Part("nama_lengkap") namaLengkap: RequestBody,
        @Part("no_telepon")  noTelepon:  RequestBody,
        @Part("kota")        kota:       RequestBody,
        @Part fotoProfile: MultipartBody.Part?
    ): Response<com.lestari.mobile.data.model.UserProfileResponse>

    @Headers("Accept: application/json")
    @PUT("user/change-password")
    suspend fun changePassword(
        @Header("Authorization") token: String,
        @Body request: com.lestari.mobile.data.model.ChangePasswordRequest,
    ): Response<com.lestari.mobile.data.model.ChangePasswordResponse>

    @Headers("Accept: application/json")
    @POST("feedbacks")
    suspend fun sendFeedback(
        @Header("Authorization") token: String,
        @Body request: com.lestari.mobile.data.model.FeedbackRequest,
    ): Response<com.lestari.mobile.data.model.FeedbackResponse>
}
