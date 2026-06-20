package com.lestari.mobile.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.data.repository.ReportRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class HistoryViewModel(private val repository: ReportRepository) : ViewModel() {

    // ── Daftar laporan ────────────────────────────────────────────────────────
    private val _reports = MutableStateFlow<Resource<List<ReportItem>>>(Resource.Loading)
    val reports: StateFlow<Resource<List<ReportItem>>> = _reports

    // ── Detail laporan (dengan logs) ──────────────────────────────────────────
    private val _detailState = MutableStateFlow<Resource<ReportItem>?>(null)
    val detailState: StateFlow<Resource<ReportItem>?> = _detailState

    init { fetchReports() }

    fun fetchReports() {
        viewModelScope.launch {
            _reports.value = Resource.Loading
            _reports.value = repository.getMyReports()
        }
    }

    // Dipanggil saat user tap "Detail" — fetch ulang dengan logs
    fun fetchDetail(reportId: Int) {
        viewModelScope.launch {
            _detailState.value = Resource.Loading
            _detailState.value = repository.getReportDetail(reportId)
        }
    }

    fun clearDetail() {
        _detailState.value = null
    }
}

