# Dokumentasi Database Aplikasi Lestari

Database yang digunakan adalah **PostgreSQL** (production via Supabase) dan **SQLite** (untuk development lokal).
ORM yang digunakan adalah **Laravel Eloquent**.

---

## Ringkasan Tabel

| Tabel | Fungsi Utama | Relasi dengan |
| -------------------- | ------------------------------------------------- | ---------------------- |
| `users` | Menyimpan akun pengguna mobile (masyarakat) | reports, feedbacks, notifications |
| `admins` | Menyimpan akun pengelola dashboard web | reports, report_logs |
| `reports` | Inti sistem menyimpan laporan lingkungan | users, admins, photos, report_logs, notifications |
| `photos` | Foto bukti yang dilampirkan pada laporan | reports |
| `report_logs` | Riwayat perubahan status setiap laporan | reports, admins |
| `notifications` | Notifikasi yang dikirim ke user saat status berubah | users, reports |
| `feedbacks` | Rating dan ulasan user untuk aplikasi | users |
| `registration_otps` | OTP sementara proses registrasi akun | *(standalone)* |
| `password_reset_otps`| OTP sementara proses reset password | *(standalone)* |
| `personal_access_tokens` | Token autentikasi (dikelola Sanctum) | users, admins |

---

## Entity Relationship Diagram (ERD)

```
 
 users reports 
 
 id (PK) 1n id (PK) 
 nama_lengkap nomor_laporan (UNIQUE) 
 email (UNIQUE) user_id (FK users.id) 
 password admin_id (FK admins.id, NULL) 
 email_verified_at judul 
 no_telepon kategori 
 kota deskripsi 
 foto_profil lokasi 
 remember_token latitude 
 created_at longitude 
 updated_at status (ENUM) 
 is_anonymous 
 alasan_penolakan 
 validated_at 
 1 created_at 
 updated_at 
 n 
 
 
 feedbacks 1 1
 
 id (PK) 
 user_id (FK) photos report_logs notifications 
 rating 
 komentar id (PK) id (PK) id (PK) 
 created_at report_id report_id (FK) user_id (FK) 
 updated_at file_path admin_id (FK) report_id(FK) 
 file_type status pesan 
 file_size aksi status_baru 
 uploaded_at catatan is_read 
 created_at created_at 
 updated_at 
 
 
 
 admins 

 id (PK) 
 username (UNIQUE) 
 email (UNIQUE) 
 password 
 remember_token 
 created_at 
 updated_at 

```

---

## Detail Setiap Tabel

### 1. Tabel `users`

Menyimpan akun pengguna yang menggunakan **aplikasi mobile**.

| Kolom | Tipe Data | Constraint | Keterangan |
| ------------------ | -------------- | ----------------------- | -------------------------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik user |
| `nama_lengkap` | VARCHAR(255) | NOT NULL | Nama lengkap user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email untuk login, harus unik |
| `password` | VARCHAR(255) | NOT NULL | Password di-hash dengan bcrypt (12 rounds) |
| `email_verified_at`| TIMESTAMP | NULL | Waktu email diverifikasi via OTP |
| `no_telepon` | VARCHAR(20) | NULL | Nomor telepon (opsional, diisi user di profil) |
| `kota` | VARCHAR(100) | NULL | Kota domisili (opsional) |
| `foto_profil` | VARCHAR(500) | NULL | Path file foto profil di Supabase Storage |
| `remember_token` | VARCHAR(100) | NULL | Token untuk fitur "ingat saya" |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu akun dibuat |
| `updated_at` | TIMESTAMP | NULL | Waktu terakhir akun diperbarui |

**Catatan Penting:**
- `foto_profil` menyimpan **path relatif** di Supabase Storage, bukan URL lengkap. URL lengkap tersedia via accessor `foto_profil_url` di response API.
- User yang login via Google OAuth tidak memiliki password (menggunakan `email_verified_at` sebagai penanda verifikasi).
- `nama_lengkap` menggabungkan nama depan dan belakang (tidak dipisahkan di database).

**Relasi:**
- `users.id` `reports.user_id` (satu user bisa punya banyak laporan)
- `users.id` `feedbacks.user_id` (satu user bisa punya banyak feedback)
- `users.id` `notifications.user_id` (satu user bisa punya banyak notifikasi)

---

### 2. Tabel `admins`

Menyimpan akun pengelola yang menggunakan **dashboard web admin**.

| Kolom | Tipe Data | Constraint | Keterangan |
| ---------------- | ------------ | ----------------------- | ----------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik admin |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Username admin untuk login |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email admin |
| `password` | VARCHAR(255) | NOT NULL | Password di-hash dengan bcrypt |
| `remember_token` | VARCHAR(100) | NULL | Token untuk fitur "ingat saya" |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu akun admin dibuat |
| `updated_at` | TIMESTAMP | NULL | Waktu terakhir akun diperbarui |

**Relasi:**
- `admins.id` `reports.admin_id` (admin yang menangani laporan)
- `admins.id` `report_logs.admin_id` (admin yang mencatat log aksi)

---

### 3. Tabel `reports`

Tabel inti sistem. Menyimpan seluruh laporan isu lingkungan yang dibuat user.

| Kolom | Tipe Data | Constraint | Keterangan |
| ------------------ | -------------- | ------------------------------------- | -------------------------------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik laporan |
| `nomor_laporan` | VARCHAR(22) | UNIQUE, NULL | Kode referensi format `LAP-DDMMYYYY-XXXXXX` |
| `user_id` | BIGINT | FK users.id, NOT NULL, CASCADE DEL | Pemilik laporan |
| `admin_id` | BIGINT | FK admins.id, NULL, SET NULL DEL | Admin yang menangani (null jika belum diproses) |
| `judul` | VARCHAR(255) | NOT NULL | Judul singkat laporan |
| `kategori` | VARCHAR(100) | NULL | Kategori isu: Sampah, Air, Udara, Tanah, Kebisingan, dll |
| `deskripsi` | TEXT | NOT NULL | Deskripsi lengkap isu lingkungan |
| `lokasi` | VARCHAR(255) | NOT NULL | Nama alamat atau lokasi kejadian |
| `latitude` | DECIMAL(11,8) | NOT NULL | Koordinat GPS latitude |
| `longitude` | DECIMAL(11,8) | NOT NULL | Koordinat GPS longitude |
| `status` | ENUM | NOT NULL, DEFAULT 'menunggu_validasi' | Status laporan (lihat tabel status di bawah) |
| `is_anonymous` | BOOLEAN | NOT NULL, DEFAULT false | `true` jika pelapor memilih anonim |
| `alasan_penolakan` | TEXT | NULL | Alasan penolakan oleh admin (diisi jika `ditolak`) |
| `validated_at` | TIMESTAMP | NULL | Waktu laporan divalidasi admin |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu laporan dibuat |
| `updated_at` | TIMESTAMP | NULL | Waktu terakhir laporan diperbarui |

**Nilai ENUM `status`:**

| Nilai | Arti | Siapa yang Mengubah |
| -------------------- | ---------------------------------------------- | -------------------- |
| `menunggu_validasi` | Laporan baru, menunggu tinjauan admin | Sistem (otomatis) |
| `divalidasi` | Laporan diterima dan divalidasi admin | Admin |
| `ditolak` | Laporan ditolak (isi `alasan_penolakan`) | Admin |
| `diproses` | Laporan sedang dalam penanganan | Admin |
| `selesai` | Laporan selesai ditangani | Admin |

**Format `nomor_laporan`:** 
`LAP-{DDMMYYYY}-{XXXXXX}` Contoh: `LAP-21062026-000042`
- `DDMMYYYY` = tanggal laporan dibuat
- `XXXXXX` = nomor urut laporan di tahun tersebut (6 digit, diisi 0 di depan)
- Di-generate **otomatis** oleh sistem saat laporan pertama kali disimpan

**Index Database (untuk performa query):**
- `user_id` query laporan milik user
- `admin_id` query laporan yang ditangani admin tertentu
- `status` filter laporan berdasarkan status
- `created_at` sorting laporan terbaru

**Relasi:**
- `reports.id` `photos.report_id`
- `reports.id` `report_logs.report_id`
- `reports.id` `notifications.report_id`

---

### 4. Tabel `photos`

Menyimpan foto bukti yang dilampirkan pada laporan.

| Kolom | Tipe Data | Constraint | Keterangan |
| ------------- | ------------ | ------------------------- | ----------------------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik foto |
| `report_id` | BIGINT | FK reports.id, NOT NULL | Laporan yang foto ini dilampirkan |
| `file_path` | VARCHAR(500) | NOT NULL | Path relatif file di Supabase Storage |
| `file_type` | VARCHAR(50) | NOT NULL | MIME type (contoh: `image/jpeg`, `image/webp`) |
| `file_size` | INT | NOT NULL | Ukuran file dalam **bytes** |
| `uploaded_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu foto diunggah |

**Catatan Penting:**
- Satu laporan hanya bisa memiliki **satu foto** saat ini (sesuai alur UI).
- Foto otomatis dikompres oleh server menjadi maks **512KB** sebelum disimpan ke Supabase.
- `file_path` adalah path relatif, URL publik dibangun via accessor `file_url` di model PHP.
- Format yang didukung: JPG, JPEG, PNG, WebP.

**Relasi:**
- `photos.report_id` `reports.id` (cascade delete foto ikut terhapus jika laporan dihapus)

---

### 5. Tabel `report_logs`

Menyimpan **riwayat perubahan status** setiap laporan. Berfungsi seperti audit trail.

| Kolom | Tipe Data | Constraint | Keterangan |
| ----------- | ------------ | ------------------------- | -------------------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik log |
| `report_id` | BIGINT | FK reports.id, NOT NULL | Laporan yang terkait |
| `admin_id` | BIGINT | FK admins.id, NULL | Admin yang melakukan aksi (null = sistem) |
| `status` | VARCHAR(255) | NOT NULL | Status laporan saat log ini dibuat |
| `aksi` | VARCHAR(255) | NOT NULL | Deskripsi aksi yang dilakukan |
| `catatan` | TEXT | NULL | Catatan opsional dari admin |
| `created_at`| TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu log dibuat |

**Contoh Data `aksi`:**
- `"Laporan diterima sistem"` saat laporan pertama kali dibuat (admin_id: null)
- `"Laporan divalidasi"` saat admin memvalidasi laporan
- `"Laporan ditolak"` saat admin menolak laporan
- `"Status diperbarui menjadi diproses"` saat admin update status
- `"Status diperbarui menjadi selesai"` saat admin menandai selesai

**Penggunaan di Mobile:**
Data dari tabel ini ditampilkan di endpoint `GET /api/reports/{id}` sebagai field `logs` (array timeline) untuk menunjukkan riwayat perkembangan laporan kepada user.

---

### 6. Tabel `notifications`

Menyimpan notifikasi yang dikirim ke user ketika status laporan berubah.

| Kolom | Tipe Data | Constraint | Keterangan |
| ------------ | ----------- | ------------------------- | --------------------------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik notifikasi |
| `user_id` | BIGINT | FK users.id, NOT NULL | User penerima notifikasi |
| `report_id` | BIGINT | FK reports.id, NULL | Laporan terkait (null jika notifikasi sistem umum) |
| `pesan` | TEXT | NOT NULL | Isi pesan notifikasi |
| `status_baru`| VARCHAR(50) | NULL | Status laporan yang baru saja berubah |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT false | Status baca: `false` = belum dibaca |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Waktu notifikasi dibuat |
| `updated_at` | TIMESTAMP | NULL | Waktu terakhir notifikasi diperbarui |

**Alur Pembuatan Notifikasi:**
Notifikasi dibuat otomatis oleh backend setiap kali admin mengubah status laporan. User tidak membuat notifikasi secara langsung.

**Relasi:**
- `notifications.user_id` `users.id` (cascade delete notifikasi terhapus jika user dihapus)
- `notifications.report_id` `reports.id` (cascade delete notifikasi terhapus jika laporan dihapus)

---

### 7. Tabel `feedbacks`

Menyimpan rating dan ulasan yang dikirim user untuk aplikasi.

| Kolom | Tipe Data | Constraint | Keterangan |
| ------------ | --------- | ----------------------- | ---------------------------------- |
| `id` | BIGINT | PK, AUTO_INCREMENT | ID unik feedback |
| `user_id` | BIGINT | FK users.id, NOT NULL | User yang memberikan feedback |
| `rating` | INT | NOT NULL | Rating 15 bintang |
| `komentar` | TEXT | NULL | Komentar opsional, maks 1000 char |
| `created_at` | TIMESTAMP | NULL | Waktu feedback dibuat |
| `updated_at` | TIMESTAMP | NULL | Waktu terakhir feedback diperbarui |

---

### 8. Tabel `registration_otps` *(Tabel Sementara)*

Menyimpan OTP sementara selama proses registrasi akun baru. Data dihapus setelah OTP digunakan.

| Kolom | Tipe Data | Keterangan |
| -------------- | ------------ | -------------------------------------------------- |
| `id` | BIGINT | PK |
| `nama_lengkap` | VARCHAR(255) | Nama calon user yang sedang mendaftar |
| `email` | VARCHAR(255) | Email calon user |
| `password` | VARCHAR(255) | Password yang sudah di-hash (belum masuk tabel users) |
| `otp` | VARCHAR(6) | 6 digit kode OTP |
| `attempts` | INT | Jumlah percobaan OTP yang gagal |
| `expires_at` | TIMESTAMP | Waktu kedaluwarsa OTP (10 menit dari dibuat) |
| `created_at` | TIMESTAMP | Waktu data dibuat |
| `updated_at` | TIMESTAMP | Waktu terakhir diperbarui |

---

### 9. Tabel `password_reset_otps` *(Tabel Sementara)*

Menyimpan OTP sementara selama proses reset password. Data dihapus setelah password berhasil direset.

| Kolom | Tipe Data | Keterangan |
| ------------ | ------------ | ----------------------------------------------------------------- |
| `id` | BIGINT | PK |
| `email` | VARCHAR(255) | Email user yang meminta reset |
| `otp` | TEXT | OTP 6 digit (atau `reset_token` 64 karakter setelah OTP dipakai) |
| `used` | BOOLEAN | `false` = OTP aktif, `true` = OTP sudah dipakai (jadi token) |
| `expires_at` | TIMESTAMP | Waktu kedaluwarsa OTP (10 menit dari dibuat) |
| `created_at` | TIMESTAMP | Waktu data dibuat |

**Alur kolom `otp`:**
1. Awalnya berisi 6 digit OTP
2. Setelah OTP diverifikasi, kolom `otp` **diubah** menjadi `reset_token` (64 karakter random) dan `used` = `true`
3. `reset_token` ini digunakan user di step terakhir reset password

---

### 10. Tabel `personal_access_tokens`

Dikelola otomatis oleh **Laravel Sanctum**. Menyimpan token autentikasi untuk user dan admin.

| Kolom | Tipe Data | Keterangan |
| ---------------- | ------------ | ------------------------------------------------- |
| `id` | BIGINT | PK |
| `tokenable_type` | VARCHAR(255) | Nama model (contoh: `App\Models\User`) |
| `tokenable_id` | BIGINT | ID user atau admin |
| `name` | VARCHAR(255) | Nama token (contoh: `user_token`, `admin_token`) |
| `token` | VARCHAR(64) | Hash dari token (SHA-256) |
| `abilities` | TEXT | Permission token (JSON array) |
| `last_used_at` | TIMESTAMP | Waktu terakhir token digunakan |
| `expires_at` | TIMESTAMP | Waktu kedaluwarsa token (NULL = tidak kadaluarsa) |
| `created_at` | TIMESTAMP | Waktu token dibuat |
| `updated_at` | TIMESTAMP | Waktu terakhir diperbarui |

**Catatan:** Token lama dihapus setiap kali user login (untuk mencegah penumpukan token). Artinya satu akun hanya memiliki **satu token aktif** pada satu waktu.

---

## Relasi Antar Tabel (Ringkasan)

```
users 1:n reports
users 1:n feedbacks
users 1:n notifications

admins 1:n reports (admin_id)
admins 1:n report_logs (admin_id)

reports 1:n photos
reports 1:n report_logs
reports 1:n notifications
```

---

## Diagram Alur Status Laporan

```
 
 [USER BUAT LAPORAN] menunggu_validasi 
 
 
 
 
 
 divalidasi ditolak Admin tolak
 
 
 
 
 diproses Admin mulai tangani
 
 
 
 
 selesai Admin selesaikan
 
```

Setiap perubahan status sistem otomatis:
1. Mencatat ke tabel `report_logs`
2. Membuat notifikasi di tabel `notifications` untuk user pelapor

---

## Keamanan Database

| Fitur | Implementasi |
| ------------------------ | ------------------------------------------------- |
| **Hash Password** | bcrypt dengan 12 rounds (via Laravel Hash facade) |
| **Token Autentikasi** | SHA-256 hash, stored di `personal_access_tokens` |
| **Cascade Delete** | Laporan dihapus foto, log, notifikasi ikut hapus |
| **OTP Expiry** | OTP kedaluwarsa otomatis setelah 10 menit |
| **Validasi Duplikat** | Haversine formula untuk cek duplikat radius 20m |
| **Anonim Reporting** | Identitas user disembunyikan di response API |

---

## Lokasi File Database (Development)

| File | Keterangan |
| ------------------------------------------------- | ------------------------------------ |
| `src/backend/database/migrations/` | Semua file migration (skema tabel) |
| `src/backend/database/seeders/` | File seeder untuk data awal |
| `src/backend/database/database.sqlite` | File SQLite untuk development lokal |
| `src/backend/app/Models/` | Model Eloquent untuk setiap tabel |

---

## Cara Jalankan Migrasi

```bash
# Masuk ke folder backend
cd src/backend

# Jalankan semua migrasi
php artisan migrate

# Jalankan migrasi + seeder
php artisan migrate --seed

# Reset dan jalankan ulang dari awal
php artisan migrate:fresh --seed
```
