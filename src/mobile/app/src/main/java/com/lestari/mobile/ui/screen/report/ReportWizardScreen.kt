package com.lestari.mobile.ui.screen.report

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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AddPhotoAlternate
import androidx.compose.material.icons.outlined.Close
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.rememberAsyncImagePainter
import com.lestari.mobile.BuildConfig
import com.lestari.mobile.map.MapTilerView
import com.lestari.mobile.model.ReportCategories
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.model.ReportStatus
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.component.SectionCard
import com.lestari.mobile.ui.theme.AppColors

// ── State holder untuk wizard ─────────────────────────────────────────────────
private data class WizardState(
    val step: Int = 0,
    val judul: String = "",
    val category: String = "Sampah",
    val description: String = "",
    val location: String = "Jl. Klebet 7, Surakarta",
    val photoUri: Uri? = null
)

@Composable
fun ReportWizardScreen(onSubmit: (ReportItem) -> Unit) {
    var step        by rememberSaveable { mutableIntStateOf(0) }
    var judul       by rememberSaveable { mutableStateOf("") }
    var category    by rememberSaveable { mutableStateOf("Sampah") }
    var description by rememberSaveable { mutableStateOf("") }
    var location    by rememberSaveable { mutableStateOf("Jl. Klebet 7, Surakarta") }
    var photoUri    by rememberSaveable { mutableStateOf<Uri?>(null) }

    // Gallery picker launcher
    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? -> if (uri != null) photoUri = uri }

    Column(Modifier.fillMaxSize()) {
        AppHeader("Buat Laporan")
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
                    onJudulChange    = { judul = it },
                    onCategoryChange = { category = it },
                    onDescChange     = { description = it },
                    onPickPhoto      = { photoPicker.launch("image/*") },
                    onRemovePhoto    = { photoUri = null }
                )
                1 -> ReportLocationStep(location, onLocationChange = { location = it })
                2 -> ReportSummaryStep(judul, category, description, location, photoUri)
                else -> ReportFinishStep()
            }

            WizardActions(
                step   = step,
                onBack = { if (step > 0) step-- },
                onNext = {
                    if (step < 3) {
                        step++
                    } else {
                        onSubmit(
                            ReportItem(
                                title       = judul.ifBlank { category },
                                number      = "LAP-03062026-0008",
                                category    = category,
                                description = description.ifBlank { "Detail laporan belum diisi." },
                                location    = location,
                                date        = "Rabu, 3 Juni 2026 - 21.41 WIB",
                                status      = ReportStatus.Pending,
                                hasPhoto    = photoUri != null
                            )
                        )
                        step        = 0
                        judul       = ""
                        description = ""
                        photoUri    = null
                    }
                }
            )
        }
    }
}

// ── Step progress bar ─────────────────────────────────────────────────────────
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
            text = "Langkah ${step + 1} dari 4 — ${labels[step]}",
            fontSize = 12.sp,
            color = AppColors.Muted
        )
    }
}

// ── Step 1: Detail laporan ────────────────────────────────────────────────────
@Composable
private fun ReportStepOne(
    judul: String,
    selectedCategory: String,
    description: String,
    photoUri: Uri?,
    onJudulChange: (String) -> Unit,
    onCategoryChange: (String) -> Unit,
    onDescChange: (String) -> Unit,
    onPickPhoto: () -> Unit,
    onRemovePhoto: () -> Unit
) {
    // Judul laporan
    SectionCard(title = "Judul Laporan") {
        OutlinedTextField(
            value = judul,
            onValueChange = onJudulChange,
            singleLine = true,
            placeholder = { Text("Contoh: Tumpukan sampah di pinggir jalan", fontSize = 12.sp) },
            modifier = Modifier.fillMaxWidth()
        )
    }

    // Kategori
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
                    // Isi sisa slot kalau row tidak penuh
                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }

    // Deskripsi
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
            modifier = Modifier.fillMaxWidth()
        )
    }

    // Foto
    SectionCard(title = "Bukti Foto") {
        if (photoUri != null) {
            // Preview foto yang sudah dipilih
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
                // Tombol hapus di pojok kanan atas
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

        // Tombol pick foto (selalu tampil agar bisa ganti)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (photoUri != null) 52.dp else 116.dp)
                .border(
                    width = 1.dp,
                    color = if (photoUri != null) AppColors.Forest else AppColors.Muted,
                    shape = RoundedCornerShape(8.dp)
                )
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

// ── Step 2: Lokasi ────────────────────────────────────────────────────────────
@Composable
private fun ReportLocationStep(location: String, onLocationChange: (String) -> Unit) {
    SectionCard("Pilih Lokasi") {
        OutlinedTextField(
            value         = location,
            onValueChange = onLocationChange,
            label         = { Text("Alamat lokasi") },
            modifier      = Modifier.fillMaxWidth()
        )
        Button(
            onClick = { onLocationChange("Jl. Klebet 7, Surakarta") },
            colors  = ButtonDefaults.buttonColors(containerColor = AppColors.Forest),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Gunakan lokasi saat ini (contoh)")
        }
        MapTilerView(
            apiKey             = BuildConfig.MAPTILER_API_KEY,
            selectedCategories = ReportCategories.filterNot { it == "Lain-Lain" }.toSet(),
            modifier           = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .clip(RoundedCornerShape(8.dp))
        )
    }
}

// ── Step 3: Ringkasan ─────────────────────────────────────────────────────────
@Composable
private fun ReportSummaryStep(
    judul: String,
    category: String,
    description: String,
    location: String,
    photoUri: Uri?
) {
    SectionCard("Ringkasan Laporan") {
        // Foto preview (beneran kalau ada, placeholder kalau tidak)
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
        AssistChip(onClick = {}, label = { Text(category, fontWeight = FontWeight.Bold) })
        Text("Rabu, 3 Juni 2026  •  20:00 WIB", fontSize = 12.sp, color = AppColors.Muted)
    }

    SectionCard("Lokasi") {
        Text(location, fontSize = 13.sp)
        Spacer(Modifier.height(8.dp))
        MapTilerView(
            apiKey             = BuildConfig.MAPTILER_API_KEY,
            selectedCategories = setOf(category),
            modifier           = Modifier
                .fillMaxWidth()
                .height(120.dp)
                .clip(RoundedCornerShape(8.dp))
        )
    }
}

// ── Step 4: Konfirmasi ────────────────────────────────────────────────────────
@Composable
private fun ReportFinishStep() {
    SectionCard("Konfirmasi Pengiriman") {
        Text(
            text  = "Pastikan judul, kategori, deskripsi, bukti foto, dan lokasi sudah benar sebelum laporan dikirim.",
            fontSize = 14.sp,
            color = Color(0xFF3D423D)
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text  = "Laporan yang sudah dikirim tidak dapat diubah. Admin akan memvalidasi laporan kamu dalam 1×24 jam.",
            fontSize = 12.sp,
            color = AppColors.Muted
        )
    }
}

// ── Category chip button ──────────────────────────────────────────────────────
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
            .border(
                width = 1.dp,
                color = if (selected) AppColors.Forest else AppColors.Border,
                shape = RoundedCornerShape(8.dp)
            )
            .background(if (selected) Color(0xFFEAF7ED) else Color.White)
            .clickable(onClick = onClick)
            .padding(6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(label, fontSize = 12.sp, textAlign = TextAlign.Center)
    }
}

// ── Wizard navigation buttons ─────────────────────────────────────────────────
@Composable
private fun WizardActions(
    step: Int,
    onBack: () -> Unit,
    onNext: () -> Unit
) {
    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        if (step > 0) {
            OutlinedButton(
                onClick  = onBack,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp)
            ) {
                Text("Kembali")
            }
        }
        Button(
            onClick  = onNext,
            colors   = ButtonDefaults.buttonColors(containerColor = AppColors.Forest),
            modifier = Modifier
                .weight(1f)
                .height(48.dp)
        ) {
            Text(if (step == 3) "Kirim Laporan" else "Lanjut")
        }
    }
}