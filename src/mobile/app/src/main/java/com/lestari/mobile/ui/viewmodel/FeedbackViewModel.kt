package com.lestari.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.data.repository.UserRepository
import com.lestari.mobile.ui.screen.profile.FEEDBACK_MAX_CHARS
import com.lestari.mobile.ui.screen.profile.FEEDBACK_MIN_CHARS
import com.lestari.mobile.ui.screen.profile.FeedbackEvent
import com.lestari.mobile.ui.screen.profile.FeedbackFormState
import com.lestari.mobile.ui.screen.profile.FeedbackSaveState
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class FeedbackViewModel(
    private val repository: UserRepository,
) : ViewModel() {

    // ── Form state ────────────────────────────────────────────────────────────
    private val _form = MutableStateFlow(FeedbackFormState())
    val form: StateFlow<FeedbackFormState> = _form.asStateFlow()

    // ── Save state ────────────────────────────────────────────────────────────
    private val _saveState = MutableStateFlow<FeedbackSaveState>(FeedbackSaveState.Idle)
    val saveState: StateFlow<FeedbackSaveState> = _saveState.asStateFlow()

    // ── One-shot events ───────────────────────────────────────────────────────
    private val _events = Channel<FeedbackEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    // ── Field handlers ────────────────────────────────────────────────────────

    fun onRatingChange(value: Int) {
        _form.update { it.copy(rating = value, ratingError = null) }
    }

    fun onIsiChange(value: String) {
        // Batasi input maksimal FEEDBACK_MAX_CHARS karakter
        if (value.length > FEEDBACK_MAX_CHARS) return
        _form.update { it.copy(isi = value, isiError = null) }
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    fun submit() {
        if (!validate()) return

        val current = _form.value
        viewModelScope.launch {
            _saveState.value = FeedbackSaveState.Saving

            val result = repository.sendFeedback(
                rating = current.rating,
                isi    = current.isi.trim(),
            )

            when (result) {
                is Resource.Success -> {
                    _saveState.value = FeedbackSaveState.Success
                    _form.value      = FeedbackFormState()  // reset form
                    _events.send(FeedbackEvent.ShowSnackbar("Terima kasih! Feedback Anda telah terkirim."))
                    _events.send(FeedbackEvent.NavigateBack)
                }
                is Resource.Error -> {
                    _saveState.value = FeedbackSaveState.Error(result.message)
                    _events.send(FeedbackEvent.ShowSnackbar(result.message))
                }
                is Resource.Loading -> Unit
            }
        }
    }

    // ── Validasi lokal ────────────────────────────────────────────────────────

    private fun validate(): Boolean {
        val f = _form.value

        val ratingError = if (f.rating == 0) "Pilih rating bintang terlebih dahulu." else null
        val isiError = when {
            f.isi.isBlank()              -> "Masukan atau saran wajib diisi."
            f.isi.trim().length < FEEDBACK_MIN_CHARS -> "Masukan minimal $FEEDBACK_MIN_CHARS karakter."
            else                         -> null
        }

        _form.update { it.copy(ratingError = ratingError, isiError = isiError) }
        return ratingError == null && isiError == null
    }

    fun resetSaveState() {
        _saveState.value = FeedbackSaveState.Idle
    }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

class FeedbackViewModelFactory(
    private val repository: UserRepository,
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return FeedbackViewModel(repository) as T
    }
}