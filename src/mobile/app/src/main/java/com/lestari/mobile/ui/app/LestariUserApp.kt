package com.lestari.mobile.ui.app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import com.lestari.mobile.controller.AppController
import com.lestari.mobile.model.MainTab
import com.lestari.mobile.ui.component.BottomNavigationBar
import com.lestari.mobile.ui.screen.history.HistoryScreen
import com.lestari.mobile.ui.screen.map.MapScreen
import com.lestari.mobile.ui.screen.profile.ProfileScreen
import com.lestari.mobile.ui.screen.report.ReportWizardScreen
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun LestariUserApp(controller: AppController = remember { AppController() }) {
    Scaffold(
        containerColor = AppColors.Page,
        bottomBar = {
            BottomNavigationBar(
                selectedTab = controller.selectedTab,
                onSelect = controller::selectTab
            )
        }
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            color = AppColors.Page
        ) {
            when (controller.selectedTab) {
                MainTab.Map -> MapScreen(onCreateReport = controller::openReportForm)
                MainTab.Report -> ReportWizardScreen(onSubmit = controller::submitReport)
                MainTab.History -> HistoryScreen(reports = controller.reports)
                MainTab.Profile -> ProfileScreen(onLogout = controller::logout)
            }
        }
    }
}
