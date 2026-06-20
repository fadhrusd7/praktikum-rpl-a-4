package com.lestari.mobile.map

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.border
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.maptiler.maptilersdk.annotations.MTCustomAnnotationView
import com.maptiler.maptilersdk.events.MTEvent
import com.maptiler.maptilersdk.map.LngLat
import com.maptiler.maptilersdk.map.MTMapOptions
import com.maptiler.maptilersdk.map.MTMapView
import com.maptiler.maptilersdk.map.MTMapViewController
import com.maptiler.maptilersdk.map.MTMapViewDelegate
import com.maptiler.maptilersdk.map.options.MTCameraOptions
import com.maptiler.maptilersdk.map.style.MTMapReferenceStyle
import com.maptiler.maptilersdk.map.types.MTData
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.data.reverseGeocode
import kotlinx.coroutines.launch

// Warna per kategori (Earth Tone - High Contrast)
private fun categoryColor(category: String): Color = when (category) {
    "Sampah"     -> AppColors.CatRed
    "Banjir"     -> AppColors.CatBlue
    "Polusi"     -> AppColors.CatGrey
    "Penebangan" -> AppColors.CatBrown
    "Isu Air"    -> AppColors.CatTeal
    else         -> AppColors.CatOrange
}

@Composable
fun MapTilerView(
    reports: List<ReportItem>,
    selectedCategories: Set<String>,
    modifier: Modifier = Modifier,
    controller: MTMapViewController? = null,
    userLocation: LngLat? = null,
    searchLocation: LngLat? = null,
    onMarkerClick: (ReportItem) -> Unit = {},
    onMapClick: ((LngLat) -> Unit)? = null,
    showLegend: Boolean = true
) {
    val context = LocalContext.current
    val mapController = controller ?: remember { MTMapViewController(context) }
    val mapReady = remember { mutableStateOf(false) }

    // Setup delegate — hanya sekali saat composable pertama masuk
    LaunchedEffect(mapController) {
        mapController.delegate = object : MTMapViewDelegate {
            override fun onMapViewInitialized() {
                // Focus ke lokasi pencarian atau default
                val initialPos = searchLocation ?: userLocation ?: LngLat(110.8243, -7.5666)
                mapController.easeTo(
                    MTCameraOptions(
                        center = initialPos,
                        zoom = if (searchLocation != null || userLocation != null) 15.0 else 12.0
                    )
                )
                mapReady.value = true
            }
            override fun onEventTriggered(event: MTEvent, data: MTData?) {
                if (event == MTEvent.ON_TAP) {
                    data?.coordinate?.let { onMapClick?.invoke(it) }
                }
            }
        }
    }

    DisposableEffect(mapController) {
        onDispose { mapController.delegate = null }
    }

    // Filter laporan sesuai kategori aktif
    val filteredReports = remember(reports, selectedCategories) {
        reports.filter { it.category in selectedCategories }
    }

    Box(modifier = modifier) {
        MTMapView(
            referenceStyle = MTMapReferenceStyle.SATELLITE,
            options = MTMapOptions(),
            controller = mapController,
            modifier = Modifier.fillMaxSize(),
        )

        // Custom annotation markers — hanya render saat map sudah siap
        if (mapReady.value) {
            // 1. Render User Location Marker (Bulatan biru dengan border putih + bayangan)
            userLocation?.let { loc ->
                MTCustomAnnotationView(
                    controller = mapController,
                    coordinates = loc,
                    modifier = Modifier
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .shadow(4.dp, CircleShape)
                            .border(2.dp, Color.White, CircleShape)
                            .clip(CircleShape)
                            .background(Color(0xFF2196F3)), // Blue GPS
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                        )
                    }
                }
            }

            // 2. Render Search Location Marker (Pin merah/pink)
            searchLocation?.let { loc ->
                MTCustomAnnotationView(
                    controller = mapController,
                    coordinates = loc,
                    modifier = Modifier
                ) {
                    // Beri offset negatif setengah dari size (36/2 = 18) agar ujung bawah pin pas di titik
                    Icon(
                        imageVector = Icons.Filled.Place,
                        contentDescription = "Lokasi Pencarian",
                        tint = Color(0xFFE91E63), // Pink/Red
                        modifier = Modifier
                            .size(36.dp)
                            .offset(y = (-18).dp)
                    )
                }
            }

            // 3. Render Report Markers
            for (report in filteredReports) {
                val lat = report.latitude
                val lng = report.longitude
                if (lat != null && lng != null) {
                    key(report.id) {
                        MTCustomAnnotationView(
                            controller = mapController,
                            coordinates = LngLat(lng, lat),
                            modifier = Modifier
                        ) {
                            // Marker Pin Berwarna sesuai kategori
                            Icon(
                                imageVector = Icons.Filled.Place,
                                contentDescription = report.title,
                                tint = categoryColor(report.category),
                                modifier = Modifier
                                    .size(32.dp)
                                    .offset(y = (-16).dp)
                                    .clickable { onMarkerClick(report) }
                            )
                        }
                    }
                }
            }
        }

        if (showLegend) {
            CategoryLegend(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(12.dp)
            )
        }
    }
}

// CategoryLegend, ReportLocationMap, MapFallback tidak berubah — tetap sama
@Composable
fun CategoryLegend(modifier: Modifier = Modifier) {
    val categories = listOf(
        "Sampah"     to AppColors.CatRed,
        "Banjir"     to AppColors.CatBlue,
        "Polusi"     to AppColors.CatGrey,
        "Penebangan" to AppColors.CatBrown,
        "Isu Air"    to AppColors.CatTeal,
        "Lainnya"    to AppColors.CatOrange,
    )
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                "Kategori Isu",
                color = AppColors.TextPrimary,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            categories.forEach { (label, color) ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 3.dp)
                ) {
                    Box(modifier = Modifier.size(12.dp).background(color, CircleShape))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = label,
                        color = AppColors.TextPrimary,
                        fontSize = 13.sp
                    )
                }
            }
        }
    }
}

@Composable
fun ReportLocationMap(
    latitude: Double,
    longitude: Double,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val controller = remember { MTMapViewController(context) }
    val mapReady = remember { mutableStateOf(false) }

    LaunchedEffect(controller) {
        controller.delegate = object : MTMapViewDelegate {
            override fun onMapViewInitialized() {
                mapReady.value = true
            }
            override fun onEventTriggered(event: MTEvent, data: MTData?) {}
        }
    }

    // Update camera & marker saat lat/lng berubah atau map siap
    LaunchedEffect(latitude, longitude, mapReady.value) {
        if (mapReady.value) {
            controller.easeTo(MTCameraOptions(center = LngLat(longitude, latitude), zoom = 15.0))
        }
    }

    DisposableEffect(controller) { onDispose { controller.delegate = null } }

    Box(modifier = modifier) {
        MTMapView(
            referenceStyle = MTMapReferenceStyle.SATELLITE,
            options = MTMapOptions(
                isInteractionEnabled = false,
                dragPanIsEnabled = false,
                dragRotateIsEnabled = false,
                doubleTapShouldZoom = false,
            ),
            controller = controller,
            modifier = Modifier.fillMaxSize(),
        )

        if (mapReady.value) {
            key(latitude, longitude) {
                MTCustomAnnotationView(
                    controller = controller,
                    coordinates = LngLat(longitude, latitude)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Place,
                        contentDescription = null,
                        tint = AppColors.Forest,
                        modifier = Modifier
                            .size(32.dp)
                            .offset(y = (-16).dp)
                    )
                }
            }
        }
    }
}

@Composable
fun MapLocationPicker(
    modifier: Modifier = Modifier,
    controller: MTMapViewController? = null,
    pickedLocation: LngLat? = null,
    onLocationPicked: (lat: Double, lng: Double, address: String) -> Unit
) {
    val context    = LocalContext.current
    val mapController = controller ?: remember { MTMapViewController(context) }
    val mapReady   = remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(mapController) {
        mapController.delegate = object : MTMapViewDelegate {
            override fun onMapViewInitialized() {
                val initialPos = pickedLocation ?: LngLat(110.8243, -7.5666)
                mapController.easeTo(
                    MTCameraOptions(
                        center = initialPos,
                        zoom   = 12.0
                    )
                )
                mapReady.value = true
            }

            override fun onEventTriggered(event: MTEvent, data: MTData?) {
                if (event == MTEvent.ON_TAP) {
                    val coord = data?.coordinate ?: return
                    // 1. Update koordinat langsung (UI responsif: marker langsung pindah)
                    onLocationPicked(coord.lat, coord.lng, "Memuat alamat...")
                    
                    // 2. Baru cari alamatnya di background
                    scope.launch {
                        val address = reverseGeocode(
                            coord.lat,
                            coord.lng
                        )
                        onLocationPicked(coord.lat, coord.lng, address)
                    }
                }
            }
        }
    }

    DisposableEffect(mapController) {
        onDispose { mapController.delegate = null }
    }

    Box(modifier = modifier) {
        MTMapView(
            referenceStyle = MTMapReferenceStyle.SATELLITE,
            options        = MTMapOptions(),
            controller     = mapController,
            modifier       = Modifier.fillMaxSize()
        )

        if (mapReady.value && pickedLocation != null) {
            key(pickedLocation.lat, pickedLocation.lng) {
                MTCustomAnnotationView(
                    controller = mapController,
                    coordinates = pickedLocation,
                    modifier = Modifier
                ) {
                    Icon(
                        imageVector = Icons.Filled.Place,
                        contentDescription = "Marker Laporan",
                        tint = AppColors.Forest,
                        modifier = Modifier
                            .size(36.dp)
                            .offset(y = (-18).dp)
                    )
                }
            }
        }
    }
}

@Composable
fun MapFallback(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.background(Color(0xFFDCE9DA)).padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Text(
                text = "Peta tidak tersedia.\nCek gradle.properties.",
                color = Color.Black,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}