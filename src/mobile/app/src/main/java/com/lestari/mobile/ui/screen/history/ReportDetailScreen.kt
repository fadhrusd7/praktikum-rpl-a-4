package com.lestari.mobile.ui.screen.history

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.model.statusDescription
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.component.DetailRow
import com.lestari.mobile.ui.component.FakeReportPhoto
import com.lestari.mobile.ui.component.SectionCard
import com.lestari.mobile.ui.component.StatusPill
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun ReportDetailScreen(report: ReportItem, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize()) {
        AppHeader("Detail Laporan") {
            OutlinedButton(onClick = onBack, modifier = Modifier.height(36.dp)) {
                Text("Kembali", fontSize = 12.sp)
            }
        }
        Column(
            modifier = Modifier
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SectionCard(report.title) {
                StatusPill(report.status)
                Text(report.number, color = AppColors.Muted, fontSize = 12.sp)
                if (report.hasPhoto) {
                    FakeReportPhoto()
                } else {
                    Text("Laporan ini belum memiliki foto.", color = AppColors.Muted, fontSize = 13.sp)
                }
                Spacer(Modifier.height(4.dp))
                Text(report.description, fontSize = 13.sp)
            }
            SectionCard("Informasi") {
                DetailRow("Kategori", report.category)
                DetailRow("Lokasi", report.location)
                DetailRow("Waktu", report.date)
            }
            SectionCard("Status") {
                Text(statusDescription(report.status), fontSize = 13.sp)
            }
        }
    }
}
