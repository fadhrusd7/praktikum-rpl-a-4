package com.lestari.mobile.ui.viewmodel

import android.content.Context
import android.util.Patterns
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.ui.component.GoogleAuthWebResult
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.repository.AuthRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Email dan kata sandi wajib diisi.")
            return
        }
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.login(email, password)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(
                    isLoading    = false,
                    loginSuccess = true
                )
                is Resource.Error   -> _uiState.value = _uiState.value.copy(
                    isLoading    = false,
                    errorMessage = result.message
                )
                else -> Unit
            }
        }
    }

    // ── GOOGLE AUTH ──────────────────────────────────────────────────────────
    fun startGoogleLogin() {
        _uiState.value = _uiState.value.copy(isGoogleRegister = false, isGoogleAuth = false)
        executeGoogleAuth()
    }

    fun startGoogleRegister() {
        _uiState.value = _uiState.value.copy(isGoogleRegister = true, isGoogleAuth = false)
        executeGoogleAuth()
    }

    private fun executeGoogleAuth() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isGoogleLoading = true, errorMessage = null)
            when (val result = repository.getGoogleAuthUrl()) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(
                    isGoogleLoading = false,
                    googleAuthUrl   = result.data
                )
                is Resource.Error   -> _uiState.value = _uiState.value.copy(
                    isGoogleLoading = false,
                    errorMessage    = result.message
                )
                else -> Unit
            }
        }
    }

    fun handleGoogleAuthResult(result: GoogleAuthWebResult) {
        when (result) {
            is GoogleAuthWebResult.Success -> {
                viewModelScope.launch {
                    val isRegisterFlow = _uiState.value.isGoogleRegister
                    _uiState.value = _uiState.value.copy(googleAuthUrl = null, isGoogleLoading = true)
                    
                    when (val loginResult = repository.completeGoogleLogin(
                        token = result.token,
                        persistSession = !isRegisterFlow
                    )) {
                        is Resource.Success -> {
                            if (isRegisterFlow) {
                                _uiState.value = _uiState.value.copy(
                                    isGoogleLoading = false,
                                    registerSuccess = true,
                                    isGoogleAuth    = true,
                                    registeredEmail = loginResult.data.email
                                )
                            } else {
                                _uiState.value = _uiState.value.copy(
                                    isGoogleLoading = false,
                                    loginSuccess    = true
                                )
                            }
                        }
                        is Resource.Error -> _uiState.value = _uiState.value.copy(
                            isGoogleLoading = false,
                            errorMessage    = loginResult.message
                        )
                        else -> Unit
                    }
                }
            }
            is GoogleAuthWebResult.Failed -> _uiState.value = _uiState.value.copy(
                googleAuthUrl   = null,
                isGoogleLoading = false,
                errorMessage    = result.message
            )
            is GoogleAuthWebResult.Cancelled -> _uiState.value = _uiState.value.copy(
                googleAuthUrl   = null,
                isGoogleLoading = false
            )
        }
    }

    fun dismissGoogleAuthWebView() {
        _uiState.value = _uiState.value.copy(googleAuthUrl = null, isGoogleLoading = false)
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────
    fun register(namaLengkap: String, email: String, password: String, confirmPassword: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null, isGoogleAuth = false)
            when (val result = repository.register(namaLengkap, email, password, confirmPassword)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(
                    isLoading       = false,
                    registerSuccess = true,
                    registeredEmail = email
                )
                is Resource.Error   -> _uiState.value = _uiState.value.copy(
                    isLoading    = false,
                    errorMessage = result.message
                )
                else -> Unit
            }
        }
    }

    // ── OTP ───────────────────────────────────────────────────────────────────
    fun verifyOtp(email: String, otp: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.verifyOtp(email, otp)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(isLoading = false, otpVerified = true)
                is Resource.Error   -> _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = result.message)
                else -> Unit
            }
        }
    }

    fun resendOtp(email: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.resendOtp(email)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(isLoading = false, resendSuccess = true)
                is Resource.Error   -> _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = result.message)
                else -> Unit
            }
        }
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────
    fun clearError()  { _uiState.value = _uiState.value.copy(errorMessage = null) }
    fun clearResend() { _uiState.value = _uiState.value.copy(resendSuccess = false) }
    fun resetState()  { _uiState.value = AuthUiState() }

    // ── FORGOT & RESET ────────────────────────────────────────────────────────
    fun forgotPassword(email: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.forgotPassword(email)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(isLoading = false, forgotPasswordSuccess = true, registeredEmail = email)
                is Resource.Error   -> _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = result.message)
                else -> Unit
            }
        }
    }

    fun verifyResetOtp(email: String, otp: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.verifyResetOtp(email, otp)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(isLoading = false, resetOtpVerified = true, resetToken = result.data)
                is Resource.Error   -> _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = result.message)
                else -> Unit
            }
        }
    }

    fun resetPassword(email: String, resetToken: String, password: String, passwordConfirmation: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            when (val result = repository.resetPassword(email, resetToken, password, passwordConfirmation)) {
                is Resource.Success -> _uiState.value = _uiState.value.copy(isLoading = false, resetPasswordSuccess = true)
                is Resource.Error   -> _uiState.value = _uiState.value.copy(isLoading = false, errorMessage = result.message)
                else -> Unit
            }
        }
    }
}

data class AuthUiState(
    val isLoading: Boolean        = false,
    val errorMessage: String?     = null,
    val loginSuccess: Boolean     = false,
    val registerSuccess: Boolean  = false,
    val registeredEmail: String?  = null,
    val otpVerified: Boolean      = false,
    val resendSuccess: Boolean    = false,
    val forgotPasswordSuccess: Boolean = false,
    val resetOtpVerified: Boolean      = false,
    val resetToken: String?            = null,
    val resetPasswordSuccess: Boolean  = false,
    val isGoogleLoading: Boolean       = false,
    val googleAuthUrl: String?         = null,
    val isGoogleRegister: Boolean      = false,
    val isGoogleAuth: Boolean          = false
)
