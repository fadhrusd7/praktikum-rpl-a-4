// ─── 1. Model Request ─────────────────────────────────────────────────────────
// Letakkan di: com.lestari.mobile.ui.data.model

package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

data class ChangePasswordRequest(
    @SerializedName("password_lama")
    val passwordLama: String,

    @SerializedName("password_baru")
    val passwordBaru: String,

    @SerializedName("password_baru_confirmation")
    val passwordBaruConfirmation: String,
)

data class ChangePasswordResponse(
    val success: Boolean,
    val message: String,
)

data class DeleteAccountRequest(
    val password: String
)