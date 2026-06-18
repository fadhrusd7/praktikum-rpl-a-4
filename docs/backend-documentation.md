# Panduan Presentasi Backend — Proyek Lestari (Web)

**Sistem Monitoring Isu Lingkungan Berbasis Peta — Kelompok 4**
Backend Developer: Fadhil Rusadi

---

## 1. Gambaran Umum

**Lestari** adalah aplikasi web untuk melaporkan masalah lingkungan berbasis peta. Masyarakat bisa melaporkan isu seperti sampah, banjir, atau polusi lengkap dengan lokasi GPS dan foto. Kemudian admin akan memverifikasi dan memantau penyelesaiannya.

**Masalah yang diselesaikan:**
Selama ini masyarakat kesulitan melaporkan isu lingkungan karena tidak ada satu tempat yang terpusat dan terintegrasi dengan lokasi. Akibatnya banyak masalah yang tidak tersampaikan ke pihak yang berwenang.

**Peran backend:**
Backend adalah bagian yang mengurus semua logika di balik layar. Dia yang menerima data dari tampilan web, memprosesnya, menyimpan ke database, dan mengirim balikan ke tampilan. Ibaratnya, kalau frontend itu wajah aplikasi, backend itu otaknya.

---

## 2. Teknologi yang Dipakai

| Komponen          | Teknologi             | Fungsi                                 |
| ----------------- | --------------------- | -------------------------------------- |
| Framework         | Laravel (PHP 8+)      | Kerangka kerja utama backend           |
| Database          | Supabase (PostgreSQL) | Menyimpan semua data                   |
| Autentikasi       | Laravel Sanctum       | Mengelola login dan token akses        |
| Penyimpanan File  | Supabase Storage      | Menyimpan foto laporan dan foto profil |
| Login Google      | Laravel Socialite     | Alternatif login lewat akun Google     |
| Email             | Laravel Mail (SMTP)   | Mengirim kode OTP ke email user        |
| Pengolahan Gambar | PHP GD                | Mengompres foto sebelum disimpan       |

---

## 3. Arsitektur Sistem

Arsitekturnya menggunakan model **client-server**:

```
  Browser (Frontend Web)
         |
         | HTTP Request (JSON)
         v
  Laravel REST API (Backend)
         |
         |--- Supabase PostgreSQL (Database)
         |--- Supabase Storage (File foto)
         |--- Google OAuth (Login Google)
         |--- SMTP Server (Kirim email OTP)
```

Jadi frontend web mengirim permintaan (request) ke backend dalam format JSON, backend memproses, lalu mengirim balasan (response) juga dalam format JSON. Semua komunikasi lewat API, tidak ada halaman yang di-render langsung oleh backend.

---

## 4. Struktur File Backend

```
src/backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/         -- Tempat logika utama tiap fitur
│   │   │   ├── Auth/            -- Semua yang berhubungan dengan login/register
│   │   │   ├── ReportController       -- Laporan dari sisi user
│   │   │   ├── AdminReportController  -- Laporan dari sisi admin
│   │   │   ├── AdminStatsController   -- Statistik dashboard admin
│   │   │   ├── UserController         -- Profil dan akun user
│   │   │   ├── FeedbackController     -- Kritik dan saran
│   │   │   └── NotificationController -- Notifikasi
│   │   ├── Middleware/          -- Pengecekan akses (misal: hanya admin)
│   │   └── Requests/            -- Aturan validasi input
│   └── Models/                  -- Representasi tabel database
├── database/migrations/         -- Definisi struktur tabel
└── routes/api.php               -- Daftar semua endpoint API
```

---

## 5. Modul-Modul Backend

### 5.1 Autentikasi (Login dan Registrasi)

**Registrasi dengan Verifikasi OTP Email**

Alurnya seperti ini:

1. User mengisi form registrasi (nama, email, password).
2. Backend belum langsung membuat akun. Data disimpan sementara dan kode OTP 6 digit dikirim ke email user.
3. User memasukkan kode OTP tersebut.
4. Kalau kode cocok dan belum expired (berlaku 10 menit), barulah akun resmi dibuat.

Tujuannya agar email yang didaftarkan benar-benar valid dan milik user tersebut.

**Login Biasa**

User mengirim email dan password. Backend mencocokkan dengan data di database menggunakan bcrypt. Kalau cocok, backend membuat token akses (semacam kunci sementara) yang dipakai frontend untuk mengakses fitur-fitur yang membutuhkan login.

**Login lewat Google**

Sebagai alternatif, user bisa login langsung pakai akun Google. Backend mengarahkan ke halaman login Google, lalu setelah berhasil, data user diambil dan token akses langsung diberikan. Kalau user tersebut baru pertama kali, akunnya otomatis dibuatkan.

**Lupa Password**

Alurnya mirip registrasi, tiga langkah:

1. User minta reset password, OTP dikirim ke email.
2. User memasukkan OTP, kalau valid dapat reset token.
3. User memasukkan password baru beserta reset token, lalu password diganti.

Setelah password berhasil diganti, semua token login yang lama dihapus supaya user harus login ulang dengan password baru.

**Pemisahan User dan Admin**

User dan admin disimpan di tabel yang berbeda. Admin punya middleware khusus yang mengecek apakah yang login memang admin. Jadi user biasa tidak bisa mengakses endpoint admin meskipun punya token.

---

### 5.2 Laporan (Fitur Inti)

Ini adalah fitur paling utama di sistem ini.

**Membuat Laporan Baru**

Ketika user membuat laporan, ada beberapa hal yang terjadi di backend:

1. **Pengecekan duplikat** — Backend mengecek apakah sudah ada laporan dengan kategori yang sama di sekitar lokasi tersebut (dalam radius 20 meter) dan dalam 14 hari terakhir. Kalau ada, laporan ditolak supaya tidak ada laporan ganda. Pengecekan jaraknya menggunakan rumus Haversine, yaitu rumus untuk menghitung jarak antara dua titik koordinat di permukaan bumi.

2. **Kompresi foto** — User boleh upload foto sampai 10MB. Tapi sebelum disimpan ke Supabase Storage, backend otomatis mengompres foto tersebut supaya ukurannya tidak lebih dari 512KB. Untuk foto JPEG dan WebP, kualitasnya dikurangi bertahap. Untuk PNG, dimensinya yang diperkecil supaya transparansi tetap terjaga.

3. **Penyimpanan dalam satu transaksi** — Proses menyimpan data laporan dan upload foto dibungkus dalam satu transaksi database. Artinya, kalau upload foto gagal di tengah jalan, data laporan yang sudah disimpan juga dibatalkan. Tidak akan ada data laporan tanpa foto yang menggantung.

4. **Nomor laporan otomatis** — Setiap laporan mendapat nomor unik dengan format `LAP-DDMMYYYY-000001`. Ini di-generate otomatis oleh sistem saat laporan berhasil dibuat.

5. **Pencatatan otomatis** — Begitu laporan dibuat, sistem langsung mencatat log pertama: "Laporan diterima sistem". Ini menjadi awal dari riwayat perubahan laporan tersebut.

6. **Laporan anonim** — User bisa memilih untuk melaporkan secara anonim. Kalau opsi ini dipilih, nama dan email user tidak akan ditampilkan di response API.

**Melihat Laporan**

- User bisa melihat daftar semua laporan miliknya beserta statusnya.
- User juga bisa melihat detail satu laporan tertentu, termasuk riwayat perubahannya.

**Peta Publik**

Ada satu endpoint yang bisa diakses tanpa login, yaitu untuk menampilkan laporan yang sudah terverifikasi di peta. Endpoint ini hanya mengembalikan laporan dengan status terverifikasi supaya peta menampilkan data yang sudah valid.

---

### 5.3 Manajemen Laporan oleh Admin

Admin punya akses penuh untuk mengelola semua laporan:

- **Melihat semua laporan** dengan fitur filter (berdasarkan status dan kategori) serta pencarian (berdasarkan judul, nomor laporan, nama user, atau email).
- **Memverifikasi atau menolak laporan** — Laporan yang statusnya masih "menunggu validasi" bisa diverifikasi atau ditolak. Kalau ditolak, admin wajib mengisi alasan penolakan.
- **Mengubah status laporan** — Misalnya dari terverifikasi menjadi selesai.
- **Menghapus laporan.**

**Alur status laporan:**

```
menunggu_validasi --> divalidasi (terverifikasi) --> selesai
                  \
                   --> ditolak (dengan alasan)
```

Setiap perubahan status dicatat di tabel `report_logs` sebagai audit trail. Jadi bisa dilacak siapa admin yang mengubah, kapan, dan apa catatannya.

Selain itu, setiap kali admin mengubah status laporan, backend otomatis membuat notifikasi untuk user pemilik laporan.

**Statistik Dashboard**

Backend juga menyediakan data statistik untuk dashboard admin:

- Total laporan per status (berapa yang menunggu, terverifikasi, ditolak, selesai).
- Volume laporan harian dalam 7 hari terakhir (untuk grafik batang).
- Jumlah laporan per kategori (Sampah, Polusi, Banjir, dll).

---

### 5.4 Notifikasi

Notifikasi dibuat secara otomatis oleh backend setiap kali ada perubahan pada laporan user:

- Laporan diverifikasi — "Laporan 'judul' berhasil diverifikasi"
- Laporan ditolak — "Laporan 'judul' ditolak. Alasan: ..."
- Laporan selesai — "Laporan 'judul' telah diselesaikan, terima kasih atas laporannya"

User bisa melihat daftar notifikasinya, mengecek berapa yang belum dibaca, dan menandai semua sebagai sudah dibaca.

---

### 5.5 Manajemen Profil User

User bisa mengelola akunnya sendiri:

- Melihat dan mengubah profil (nama, nomor telepon, kota, foto profil).
- Mengganti password (harus memasukkan password lama dulu).
- Menghapus akun (harus konfirmasi password).
- Melihat statistik pribadinya (berapa total laporan, berapa yang terverifikasi, ditolak, selesai).

Kalau user mengupload foto profil baru, foto yang lama otomatis dihapus dari penyimpanan.

---

### 5.6 Feedback

User bisa mengirimkan penilaian (rating 1-5) dan komentar tentang sistem. Admin bisa melihat semua feedback yang masuk, melihat statistik rata-rata rating dan distribusinya, serta menghapus feedback tertentu.

---

## 6. Keamanan

| Aspek              | Cara Penanganan                                                      |
| ------------------ | -------------------------------------------------------------------- |
| Login              | Token-based menggunakan Laravel Sanctum                              |
| Pembatasan akses   | Middleware mengecek apakah sudah login dan apakah admin              |
| Password           | Di-hash pakai bcrypt, tidak disimpan dalam bentuk asli               |
| Validasi input     | Semua input dicek dulu sebelum diproses (format, tipe data, ukuran)  |
| Pemisahan role     | Tabel user dan admin terpisah, middleware mengecek tipe akun         |
| Upload file        | Dicek format (hanya jpg/png/webp), ukuran maksimal dibatasi          |
| Transaksi database | Operasi yang melibatkan banyak tabel dibungkus dalam transaksi       |
| Pesan error        | Detail error hanya ditampilkan saat development, tidak di production |

---

## 7. Ringkasan Angka

| Item                | Jumlah                                                            |
| ------------------- | ----------------------------------------------------------------- |
| Total endpoint API  | 34                                                                |
| Model (tabel utama) | 7 (User, Admin, Report, Photo, ReportLog, Feedback, Notification) |
| Migration           | 19 file                                                           |
| Controller          | 10 file                                                           |
| Kategori laporan    | 6 (Sampah, Polusi, Banjir, Isu Air, Penebangan, Lainnya)          |

---
