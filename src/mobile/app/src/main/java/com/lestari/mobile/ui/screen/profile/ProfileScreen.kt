package com.lestari.mobile.ui.screen.profile

import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import coil.compose.AsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.util.Resource
import com.lestari.mobile.ui.viewmodel.ProfileViewModel

private val StatBlue   = Color(0xFFE3F2FD)
private val StatGreen  = Color(0xFFE8F5E9)
private val StatYellow = Color(0xFFFFFDE7)

@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    onEditProfile: () -> Unit,
    onNavigateToChangePassword: () -> Unit,
    onNavigateToFeedback: () -> Unit,
    onNotificationClick: () -> Unit,
    unreadCount: Int,
    viewModel: ProfileViewModel
) {
    val profileState     by viewModel.profile.collectAsState()
    val statsState       by viewModel.stats.collectAsState()
    val photoUploadState by viewModel.photoUploadState.collectAsState()
    val photoVersion     by viewModel.photoVersion.collectAsState()

    val context           = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    val lifecycleOwner    = LocalLifecycleOwner.current

    // ── Refresh profil setiap kali screen kembali ke foreground (ON_RESUME) ──
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.refresh()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    // ── Tampilkan snackbar hasil upload foto ──────────────────────────────────
    LaunchedEffect(photoUploadState) {
        when (val state = photoUploadState) {
            is Resource.Success -> {
                snackbarHostState.showSnackbar("Foto profil berhasil diperbarui.")
                viewModel.resetPhotoUploadState()
            }
            is Resource.Error -> {
                snackbarHostState.showSnackbar(state.message)
                viewModel.resetPhotoUploadState()
            }
            else -> Unit
        }
    }

    val photoPicker = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) viewModel.uploadPhotoOnly(uri)
    }

    val galleryFallback = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) viewModel.uploadPhotoOnly(uri)
    }

    fun openPhotoPicker() {
        try {
            photoPicker.launch(
                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
            )
        } catch (e: Exception) {
            galleryFallback.launch("image/*")
        }
    }

    Scaffold(
        snackbarHost   = { SnackbarHost(snackbarHostState) },
        containerColor = AppColors.Page,
        topBar = {
            AppHeader(
                title = "Profil dan Pengaturan",
                onNotificationClick = onNotificationClick,
                unreadCount = unreadCount
            )
        }
    ) { innerPadding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ── Kartu Profil ──────────────────────────────────────────────
            Card(
                modifier  = Modifier.fillMaxWidth(),
                shape     = RoundedCornerShape(16.dp),
                colors    = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    val profileData = (profileState as? Resource.Success)?.data
                    val namaLengkap = profileData?.namaLengkap ?: ""
                    val displayPhotoUrl = profileData?.displayPhotoUrl
                    val initial     = namaLengkap.firstOrNull()?.uppercaseChar()?.toString() ?: "U"

                    val fullPhotoUrl = remember(displayPhotoUrl, photoVersion) {
                        val resolvedUrl = RetrofitClient.resolveProfilePhotoUrl(displayPhotoUrl)
                        resolvedUrl?.let { url ->
                            if (photoVersion > 0L) {
                                val separator = if (url.contains("?")) "&" else "?"
                                "$url${separator}v=$photoVersion"
                            } else {
                                url
                            }
                        }
                    }

                    // ── Avatar ────────────────────────────────────────────
                    Box(contentAlignment = Alignment.BottomEnd) {
                        Box(
                            Modifier
                                .size(88.dp)
                                .clip(CircleShape)
                                .background(AppColors.Forest.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                initial,
                                color      = AppColors.Forest,
                                fontWeight = FontWeight.Bold,
                                fontSize   = 36.sp
                            )

                            if (!fullPhotoUrl.isNullOrBlank()) {
                                AsyncImage(
                                    model = ImageRequest.Builder(context)
                                        .data(fullPhotoUrl)
                                        .crossfade(true)
                                        .diskCachePolicy(CachePolicy.DISABLED)
                                        .memoryCachePolicy(CachePolicy.DISABLED)
                                        .build(),
                                    contentDescription = "Foto profil",
                                    contentScale       = ContentScale.Crop,
                                    modifier           = Modifier.matchParentSize()
                                )
                            }
                        }

                        if (photoUploadState is Resource.Loading) {
                            Box(
                                Modifier
                                    .size(88.dp)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.55f)),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(24.dp),
                                    strokeWidth = 2.dp,
                                    color = AppColors.Forest
                                )
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))
                    Text(
                        text       = namaLengkap.ifEmpty { "Pengguna Lestari" },
                        fontWeight = FontWeight.Bold,
                        fontSize   = 20.sp,
                        color      = AppColors.TextPrimary
                    )

                    val email = profileData?.email ?: ""
                    if (email.isNotEmpty()) {
                        Text(email, color = AppColors.Muted, fontSize = 14.sp)
                    }

                    Spacer(Modifier.height(8.dp))

                    // ── Tombol Ganti Foto ─────────────────────────────────
                    if (photoUploadState is Resource.Loading) {
                        Text(
                            "Mengunggah...",
                            color    = AppColors.Forest,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    } else {
                        TextButton(onClick = { openPhotoPicker() }) {
                            Text("Ganti Foto Profil", color = AppColors.Forest, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    // ── Stat Chips ────────────────────────────────────────
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        when (val s = statsState) {
                            is Resource.Loading -> {
                                Box(Modifier.fillMaxWidth().height(60.dp), contentAlignment = Alignment.Center) {
                                    CircularProgressIndicator(color = AppColors.Forest, modifier = Modifier.size(24.dp))
                                }
                            }
                            is Resource.Success -> {
                                StatChip(
                                    value   = s.data.total,
                                    label   = "Laporan",
                                    bgColor = StatBlue,
                                    textColor = Color(0xFF1976D2),
                                    modifier = Modifier.weight(1f)
                                )
                                StatChip(
                                    value   = s.data.terverifikasi,
                                    label   = "Terverifikasi",
                                    bgColor = StatGreen,
                                    textColor = Color(0xFF388E3C),
                                    modifier = Modifier.weight(1f)
                                )
                                StatChip(
                                    value   = s.data.menungguValidasi,
                                    label   = "Tertunda",
                                    bgColor = StatYellow,
                                    textColor = Color(0xFFFBC02D),
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            else -> Unit
                        }
                    }
                }
            }

            // ── Menu Items ────────────────────────────────────────────────
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                MenuItemCard(emoji = "✏️",  label = "Edit Profil",        onClick = onEditProfile)
                MenuItemCard(emoji = "🔒", label = "Privasi & Keamanan",  onClick = onNavigateToChangePassword)
                MenuItemCard(emoji = "💬", label = "Beri Masukan",        onClick = onNavigateToFeedback)
            }

            Spacer(Modifier.weight(1f))

            // ── Tombol Logout ─────────────────────────────────────────────
            OutlinedButton(
                onClick  = onLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape  = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFD32F2F)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD32F2F).copy(alpha = 0.5f))
            ) {
                Icon(
                    imageVector        = Icons.AutoMirrored.Filled.ExitToApp,
                    contentDescription = null,
                    modifier           = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text("Keluar dari Akun", fontWeight = FontWeight.SemiBold)
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
private fun StatChip(
    value: Int,
    label: String,
    bgColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    Box(
        modifier
            .clip(RoundedCornerShape(16.dp))
            .background(bgColor)
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "$value", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = textColor)
            Text(text = label,   fontSize = 11.sp, color = textColor.copy(alpha = 0.8f), fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun MenuItemCard(
    emoji: String,
    label: String,
    onClick: () -> Unit
) {
    Card(
        onClick   = onClick,
        modifier  = Modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(12.dp),
        colors    = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(AppColors.Page),
                contentAlignment = Alignment.Center
            ) {
                Text(emoji, fontSize = 18.sp)
            }
            Spacer(Modifier.width(16.dp))
            Text(label, modifier = Modifier.weight(1f), fontSize = 15.sp, fontWeight = FontWeight.Medium, color = AppColors.TextPrimary)
            Icon(
                imageVector        = Icons.Default.ChevronRight,
                contentDescription = null,
                tint               = AppColors.Muted,
                modifier           = Modifier.size(20.dp)
            )
        }
    }
}
