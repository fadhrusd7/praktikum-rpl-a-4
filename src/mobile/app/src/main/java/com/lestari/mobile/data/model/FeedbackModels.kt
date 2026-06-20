package com.lestari.mobile.data.model
import com.google.gson.annotations.SerializedName

data class FeedbackRequest(
    @SerializedName("rating")
    val rating: Int,

    @SerializedName("komentar")
    val isi: String,
)

data class FeedbackResponse(
    val success: Boolean,
    val message: String,
)
