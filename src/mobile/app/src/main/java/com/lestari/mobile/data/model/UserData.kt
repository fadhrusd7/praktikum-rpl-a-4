package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

data class UserData(
    @SerializedName("id") val id: Int,
    @SerializedName("nama_lengkap") val namaLengkap: String = "",
    @SerializedName("role") val role: String = "user",
    @SerializedName("email") val email: String,
    @SerializedName("no_telepon") val noTelepon: String? = null,
    @SerializedName("kota") val kota: String? = null,
    @SerializedName(
        value = "foto_profile",
        alternate = ["foto_profil", "photo_profile", "profile_photo", "avatar"]
    )
    val fotoProfile: String? = null,
    @SerializedName(
        value = "foto_profil_url",
        alternate = ["foto_profile_url", "photo_profile_url", "profile_photo_url", "avatar_url"]
    )
    val fotoProfilUrl: String? = null
)
