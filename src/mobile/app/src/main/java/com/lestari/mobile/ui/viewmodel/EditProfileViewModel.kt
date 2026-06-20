package com.lestari.mobile.ui.viewmodel

import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.data.repository.UserRepository
import com.lestari.mobile.ui.screen.profile.EditProfileEvent
import com.lestari.mobile.ui.screen.profile.EditProfileFormState
import com.lestari.mobile.ui.screen.profile.ProfileLoadState
import com.lestari.mobile.ui.screen.profile.ProfileSaveState
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class EditProfileViewModel(
    private val userRepository: UserRepository,
) : ViewModel() {

    // States

    private val _loadState = MutableStateFlow<ProfileLoadState>(ProfileLoadState.Idle)
    val loadState: StateFlow<ProfileLoadState> = _loadState.asStateFlow()

    private val _saveState = MutableStateFlow<ProfileSaveState>(ProfileSaveState.Idle)
    val saveState: StateFlow<ProfileSaveState> = _saveState.asStateFlow()

    private val _formState = MutableStateFlow(EditProfileFormState())
    val formState: StateFlow<EditProfileFormState> = _formState.asStateFlow()

    private val _events = Channel<EditProfileEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    // ── Init ──────────────────────────────────────────────────────────────────

    init { loadProfile() }

    // ── Load ──────────────────────────────────────────────────────────────────

    fun loadProfile() {
        viewModelScope.launch {
            _loadState.value = ProfileLoadState.Loading
            Log.d("PROFILE_DEBUG", "Mulai load profile...")
            when (val result = userRepository.getProfile()) {
                is Resource.Success -> {
                    val p = result.data
                    Log.d("PROFILE_DEBUG", "Berhasil load profile: namaLengkap=${p.namaLengkap}, foto=${p.fotoProfile}, url=${p.fotoProfilUrl}")

                    // SMART SPLIT: Jika namaDepan kosong dari backend, pecah dari namaLengkap
                    val parts = p.namaLengkap.trim().split(" ", limit = 2)
                    val namaDepan: String = parts.getOrElse(0) {""}
                    val namaBelakang = parts.getOrElse(1) {""}

                    Log.d("PROFILE_DEBUG", "Split nama: depan='$namaDepan', belakang='$namaBelakang'")

                    _formState.update {
                        it.copy(
                            namaDepan       = namaDepan,
                            namaBelakang    = namaBelakang,
                            email           = p.email,
                            noTelepon       = p.noTelepon.orEmpty(),
                            kota            = p.kota.orEmpty(),
                            profilePhotoUrl = p.displayPhotoUrl,
                        )
                    }
                    _loadState.value = ProfileLoadState.Success
                }
                is Resource.Error -> {
                    _loadState.value = ProfileLoadState.Error(result.message)
                }
                is Resource.Loading -> { /* Handled at start */ }
            }
        }
    }

    // ── Field handlers ────────────────────────────────────────────────────────

    fun onNamaDepanChange(v: String)    = _formState.update { it.copy(namaDepan = v,    namaDepanError = null) }
    fun onNamaBelakangChange(v: String) = _formState.update { it.copy(namaBelakang = v, namaBelakangError = null) }
    fun onNoTeleponChange(v: String)    = _formState.update { it.copy(noTelepon = v,    noTeleponError = null) }
    fun onKotaChange(v: String)         = _formState.update { it.copy(kota = v) }
    fun onPhotoSelected(uri: Uri?)      = _formState.update { it.copy(selectedPhotoUri = uri) }

    // Save

    fun saveProfile() {
        if (!validateForm()) return

        viewModelScope.launch {
            _saveState.value = ProfileSaveState.Saving
            val f = _formState.value

            val namaLengkap = "${f.namaDepan.trim()} ${f.namaBelakang.trim()}".trim()

            val result = userRepository.updateProfile(
                namaLengkap = namaLengkap,
                noTelepon = f.noTelepon.trim(),
                kota = f.kota.trim(),
                photoUri  = f.selectedPhotoUri
            )

            when (result) {
                is Resource.Success -> {
                    val p = result.data
                    Log.d("UPDATE_PROFILE_DEBUG", "update berhasil: namaLengkap=${p.namaLengkap}, foto=${p.fotoProfile}, url=${p.fotoProfilUrl}")

                    val parts = p.namaLengkap.trim().split(" ", limit = 2)
                    val namaDepan = parts.getOrElse(0) {""}
                    val namaBelakang = parts.getOrElse(1) {""}
                    
                    _formState.update {
                        it.copy(
                            namaDepan        = namaDepan,
                            namaBelakang     = namaBelakang,
                            email            = p.email,
                            noTelepon        = p.noTelepon.orEmpty(),
                            kota             = p.kota.orEmpty(),
                            profilePhotoUrl  = p.displayPhotoUrl,
                            selectedPhotoUri = null,
                        )
                    }
                    _saveState.value = ProfileSaveState.Success
                    _events.send(EditProfileEvent.ShowSnackbar("Profil berhasil diperbarui"))
                    _events.send(EditProfileEvent.NavigateBack)
                }
                is Resource.Error -> {
                    _saveState.value = ProfileSaveState.Error(result.message)
                    _events.send(EditProfileEvent.ShowSnackbar(result.message))
                }
                is Resource.Loading -> { /* Handled at start */ }
            }
        }
    }

    // ── Validasi ──────────────────────────────────────────────────────────────

    private fun validateForm(): Boolean {
        val f = _formState.value

        val namaDepanErr = when {
            f.namaDepan.isBlank()         -> "Nama depan tidak boleh kosong"
            f.namaDepan.trim().length < 2 -> "Nama depan minimal 2 karakter"
            else -> null
        }
        val namaBelakangErr = when {
            f.namaBelakang.isBlank() -> "Nama belakang tidak boleh kosong"
            else -> null
        }
        val noTeleponErr = when {
            f.noTelepon.isBlank() -> "Nomor telepon tidak boleh kosong"
            !f.noTelepon.matches(Regex("^(\\+62|62|0)[0-9]{8,12}$")) ->
                "Format tidak valid (contoh: +6281234567890)"
            else -> null
        }

        _formState.update {
            it.copy(
                namaDepanError    = namaDepanErr,
                namaBelakangError = namaBelakangErr,
                noTeleponError    = noTeleponErr,
            )
        }

        return listOf(namaDepanErr, namaBelakangErr, noTeleponErr).all { it == null }
    }

    // ── Factory — sesuai pola ViewModelFactory project ────────────────────────

    class Factory(
        private val userRepository: UserRepository,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(EditProfileViewModel::class.java)) {
                return EditProfileViewModel(userRepository) as T
            }
            throw IllegalArgumentException("Unknown ViewModel: ${modelClass.name}")
        }
    }
}
