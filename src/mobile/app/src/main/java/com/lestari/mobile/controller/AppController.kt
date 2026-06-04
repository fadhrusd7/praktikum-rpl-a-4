package com.lestari.mobile.controller

import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.lestari.mobile.model.MainTab
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.model.seedReports

class AppController {
    var selectedTab by mutableStateOf(MainTab.Map)
        private set

    val reports = mutableStateListOf<ReportItem>().apply {
        addAll(seedReports)
    }

    fun selectTab(tab: MainTab) {
        selectedTab = tab
    }

    fun openReportForm() {
        selectedTab = MainTab.Report
    }

    fun submitReport(report: ReportItem) {
        reports.add(0, report)
        selectedTab = MainTab.History
    }

    fun logout() {
        selectedTab = MainTab.Map
    }
}
