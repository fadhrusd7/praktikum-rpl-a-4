package com.lestari.mobile.ui.screen.profile

// ─── State form field ─────────────────────────────────────────────────────────
data class ChangePasswordFormState(
    val passwordLama:              String  = "",
    val passwordBaru:              String  = "",
    val konfirmasiPasswordBaru:    String  = "",

    // Error per-field
    val passwordLamaError:           String? = null,
    val passwordBaruError:           String? = null,
    val konfirmasiPasswordBaruError: String? = null,
)

// ─── State operasi simpan (submit) ────────────────────────────────────────────
sealed class ChangePasswordSaveState {
    object Idle    : ChangePasswordSaveState()
    object Saving  : ChangePasswordSaveState()
    object Success : ChangePasswordSaveState()
    data class Error(val message: String) : ChangePasswordSaveState()
}

// ─── One-shot event (Snackbar, navigasi) ──────────────────────────────────────
sealed class ChangePasswordEvent {
    data class ShowSnackbar(val message: String) : ChangePasswordEvent()
    object NavigateBack                          : ChangePasswordEvent()
}