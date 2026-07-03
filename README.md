# 🌿 EnviroGuard

**Sistem Pelaporan Permasalahan Lingkungan Berbasis GIS**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Release](https://img.shields.io/github/v/release/fadhilr/rpl?include_prereleases&sort=semver)](https://github.com/fadhilr/rpl/releases)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/fadhilr/rpl/actions)

---

## 📋 Deskripsi Proyek

EnviroGuard adalah platform berbasis web dan mobile yang memungkinkan masyarakat untuk melaporkan permasalahan lingkungan seperti pencemaran air, sampah liar, dan kerusakan lingkungan lainnya. Laporan dilengkapi dengan lokasi geografis dan foto bukti, kemudian dapat dipantau melalui peta interaktif.

**Problem Statement**: Masyarakat membutuhkan saluran terpusat untuk melaporkan dan melacak permasalahan lingkungan di sekitar mereka.

---

## ✨ Fitur Utama

### Must-have ✅
- **Registrasi & Login** - Autentikasi menggunakan email dengan verifikasi OTP
- **Login Google** - Alternatif login cepat via OAuth
- **Login Admin** - Dashboard khusus untuk pengelola
- **Pelaporan Laporan** - Buat laporan dengan lokasi koordinat
- **Peta Interaktif** - Visualisasi persebaran laporan

### Should-have ✅
- **Status Laporan** - Cek status laporan yang pernah dibuat
- **Upload Foto** - Tambahkan bukti foto pada laporan
- **Manajemen Admin** - Verifikasi, tolak, atau selesaikan laporan
- **Dashboard Statistik** - Grafik ringkasan laporan

### Could-have ✅
- **Riwayat Laporan** - Menu "My Reports" untuk user
- **Filter Kategori** - Sortir laporan berdasarkan jenis
- **Notifikasi** - Pemberitahuan perubahan status
- **Laporan Anonim** - Kirim tanpa identitas

### Nice-to-have (Extra) ✅
- **Reset Password** - via OTP email
- **Manajemen Profil** - Edit foto, password, hapus akun
- **Sistem Feedback** - Kritik & saran untuk admin

---

## 📸 Screenshots

<details>
<summary>Klik untuk melihat screenshot</summary>

### Website - Dashboard Peta
![Peta Laporan](./docs/screenshots/peta-laporan.png)

### Website - Form Laporan
![Form Laporan](./docs/screenshots/form-laporan.png)

### Website - Dashboard Admin
![Dashboard Admin](./docs/screenshots/admin-dashboard.png)

### Mobile App - Halaman Utama
![Mobile Home](./docs/screenshots/mobile-home.png)

</details>

---

## 🛠️ Prasyarat

Pastikan Anda telah menginstall:

| Software | Versi Minimum | Keterangan |
|----------|---------------|------------|
| PHP | 8.1+ | Untuk Laravel Backend |
| Composer | 2.x | Dependency manager PHP |
| Node.js | 18.x+ | Untuk Vite frontend |
| PostgreSQL | 14.x | Database |
| Android Studio | Latest | Untuk mobile development |

---

## 📥 Cara Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/fadhilr/rpl.git
cd rpl
```

### 2. Setup Backend (Laravel)

```bash
cd src/backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Setup database di .env:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=enviroguard
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start server
php artisan serve
```

### 3. Setup Frontend Website

```bash
cd src/website

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Setup Mobile (Android)

```bash
cd src/mobile

# Open di Android Studio
# Sync Gradle files
# Run on emulator atau device
```

### 5. Konfigurasi Eksternal

#### Supabase Setup
1. Buat project di [Supabase](https://supabase.com)
2. Enable Authentication
3. Buat storage bucket `report-photos`
4. Update `.env` dengan credentials

#### MapTiler API
1. Daftar di [MapTiler](https://www.maptiler.com)
2. Get API key
3. Update di konfigurasi frontend

---

## 🚀 Cara Menjalankan

### Development Mode

```bash
# Terminal 1 - Backend
cd src/backend
php artisan serve

# Terminal 2 - Frontend
cd src/website
npm run dev
```

Aplikasi akan tersedia di:
- **Website**: http://localhost:5173
- **API**: http://localhost:8000

---

## 📁 Struktur Folder

```
rpl/
├── CHANGELOG.md              # Catatan perubahan versi
├── README.md                 # Dokumentasi utama
├── .gitignore
│
├── docs/                     # Dokumentasi proyek
│   ├── ai-usage-log.md       # Log penggunaan AI
│   ├── api-documentation.md
│   ├── backend-documentation.md
│   ├── database-documentation.md
│   ├── problem-statement.md
│   ├── srs.md                # Software Requirements Specification
│   ├── team-contract.md
│   ├── test-cases.md
│   ├── user-stories.md
│   ├── user-manual.md
│   ├── installation-guide.md
│   ├── presentation/         # Slide presentasi
│   │   └── demo-slides.md
│   ├── uml/                  # Diagram UML
│   └── wireframe/            # Wireframe aplikasi
│
├── postman/                  # Postman collections & specs
│   ├── collections/
│   ├── environments/
│   └── specs/
│
├── src/
│   ├── backend/              # Laravel API
│   │   ├── app/
│   │   ├── config/
│   │   ├── database/
│   │   ├── routes/
│   │   └── tests/
│   │
│   ├── website/             # Frontend (HTML/CSS/JS)
│   │   ├── css/
│   │   ├── js/
│   │   ├── users/
│   │   └── index.html
│   │
│   └── mobile/              # Android App (Kotlin)
│       └── app/src/main/
│
└── tests/                    # Test files
    └── Unit/
```

---

## 👥 Daftar Anggota Tim

| Nama | NIM | Role |
|------|-----|------|
| Fadhil Rusadi | L0124013 | Fullstack (Website) |
| Besty Mega Fauziah | L0124007 | Backend Developer |
| Deoshi Anessah Zheren Areja | L0124009 | Mobile Developer |
| Dina Hamala Nur Rosyidah | L0124010 | Mobile Developer |

---

## 📚 Dokumentasi Lengkap

| Dokumen | Lokasi |
|---------|--------|
| Problem Statement | `docs/problem-statement.md` |
| User Stories | `docs/user-stories.md` |
| SRS | `docs/srs.md` |
| API Documentation | `docs/api-documentation.md` |
| Database Documentation | `docs/database-documentation.md` |
| Test Cases | `docs/test-cases.md` |
| User Manual | `docs/user-manual.md` |
| Installation Guide | `docs/installation-guide.md` |
| AI Usage Log | `docs/ai-usage-log.md` |
| Presentation Slides | `docs/presentation/demo-slides.md` |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

## 🙏 Apresiasi

- **Dosen**: Terima kasih atas bimbingan selama semester
- **Asisten Dosen**: Terima kasih atas feedback dan review
- **Tim**: Terima kasih atas kerja keras seluruh anggota

---

*EnviroGuard v1.0.0 - Dirlisakan pada 3 Juli 2026*
