package com.lestari.mobile.ui.screen.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.lestari.mobile.map.ReportLocationMap
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.model.ReportStatus
import com.lestari.mobile.ui.component.StatusPill
import com.lestari.mobile.data.api.RetrofitClient
import com.lestari.mobile.ui.theme.AppColors

/**
 * Konten utama Detail Laporan (tanpa top bar / chrome layar).
 *
 * Diekstrak dari [ReportDetailScreen] agar bisa di-reuse oleh layar lain
 * (misalnya MapScreen) tanpa duplikasi kode. Composable ini HANYA berisi
 * body yang scrollable — pemanggil bertanggung jawab menyediakan top bar,
 * background penuh layar, dan padding status bar sesuai konteksnya masing-masing.
 *
 * @param report Data laporan yang akan ditampilkan. Sumbernya bisa dari
 *   hasil fetch detail (dengan logs lengkap) di History maupun di Map.
 * @param modifier Modifier opsional untuk container Column, misal untuk
 *   menambahkan padding tambahan dari pemanggil.
 */
@Composable
fun ReportDetailContent(
    report: ReportItem,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // ── Judul + status pill ───────────────────────────────────────────
        Row(
            modifier          = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top
        ) {
            Column(Modifier.weight(1f)) {
                Text(
                    text       = report.title,
                    fontSize   = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color      = AppColors.TextPrimary
                )
                Spacer(Modifier.height(2.dp))
                Text(report.number, color = AppColors.Muted, fontSize = 12.sp)
            }
            Spacer(Modifier.width(12.dp))
            StatusPill(report.status)
        }

        // ── Box alasan penolakan (hanya jika ditolak) ─────────────────────
        if (report.status == ReportStatus.Rejected) {
            val alasan = report.logs.firstOrNull { it.status == "ditolak" }?.catatan
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFFFEBEE), RoundedCornerShape(10.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("⚠", fontSize = 14.sp)
                Column {
                    Text(
                        text       = "Alasan Penolakan",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 13.sp,
                        color      = Color(0xFFB71C1C)
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text     = alasan ?: "Laporan ditolak oleh admin.",
                        fontSize = 13.sp,
                        color    = Color(0xFFB71C1C)
                    )
                }
            }
        }

        // ── Informasi Laporan ───────────────────────────────────────────
        Surface(
            shape           = RoundedCornerShape(12.dp),
            color           = Color.White,
            shadowElevation = 1.dp,
            modifier        = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("📋", fontSize = 16.sp)
                    Spacer(Modifier.width(6.dp))
                    Text("Informasi Laporan", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = AppColors.TextPrimary)
                }
                HorizontalDivider(color = AppColors.Border)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Kategori", color = AppColors.Muted, fontSize = 12.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(report.category, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                    Column(Modifier.weight(1f)) {
                        Text("Waktu", color = AppColors.Muted, fontSize = 12.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(report.date, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                }
            }
        }

        // ── Bukti Visual ─────────────────────────────────────────────────
        if (report.photoUrl != null) {
            Surface(
                shape           = RoundedCornerShape(12.dp),
                color           = Color.White,
                shadowElevation = 1.dp,
                modifier        = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🖼️", fontSize = 16.sp)
                        Spacer(Modifier.width(6.dp))
                        Text("Bukti Visual", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = AppColors.TextPrimary)
                    }
                    HorizontalDivider(color = AppColors.Border)

                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data("${RetrofitClient.PHOTO_BASE_URL}${report.photoUrl}")
                            .crossfade(true)
                            .listener(
                                onError   = { _, r -> android.util.Log.e("PhotoDebug", "Error: ${r.throwable}") },
                                onSuccess = { _, _ -> android.util.Log.d("PhotoDebug", "Success") }
                            )
                            .build(),
                        contentDescription = "Foto laporan",
                        contentScale       = ContentScale.Crop,
                        modifier           = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                }
            }
        }

        // ── Deskripsi Laporan ───────────────────────────────────────────
        Surface(
            shape           = RoundedCornerShape(12.dp),
            color           = Color.White,
            shadowElevation = 1.dp,
            modifier        = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("📄", fontSize = 16.sp)
                    Spacer(Modifier.width(6.dp))
                    Text("Deskripsi Laporan", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = AppColors.TextPrimary)
                }
                HorizontalDivider(color = AppColors.Border)

                Text(report.description, fontSize = 13.sp, color = AppColors.TextPrimary)
            }
        }

        // ── Lokasi ───────────────────────────────────────────────────────
        if (report.latitude != null && report.longitude != null) {
            Surface(
                shape           = RoundedCornerShape(12.dp),
                color           = Color.White,
                shadowElevation = 1.dp,
                modifier        = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("📍", fontSize = 14.sp)
                        Spacer(Modifier.width(6.dp))
                        Text("Lokasi", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = AppColors.TextPrimary)
                    }
                    if (report.location.isNotBlank()) {
                        Text(report.location, fontSize = 13.sp, color = AppColors.TextPrimary)
                    }
                    ReportLocationMap(
                        latitude  = report.latitude,
                        longitude = report.longitude,
                        modifier  = Modifier
                            .fillMaxWidth()
                            .height(180.dp)
                            .clip(RoundedCornerShape(8.dp))
                    )
                }
            }
        }

        // ── Pelapor + Status verifikasi ───────────────────────────────────
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Pelapor
            Surface(
                shape           = RoundedCornerShape(12.dp),
                color           = Color.White,
                shadowElevation = 1.dp,
                modifier        = Modifier.weight(1f)
            ) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Dilaporkan oleh:", color = AppColors.Muted, fontSize = 12.sp)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("👤", fontSize = 14.sp)
                        Text(
                            text       = when {
                                report.isAnonymous          -> "Anonim"
                                report.reporterName != null -> report.reporterName
                                else                        -> "-"
                            },
                            fontWeight = FontWeight.SemiBold,
                            fontSize   = 13.sp,
                            color      = AppColors.TextPrimary
                        )
                    }
                }
            }

            // Status verifikasi (jika bukan pending)
            if (report.status != ReportStatus.Pending) {
                val (bgColor, textColor, icon, label) = when (report.status) {
                    ReportStatus.Verified -> listOf(Color(0xFFE8F5E9), Color(0xFF1B5E20), "✅", "Laporan Terverifikasi")
                    ReportStatus.Done     -> listOf(Color(0xFFE8F5E9), Color(0xFF1B5E20), "✅", "Laporan Selesai")
                    ReportStatus.Rejected -> listOf(Color(0xFFFFEBEE), Color(0xFFB71C1C), "❌", "Laporan Ditolak")
                    else                  -> listOf(Color(0xFFFFF8E1), Color(0xFF7A5901), "⏳", "Menunggu")
                }
                Surface(
                    shape           = RoundedCornerShape(12.dp),
                    color           = bgColor as Color,
                    modifier        = Modifier.weight(1f)
                ) {
                    Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(icon as String, fontSize = 14.sp)
                            Text(label as String, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = textColor as Color)
                        }
                        if (report.adminUsername != null) {
                            Text("Oleh: @${report.adminUsername}", fontSize = 11.sp, color = (textColor as Color).copy(alpha = 0.8f))
                        }
                    }
                }
            }
        }

        // ── Log Aktivitas ─────────────────────────────────────────────────
        if (report.logs.isNotEmpty()) {
            Surface(
                shape           = RoundedCornerShape(12.dp),
                color           = Color.White,
                shadowElevation = 1.dp,
                modifier        = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text(
                        text       = "LOG AKTIVITAS",
                        fontSize   = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color      = AppColors.Muted,
                        letterSpacing = 1.sp
                    )
                    Spacer(Modifier.height(12.dp))

                    report.logs.forEachIndexed { index, log ->
                        val isLatest = index == 0
                        val dotColor = when (log.status) {
                            "ditolak"                      -> Color(0xFFE24B4A)
                            "divalidasi", "terverifikasi"  -> Color(0xFF1D9E75)
                            "menunggu_validasi"            -> Color(0xFFEF9F27)
                            "selesai"                       -> Color(0xFF1B5E20)
                            else                            -> Color(0xFF9E9E9E)
                        }

                        Row(
                            modifier          = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.Top,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .padding(top = 4.dp)
                                    .size(12.dp)
                                    .background(dotColor, CircleShape)
                            )
                            Column(
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(bottom = if (index < report.logs.lastIndex) 16.dp else 0.dp)
                            ) {
                                Text(
                                    text       = log.aksi,
                                    fontSize   = 14.sp,
                                    fontWeight = if (isLatest) FontWeight.Bold else FontWeight.Normal,
                                    color      = if (isLatest) AppColors.TextPrimary else AppColors.TextPrimary.copy(alpha = 0.65f)
                                )
                                Spacer(Modifier.height(2.dp))
                                Text(
                                    text     = log.createdAt,
                                    fontSize = 12.sp,
                                    color    = AppColors.Muted
                                )
                                if (!log.catatan.isNullOrBlank() && log.status != "ditolak") {
                                    Spacer(Modifier.height(4.dp))
                                    Text(
                                        text     = log.catatan,
                                        fontSize = 12.sp,
                                        color    = AppColors.TextPrimary,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(Color(0xFFF5F5F5), RoundedCornerShape(6.dp))
                                            .padding(8.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}