package com.lestari.mobile.ui.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.repository.AuthRepository

// ── Factory (konsisten dengan pola yang sudah ada) ────────────────────────────
class AuthViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val tokenPreferences = TokenPreferences(context)
        val repository       = AuthRepository(RetrofitClient.authApiService, tokenPreferences)
        @Suppress("UNCHECKED_CAST")
        return AuthViewModel(repository) as T
    }
}