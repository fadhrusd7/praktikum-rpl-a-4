package com.lestari.mobile.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    const val PHOTO_BASE_URL = "https://lxjprimpzxzexaowbist.storage.supabase.co/storage/v1/object/public/report-foto/"

    // Ganti dengan URL backend Laravel
    private const val BASE_URL = "https://outcome-vivacious-bunkbed.ngrok-free.dev/api/"
    const val BASE_STORAGE_URL = "http://outcome-vivacious-bunkbed.ngrok-free.dev/storage/"

    fun resolveProfilePhotoUrl(path: String?): String? {
        val cleanPath = path?.trim().orEmpty()
        if (cleanPath.isBlank()) return null

        return when {
            cleanPath.startsWith("http://") || cleanPath.startsWith("https://") -> cleanPath
            cleanPath.startsWith("/storage/") -> BASE_STORAGE_URL.trimEnd('/') + cleanPath.removePrefix("/storage")
            cleanPath.startsWith("storage/") -> BASE_STORAGE_URL.trimEnd('/') + "/" + cleanPath.removePrefix("storage/")
            cleanPath.startsWith("/") -> BASE_STORAGE_URL.trimEnd('/') + cleanPath
            else -> BASE_STORAGE_URL + cleanPath
        }
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .header("ngrok-skip-browser-warning", "true")  // ← tambah ini
                .build()
            chain.proceed(request)
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    val instance: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val authApiService: AuthApiService by lazy {
        instance.create(AuthApiService::class.java)
    }

    val userApiService: UserApiService by lazy {
        instance.create(UserApiService::class.java)
    }

    val reportApiService: ReportApiService by lazy {
        instance.create(ReportApiService::class.java)
    }

    val notificationApiService: NotificationApiService by lazy {
        instance.create(NotificationApiService::class.java)
    }
}