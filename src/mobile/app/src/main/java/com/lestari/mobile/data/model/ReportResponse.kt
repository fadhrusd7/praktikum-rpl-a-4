package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

data class ReportPhoto(
    val id: Int?,
    val file_path: String?,
    val file_type: String?,
    val file_size: Int?,
    val uploaded_at: String?
)

data class ReportUserData(
    val id: Int?,
    val nama: String?,
    val nama_lengkap: String?,
    val email: String?
)

data class ReportData(
    val id: Int,
    val nomor_laporan: String? = null,
    val judul: String? = null,
    val kategori: String? = null,
    val deskripsi: String? = null,
    val lokasi: String? = null,
    val latitude: Double? = 0.0,
    val longitude: Double? = 0.0,
    val status: String? = null,
    val created_at: String? = null,
    val photos: List<com.lestari.mobile.data.model.ReportPhoto>? = emptyList(),
    val is_anonymous: Boolean? = false,
    val user: com.lestari.mobile.data.model.ReportUserData? = null,
    val admin: com.lestari.mobile.data.model.ReportAdminData? = null,
    val logs: List<com.lestari.mobile.data.model.ReportLogData>? = emptyList()
)

data class ReportAdminData(
    val id: Int? = null,
    val username: String? = null
)

data class ReportLogData(
    val aksi: String? = null,
    val status: String? = null,
    val catatan: String? = null,
    val created_at: String? = null,
    val admin: com.lestari.mobile.data.model.ReportAdminData? = null
)

data class MyReportsResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data")    val data: List<com.lestari.mobile.data.model.ReportData>? = null
)

data class SingleReportResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data")    val data: com.lestari.mobile.data.model.ReportData? = null
)

data class CreateReportResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data")    val data: com.lestari.mobile.data.model.ReportData? = null
)

// ── Request (dikirim ke backend) ──────────────────────────────────────────────
data class CreateReportRequest(
    val judul: String,
    val kategori: String,
    val deskripsi: String,
    val lokasi: String,
    val latitude: Double,
    val longitude: Double,
    val is_anonymous: Boolean = false
)

data class LogItem(
    val aksi: String,
    val status: String,
    val catatan: String?,
    val createdAt: String,
    val adminUsername: String?
)
