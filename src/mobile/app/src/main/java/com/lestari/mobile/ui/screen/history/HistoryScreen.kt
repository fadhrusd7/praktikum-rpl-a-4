package com.lestari.mobile.ui.screen.history

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.component.StatusPill
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.HistoryViewModel
import com.lestari.mobile.util.Resource

@Composable
fun HistoryScreen(
    viewModel: HistoryViewModel,
    onNotificationClick: () -> Unit,
    unreadCount: Int
) {
    val reportsState by viewModel.reports.collectAsState()
    val detailState  by viewModel.detailState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

    // ── Refresh data setiap kali layar kembali aktif ──
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.fetchReports()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val reports = when (val s = reportsState) {
        is Resource.Success -> s.data
        else -> emptyList()
    }

    var selectedFilter by rememberSaveable { mutableStateOf("Semua") }
    var query          by rememberSaveable { mutableStateOf("") }
    // Simpan ReportItem ringan (dari list) untuk fallback judul/nomor saat loading detail
    var pendingReport  by remember { mutableStateOf<ReportItem?>(null) }

    val filters = listOf("Semua", "Tertunda", "Terverifikasi", "Selesai", "Ditolak")

    val visibleReports = reports
        .filter { selectedFilter == "Semua" || it.status.label == selectedFilter }
        .filter { r ->
            val s = query.trim()
            s.isBlank() ||
                    r.title.contains(s, ignoreCase = true) ||
                    r.number.contains(s, ignoreCase = true) ||
                    r.category.contains(s, ignoreCase = true) ||
                    r.location.contains(s, ignoreCase = true)
        }

    // ── Saat detail sukses di-load → tampilkan ReportDetailScreen ────────────
    val loadedDetail = (detailState as? Resource.Success)?.data
    if (loadedDetail != null) {
        ReportDetailScreen(
            report = loadedDetail,
            onBack = { viewModel.clearDetail() }
        )
        return
    }

    // ── Saat loading detail → tampilkan skeleton/loading di atas list ─────────
    if (detailState is Resource.Loading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(color = AppColors.Forest)
                Spacer(Modifier.height(12.dp))
                Text(
                    text  = "Memuat detail laporan...",
                    color = AppColors.Muted,
                    fontSize = 13.sp
                )
            }
        }
        return
    }

    // ── Error saat fetch detail → snackbar, lalu kembali ke list ─────────────
    val detailError = (detailState as? Resource.Error)?.message
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(detailError) {
        if (detailError != null) {
            snackbarHostState.showSnackbar(
                message  = detailError,
                duration = SnackbarDuration.Short
            )
            viewModel.clearDetail()
        }
    }

    Scaffold(
        snackbarHost      = { SnackbarHost(snackbarHostState) },
        containerColor    = AppColors.Page,
        topBar = {
            AppHeader(
                title = "Riwayat Laporan",
                backgroundColor = AppColors.Page,
                onNotificationClick = onNotificationClick,
                unreadCount = unreadCount
            )
        }
    ) { innerPadding ->
        Column(
            Modifier
                .fillMaxSize()
                .background(AppColors.Page)
                .padding(innerPadding)
        ) {
            if (reportsState is Resource.Loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = AppColors.Forest)
                }
                return@Scaffold
            }

            if (reportsState is Resource.Error) {
                Box(
                    Modifier.fillMaxSize().padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text  = (reportsState as Resource.Error).message,
                        color = AppColors.Danger
                    )
                }
                return@Scaffold
            }

            LazyColumn(
                contentPadding      = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    OutlinedTextField(
                        value         = query,
                        onValueChange = { query = it },
                        placeholder   = { Text("Cari Laporan...", color = AppColors.Muted) },
                        shape         = RoundedCornerShape(24.dp),
                        modifier      = Modifier.fillMaxWidth(),
                        singleLine    = true,
                        colors        = OutlinedTextFieldDefaults.colors(
                            focusedTextColor        = AppColors.TextPrimary,
                            unfocusedTextColor      = AppColors.TextPrimary,
                            focusedContainerColor   = AppColors.Page,
                            unfocusedContainerColor = AppColors.Page,
                            focusedBorderColor      = AppColors.Forest,
                            unfocusedBorderColor    = AppColors.Border,
                            cursorColor             = AppColors.Forest
                        )
                    )
                    Spacer(Modifier.height(12.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier              = Modifier.horizontalScroll(rememberScrollState())
                    ) {
                        filters.forEach { filter ->
                            FilterChip(
                                selected = selectedFilter == filter,
                                onClick  = { selectedFilter = filter },
                                label    = { Text(filter, fontSize = 11.sp) }
                            )
                        }
                    }
                }

                if (visibleReports.isEmpty()) {
                    item {
                        Text(
                            text     = "Belum ada laporan yang cocok.",
                            color    = AppColors.Muted,
                            modifier = Modifier.padding(top = 24.dp)
                        )
                    }
                }

                items(visibleReports) { report ->
                    HistoryCard(
                        report  = report,
                        onClick = {
                            pendingReport = report
                            viewModel.fetchDetail(report.id) // ← fetch dengan logs
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun HistoryCard(report: ReportItem, onClick: () -> Unit) {
    Card(
        modifier  = Modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(8.dp),
        colors    = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(
                        report.title,
                        fontWeight = FontWeight.Bold,
                        fontSize   = 16.sp,
                        maxLines   = 1,
                        overflow   = TextOverflow.Ellipsis,
                        color      = AppColors.TextPrimary
                    )
                    Text(report.number, color = AppColors.Muted, fontSize = 11.sp)
                }
                StatusPill(report.status)
            }
            AssistChip(
                onClick = {},
                label   = { Text(report.category, fontSize = 11.sp, color = AppColors.TextPrimary) }
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    report.date,
                    color    = AppColors.Muted,
                    fontSize = 11.sp,
                    modifier = Modifier.weight(1f)
                )
                OutlinedButton(
                    onClick        = onClick,
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                    modifier       = Modifier.height(34.dp)
                ) {
                    Text("Detail", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AppColors.Forest)
                }
            }
        }
    }
}