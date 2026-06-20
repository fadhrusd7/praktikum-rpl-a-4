package com.lestari.mobile.ui.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.repository.AuthRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch

// ─── Events (one-shot) ────────────────────────────────────────────────────────
sealed class ChangePasswordEvent {
    data class ShowSnackbar(val message: String) : ChangePasswordEvent()
    object NavigateBack : ChangePasswordEvent()
}

// ─── Save states ──────────────────────────────────────────────────────────────
sealed class ChangePasswordSaveState {
    object Idle    : ChangePasswordSaveState()
    object Saving  : ChangePasswordSaveState()
    object Success : ChangePasswordSaveState()
}

// ─── Delete Account states ────────────────────────────────────────────────────
sealed class DeleteAccountState {
    object Idle    : DeleteAccountState()
    object Loading : DeleteAccountState()
    object Success : DeleteAccountState()
    data class Error(val message: String) : DeleteAccountState()
}

// ─── Form state ───────────────────────────────────────────────────────────────
data class ChangePasswordForm(
    val passwordLama: String               = "",
    val passwordLamaError: String?         = null,
    val passwordBaru: String               = "",
    val passwordBaruError: String?         = null,
    val konfirmasiPasswordBaru: String     = "",
    val konfirmasiPasswordBaruError: String? = null,
)

class ChangePasswordViewModel(
    private val authRepository: AuthRepository,
    private val tokenPreferences: TokenPreferences,
) : ViewModel() {

    // ── Form & Save State ─────────────────────────────────────────────────────
    private val _form = MutableStateFlow(ChangePasswordForm())
    val form: StateFlow<ChangePasswordForm> = _form

    private val _saveState = MutableStateFlow<ChangePasswordSaveState>(ChangePasswordSaveState.Idle)
    val saveState: StateFlow<ChangePasswordSaveState> = _saveState

    // ── Delete Account State ──────────────────────────────────────────────────
    private val _deleteAccountState = MutableStateFlow<DeleteAccountState>(DeleteAccountState.Idle)
    val deleteAccountState: StateFlow<DeleteAccountState> = _deleteAccountState

    // ── One-shot events ───────────────────────────────────────────────────────
    private val _eventChannel = Channel<ChangePasswordEvent>(Channel.BUFFERED)
    val events = _eventChannel.receiveAsFlow()

    // ── Form handlers ─────────────────────────────────────────────────────────
    fun onPasswordLamaChange(value: String) {
        _form.value = _form.value.copy(passwordLama = value, passwordLamaError = null)
    }

    fun onPasswordBaruChange(value: String) {
        _form.value = _form.value.copy(passwordBaru = value, passwordBaruError = null)
    }

    fun onKonfirmasiPasswordBaruChange(value: String) {
        _form.value = _form.value.copy(konfirmasiPasswordBaru = value, konfirmasiPasswordBaruError = null)
    }

    // ── Submit Ganti Password ─────────────────────────────────────────────────
    fun submitChangePassword() {
        val f = _form.value
        var hasError = false

        if (f.passwordLama.isBlank()) {
            _form.value = _form.value.copy(passwordLamaError = "Sandi lama wajib diisi.")
            hasError = true
        }
        if (f.passwordBaru.isBlank()) {
            _form.value = _form.value.copy(passwordBaruError = "Sandi baru wajib diisi.")
            hasError = true
        } else if (f.passwordBaru.length < 8) {
            _form.value = _form.value.copy(passwordBaruError = "Sandi baru minimal 8 karakter.")
            hasError = true
        }
        if (f.konfirmasiPasswordBaru.isBlank()) {
            _form.value = _form.value.copy(konfirmasiPasswordBaruError = "Konfirmasi sandi wajib diisi.")
            hasError = true
        } else if (f.konfirmasiPasswordBaru != f.passwordBaru) {
            _form.value = _form.value.copy(konfirmasiPasswordBaruError = "Konfirmasi sandi tidak cocok.")
            hasError = true
        }
        if (hasError) return

        viewModelScope.launch {
            _saveState.value = ChangePasswordSaveState.Saving

            val token = tokenPreferences.getToken()
            if (token.isNullOrBlank()) {
                _saveState.value = ChangePasswordSaveState.Idle
                _eventChannel.send(ChangePasswordEvent.ShowSnackbar("Sesi berakhir. Silakan login ulang."))
                return@launch
            }

            val result = authRepository.changePassword(
                token,
                f.passwordLama,
                f.passwordBaru,
                f.konfirmasiPasswordBaru
            )

            when (result) {
                is Resource.Success -> {
                    _saveState.value = ChangePasswordSaveState.Success
                    _eventChannel.send(ChangePasswordEvent.ShowSnackbar("Sandi berhasil diubah."))
                    _form.value = ChangePasswordForm()
                }
                is Resource.Error -> {
                    _saveState.value = ChangePasswordSaveState.Idle
                    _eventChannel.send(ChangePasswordEvent.ShowSnackbar(result.message ?: "Gagal mengubah sandi."))
                }
                else -> {
                    _saveState.value = ChangePasswordSaveState.Idle
                }
            }
        }
    }

    // ── Hapus Akun ────────────────────────────────────────────────────────────
    fun deleteAccount(password: String) {
        if (_deleteAccountState.value is DeleteAccountState.Loading) return
        if (password.isBlank()) {
            _deleteAccountState.value = DeleteAccountState.Error("Kata sandi wajib diisi untuk konfirmasi.")
            return
        }

        viewModelScope.launch {
            _deleteAccountState.value = DeleteAccountState.Loading

            val token = tokenPreferences.getToken()
            if (token.isNullOrBlank()) {
                // Token tidak ada — bersihkan sesi dan arahkan keluar
                clearSessionAndLogout()
                return@launch
            }

            when (val result = authRepository.deleteAccount(token, password)) {
                is Resource.Success -> {
                    clearSessionAndLogout()
                }
                is Resource.Error -> {
                    _deleteAccountState.value = DeleteAccountState.Error(
                        result.message ?: "Gagal menghapus akun. Coba lagi."
                    )
                }
                else -> {
                    _deleteAccountState.value = DeleteAccountState.Error(
                        "Terjadi kesalahan. Coba lagi."
                    )
                }
            }
        }
    }

    /** Bersihkan semua sesi lokal dan tandai sukses → UI redirect ke Login. */
    private fun clearSessionAndLogout() {
        tokenPreferences.clearAuthData()
        _deleteAccountState.value = DeleteAccountState.Success
    }

    fun resetDeleteAccountState() {
        _deleteAccountState.value = DeleteAccountState.Idle
    }

    // ── Factory ───────────────────────────────────────────────────────────────
    class ChangePasswordViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            val tokenPreferences = TokenPreferences(context)
            val repository = AuthRepository(
                RetrofitClient.authApiService,
                tokenPreferences,
            )
            @Suppress("UNCHECKED_CAST")
            return ChangePasswordViewModel(repository, tokenPreferences) as T
        }
    }
}