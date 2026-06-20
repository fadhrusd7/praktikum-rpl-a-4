package com.lestari.mobile.data.model

import com.google.gson.annotations.SerializedName

data class NotificationData(
    val id: Int,
    val pesan: String,
    val status_baru: String?,
    val is_read: Any?, // Can be Boolean (true/false) or String ("true"/"false") or Int (0/1)
    val report_id: Int?,
    val created_at: String?
) {
    val isReadBool: Boolean
        get() = when (is_read) {
            is Boolean -> is_read
            is String -> is_read.lowercase() == "true" || is_read == "1"
            is Number -> is_read.toInt() != 0
            else -> false
        }
}

data class NotificationListResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data")    val data: List<com.lestari.mobile.data.model.NotificationData>? = null
)

data class NotificationUnreadCountResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("count")   val count: Int
)

data class NotificationMarkReadResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String? = null
)
