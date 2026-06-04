package com.lestari.mobile.ui.screen.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.BuildConfig
import com.lestari.mobile.map.MapTilerView
import com.lestari.mobile.model.ReportCategories
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun MapScreen(onCreateReport: () -> Unit) {
    var showFilter by remember { mutableStateOf(false) }
    val selectedCategories = remember {
        mutableStateListOf<String>().apply { addAll(ReportCategories.filterNot { it == "Lain-Lain" }) }
    }

    Column(Modifier.fillMaxSize()) {
        AppHeader(title = "Peta") {
            OutlinedButton(
                onClick = { showFilter = !showFilter },
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.height(36.dp)
            ) {
                Text(if (showFilter) "Tutup" else "Filter", fontSize = 12.sp)
            }
            Spacer(Modifier.width(8.dp))
            Button(
                onClick = onCreateReport,
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.ForestDark),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.height(36.dp)
            ) {
                Text("+ Laporan", fontSize = 12.sp)
            }
        }
        Box(Modifier.fillMaxSize()) {
            MapTilerView(
                apiKey = BuildConfig.MAPTILER_API_KEY,
                selectedCategories = selectedCategories.toSet(),
                modifier = Modifier.fillMaxSize()
            )
            CategoryLegend(
                selectedCategories = selectedCategories.toSet(),
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 14.dp, end = 10.dp)
            )
            if (showFilter) {
                MapFilterPanel(
                    selectedCategories = selectedCategories.toSet(),
                    onToggle = { category ->
                        if (category in selectedCategories) {
                            selectedCategories.remove(category)
                        } else {
                            selectedCategories.add(category)
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(16.dp)
                )
            }
        }
    }
}

@Composable
private fun MapFilterPanel(
    selectedCategories: Set<String>,
    onToggle: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Filter kategori", fontWeight = FontWeight.Bold, color = AppColors.ForestDark)
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                ReportCategories.filterNot { it == "Lain-Lain" }.take(3).forEach { category ->
                    FilterChip(
                        selected = category in selectedCategories,
                        onClick = { onToggle(category) },
                        label = { Text(category, fontSize = 11.sp) }
                    )
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                ReportCategories.filterNot { it == "Lain-Lain" }.drop(3).forEach { category ->
                    FilterChip(
                        selected = category in selectedCategories,
                        onClick = { onToggle(category) },
                        label = { Text(category, fontSize = 11.sp) }
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryLegend(selectedCategories: Set<String>, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.width(150.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Kategori Isu", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            LegendItem(AppColors.Danger, "Sampah", "Sampah" in selectedCategories)
            LegendItem(AppColors.Info, "Banjir", "Banjir" in selectedCategories)
            LegendItem(Color(0xFF8E8E8E), "Polusi", "Polusi" in selectedCategories)
            LegendItem(AppColors.Soil, "Penebangan", "Penebangan" in selectedCategories)
            LegendItem(AppColors.Info, "Isu Air", "Isu Air" in selectedCategories)
        }
    }
}

@Composable
private fun LegendItem(color: Color, label: String, active: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(if (active) color else AppColors.Border)
        )
        Spacer(Modifier.width(8.dp))
        Text(label, fontSize = 12.sp, color = if (active) Color.Unspecified else AppColors.Muted)
    }
}
