package com.lestari.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.data.repository.ReportRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class MapUiState {
    object Loading : MapUiState()
    data class Success(val reports: List<ReportItem>) : MapUiState()
    data class Error(val message: String) : MapUiState()
}

class MapViewModel(
    private val repository: ReportRepository
) : ViewModel() {

    // ── Daftar marker untuk peta ──────────────────────────────────────────────
    private val _uiState = MutableStateFlow<MapUiState>(MapUiState.Loading)
    val uiState: StateFlow<MapUiState> = _uiState

    // ── Detail laporan terpilih (dengan logs lengkap) ─────────────────────────
    // Sengaja dipisah dari _uiState agar fetch detail TIDAK memicu reload
    // daftar marker / peta. Pola ini mengikuti HistoryViewModel.detailState.
    private val _detailState = MutableStateFlow<Resource<ReportItem>?>(null)
    val detailState: StateFlow<Resource<ReportItem>?> = _detailState

    init {
        loadReports()
    }

    fun loadReports() {
        viewModelScope.launch {
            _uiState.value = MapUiState.Loading
            when (val result = repository.getAllReports()) {
                is Resource.Success -> _uiState.value = MapUiState.Success(result.data)
                is Resource.Error   -> _uiState.value = MapUiState.Error(result.message)
                is Resource.Loading -> _uiState.value = MapUiState.Loading
            }
        }
    }

    // Dipanggil saat user tap "Detail" di bottom sheet ringkasan marker.
    // Fetch ulang ke server agar logs & status paling update (bukan reuse
    // data ringkasan dari marker).
    fun fetchDetail(reportId: Int) {
        viewModelScope.launch {
            _detailState.value = Resource.Loading
            _detailState.value = repository.getReportDetail(reportId)
        }
    }

    // Dipanggil saat user menutup detail (tombol back) untuk kembali ke
    // tampilan peta. Tidak memicu reload marker karena _uiState tidak disentuh.
    fun clearDetail() {
        _detailState.value = null
    }
}