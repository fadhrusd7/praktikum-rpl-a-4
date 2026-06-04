package com.lestari.mobile.model

import androidx.compose.ui.graphics.Color
import com.lestari.mobile.ui.theme.AppColors

enum class ReportStatus(
    val label: String,
    val color: Color,
    val background: Color
) {
    Pending("Tertunda", Color(0xFFC99100), Color(0xFFFFF0BE)),
    Verified("Terverifikasi", AppColors.ForestDark, Color(0xFFD8EFDE)),
    Done("Selesai", Color(0xFF8F8F8F), Color(0xFFECECEC)),
    Rejected("Ditolak", AppColors.Danger, Color(0xFFFFD7D7))
}

data class ReportItem(
    val title: String,
    val number: String,
    val category: String,
    val description: String,
    val location: String,
    val date: String,
    val status: ReportStatus,
    val hasPhoto: Boolean = true
)

val ReportCategories = listOf("Sampah", "Banjir", "Polusi", "Penebangan", "Isu Air", "Lain-Lain")

fun categoryTitle(category: String): String = when (category) {
    "Banjir" -> "Genangan di jalan"
    "Polusi" -> "Polusi udara"
    "Penebangan" -> "Penebangan pohon"
    "Isu Air" -> "Masalah kualitas air"
    else -> "Tumpukan sampah liar"
}

fun statusDescription(status: ReportStatus): String = when (status) {
    ReportStatus.Pending -> "Laporan sedang menunggu validasi admin."
    ReportStatus.Verified -> "Laporan sudah terverifikasi dan menunggu tindak lanjut."
    ReportStatus.Done -> "Laporan sudah selesai ditangani."
    ReportStatus.Rejected -> "Laporan ditolak. Mohon lengkapi bukti atau lokasi dengan lebih jelas."
}

val seedReports = listOf(
    ReportItem(
        title = "Tumpukan sampah liar",
        number = "LAP-03052026-0004",
        category = "Sampah",
        description = "Tumpukan sampah di tepi jalan mulai menimbulkan bau dan mengganggu akses warga.",
        location = "Jl. Klebet 7, Surakarta",
        date = "Senin, 8 Mei 2027 - 8.30 WIB",
        status = ReportStatus.Pending
    ),
    ReportItem(
        title = "Genangan di jalan",
        number = "LAP-03052026-0005",
        category = "Banjir",
        description = "Genangan air menetap setelah hujan dan membuat pengendara sulit lewat.",
        location = "Jl. Klebet 3, Surakarta",
        date = "Sabtu, 6 Mei 2027 - 8.30 WIB",
        status = ReportStatus.Verified
    ),
    ReportItem(
        title = "Tumpukan sampah liar",
        number = "LAP-03052026-0006",
        category = "Sampah",
        description = "Laporan ditolak karena lokasi dan foto belum cukup jelas.",
        location = "Jl. Klebet 7, Surakarta",
        date = "Senin, 8 Mei 2027 - 8.30 WIB",
        status = ReportStatus.Rejected
    ),
    ReportItem(
        title = "Tumpukan sampah liar",
        number = "LAP-03052026-0007",
        category = "Sampah",
        description = "Laporan sudah ditindaklanjuti oleh petugas.",
        location = "Jl. Klebet 7, Surakarta",
        date = "Senin, 8 Mei 2027 - 8.30 WIB",
        status = ReportStatus.Done
    )
)
