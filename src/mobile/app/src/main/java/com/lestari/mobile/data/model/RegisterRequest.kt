package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

data class RegisterRequest(
    @SerializedName("nama_lengkap") val namaLengkap: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("password_confirmation") val passwordConfirmation: String
)
