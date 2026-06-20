package com.lestari.mobile.ui.screen.map

import android.Manifest
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.ArrowBackIosNew
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.lestari.mobile.map.MapTilerView
import com.lestari.mobile.model.ReportCategories
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.data.TokenPreferences
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.data.repository.ReportRepository
import com.lestari.mobile.ui.screen.map.ReportDetailContent
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.MapUiState
import com.lestari.mobile.ui.viewmodel.MapViewModel
import com.lestari.mobile.util.LocationHelper
import com.lestari.mobile.util.Resource
import com.lestari.mobile.data.geocode
import com.maptiler.maptilersdk.map.LngLat
import com.maptiler.maptilersdk.map.MTMapViewController
import com.maptiler.maptilersdk.map.options.MTCameraOptions
import kotlinx.coroutines.launch

private const val FILTER_ALL = "Semua"

@Composable
fun MapScreen(
    onCreateReport: () -> Unit,
    onNotificationClick: () -> Unit,
    unreadCount: Int
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selectedReport by remember { mutableStateOf<ReportItem?>(null) }

    // Map & Location States
    val controller = remember { MTMapViewController(context) }
    var userLocation by remember { mutableStateOf<LngLat?>(null) }
    var searchLocation by remember { mutableStateOf<LngLat?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var isSearching by remember { mutableStateOf(false) }

    val viewModel: MapViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val token = TokenPreferences(context).getToken() ?: ""
                val api = RetrofitClient.reportApiService
                @Suppress("UNCHECKED_CAST")
                return MapViewModel(ReportRepository(api, token)) as T
            }
        }
    )

    val uiState by viewModel.uiState.collectAsState()
    val detailState by viewModel.detailState.collectAsState()

    // Simpan ReportItem ringan (dari marker) untuk fallback judul/nomor saat
    // detail sedang loading — pola sama seperti HistoryScreen.pendingReport
    var pendingReport by remember { mutableStateOf<ReportItem?>(null) }

    // "Semua" = tampilkan semua marker; satu kategori = filter hanya itu
    var activeFilter by remember { mutableStateOf(FILTER_ALL) }

    // Daftar chip: "Semua" + semua kategori kecuali "Lain-Lain"
    val filterOptions = listOf(FILTER_ALL) + ReportCategories.filterNot { it == "Lain-Lain" }

    // Request Permission Launcher
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fineGranted || coarseGranted) {
            LocationHelper.getCurrentLocation(
                context = context,
                onSuccess = { lat, lng ->
                    userLocation = LngLat(lng, lat)
                },
                onFailure = { /* abaikan di startup */ }
            )
        } else {
            android.widget.Toast.makeText(context, "Izin lokasi ditolak. Penunjuk GPS dinonaktifkan.", android.widget.Toast.LENGTH_LONG).show()
        }
    }

    // Ambil lokasi startup
    LaunchedEffect(Unit) {
        if (LocationHelper.hasLocationPermission(context)) {
            LocationHelper.getCurrentLocation(
                context = context,
                onSuccess = { lat, lng ->
                    userLocation = LngLat(lng, lat)
                },
                onFailure = { /* abaikan di startup */ }
            )
        } else {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    // ── Snackbar untuk error fetch detail ──────────────────────────────────────
    val snackbarHostState = remember { SnackbarHostState() }
    val detailError = (detailState as? Resource.Error)?.message
    LaunchedEffect(detailError) {
        if (detailError != null) {
            snackbarHostState.showSnackbar(
                message  = detailError,
                duration = SnackbarDuration.Short
            )
            viewModel.clearDetail()
            pendingReport = null
        }
    }

    // `true` ketika user sedang membuka tampilan Detail Laporan di dalam tab Map
    // (bukan pindah tab — selectedTab di AppController tidak disentuh).
    val isShowingDetail = detailState != null && detailState !is Resource.Error

    Box(Modifier.fillMaxSize()) {
        AnimatedContent(
            targetState = isShowingDetail,
            transitionSpec = {
                if (targetState) {
                    // Masuk ke Detail: slide-up dari bawah
                    (slideInVertically(animationSpec = tween(300)) { fullHeight -> fullHeight } + fadeIn(tween(300))) togetherWith
                            (fadeOut(tween(150)))
                } else {
                    // Kembali ke Map: fade saja (peta tidak perlu ikut slide turun)
                    fadeIn(tween(200)) togetherWith
                            (slideOutVertically(animationSpec = tween(300)) { fullHeight -> fullHeight } + fadeOut(tween(300)))
                }
            },
            label = "map_to_detail_transition"
        ) { showingDetail ->
            if (showingDetail) {
                MapReportDetailView(
                    detailState = detailState,
                    pendingReport = pendingReport,
                    onBack = {
                        viewModel.clearDetail()
                        pendingReport = null
                    }
                )
            } else {
                MapContentView(
                    context = context,
                    scope = scope,
                    controller = controller,
                    userLocation = userLocation,
                    onUserLocationChange = { userLocation = it },
                    searchLocation = searchLocation,
                    onSearchLocationChange = { searchLocation = it },
                    searchQuery = searchQuery,
                    onSearchQueryChange = { searchQuery = it },
                    isSearching = isSearching,
                    onIsSearchingChange = { isSearching = it },
                    activeFilter = activeFilter,
                    onActiveFilterChange = { activeFilter = it },
                    filterOptions = filterOptions,
                    uiState = uiState,
                    onCreateReport = onCreateReport,
                    onNotificationClick = onNotificationClick,
                    unreadCount = unreadCount,
                    onMarkerClick = { report -> selectedReport = report },
                    permissionLauncher = permissionLauncher
                )
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )
    }

    // Bottom Sheet ringkasan — di luar Box agar tidak ter-clip layout.
    // Tidak ditampilkan saat mode Detail aktif (selectedReport sengaja
    // tidak diubah, jadi saat balik dari Detail, sheet TIDAK muncul lagi
    // otomatis kecuali user klik marker lagi).
    if (!isShowingDetail) {
        selectedReport?.let { report ->
            ReportMapBottomSheet(
                report = report,
                onDismiss = { selectedReport = null },
                onDetailClick = {
                    pendingReport = report
                    selectedReport = null
                    viewModel.fetchDetail(report.id)
                }
            )
        }
    }
}

/**
 * Tampilan Detail Laporan di dalam tab Map.
 *
 * Reuse [ReportDetailContent] yang sama dipakai oleh ReportDetailScreen di
 * History — top bar dibuat sendiri di sini (mirip ReportDetailScreen) supaya
 * konsisten secara visual, namun composable ini TIDAK mengubah selectedTab
 * di AppController. Back hanya mengembalikan tampilan ke Map, bottom nav
 * tetap di tab Map.
 */
@Composable
private fun MapReportDetailView(
    detailState: Resource<ReportItem>?,
    pendingReport: ReportItem?,
    onBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.Page)
    ) {
        // ── Top bar (konsisten dengan ReportDetailScreen di History) ───────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(AppColors.Page)
                .padding(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack, modifier = Modifier.size(32.dp)) {
                Icon(
                    imageVector        = Icons.Outlined.ArrowBackIosNew,
                    contentDescription = "Kembali",
                    tint               = AppColors.Forest,
                    modifier           = Modifier.size(18.dp)
                )
            }
            Spacer(Modifier.width(8.dp))
            Text("Peta", color = AppColors.Forest, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Text("  ›  ", color = AppColors.Muted, fontSize = 13.sp)
            Text(
                text = (detailState as? Resource.Success)?.data?.number
                    ?: pendingReport?.number
                    ?: "Detail Laporan",
                color = AppColors.Muted,
                fontSize = 13.sp
            )
        }

        when (detailState) {
            is Resource.Success -> {
                ReportDetailContent(
                    report   = detailState.data,
                    modifier = Modifier.weight(1f).fillMaxWidth()
                )
            }
            is Resource.Loading, null -> {
                Box(
                    Modifier.weight(1f).fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = AppColors.Forest)
                        Spacer(Modifier.height(12.dp))
                        Text(
                            text  = pendingReport?.title ?: "Memuat detail laporan...",
                            color = AppColors.Muted,
                            fontSize = 13.sp
                        )
                    }
                }
            }
            is Resource.Error -> {
                // Error ditangani via Snackbar di level MapScreen; tampilan ini
                // hanya fallback singkat sebelum clearDetail() dipanggil.
                Box(
                    Modifier.weight(1f).fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text  = detailState.message,
                        color = AppColors.Danger
                    )
                }
            }
        }
    }
}

/**
 * Seluruh tampilan peta (search bar, filter chip, MapTiler view, tombol GPS).
 * Diekstrak ke composable terpisah agar bisa di-switch dengan AnimatedContent
 * tanpa mempengaruhi state internalnya (controller, dsb tetap di-hoist dari atas).
 */
@Composable
private fun MapContentView(
    context: android.content.Context,
    scope: kotlinx.coroutines.CoroutineScope,
    controller: MTMapViewController,
    userLocation: LngLat?,
    onUserLocationChange: (LngLat) -> Unit,
    searchLocation: LngLat?,
    onSearchLocationChange: (LngLat?) -> Unit,
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    isSearching: Boolean,
    onIsSearchingChange: (Boolean) -> Unit,
    activeFilter: String,
    onActiveFilterChange: (String) -> Unit,
    filterOptions: List<String>,
    uiState: MapUiState,
    onCreateReport: () -> Unit,
    onNotificationClick: () -> Unit,
    unreadCount: Int,
    onMarkerClick: (ReportItem) -> Unit,
    permissionLauncher: ManagedActivityResultLauncher<Array<String>, Map<String, Boolean>>
) {
    Column(Modifier.fillMaxSize().background(AppColors.Page)) {
        Box(Modifier.fillMaxWidth().zIndex(1f)) {
            AppHeader(
                title = "Peta",
                backgroundColor = AppColors.Page,
                onNotificationClick = onNotificationClick,
                unreadCount = unreadCount
            ) {
                Button(
                    onClick = onCreateReport,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AppColors.ForestDark,
                        contentColor = Color.White
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text("+ Laporan", fontSize = 12.sp)
                }
            }
        }

        // Filter chips
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .background(AppColors.Page)
                .padding(horizontal = 12.dp, vertical = 6.dp)
                .zIndex(1f),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(filterOptions) { option ->
                val isSelected = option == activeFilter
                FilterChip(
                    selected = isSelected,
                    onClick = { onActiveFilterChange(option) },
                    label = {
                        Text(
                            text = option,
                            fontSize = 12.sp,
                            color = if (isSelected) Color.White else AppColors.TextPrimary,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.ForestDark,
                        containerColor = AppColors.Page
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = isSelected,
                        borderColor = AppColors.Border,
                        selectedBorderColor = AppColors.ForestDark,
                        borderWidth = 1.dp
                    ),
                    leadingIcon = if (option != FILTER_ALL) {
                        {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(categoryChipColor(option))
                            )
                        }
                    } else null
                )
            }
        }

        // Map area
        Box(Modifier.fillMaxSize()) {
            when (val state = uiState) {
                is MapUiState.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = AppColors.ForestDark
                    )
                }
                is MapUiState.Error -> {
                    Text(
                        text = state.message,
                        color = Color.Red,
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp)
                    )
                }
                is MapUiState.Success -> {
                    // Filter marker sesuai pilihan aktif
                    val filteredReports = if (activeFilter == FILTER_ALL) {
                        state.reports
                    } else {
                        state.reports.filter { it.category == activeFilter }
                    }

                    MapTilerView(
                        reports = filteredReports,
                        selectedCategories = if (activeFilter == FILTER_ALL) {
                            ReportCategories.toSet()
                        } else {
                            setOf(activeFilter)
                        },
                        controller = controller,
                        userLocation = userLocation,
                        searchLocation = searchLocation,
                        modifier = Modifier.fillMaxSize(),
                        onMarkerClick = onMarkerClick
                    )
                }
            }

            // ── FLOATING SEARCH BAR ──────────────────────────────────────────
            Column(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .fillMaxWidth()
                    .padding(12.dp)
                    .zIndex(2f),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 2.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Cari",
                            tint = AppColors.TextPrimary,
                            modifier = Modifier.padding(start = 4.dp)
                        )
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = onSearchQueryChange,
                            placeholder = { Text("Cari lokasi...", color = AppColors.Muted, fontSize = 14.sp) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            keyboardActions = KeyboardActions(onSearch = {
                                if (searchQuery.isNotBlank()) {
                                    scope.launch {
                                        onIsSearchingChange(true)
                                        val result = geocode(context, searchQuery)
                                        onIsSearchingChange(false)
                                        if (result != null) {
                                            val (lat, lng) = result
                                            onSearchLocationChange(LngLat(lng, lat))
                                            controller.easeTo(
                                                MTCameraOptions(
                                                    center = LngLat(lng, lat),
                                                    zoom = 15.0
                                                )
                                            )
                                        } else {
                                            android.widget.Toast.makeText(context, "Lokasi tidak ditemukan.", android.widget.Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                } else {
                                    android.widget.Toast.makeText(context, "Masukkan kata kunci pencarian.", android.widget.Toast.LENGTH_SHORT).show()
                                }
                            }),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color.Transparent,
                                unfocusedBorderColor = Color.Transparent,
                                focusedTextColor = AppColors.TextPrimary,
                                unfocusedTextColor = AppColors.TextPrimary,
                                cursorColor = AppColors.Forest
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .height(56.dp)
                        )
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = {
                                onSearchQueryChange("")
                                onSearchLocationChange(null)
                            }) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Hapus",
                                    tint = AppColors.Muted
                                )
                            }
                        }
                    }
                }
                if (isSearching) {
                    LinearProgressIndicator(
                        modifier = Modifier
                            .fillMaxWidth(0.9f)
                            .padding(top = 4.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = AppColors.Forest
                    )
                }
            }

            // ── FLOATING LOCATION BUTTON (GPS) ──────────────────────────────
            FloatingActionButton(
                onClick = {
                    if (LocationHelper.hasLocationPermission(context)) {
                        LocationHelper.getCurrentLocation(
                            context = context,
                            onSuccess = { lat, lng ->
                                val loc = LngLat(lng, lat)
                                onUserLocationChange(loc)
                                controller.easeTo(
                                    MTCameraOptions(
                                        center = loc,
                                        zoom = 15.0
                                    )
                                )
                            },
                            onFailure = { msg ->
                                android.widget.Toast.makeText(context, msg, android.widget.Toast.LENGTH_LONG).show()
                            }
                        )
                    } else {
                        permissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    }
                },
                containerColor = Color.White,
                contentColor = AppColors.ForestDark,
                shape = CircleShape,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(bottom = 120.dp, end = 16.dp)
                    .zIndex(2f)
            ) {
                Icon(
                    imageVector = Icons.Default.MyLocation,
                    contentDescription = "Lokasi Saya"
                )
            }
        }
    }
}

private fun categoryChipColor(category: String): Color {
    return when (category) {
        "Sampah"     -> AppColors.CatRed
        "Banjir"     -> AppColors.CatBlue
        "Polusi"     -> AppColors.CatGrey
        "Penebangan" -> AppColors.CatBrown
        "Isu Air"    -> AppColors.CatTeal
        else         -> AppColors.CatOrange
    }
}