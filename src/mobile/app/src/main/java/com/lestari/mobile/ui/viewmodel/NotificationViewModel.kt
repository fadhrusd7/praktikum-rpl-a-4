package com.lestari.mobile.ui.viewmodel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.data.model.NotificationData
import com.lestari.mobile.data.repository.NotificationRepository
import com.lestari.mobile.data.repository.ReportRepository
import com.lestari.mobile.util.Resource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
class NotificationViewModel(
    private val notificationRepository: NotificationRepository,
    private val reportRepository: ReportRepository
) : ViewModel() {
    private val _notifications = MutableStateFlow<Resource<List<NotificationData>>>(Resource.Loading)
    val notifications: StateFlow<Resource<List<NotificationData>>> = _notifications
    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount
    private val _reportDetail = MutableStateFlow<Resource<ReportItem>?>(null)
    val reportDetail: StateFlow<Resource<ReportItem>?> = _reportDetail
    init {
        refreshUnreadCount()
    }
    fun fetchNotifications() {
        viewModelScope.launch {
            _notifications.value = Resource.Loading
            _notifications.value = notificationRepository.getNotifications()
        }
    }
    fun refreshUnreadCount() {
        viewModelScope.launch {
            val result = notificationRepository.getUnreadCount()
            if (result is Resource.Success) {
                _unreadCount.value = result.data
            }
        }
    }
    fun markAllAsRead() {
        viewModelScope.launch {
            val result = notificationRepository.markAllRead()
            if (result is Resource.Success) {
                _unreadCount.value = 0
                // Refresh list notifikasi lokal agar ditandai dibaca langsung di UI
                val currentListResource = _notifications.value
                if (currentListResource is Resource.Success) {
                    val updatedList = currentListResource.data.map {
                        it.copy(is_read = "true")
                    }
                    _notifications.value = Resource.Success(updatedList)
                }
            }
        }
    }
    fun fetchReportDetail(reportId: Int) {
        viewModelScope.launch {
            _reportDetail.value = Resource.Loading
            _reportDetail.value = reportRepository.getReportDetail(reportId)
        }
    }
    fun clearReportDetail() {
        _reportDetail.value = null
    }
    class NotificationViewModelFactory(
        private val notificationRepository: NotificationRepository,
        private val reportRepository: ReportRepository
    ) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(NotificationViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return NotificationViewModel(notificationRepository, reportRepository) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}