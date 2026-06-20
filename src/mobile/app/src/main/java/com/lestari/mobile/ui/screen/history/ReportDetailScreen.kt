package com.lestari.mobile.ui.screen.history

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowBackIosNew
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.ui.screen.map.ReportDetailContent

/**
 * Layar Detail Laporan full-screen, dipakai dari menu History.
 *
 * Hanya bertanggung jawab atas "chrome" layar (top bar + breadcrumb + background
 * penuh layar). Isi kontennya di-reuse dari [ReportDetailContent] agar tidak
 * duplikasi dengan tampilan detail laporan di MapScreen.
 */
@Composable
fun ReportDetailScreen(report: ReportItem, onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.Page)
    ) {
        // ── Top bar ───────────────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(AppColors.Page)
                .padding(start = 16.dp, end = 16.dp, top = 38.dp, bottom = 12.dp),
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
            // Breadcrumb: Laporan > LAP-xxx
            Text("Laporan", color = AppColors.Forest, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Text("  ›  ", color = AppColors.Muted, fontSize = 13.sp)
            Text(report.number, color = AppColors.Muted, fontSize = 13.sp)
        }

        ReportDetailContent(
            report   = report,
            modifier = Modifier.weight(1f).fillMaxWidth()
        )
    }
}