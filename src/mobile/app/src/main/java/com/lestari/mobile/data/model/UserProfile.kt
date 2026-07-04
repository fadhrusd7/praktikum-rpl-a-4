package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

data class UserProfile(
    @SerializedName("id") val id: Int,
    @SerializedName("nama_lengkap") val namaLengkap: String,
    @SerializedName("no_telepon") val noTelepon: String?,
    @SerializedName("kota") val kota: String?,
    @SerializedName("email") val email: String,
    @SerializedName(
        value = "foto_profile",
        alternate = ["foto_profil", "photo_profile", "profile_photo", "avatar"]
    )
    val fotoProfile: String?,
    @SerializedName(
        value = "foto_profil_url",
        alternate = ["foto_profile_url", "photo_profile_url", "profile_photo_url", "avatar_url"]
    )
    val fotoProfilUrl: String? = null
) {
    val displayPhotoUrl: String?
        get() = fotoProfilUrl?.takeIf { it.isNotBlank() }
            ?: fotoProfile?.takeIf { it.isNotBlank() }
}

data class UserStats(
    @SerializedName("total") val total: Int,
    @SerializedName("terverifikasi") val terverifikasi: Int,
    @SerializedName("menunggu_validasi") val menungguValidasi: Int,
    @SerializedName("ditolak") val ditolak: Int,
    @SerializedName("selesai") val selesai: Int
)

data class UserProfileResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: com.lestari.mobile.data.model.UserProfile
)

data class UserStatsResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: com.lestari.mobile.data.model.UserStats
)
