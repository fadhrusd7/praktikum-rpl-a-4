package com.lestari.mobile.data.api

import com.lestari.mobile.data.model.NotificationListResponse
import com.lestari.mobile.data.model.NotificationUnreadCountResponse
import com.lestari.mobile.data.model.NotificationMarkReadResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
interface NotificationApiService {
    @GET("notifications")
    suspend fun getNotifications(
        @Header("Authorization") token: String
    ): Response<NotificationListResponse>
    @GET("notifications/unread-count")
    suspend fun getUnreadCount(
        @Header("Authorization") token: String
    ): Response<NotificationUnreadCountResponse>
    @POST("notifications/mark-read")
    suspend fun markAllRead(
        @Header("Authorization") token: String
    ): Response<NotificationMarkReadResponse>
}