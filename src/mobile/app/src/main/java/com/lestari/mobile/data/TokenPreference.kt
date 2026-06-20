package com.lestari.mobile.data

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit

class TokenPreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREF_NAME   = "auth_prefs"
        private const val KEY_TOKEN    = "auth_token"
        private const val KEY_USER_ID  = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_ROLE     = "user_role"
        private const val KEY_EMAIL    = "email"
    }

    fun saveAuthData(token: String, userId: Int, username: String, role: String, email: String) {
        prefs.edit {
            putString(KEY_TOKEN, token)
            putInt(KEY_USER_ID, userId)
            putString(KEY_USERNAME, username)
            putString(KEY_ROLE, role)
            putString(KEY_EMAIL, email)
        }
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)
    fun getUserId(): Int = prefs.getInt(KEY_USER_ID, -1)
    fun getUsername(): String? = prefs.getString(KEY_USERNAME, null)
    fun isLoggedIn(): Boolean = getToken() != null
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)

    fun clearAuthData() {
        prefs.edit { clear() }
    }
}
