# Lestari App - Refactor Checkpoint

Dokumen ini berfungsi sebagai penanda (checkpoint) dari progres pengembangan dan *refactoring* yang telah dilakukan pada aplikasi Lestari, serta panduan untuk pengujian dan pengembangan selanjutnya.

## 📝 Tentang Proyek Ini
Lestari adalah aplikasi pelaporan isu lingkungan berbasis web yang memungkinkan pengguna untuk melaporkan berbagai masalah lingkungan (seperti Sampah, Banjir, Polusi, dll) di sekitar mereka. Laporan-laporan ini divisualisasikan melalui peta interaktif dan dapat ditinjau serta divalidasi oleh Admin.
- **Frontend:** Vanilla HTML, CSS, JavaScript (dilayani melalui Vite).
- **Backend:** Laravel 11 (REST API).
- **Database & Storage:** PostgreSQL & Supabase.
- **Maps:** Leaflet & MapTiler.

---

## 🛠️ Riwayat Refactoring (Tahap 1 - 3)
Sejauh ini, kita telah menyelesaikan 3 fase *refactoring* utama untuk memperbaiki kualitas kode (Clean Code) tanpa mengubah fitur utama aplikasi:

### Fase 1: General Code Cleanup
- Membersihkan *dead code*, *console.log* yang tertinggal, dan merapikan struktur file dasar aplikasi.
- Standardisasi penamaan variabel dan penghapusan *comment* yang sudah tidak relevan.

### Fase 2: Backend Clean Code & Optimization
- **Database Transactions:** Mengamankan fungsi pembuatan laporan (`ReportController@store`) dengan `DB::transaction`. Jika proses unggah foto gagal, data laporan tidak akan terpotong (menghindari data *orphan*).
- **Traits untuk Reusability:** Memisahkan logika *formatting* data respons API ke dalam *Trait* khusus (`FormatsReports.php`) sehingga struktur JSON yang dikembalikan selalu konsisten dan *controller* menjadi lebih ramping.

### Fase 3: Frontend Consolidation
- **Sentralisasi API:** Memindahkan semua pemanggilan `fetch` yang berserakan di berbagai file ke dalam satu modul terpusat (`shared/api.js`). Mempermudah penanganan *error* terpusat (seperti intercept `401 Unauthorized` atau formating HTTP errors dengan `ApiError`).
- **Sentralisasi Utilitas & Peta:** Memindahkan fungsi *geocoding* (Nominatim OpenStreetMap) dan rendering peta (Leaflet SVG Markers) ke dalam modul `shared/map-core.js` serta *helpers* ke `shared/utils.js`.

---

## 💡 Saran Refactoring Selanjutnya (Fase 4+)
Jika ke depannya aplikasi ingin dioptimalkan lagi, berikut adalah area yang sangat disarankan untuk di-*refactor*:

1. **Ekstraksi "Service Layer" (Backend):** 
   Memisahkan logika bisnis yang berat (seperti kompresi gambar GD, unggah ke Supabase, kalkulasi jarak duplikat) dari `ReportController` ke dalam kelas layanan terpisah (misal `ReportService.php`).
2. **Standardisasi API Responses (Backend):**
   Membuat *Trait* `ApiResponses` untuk membungkus `response()->json()` agar semua balikan REST API (baik dari Auth, User, Admin, dll) memiliki struktur JSON (`success`, `data`, `message`) yang 100% konsisten.
3. **Sentralisasi Komponen UI (Frontend):**
   Membuat abstraksi komponen UI (seperti Modal, Toast Notification, Sidebar) ke dalam satu file *JavaScript* agar tidak perlu diinisialisasi secara berulang-ulang di setiap halaman HTML.

---

## 🧪 Panduan Testing & Branching

Untuk menjaga stabilitas aplikasi, pengujian fitur dan refactoring selanjutnya harus dipisah ke dalam *branch* tersendiri.

### Alur Branching (Git Workflow)
1. Setiap kali akan mengetes atau mengubah kode, buat *branch* baru dari `main`:
   ```bash
   git checkout -b feature/nama-fitur
   # atau
   git checkout -b test/nama-testing
   ```
2. Lakukan perubahan, lalu *commit* dan *push*:
   ```bash
   git add .
   git commit -m "Deskripsi perubahan"
   git push -u origin nama-branch
   ```
3. Uji coba aplikasi di *branch* tersebut. Jika aman, lakukan *Pull Request* (PR) ke `main`.

### Cara Menjalankan Uji Coba (Testing) Lokal
Untuk menguji aplikasi secara menyeluruh di *local environment*, ikuti langkah berikut:

1. **Jalankan Backend (Terminal 1):**
   Pastikan PostgreSQL menyala dan *environment variables* di `.env` backend sudah benar.
   ```bash
   cd src/backend
   php artisan serve
   ```
2. **Jalankan Frontend (Terminal 2):**
   ```bash
   cd src/website
   npx vite
   ```
3. **Skenario Testing Utama (End-to-End):**
   - **Autentikasi:** Coba daftar (Register), masuk (Login) sebagai User, dan masuk (Login) sebagai Admin.
   - **Pembuatan Laporan (User):** Buat laporan baru, unggah foto (pastikan ukuran >512KB untuk mengetes kompresi), pilih lokasi dari peta, dan pastikan tidak ada *error validation* (422) atau 500.
   - **Notifikasi Duplikat:** Buat laporan lain dengan kategori dan titik koordinat yang persis sama. Pastikan sistem menolak dengan status 409 (Laporan Duplikat).
   - **Validasi (Admin):** Masuk ke Dashboard Admin, buka laporan yang baru dibuat, dan berikan status *Terverifikasi* atau *Ditolak*.
   - **Rendering Peta:** Pastikan laporan yang sudah *Terverifikasi* muncul di Peta Publik / Peta Admin dengan *marker* ikon yang sesuai kategorinya.
