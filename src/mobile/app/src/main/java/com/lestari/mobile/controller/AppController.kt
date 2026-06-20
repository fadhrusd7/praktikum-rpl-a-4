package com.lestari.mobile.controller

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.lestari.mobile.model.MainTab
import com.lestari.mobile.model.ReportItem

class AppController {
    var selectedTab by mutableStateOf(MainTab.Map)
        private set

    var isEditingProfile by mutableStateOf(false)
        private set

    // Callback yang akan diisi dari LestariUserApp untuk trigger logout ke nav
    // Ini pola "callback injection" agar AppController tidak perlu tahu soal NavController
    var onLogoutRequested: (() -> Unit)? = null

    val reports = mutableStateListOf<ReportItem>().apply {

    }

    fun selectTab(tab: MainTab) {
        selectedTab = tab
        isEditingProfile = false // Reset edit state saat pindah tab
    }

    fun openEditProfile() {
        isEditingProfile = true
    }

    fun closeEditProfile() {
        isEditingProfile = false
    }

    fun openReportForm() {
        selectedTab = MainTab.Report
        isEditingProfile = false
    }

    fun submitReport(report: ReportItem) {
        selectedTab = MainTab.History
    }

    // ── BUG 4 DIPERBAIKI ─────────────────────────────────────────────────────
    // SEBELUMNYA: hanya reset tab → token tetap ada → session tidak benar-benar berakhir
    // SESUDAH   : trigger callback ke LestariUserApp yang akan:
    //             1. Panggil viewModel.logout() → hapus token
    //             2. Navigate ke Login
    // ─────────────────────────────────────────────────────────────────────────
    fun logout() {
        onLogoutRequested?.invoke()
    }
}