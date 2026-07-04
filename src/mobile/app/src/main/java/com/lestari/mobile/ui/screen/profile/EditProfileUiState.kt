package com.lestari.mobile.ui.screen.profile

import android.net.Uri

data class EditProfileFormState(
    // ── Field sesuai model backend ────────────────────────────────────────────
    val namaDepan:    String = "",
    val namaBelakang: String = "",
    val email:        String = "",   // read-only
    val noTelepon:    String = "",
    val kota:         String = "",

    // ── Foto ──────────────────────────────────────────────────────────────────
    val profilePhotoUrl:  String? = null,
    val selectedPhotoUri: Uri?    = null,

    // ── Error per-field ───────────────────────────────────────────────────────
    val namaDepanError:    String? = null,
    val namaBelakangError: String? = null,
    val noTeleponError:    String? = null,
)

sealed class ProfileLoadState {
    object Idle    : ProfileLoadState()
    object Loading : ProfileLoadState()
    object Success : ProfileLoadState()
    data class Error(val message: String) : ProfileLoadState()
}

sealed class ProfileSaveState {
    object Idle    : ProfileSaveState()
    object Saving  : ProfileSaveState()
    object Success : ProfileSaveState()
    data class Error(val message: String) : ProfileSaveState()
}

sealed class EditProfileEvent {
    data class ShowSnackbar(val message: String) : EditProfileEvent()
    object NavigateBack : EditProfileEvent()
}