package com.lestari.mobile.ui.viewmodel

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.data.repository.ReportRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import androidx.lifecycle.ViewModelProvider

class ReportViewModel(private val repository: ReportRepository) : ViewModel() {

    // State submit laporan
    private val _submitState = MutableStateFlow<Resource<ReportItem>?>(null)
    val submitState: StateFlow<Resource<ReportItem>?> = _submitState

    fun createReport(
        context: Context,
        judul: String,
        kategori: String,
        deskripsi: String,
        lokasi: String,
        latitude: Double = -7.5695,   // default koordinat Surakarta
        longitude: Double = 110.8270,
        isAnonymous: Boolean,
        photoUri: Uri?
    ) {
        viewModelScope.launch {
            _submitState.value = Resource.Loading
            _submitState.value = repository.createReport(
                context   = context,
                judul     = judul,
                kategori  = kategori,
                deskripsi = deskripsi,
                lokasi    = lokasi,
                latitude  = latitude,
                longitude = longitude,
                isAnonymous = isAnonymous,
                photoUri  = photoUri
            )
        }
    }

    fun resetSubmitState() {
        _submitState.value = null
    }
    class ReportViewModelFactory(
        private val repository: ReportRepository
    ) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            @Suppress("UNCHECKED_CAST")
            return ReportViewModel(repository) as T
}}}
