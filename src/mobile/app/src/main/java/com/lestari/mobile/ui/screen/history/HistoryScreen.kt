package com.lestari.mobile.ui.screen.history

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.component.StatusPill
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun HistoryScreen(reports: List<ReportItem>) {
    var selectedFilter by rememberSaveable { mutableStateOf("Semua") }
    var query by rememberSaveable { mutableStateOf("") }
    var selectedReport by remember { mutableStateOf<ReportItem?>(null) }
    val filters = listOf("Semua", "Tertunda", "Terverifikasi", "Selesai", "Ditolak")
    val visibleReports = reports
        .filter { selectedFilter == "Semua" || it.status.label == selectedFilter }
        .filter { report ->
            val search = query.trim()
            search.isBlank() ||
                report.title.contains(search, ignoreCase = true) ||
                report.number.contains(search, ignoreCase = true) ||
                report.category.contains(search, ignoreCase = true) ||
                report.location.contains(search, ignoreCase = true)
        }

    selectedReport?.let {
        ReportDetailScreen(report = it, onBack = { selectedReport = null })
        return
    }

    Column(Modifier.fillMaxSize()) {
        AppHeader("Riwayat Laporan")
        LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    placeholder = { Text("Cari Laporan...") },
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(12.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.horizontalScroll(rememberScrollState())
                ) {
                    filters.forEach { filter ->
                        FilterChip(
                            selected = selectedFilter == filter,
                            onClick = { selectedFilter = filter },
                            label = { Text(filter, fontSize = 11.sp) }
                        )
                    }
                }
            }
            if (visibleReports.isEmpty()) {
                item {
                    Text(
                        text = "Belum ada laporan yang cocok.",
                        color = AppColors.Muted,
                        modifier = Modifier.padding(top = 24.dp)
                    )
                }
            }
            items(visibleReports) { report ->
                HistoryCard(report = report, onClick = { selectedReport = report })
            }
        }
    }
}

@Composable
private fun HistoryCard(report: ReportItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(report.title, fontWeight = FontWeight.Bold, fontSize = 16.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(report.number, color = AppColors.Muted, fontSize = 11.sp)
                }
                StatusPill(report.status)
            }
            AssistChip(onClick = {}, label = { Text(report.category, fontSize = 11.sp) })
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(report.date, color = AppColors.Muted, fontSize = 11.sp, modifier = Modifier.weight(1f))
                OutlinedButton(
                    onClick = onClick,
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 4.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Text("Detail", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
