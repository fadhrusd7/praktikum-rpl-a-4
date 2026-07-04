package com.lestari.mobile.ui.screen.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.viewmodel.FeedbackViewModel
import kotlinx.coroutines.flow.collectLatest

private val StarActiveColor = Color(0xFFFFC107)   // kuning amber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(
    onNavigateBack: () -> Unit,
    viewModel: FeedbackViewModel,
) {
    val form      by viewModel.form.collectAsState()
    val saveState by viewModel.saveState.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    val focusManager      = LocalFocusManager.current

    // ── One-shot events ───────────────────────────────────────────────────────
    LaunchedEffect(Unit) {
        viewModel.events.collectLatest { event ->
            when (event) {
                is FeedbackEvent.ShowSnackbar -> {
                    snackbarHostState.showSnackbar(
                        message  = event.message,
                        duration = SnackbarDuration.Short,
                    )
                }
                is FeedbackEvent.NavigateBack -> onNavigateBack()
            }
        }
    }

    val isSaving = saveState is FeedbackSaveState.Saving

    Scaffold(
        snackbarHost   = { SnackbarHost(snackbarHostState) },
        containerColor = Color(0xFFF2F4F3),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Beri Masukan",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 18.sp,
                        color      = AppColors.ForestDark,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector        = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Kembali",
                            tint               = AppColors.ForestDark,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFF2F4F3),
                ),
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {

            // Subtitle di bawah TopAppBar — persis seperti web
            Text(
                text     = "Bantu kami meningkatkan layanan Lestari (lapor isu lingkungan).",
                fontSize = 14.sp,
                color    = Color.Gray,
                modifier = Modifier.padding(horizontal = 4.dp),
            )

            // ── Kartu utama form ──────────────────────────────────────────
            Card(
                modifier  = Modifier.fillMaxWidth(),
                shape     = RoundedCornerShape(16.dp),
                colors    = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(24.dp),
                ) {

                    // ── Rating Bintang ────────────────────────────────────
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(
                            text       = "Berapa bintang untuk pengalaman Anda?",
                            fontWeight = FontWeight.SemiBold,
                            fontSize   = 15.sp,
                            color      = Color(0xFF1A1A1A),
                        )
                        StarRatingRow(
                            rating   = form.rating,
                            enabled  = !isSaving,
                            onSelect = viewModel::onRatingChange,
                        )
                        // Error rating
                        if (form.ratingError != null) {
                            Text(
                                text     = form.ratingError!!,
                                color    = MaterialTheme.colorScheme.error,
                                fontSize = 12.sp,
                            )
                        }
                    }

                    HorizontalDivider(color = Color(0xFFEEEEEE))

                    // ── Textarea Masukan ──────────────────────────────────
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text       = "Tulis Masukkan atau Saran",
                            fontWeight = FontWeight.SemiBold,
                            fontSize   = 15.sp,
                            color      = Color(0xFF1A1A1A),
                        )
                        OutlinedTextField(
                            value         = form.isi,
                            onValueChange = viewModel::onIsiChange,
                            enabled       = !isSaving,
                            placeholder   = {
                                Text(
                                    "Ceritakan pengalaman Anda menggunakan aplikasi ini…",
                                    color    = Color(0xFFAAAAAA),
                                    fontSize = 14.sp,
                                )
                            },
                            isError   = form.isiError != null,
                            minLines  = 6,
                            maxLines  = 12,
                            shape     = RoundedCornerShape(10.dp),
                            modifier  = Modifier.fillMaxWidth(),
                            colors    = OutlinedTextFieldDefaults.colors(
                                focusedTextColor     = Color(0xFF1A1A1A),
                                unfocusedTextColor   = Color(0xFF1A1A1A),
                                focusedBorderColor   = AppColors.ForestDark,
                                cursorColor          = AppColors.ForestDark,
                                unfocusedBorderColor = Color(0xFFCCCCCC),
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White,
                            ),
                        )
                        // Counter + error — persis seperti web: "0 / 2000" di kanan
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment     = Alignment.CenterVertically,
                        ) {
                            if (form.isiError != null) {
                                Text(
                                    text     = form.isiError!!,
                                    color    = MaterialTheme.colorScheme.error,
                                    fontSize = 12.sp,
                                    modifier = Modifier.weight(1f),
                                )
                            } else {
                                Spacer(Modifier.weight(1f))
                            }
                            Text(
                                text     = "${form.isi.length} / $FEEDBACK_MAX_CHARS",
                                fontSize = 12.sp,
                                color    = if (form.isi.length >= FEEDBACK_MAX_CHARS)
                                    MaterialTheme.colorScheme.error
                                else Color.Gray,
                            )
                        }
                    }

                    // ── Tombol Kirim ──────────────────────────────────────
                    Button(
                        onClick  = {
                            focusManager.clearFocus()
                            viewModel.submit()
                        },
                        enabled  = !isSaving,
                        modifier = Modifier
                            .wrapContentWidth()
                            .height(48.dp),
                        shape  = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor         = AppColors.ForestDark,
                            contentColor           = Color.White,
                            disabledContainerColor = AppColors.ForestDark.copy(alpha = 0.5f),
                            disabledContentColor   = Color.White.copy(alpha = 0.7f),
                        ),
                        contentPadding = PaddingValues(horizontal = 32.dp),
                    ) {
                        if (isSaving) {
                            CircularProgressIndicator(
                                modifier    = Modifier.size(20.dp),
                                color       = Color.White,
                                strokeWidth = 2.dp,
                            )
                            Spacer(Modifier.width(8.dp))
                            Text("Mengirim...", fontWeight = FontWeight.SemiBold)
                        } else {
                            Text("Kirim", fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                        }
                    }
                }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

// ─── Baris 5 bintang interaktif ───────────────────────────────────────────────
@Composable
private fun StarRatingRow(
    rating:   Int,
    enabled:  Boolean,
    onSelect: (Int) -> Unit,
) {
    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        (1..5).forEach { star ->
            IconButton(
                onClick  = { if (enabled) onSelect(star) },
                enabled  = enabled,
                modifier = Modifier.size(40.dp),
            ) {
                Icon(
                    imageVector        = if (star <= rating) Icons.Filled.Star
                    else Icons.Outlined.StarOutline,
                    contentDescription = "$star bintang",
                    tint               = if (star <= rating) StarActiveColor
                    else Color(0xFFCCCCCC),
                    modifier           = Modifier.size(32.dp),
                )
            }
        }
    }
}