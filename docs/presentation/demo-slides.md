# Slide Presentasi Demo - Kelompok 4

## Slide 1: Judul + Nama Tim

# 🌿 EnviroGuard
### Sistem Pelaporan Permasalahan Lingkungan Berbasis GIS

**Kelompok 4 - Rekayasa Perangkat Lunak**

| Nama | NIM |
|------|-----|
| Fadhil Rusadi | L0124013 |
| Besty Mega Fauziah | L0124007 |
| Deoshi Anessah Zheren Areja | L0124009 |
| Dina Hamala Nur Rosyidah | L0124010 |

---

## Slide 2: Problem Statement

# 🎯 Masalah yang Kami Selesaikan

### Permasalahan:
- Masyarakat kesulitan melaporkan permasalahan lingkungan (sampah, pencemaran air, dll)
- Tidak ada sistem terpusat untuk memonitor dan mengelola laporan warga
- Kurangnya transparansi antara pemerintah dan masyarakat regarding status laporan

### Solusi Kami:
- **EnviroGuard** — Platform pelaporan lingkungan berbasis GIS yang memungkinkan warga melaporkan dan melacak permasalahan lingkungan di sekitar mereka secara real-time

---

## Slide 3: Demo Fitur 1 - Pelaporan Laporan

# 📝 Fitur 1: Pelaporan Laporan

### Demo Steps:
1. Login sebagai user
2. Klik tombol "Buat Laporan Baru"
3. Isi formulir:
   - Pilih kategori (Sampah, Pencemaran Air, dll)
   - Tentukan lokasi di peta
   - Tambahkan deskripsi
   - Unggah foto bukti
   - Opsional: buat secara anonim
4. Submit laporan

### Fitur Unggulan:
- ✅ Upload foto dengan Supabase Storage
- ✅ Reverse geocoding otomatis
- ✅ Opsi laporan anonim

---

## Slide 4: Demo Fitur 2 - Peta Laporan Interaktif

# 🗺️ Fitur 2: Peta Laporan Interaktif

### Demo Steps:
1. Navigasi ke halaman utama (dashboard peta)
2. Lihat persebaran laporan di peta
3. Klik marker untuk melihat detail laporan
4. Gunakan filter untuk menyaring berdasarkan kategori
5. Gunakan searchbar untuk mencari lokasi tertentu

### Fitur Unggulan:
- ✅ Visualisasi geografis real-time
- ✅ Filter multi-kategori
- ✅ Detail lengkap per laporan
- ✅ Informasi admin verifier

---

## Slide 5: Demo Fitur 3 - Dashboard Admin

# 👨‍💼 Fitur 3: Dashboard Admin

### Demo Steps:
1. Login sebagai admin
2. Lihat statistik ringkasan (total laporan, grafik)
3. Kelola semua laporan:
   - Verifikasi laporan baru
   - Tolak laporan tidak valid
   - Tandai sebagai "Selesai"
4. Kelola feedback masyarakat

### Fitur Unggulan:
- ✅ Visualisasi data statistik
- ✅ Manajemen laporan terpusat
- ✅ Sistem feedback management

---

## Slide 6: Arsitektur & Tech Stack

# 🏗️ Arsitektur Sistem

### Arsitektur: Client-Server

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Website   │────▶│  Laravel API │────▶│  Supabase   │
│  (Frontend) │     │  (Backend)   │     │ (Database) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │
       │                  ▼
       │           ┌─────────────┐
       │           │  MapTiler   │
       │           │  (Maps API) │
       │           └─────────────┘
       │
       ▼
┌─────────────┐
│   Mobile    │
│   (Kotlin)  │
└─────────────┘
```

### Tech Stack:
| Layer | Teknologi |
|-------|-----------|
| Frontend Web | HTML, CSS, JavaScript, Vite |
| Backend | PHP 8+, Laravel 10+ |
| Mobile | Kotlin (Android) |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage |
| Maps | MapTiler API |
| Authentication | JWT, OAuth (Google) |

---

## Slide 7: Refleksi dan Pembelajaran

# 📚 Refleksi & Pembelajaran

### Yang Berhasil:
- ✅ Kolaborasi tim yang solid
- ✅ Implementasi fitur lengkap sesuai backlog
- ✅ Integrasi berbagai API (Supabase, MapTiler)
- ✅ Dokumentasi yang komprehensif

### Tantangan:
- ⚠️ Manajemen waktu antara website dan mobile
- ⚠️ Handling CORS dan error handling
- ⚠️ Sinkronisasi data antar platform

### Pembelajaran:
- Pentingnya planning yang matang di awal
- Dokumentasi sejak awal lebih baik daripada di akhir
- Testing bertahap lebih efektif daripada testing di akhir

---

## Slide 8: Terima Kasih & Q&A

# 🙏 Terima Kasih

### Kontak Kami:
- **Repository**: [GitHub Link]
- **Email**: kelompok4.rpl@universitas.ac.id

### Demo ini mencakup:
- ✅ Pelaporan laporan dengan foto & lokasi
- ✅ Peta interaktif persebaran laporan
- ✅ Dashboard admin untuk pengelolaan

---

**OPEN FOR QUESTIONS** 💬

*Tim Kelompok 4 - Rekayasa Perangkat Lunak*
