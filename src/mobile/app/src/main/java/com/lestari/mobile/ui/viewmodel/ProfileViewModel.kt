package com.lestari.mobile.ui.viewmodel

import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.data.model.UserProfile
import com.lestari.mobile.data.model.UserStats
import com.lestari.mobile.data.repository.UserRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(
    private val repository: UserRepository,
) : ViewModel() {

    private val _profile = MutableStateFlow<Resource<UserProfile>>(Resource.Loading)
    val profile: StateFlow<Resource<UserProfile>> = _profile

    private val _stats = MutableStateFlow<Resource<UserStats>>(Resource.Loading)
    val stats: StateFlow<Resource<UserStats>> = _stats

    // ── State upload foto dari ProfileScreen ──────────────────────────────────
    private val _photoUploadState = MutableStateFlow<Resource<UserProfile>?>(null)
    val photoUploadState: StateFlow<Resource<UserProfile>?> = _photoUploadState

    private val _photoVersion = MutableStateFlow(0L)
    val photoVersion: StateFlow<Long> = _photoVersion

    init {
        fetchProfile()
        fetchStats()
    }

    private fun fetchProfile() {
        viewModelScope.launch {
            Log.d("PROFILE_DEBUG", "fetchProfile: mulai load profile...")
            val result = repository.getProfile()
            _profile.value = result
            Log.d("PROFILE_DEBUG", "fetchProfile: selesai, result=$result")
        }
    }

    private fun fetchStats() {
        viewModelScope.launch {
            Log.d("PROFILE_DEBUG", "fetchStats: mulai load stats...")
            _stats.value = repository.getStats()
            Log.d("PROFILE_DEBUG", "fetchStats: selesai, result=${_stats.value}")
        }
    }

    // Dipanggil saat kembali dari EditProfileScreen
    fun refresh() {
        Log.d("PROFILE_DEBUG", "refresh: dipanggil, reload profile & stats")
        fetchProfile()
        fetchStats()
    }

    // Dipanggil dari tombol "Ganti Foto" di ProfileScreen
    fun uploadPhotoOnly(uri: Uri) {
        viewModelScope.launch {
            Log.d("PHOTO_UPLOAD_DEBUG", "uploadPhotoOnly: mulai upload uri=$uri")
            _photoUploadState.value = Resource.Loading

            // Ambil data profil saat ini agar field lain tidak ter-reset
            val currentProfile = (_profile.value as? Resource.Success)?.data
            if (currentProfile == null) {
                Log.d("PHOTO_UPLOAD_DEBUG", "uploadPhotoOnly: profil belum loaded, batalkan")
                _photoUploadState.value = Resource.Error("Profil belum dimuat. Coba lagi.")
                return@launch
            }

            val result = repository.updateProfile(
                namaLengkap = currentProfile.namaLengkap,
                noTelepon   = currentProfile.noTelepon.orEmpty(),
                kota        = currentProfile.kota.orEmpty(),
                photoUri    = uri,
            )

            when (result) {
                is Resource.Success -> {
                    Log.d("PHOTO_UPLOAD_DEBUG", "uploadPhotoOnly: upload berhasil, response foto=${result.data.fotoProfile}, url=${result.data.fotoProfilUrl}")

                    when (val refreshed = repository.getProfile()) {
                        is Resource.Success -> {
                            Log.d("PHOTO_UPLOAD_DEBUG", "uploadPhotoOnly: refresh profile berhasil, foto=${refreshed.data.fotoProfile}, url=${refreshed.data.fotoProfilUrl}")
                            _profile.value = Resource.Success(refreshed.data)
                            _photoUploadState.value = Resource.Success(refreshed.data)
                        }
                        is Resource.Error -> {
                            Log.d("PHOTO_UPLOAD_DEBUG", "uploadPhotoOnly: refresh profile gagal, pakai response upload. error=${refreshed.message}")
                            _profile.value = Resource.Success(result.data)
                            _photoUploadState.value = result
                        }
                        is Resource.Loading -> Unit
                    }
                    _photoVersion.value = System.currentTimeMillis()
                }
                is Resource.Error -> {
                    Log.d("PHOTO_UPLOAD_DEBUG", "uploadPhotoOnly: gagal, error=${result.message}")
                    _photoUploadState.value = result
                }
                else -> Unit
            }
        }
    }

    fun resetPhotoUploadState() {
        _photoUploadState.value = null
    }
}
