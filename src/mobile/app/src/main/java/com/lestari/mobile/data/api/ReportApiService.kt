package com.lestari.mobile.data.api

import com.lestari.mobile.data.model.CreateReportResponse
import com.lestari.mobile.data.model.MyReportsResponse
import com.lestari.mobile.data.model.SingleReportResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ReportApiService {

    // ── GET riwayat laporan milik user ────────────────────────────────────────
    @GET("reports/my")
    suspend fun getMyReports(
        @Header("Authorization") token: String
    ): Response<com.lestari.mobile.data.model.MyReportsResponse>

    // ── GET detail satu laporan (dengan logs & admin) ─────────────────────────
    @GET("reports/{id}")
    suspend fun getReportDetail(
        @Header("Authorization") token: String,
        @Path("id") id: Int
    ): Response<com.lestari.mobile.data.model.SingleReportResponse>

    // ── GET laporan terverifikasi untuk peta ──────────────────────────────────
    @GET("reports/map")
    suspend fun getMapReports(): Response<com.lestari.mobile.data.model.MyReportsResponse>

    // ── POST buat laporan baru ────────────────────────────────────────────────
    @Multipart
    @POST("reports")
    suspend fun createReport(
        @Header("Authorization") token: String,
        @Part("judul")        judul: RequestBody,
        @Part("kategori")     kategori: RequestBody,
        @Part("deskripsi")    deskripsi: RequestBody,
        @Part("lokasi")       lokasi: RequestBody,
        @Part("latitude")     latitude: RequestBody,
        @Part("longitude")    longitude: RequestBody,
        @Part("is_anonymous") isAnonymous: RequestBody,
        @Part foto: MultipartBody.Part?
    ): Response<com.lestari.mobile.data.model.CreateReportResponse>
}