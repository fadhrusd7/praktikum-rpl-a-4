package com.lestari.mobile.model

import androidx.compose.ui.graphics.Color
import java.text.SimpleDateFormat
import java.util.Locale
import com.lestari.mobile.data.model.LogItem
import com.lestari.mobile.data.model.ReportData

enum class ReportStatus(
    val label: String,
    val color: Color,
    val background: Color
) {
    Pending("Tertunda", Color(0xFF7A5901), Color(0xFFFFF3CD)),
    Verified("Terverifikasi", Color(0xFF004D40), Color(0xFFB2DFDB)),
    Done("Selesai", Color(0xFF1B5E20), Color(0xFFC8E6C9)),
    Rejected("Ditolak", Color(0xFFB71C1C), Color(0xFFFFCDD2))
}

data class ReportItem(
    val id: Int = 0,
    val title: String,
    val number: String,
    val category: String,
    val description: String,
    val location: String,
    val date: String,
    val status: ReportStatus,
    val hasPhoto: Boolean = true,
    val photoUrl: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val isAnonymous: Boolean = false,
    val reporterName: String? = null,
    val logs: List<LogItem> = emptyList(),
    val adminUsername: String? = null
)

val ReportCategories = listOf("Sampah", "Banjir", "Polusi", "Penebangan", "Isu Air", "Lainnya")

fun categoryTitle(category: String): String = when (category) {
    "Banjir"     -> "Genangan di jalan"
    "Polusi"     -> "Polusi udara"
    "Penebangan" -> "Penebangan pohon"
    "Isu Air"    -> "Masalah kualitas air"
    else         -> "Tumpukan sampah liar"
}

fun statusDescription(status: ReportStatus): String = when (status) {
    ReportStatus.Pending  -> "Laporan sedang menunggu validasi admin."
    ReportStatus.Verified -> "Laporan sudah terverifikasi dan menunggu tindak lanjut."
    ReportStatus.Done     -> "Laporan sudah selesai ditangani."
    ReportStatus.Rejected -> "Laporan ditolak. Mohon lengkapi bukti atau lokasi dengan lebih jelas."
}

fun String.toReportStatus(): ReportStatus = when (this) {
    "divalidasi"        -> ReportStatus.Verified
    "terverifikasi"     -> ReportStatus.Verified
    "selesai"           -> ReportStatus.Done
    "ditolak"           -> ReportStatus.Rejected
    "menunggu_validasi" -> ReportStatus.Pending
    else                -> ReportStatus.Pending
}

fun String.toReadableDate(): String {
    if (this.isBlank()) return "-"
    return try {
        val input  = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val output = SimpleDateFormat("EEEE, d MMM yyyy - HH.mm 'WIB'", Locale("id"))
        output.format(input.parse(this)!!)
    } catch (e: Exception) {
        this
    }
}

fun ReportData.toReportItem() = ReportItem(
    id = id,
    title         = judul ?: "Tanpa Judul",
    number        = nomor_laporan ?: "-",
    category      = kategori ?: "Lainnya",
    description   = deskripsi ?: "",
    location      = lokasi ?: "Lokasi tidak diketahui",
    date          = (created_at ?: "").toReadableDate(),
    status        = (status ?: "menunggu_validasi").toReportStatus(),
    hasPhoto      = !(photos.isNullOrEmpty()),
    photoUrl      = photos?.firstOrNull()?.file_path,
    latitude      = latitude,
    longitude     = longitude,
    isAnonymous   = is_anonymous ?: false,
    reporterName  = if (is_anonymous == true) "Anonim" else (user?.nama_lengkap ?: user?.nama ?: "User"),
    adminUsername = admin?.username,
    logs          = logs?.map { log ->
        LogItem(
            aksi = log.aksi ?: "",
            status = log.status ?: "",
            catatan = log.catatan,
            createdAt = (log.created_at ?: "").toReadableDate(),
            adminUsername = log.admin?.username
        )
    } ?: emptyList()
)
