package com.lestari.mobile.ui.app

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import kotlinx.coroutines.launch
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.ui.component.BottomNavigationBar
import com.lestari.mobile.model.MainTab
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.repository.ReportRepository
import com.lestari.mobile.data.repository.UserRepository
import com.lestari.mobile.data.repository.AuthRepository
import com.lestari.mobile.ui.screen.auth.AuthRoutes
import com.lestari.mobile.ui.screen.history.HistoryScreen
import com.lestari.mobile.ui.screen.map.MapScreen
import com.lestari.mobile.ui.screen.profile.ChangePasswordScreen
import com.lestari.mobile.ui.screen.profile.EditProfileScreen
import com.lestari.mobile.ui.screen.profile.FeedbackScreen
import com.lestari.mobile.ui.screen.profile.ProfileScreen
import com.lestari.mobile.ui.screen.report.ReportWizardScreen
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.ChangePasswordViewModel.ChangePasswordViewModelFactory
import com.lestari.mobile.ui.viewmodel.FeedbackViewModelFactory
import com.lestari.mobile.ui.viewmodel.HistoryViewModel
import com.lestari.mobile.ui.viewmodel.HistoryViewModelFactory
import com.lestari.mobile.ui.viewmodel.ProfileViewModel
import com.lestari.mobile.ui.viewmodel.ProfileViewModelFactory
import com.lestari.mobile.ui.viewmodel.ReportViewModel
import com.lestari.mobile.ui.viewmodel.ReportViewModel.ReportViewModelFactory
import com.lestari.mobile.data.repository.NotificationRepository
import com.lestari.mobile.ui.viewmodel.NotificationViewModel
import com.lestari.mobile.ui.component.NotificationBottomSheet
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.compose.currentStateAsState
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.lestari.mobile.controller.AppController

@Composable
fun LestariUserApp(
    controller: AppController,
    navController: NavController
) {
    val context = LocalContext.current
    val tokenPreferences = TokenPreferences(context)
    val token = tokenPreferences.getToken() ?: ""

    val userRepository = UserRepository(
        RetrofitClient.userApiService,
        token,
        context
    )

    val profileViewModel: ProfileViewModel = viewModel(
        factory = ProfileViewModelFactory(userRepository)
    )

    val historyViewModel: HistoryViewModel = viewModel(
        factory = HistoryViewModelFactory(
            ReportRepository(
                RetrofitClient.reportApiService,
                token
            )
        )
    )

    val reportViewModel: ReportViewModel = viewModel(
        factory = ReportViewModelFactory(
            ReportRepository(
                RetrofitClient.reportApiService,
                token
            )
        )
    )

    val reportRepository = ReportRepository(
        RetrofitClient.reportApiService,
        token
    )

    val notificationRepository = NotificationRepository(
        RetrofitClient.notificationApiService,
        token
    )

    val notificationViewModel: NotificationViewModel = viewModel(
        factory = NotificationViewModel.NotificationViewModelFactory(
            notificationRepository,
            reportRepository
        )
    )

    var showNotificationSheet by remember { mutableStateOf(false) }
    val unreadCount by notificationViewModel.unreadCount.collectAsStateWithLifecycle()

    // ── NOTIFICATION POLLING ──────────────────────────────────────────────────
    // Karena belum menggunakan FCM, kita lakukan pengecekan jumlah notifikasi 
    // secara berkala (setiap 30 detik) saat aplikasi aktif.
    LaunchedEffect(Unit) {
        while (true) {
            notificationViewModel.refreshUnreadCount()
            kotlinx.coroutines.delay(30_000) // 30 detik
        }
    }

    val coroutineScope = rememberCoroutineScope()

    // ── LOGOUT HANDLING ───────────────────────────────────────────────────────
    // Kita pasang listener di sini agar saat tombol logout di klik, 
    // aplikasi tahu harus berbuat apa (hapus token & pindah screen)
    controller.onLogoutRequested = {
        coroutineScope.launch {
            val latestToken = tokenPreferences.getToken() ?: ""
            if (latestToken.isNotBlank()) {
                val authRepository =
                    AuthRepository(
                        RetrofitClient.authApiService,
                        tokenPreferences
                    )
                // Coba logout di server, tapi jangan tunggu (ignore result)
                // agar user tetap bisa logout meskipun internet lambat
                authRepository.logoutApi(latestToken)
            }
            // 1. Hapus data session di HP
            tokenPreferences.clearAuthData()
            
            // 2. Tendang user kembali ke layar Login dan bersihkan history layar
            navController.navigate(AuthRoutes.LOGIN) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

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
                MainTab.Map     -> MapScreen(
                    onCreateReport = controller::openReportForm,
                    onNotificationClick = { showNotificationSheet = true },
                    unreadCount = unreadCount
                )
                MainTab.Report  -> ReportWizardScreen(
                    viewModel = reportViewModel,
                    onNotificationClick = { showNotificationSheet = true },
                    unreadCount = unreadCount,
                    onSubmitSuccess = { reportItem ->
                        historyViewModel.fetchReports()
                        controller.submitReport(reportItem)
                    })
                MainTab.History -> HistoryScreen(
                    viewModel = historyViewModel,
                    onNotificationClick = { showNotificationSheet = true },
                    unreadCount = unreadCount
                )
                MainTab.Profile -> {
                    val profileNavController = rememberNavController()
                    NavHost(navController = profileNavController, startDestination = "profile_main") {
                        composable("profile_main") { backStackEntry ->
                            LaunchedEffect(backStackEntry.lifecycle.currentStateAsState().value) {
                                if (backStackEntry.lifecycle.currentState == Lifecycle.State.RESUMED) {
                                    android.util.Log.d("PROFILE_DEBUG", "profile_main RESUMED - refresh")
                                    profileViewModel.refresh()
                                    notificationViewModel.refreshUnreadCount()
                                }
                            }
                            ProfileScreen(
                                onLogout = controller::logout,
                                onEditProfile = { profileNavController.navigate("edit_profile") },
                                onNavigateToChangePassword = { profileNavController.navigate("change_password") },
                                onNavigateToFeedback = { profileNavController.navigate("feedback") },
                                onNotificationClick = { showNotificationSheet = true },
                                unreadCount = unreadCount,
                                viewModel = profileViewModel
                            )
                        }
                        composable("edit_profile") {
                            EditProfileScreen(
                                onNavigateBack = { profileNavController.popBackStack() },
                                userRepository = userRepository
                            )
                        }
                        composable("change_password") {
                            ChangePasswordScreen(
                                onNavigateBack = { profileNavController.popBackStack() },
                                onAccountDeleted = {
                                    navController.navigate(AuthRoutes.LOGIN) {
                                        popUpTo(0) { inclusive = true }
                                    }
                                },
                                viewModel = viewModel(factory = ChangePasswordViewModelFactory(context))
                            )
                        }
                        composable("feedback") {
                            FeedbackScreen(
                                onNavigateBack = { profileNavController.popBackStack() },
                                viewModel = viewModel(factory = FeedbackViewModelFactory(userRepository))
                            )
                        }
                    }
                }
            }
        }

        if (showNotificationSheet) {
            NotificationBottomSheet(
                viewModel = notificationViewModel,
                onDismiss = { showNotificationSheet = false },
                onReportClick = { reportId ->
                    showNotificationSheet = false
                    // Navigasi ke Riwayat dan buka detail
                    controller.selectTab(MainTab.History)
                    historyViewModel.fetchDetail(reportId)
                }
            )
        }
    }
}
