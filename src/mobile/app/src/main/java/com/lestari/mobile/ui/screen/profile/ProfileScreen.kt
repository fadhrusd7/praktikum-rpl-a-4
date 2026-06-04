package com.lestari.mobile.ui.screen.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lestari.mobile.ui.component.AppHeader
import com.lestari.mobile.ui.component.DetailRow
import com.lestari.mobile.ui.component.SectionCard
import com.lestari.mobile.ui.theme.AppColors

@Composable
fun ProfileScreen(onLogout: () -> Unit) {
    Column(Modifier.fillMaxSize()) {
        AppHeader("Profil")
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFD8EFDE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("U", color = AppColors.ForestDark, fontWeight = FontWeight.Bold, fontSize = 22.sp)
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("User Lestari", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("user@lestari.id", color = AppColors.Muted, fontSize = 13.sp)
                        Text("Warga Surakarta", color = AppColors.ForestDark, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
            SectionCard("Ringkasan Aktivitas") {
                DetailRow("Laporan", "4 laporan")
                DetailRow("Terverifikasi", "1 laporan")
                DetailRow("Selesai", "1 laporan")
            }
            SectionCard("Akun") {
                DetailRow("Nama", "User Lestari")
                DetailRow("Email", "user@lestari.id")
                DetailRow("Kota", "Surakarta")
                DetailRow("Telepon", "Belum diisi")
            }
            SectionCard("Preferensi") {
                DetailRow("Notifikasi", "Aktif")
                DetailRow("Bahasa", "Indonesia")
                DetailRow("Mode peta", "Satelit")
            }
            SectionCard("Keamanan") {
                DetailRow("Login", "Google / Email")
                DetailRow("Status akun", "Aktif")
            }
            OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
                Text("Logout")
            }
        }
    }
}
