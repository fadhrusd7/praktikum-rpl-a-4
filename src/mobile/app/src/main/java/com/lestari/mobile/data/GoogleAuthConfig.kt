package com.lestari.mobile.data

/**
 * Konfigurasi terpusat untuk alur Google Sign-In.
 *
 * Backend (Laravel Socialite) menangani seluruh OAuth Google secara server-side dan
 * me-redirect hasilnya ke:
 *   "<FRONTEND_URL>/users/auth/google-callback.html?token=...&role=..."
 * (lihat GoogleAuthController@callback). FRONTEND_URL dikonfigurasi di .env backend dan
 * bisa berbeda antar environment (local/staging/produksi). Mobile app HANYA mencocokkan
 * path-nya saja (bukan domain penuh), supaya tetap berfungsi di environment apa pun tanpa
 * perlu rebuild app.
 */
object GoogleAuthConfig {
    const val CALLBACK_PATH = "/users/auth/google-callback.html"
}