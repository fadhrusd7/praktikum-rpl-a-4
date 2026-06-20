package com.lestari.mobile.ui.screen.profile

// ─── State form field ─────────────────────────────────────────────────────────
data class FeedbackFormState(
    val rating:    Int    = 0,      // 0 = belum dipilih, 1–5
    val isi:       String = "",

    // Error per-field
    val ratingError: String? = null,
    val isiError:    String? = null,
)

// ─── Batas karakter textarea ──────────────────────────────────────────────────
const val FEEDBACK_MAX_CHARS = 2000
const val FEEDBACK_MIN_CHARS = 10

// ─── State operasi kirim ──────────────────────────────────────────────────────
sealed class FeedbackSaveState {
    object Idle    : FeedbackSaveState()
    object Saving  : FeedbackSaveState()
    object Success : FeedbackSaveState()
    data class Error(val message: String) : FeedbackSaveState()
}

// ─── One-shot event ───────────────────────────────────────────────────────────
sealed class FeedbackEvent {
    data class ShowSnackbar(val message: String) : FeedbackEvent()
    object NavigateBack                          : FeedbackEvent()
}