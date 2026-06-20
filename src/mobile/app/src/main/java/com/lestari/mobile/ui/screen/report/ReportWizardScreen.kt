package com.lestari.mobile.ui.screen.report

import android.Manifest
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.IconButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddPhotoAlternate
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import com.lestari.mobile.map.MapLocationPicker
import com.lestari.mobile.model.ReportCategories
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.component.SectionCard
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.ReportViewModel
import com.lestari.mobile.util.Resource
import com.lestari.mobile.map.ReportLocationMap
import com.lestari.mobile.util.LocationHelper
import com.lestari.mobile.data.geocode
import com.lestari.mobile.data.reverseGeocode
import com.maptiler.maptilersdk.map.LngLat
import com.maptiler.maptilersdk.map.MTMapViewController
import com.maptiler.maptilersdk.map.options.MTCameraOptions
import kotlinx.coroutines.launch

@Composable
fun ReportWizardScreen(
    viewModel: ReportViewModel,
    onNotificationClick: () -> Unit,
    unreadCount: Int,
    onSubmitSuccess: (ReportItem) -> Unit
) {
    val context     = LocalContext.current
    val submitState by viewModel.submitState.collectAsState()
    val isLoading   = submitState is Resource.Loading

    var latitude    by rememberSaveable { mutableDoubleStateOf(-7.5666) }
    var longitude   by rememberSaveable { mutableDoubleStateOf(110.8243) }
    var step        by rememberSaveable { mutableIntStateOf(0) }
    var judul       by rememberSaveable { mutableStateOf("") }
    var category    by rememberSaveable { mutableStateOf("Sampah") }
    var description by rememberSaveable { mutableStateOf("") }
    var location    by rememberSaveable { mutableStateOf("") }
    var photoUri    by rememberSaveable { mutableStateOf<Uri?>(null) }
    var address     by rememberSaveable { mutableStateOf("") }
    var isAnonymous by rememberSaveable { mutableStateOf(false) }

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? -> if (uri != null) photoUri = uri }

    LaunchedEffect(submitState) {
        when (val state = submitState) {
            is Resource.Success -> {
                onSubmitSuccess(state.data)
                viewModel.resetSubmitState()
                step = 0; judul = ""; description = ""; photoUri = null; isAnonymous = false
            }
            is Resource.Error -> {
                android.util.Log.d("ReportWizardScreen", "onSubmitError: ${state.message}")
            }
            else -> Unit
        }
    }

    Column(Modifier.fillMaxSize().background(AppColors.Page)) {
        AppHeader(
            title = "Buat Laporan",
            backgroundColor = AppColors.Page,
            onNotificationClick = onNotificationClick,
            unreadCount = unreadCount
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StepProgress(step)

            when (step) {
                0 -> ReportStepOne(
                    judul            = judul,
                    selectedCategory = category,
                    description      = description,
                    photoUri         = photoUri,
                    isAnonymous      = isAnonymous,
                    onJudulChange    = { judul = it },
                    onCategoryChange = { category = it },
                    onDescChange     = { description = it },
                    onAnonymousChange = { isAnonymous = it },
                    onPickPhoto      = { photoPicker.launch("image/*") },
                    onRemovePhoto    = { photoUri = null }
                )
                1 -> ReportLocationStep(
                    location            = location,
                    latitude            = latitude,
                    longitude           = longitude,
                    onLocationChange    = { location = it },
                    onCoordinatesChange = { lat, lng ->
                        latitude  = lat
                        longitude = lng
                    },
                    onAddressChange = { address = it }
                )
                2 -> ReportSummaryStep(
                    judul       = judul,
                    category    = category,
                    description = description,
                    location    = location,
                    photoUri    = photoUri,
                    latitude    = latitude,
                    longitude   = longitude,
                    address     = address,
                    isAnonymous = isAnonymous
                )
                else -> ReportFinishStep()
            }

            WizardActions(
                step        = step,
                isLoading   = isLoading,
                judul       = judul,
                description = description,
                onBack      = { if (step > 0) step-- },
                onNext      = {
                    when {
                        step == 0 && (judul.isBlank() || description.isBlank()) -> { /* diblokir oleh isNextEnabled */ }
                        step < 3  -> step++
                        !isLoading -> viewModel.createReport(
                            context   = context,
                            judul     = judul,
                            kategori  = category,
                            deskripsi = description,
                            lokasi    = address.ifBlank { location },
                            latitude  = latitude,
                            longitude = longitude,
                            isAnonymous = isAnonymous,
                            photoUri  = photoUri
                        )
                    }
                }
            )
        }
    }
}

@Composable
private fun StepProgress(step: Int) {
    val labels = listOf("Detail", "Lokasi", "Ringkasan", "Konfirmasi")
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            repeat(4) { index ->
                Box(
                    modifier = Modifier
                        .height(5.dp)
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (index <= step) AppColors.Forest else Color(0xFF939393))
                )
                if (index < 3) Spacer(Modifier.width(8.dp))
            }
        }
        Text(
            text     = "Langkah ${step + 1} dari 4 — ${labels[step]}",
            fontSize = 12.sp,
            color    = AppColors.Muted
        )
    }
}

@Composable
private fun ReportStepOne(
    judul: String,
    selectedCategory: String,
    description: String,
    photoUri: Uri?,
    isAnonymous: Boolean,
    onJudulChange: (String) -> Unit,
    onCategoryChange: (String) -> Unit,
    onDescChange: (String) -> Unit,
    onAnonymousChange: (Boolean) -> Unit,
    onPickPhoto: () -> Unit,
    onRemovePhoto: () -> Unit
) {
    SectionCard(title = "Judul Laporan") {
        OutlinedTextField(
            value         = judul,
            onValueChange = onJudulChange,
            singleLine    = true,
            placeholder   = { Text("Contoh: Tumpukan sampah di pinggir jalan", fontSize = 12.sp) },
            modifier      = Modifier.fillMaxWidth(),
            colors        = OutlinedTextFieldDefaults.colors(
                focusedTextColor     = AppColors.TextPrimary,
                unfocusedTextColor   = AppColors.TextPrimary,
                focusedBorderColor   = AppColors.Forest,
                unfocusedBorderColor = AppColors.Border,
                cursorColor          = AppColors.Forest
            )
        )
    }

    SectionCard(title = "Kategori Isu") {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            ReportCategories.chunked(3).forEach { row ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    row.forEach { item ->
                        CategoryButton(
                            label    = item,
                            selected = selectedCategory == item,
                            modifier = Modifier.weight(1f),
                            onClick  = { onCategoryChange(item) }
                        )
                    }
                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }

    SectionCard(title = "Deskripsi Laporan") {
        OutlinedTextField(
            value         = description,
            onValueChange = onDescChange,
            minLines      = 4,
            placeholder   = {
                Text(
                    "Tuliskan detail masalah yang terjadi, sejak kapan dan dampak yang dirasakan ...",
                    fontSize = 12.sp
                )
            },
            modifier = Modifier.fillMaxWidth(),
            colors   = OutlinedTextFieldDefaults.colors(
                focusedTextColor     = AppColors.TextPrimary,
                unfocusedTextColor   = AppColors.TextPrimary,
                focusedBorderColor   = AppColors.Forest,
                unfocusedBorderColor = AppColors.Border,
                cursorColor          = AppColors.Forest
            )
        )
    }

    SectionCard(title = "Privasi Pelapor") {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .clickable { onAnonymousChange(!isAnonymous) }
                .padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = isAnonymous,
                onCheckedChange = onAnonymousChange,
                colors = CheckboxDefaults.colors(
                    checkedColor = AppColors.Forest,
                    uncheckedColor = AppColors.Muted,
                    checkmarkColor = Color.White
                )
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Kirim laporan secara anonim",
                    color = AppColors.TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Identitas Anda disembunyikan dari tampilan publik laporan.",
                    color = AppColors.Muted,
                    fontSize = 11.sp
                )
            }
        }
    }

    SectionCard(title = "Bukti Foto") {
        if (photoUri != null) {
            Box(modifier = Modifier.fillMaxWidth()) {
                Image(
                    painter            = rememberAsyncImagePainter(photoUri),
                    contentDescription = "Foto laporan",
                    contentScale       = ContentScale.Crop,
                    modifier           = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(6.dp)
                        .size(28.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color.Black.copy(alpha = 0.55f))
                        .clickable { onRemovePhoto() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector        = Icons.Outlined.Close,
                        contentDescription = "Hapus foto",
                        tint               = Color.White,
                        modifier           = Modifier.size(16.dp)
                    )
                }
            }
            Text(
                "Ketuk ✕ untuk hapus atau ketuk kotak di bawah untuk ganti foto.",
                color    = AppColors.Muted,
                fontSize = 11.sp
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (photoUri != null) 52.dp else 116.dp)
                .border(1.dp, if (photoUri != null) AppColors.Forest else AppColors.Muted, RoundedCornerShape(8.dp))
                .clip(RoundedCornerShape(8.dp))
                .clickable { onPickPhoto() },
            contentAlignment = Alignment.Center
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment     = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector        = Icons.Outlined.AddPhotoAlternate,
                    contentDescription = null,
                    tint               = if (photoUri != null) AppColors.Forest else AppColors.Muted,
                    modifier           = Modifier.size(22.dp)
                )
                Column {
                    Text(
                        text       = if (photoUri != null) "Ganti foto" else "Pilih foto dari galeri",
                        color      = if (photoUri != null) AppColors.Forest else AppColors.Muted,
                        fontWeight = FontWeight.SemiBold,
                        fontSize   = 13.sp
                    )
                    if (photoUri == null) {
                        Text("PNG, JPG hingga 10 MB", color = AppColors.Muted, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun ReportLocationStep(
    location: String,
    latitude: Double,
    longitude: Double,
    onLocationChange: (String) -> Unit,
    onCoordinatesChange: (Double, Double) -> Unit,
    onAddressChange: (String) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val controller = remember { MTMapViewController(context) }
    var isSearching by remember { mutableStateOf(false) }
    var isLocating by remember { mutableStateOf(false) }

    // Minta permission launcher untuk GPS
    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        if (fineGranted || coarseGranted) {
            isLocating = true
            LocationHelper.getCurrentLocation(
                context = context,
                onSuccess = { lat, lng ->
                    scope.launch {
                        val addr = reverseGeocode(lat, lng)
                        onCoordinatesChange(lat, lng)
                        onAddressChange(addr)
                        onLocationChange(addr)
                        controller.easeTo(MTCameraOptions(center = LngLat(lng, lat), zoom = 15.0))
                        isLocating = false
                    }
                },
                onFailure = { msg ->
                    isLocating = false
                    android.widget.Toast.makeText(context, msg, android.widget.Toast.LENGTH_LONG).show()
                }
            )
        } else {
            android.widget.Toast.makeText(context, "Izin lokasi ditolak.", android.widget.Toast.LENGTH_LONG).show()
        }
    }

    val performSearch = {
        if (location.isNotBlank()) {
            scope.launch {
                isSearching = true
                val result = geocode(context, location)
                isSearching = false
                if (result != null) {
                    val (lat, lng) = result
                    onCoordinatesChange(lat, lng)
                    // Lakukan reverse geocode untuk dapat alamat resmi terformat
                    val addr = reverseGeocode(lat, lng)
                    onAddressChange(addr)
                    onLocationChange(addr.ifBlank { location })
                    controller.easeTo(MTCameraOptions(center = LngLat(lng, lat), zoom = 15.0))
                } else {
                    android.widget.Toast.makeText(context, "Lokasi tidak ditemukan.", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        } else {
            android.widget.Toast.makeText(context, "Masukkan kata kunci pencarian.", android.widget.Toast.LENGTH_SHORT).show()
        }
    }

    SectionCard("Pilih Lokasi") {
        OutlinedTextField(
            value         = location,
            onValueChange = onLocationChange,
            label         = { Text("Alamat lokasi") },
            placeholder   = { Text("Contoh: Jl. Klebet 7, Surakarta", color = AppColors.Muted) },
            modifier      = Modifier.fillMaxWidth(),
            singleLine    = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = { performSearch() }),
            trailingIcon = {
                if (isSearching) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp,
                        color = AppColors.Forest
                    )
                } else {
                    IconButton(onClick = { performSearch() }) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Cari Lokasi",
                            tint = AppColors.Forest
                        )
                    }
                }
            },
            colors        = OutlinedTextFieldDefaults.colors(
                focusedTextColor     = AppColors.TextPrimary,
                unfocusedTextColor   = AppColors.TextPrimary,
                focusedBorderColor   = AppColors.Forest,
                unfocusedBorderColor = AppColors.Border,
                cursorColor          = AppColors.Forest
            )
        )

        Text(
            "Ketuk peta untuk menandai lokasi laporan",
            fontSize = 12.sp,
            color    = AppColors.Muted
        )

        MapLocationPicker(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .clip(RoundedCornerShape(8.dp)),
            controller = controller,
            pickedLocation = LngLat(longitude, latitude),
            onLocationPicked = { lat, lng, addr ->
                onCoordinatesChange(lat, lng)
                onAddressChange(addr)
                onLocationChange(addr)
                // Tidak perlu easeTo di sini karena MapLocationPicker sudah punya logika internal untuk update
            }
        )

        Button(
            onClick = {
                if (LocationHelper.hasLocationPermission(context)) {
                    isLocating = true
                    LocationHelper.getCurrentLocation(
                        context = context,
                        onSuccess = { lat, lng ->
                            scope.launch {
                                val addr = reverseGeocode(lat, lng)
                                onCoordinatesChange(lat, lng)
                                onAddressChange(addr)
                                onLocationChange(addr)
                                controller.easeTo(MTCameraOptions(center = LngLat(lng, lat), zoom = 15.0))
                                isLocating = false
                            }
                        },
                        onFailure = { msg ->
                            isLocating = false
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
            colors   = ButtonDefaults.buttonColors(containerColor = AppColors.Forest),
            modifier = Modifier.fillMaxWidth(),
            enabled = !isLocating
        ) {
            if (isLocating) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(20.dp),
                    strokeWidth = 2.dp
                )
                Spacer(Modifier.width(8.dp))
                Text("Mencari Lokasi GPS...")
            } else {
                Icon(
                    imageVector = Icons.Default.MyLocation,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text("Gunakan Lokasi Saat Ini")
            }
        }
    }
}

@Composable
private fun ReportSummaryStep(
    judul: String,
    category: String,
    description: String,
    location: String,
    photoUri: Uri?,
    latitude: Double,
    longitude: Double,
    address: String,
    isAnonymous: Boolean
) {
    SectionCard("Ringkasan Laporan") {
        if (photoUri != null) {
            Image(
                painter            = rememberAsyncImagePainter(photoUri),
                contentDescription = "Foto laporan",
                contentScale       = ContentScale.Crop,
                modifier           = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .clip(RoundedCornerShape(8.dp))
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFF0F0F0)),
                contentAlignment = Alignment.Center
            ) {
                Text("Tidak ada foto", color = AppColors.Muted, fontSize = 13.sp)
            }
        }
        Spacer(Modifier.height(4.dp))
        Text("Judul", color = AppColors.Muted, fontSize = 12.sp)
        Text(judul.ifBlank { "(tidak diisi — akan menggunakan nama kategori)" }, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(2.dp))
        Text("Deskripsi", color = AppColors.Muted, fontSize = 12.sp)
        Text(description.ifBlank { "Belum ada deskripsi." }, fontSize = 13.sp)
    }

    SectionCard("Kategori & Waktu") {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .border(1.5.dp, AppColors.Forest, RoundedCornerShape(12.dp))
                    .background(Color(0xFFEAF7ED), RoundedCornerShape(12.dp))
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = category,
                    color = AppColors.TextPrimary, // Menggunakan Hitam agar kontras maksimal
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 14.sp
                )
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = "Rabu, 3 Juni 2026  •  20:00 WIB", 
            fontSize = 12.sp, 
            color = AppColors.Muted,
            fontWeight = FontWeight.Medium
        )
    }

    SectionCard("Lokasi") {
        if (address.isNotBlank()) {
            Text(address, fontSize = 13.sp)
        } else if (location.isNotBlank()) {
            Text(location, fontSize = 13.sp)
        } else {
            Text("Lokasi belum dipilih", fontSize = 13.sp, color = AppColors.Muted)
        }
        Spacer(Modifier.height(8.dp))
        ReportLocationMap(
            latitude  = latitude,
            longitude = longitude,
            modifier  = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .clip(RoundedCornerShape(8.dp))
        )
    }

    SectionCard("Identitas Pelapor") {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(
                    if (isAnonymous) Color(0xFFEAF7ED) else Color(0xFFF5F5F5)
                )
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text     = if (isAnonymous) "\uD83D\uDD75\uFE0F" else "\uD83D\uDC64",
                fontSize = 20.sp
            )
            Column {
                Text(
                    text       = if (isAnonymous) "Dikirim sebagai: Anonim" else "Dikirim dengan identitas akun",
                    fontWeight = FontWeight.SemiBold,
                    fontSize   = 13.sp,
                    color      = if (isAnonymous) AppColors.ForestDark else AppColors.TextPrimary
                )
                Text(
                    text     = if (isAnonymous)
                        "Nama dan profil Anda disembunyikan dari laporan ini."
                    else
                        "Nama Anda akan terlihat pada laporan ini.",
                    fontSize = 11.sp,
                    color    = AppColors.Muted
                )
            }
        }
    }
}

@Composable
private fun ReportFinishStep() {
    SectionCard("Konfirmasi Pengiriman") {
        Text(
            text     = "Pastikan judul, kategori, deskripsi, bukti foto, dan lokasi sudah benar sebelum laporan dikirim.",
            fontSize = 14.sp,
            color    = Color(0xFF3D423D)
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text     = "Laporan yang sudah dikirim tidak dapat diubah. Admin akan memvalidasi laporan kamu dalam 1×24 jam.",
            fontSize = 12.sp,
            color    = AppColors.Muted
        )
    }
}

@Composable
private fun CategoryButton(
    label: String,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(56.dp)
            .clip(RoundedCornerShape(8.dp))
            .border(1.dp, if (selected) AppColors.Forest else AppColors.Border, RoundedCornerShape(8.dp))
            .background(if (selected) Color(0xFFEAF7ED) else Color.White)
            .clickable(onClick = onClick)
            .padding(6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text       = label,
            fontSize   = 13.sp,
            textAlign  = TextAlign.Center,
            color      = if (selected) AppColors.ForestDark else AppColors.TextPrimary,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium
        )
    }
}

@Composable
private fun WizardActions(
    step: Int,
    isLoading: Boolean,
    judul: String,
    description: String,
    onBack: () -> Unit,
    onNext: () -> Unit
) {
    val isNextEnabled = when {
        isLoading -> false
        step == 0 -> judul.isNotBlank() && description.isNotBlank()
        else      -> true
    }

    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        if (step > 0) {
            OutlinedButton(
                onClick  = onBack,
                enabled  = !isLoading,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text("Kembali")
            }
        }
        Button(
            onClick  = onNext,
            enabled  = isNextEnabled,
            colors   = ButtonDefaults.buttonColors(containerColor = AppColors.Forest),
            modifier = Modifier
                .weight(1f)
                .height(48.dp)
        ) {
            if (isLoading && step == 3) {
                CircularProgressIndicator(
                    color       = Color.White,
                    modifier    = Modifier.size(20.dp),
                    strokeWidth = 2.dp
                )
            } else {
                Text(if (step == 3) "Kirim Laporan" else "Selanjutnya")
            }
        }
    }
}
