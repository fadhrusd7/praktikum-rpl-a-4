package com.lestari.mobile.ui.screen.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.lestari.mobile.model.ReportItem
import com.lestari.mobile.ui.theme.AppColors
import com.lestari.mobile.data.api.RetrofitClient

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportMapBottomSheet(
    report: ReportItem,
    onDismiss: () -> Unit,
    onDetailClick: (String) -> Unit,  // kirim nomor laporan ke detail screen
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color.White,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp)
                .padding(bottom = 24.dp)
        ) {
            // Judul + nomor laporan
            Text(
                text = report.title,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = Color.Black
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = report.number,
                fontSize = 12.sp,
                color = Color.Gray
            )

            Spacer(Modifier.height(8.dp))

            // Koordinat
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("📍", fontSize = 12.sp)
                Spacer(Modifier.width(4.dp))
                Text(
                    text = "${report.latitude}, ${report.longitude}",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }

            Spacer(Modifier.height(8.dp))

            // Chip kategori
            Box(
                modifier = Modifier
                    .background(
                        color = AppColors.ForestDark.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(50)
                    )
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text(
                    text = report.category,
                    fontSize = 12.sp,
                    color = AppColors.ForestDark,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(Modifier.height(12.dp))

            // Foto
            if (report.photoUrl != null) {
                // BENAR
                val fullUrl = "${RetrofitClient.PHOTO_BASE_URL}${report.photoUrl}"
                AsyncImage(
                    model = fullUrl,
                    contentDescription = "Foto laporan",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .clip(RoundedCornerShape(12.dp))
                )
                Spacer(Modifier.height(12.dp))
            }

            // Tanggal
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("🕐", fontSize = 12.sp)
                Spacer(Modifier.width(6.dp))
                Column {
                    Text(
                        text = "Dilaporkan pada",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = report.date,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                }
            }

            Spacer(Modifier.height(10.dp))

            // Lokasi
            Row(verticalAlignment = Alignment.Top) {
                Text("📌", fontSize = 12.sp)
                Spacer(Modifier.width(6.dp))
                Column {
                    Text(
                        text = "Lokasi",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = report.location,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                }
            }

            Spacer(Modifier.height(10.dp))

            // Deskripsi
            Text(
                text = report.description,
                fontSize = 13.sp,
                color = Color.DarkGray,
                lineHeight = 20.sp
            )

            Spacer(Modifier.height(16.dp))

            // Status badge
            Box(
                modifier = Modifier
                    .background(
                        color = report.status.background,
                        shape = RoundedCornerShape(50)
                    )
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Text(
                    text = report.status.label,
                    fontSize = 12.sp,
                    color = report.status.color,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(Modifier.height(16.dp))

            // Tombol detail
            Button(
                onClick = { onDetailClick(report.number) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppColors.ForestDark,
                    contentColor = Color.White
                )
            ) {
                Text("Detail", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
        }
    }
}