# Dokumentasi Backend API Aplikasi Mobile Lestari

> **Khusus untuk Developer Mobile (Flutter/React Native/dll)**
> Dokumen ini hanya mencakup endpoint yang digunakan oleh user (masyarakat) di aplikasi mobile.
> Endpoint admin TIDAK termasuk dalam dokumen ini.

---

## Informasi Umum

| Item | Detail |
| ----------------- | ------------------------------------------- |
| **Base URL** | `https://<domain>/api` |
| **Format Request**| `application/json` (kecuali upload foto) |
| **Format Respon** | `application/json` |
| **Autentikasi** | Bearer Token via Laravel Sanctum |
| **Versi** | 1.0 |

### Header Wajib

Untuk semua request yang memerlukan login, tambahkan header berikut:

```
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

Untuk request dengan upload file (foto):
```
Authorization: Bearer <token>
Accept: application/json
Content-Type: multipart/form-data
```

---

## Format Respon Standar

Semua endpoint mengembalikan JSON dengan struktur berikut:

### Sukses
```json
{
 "success": true,
 "message": "Keterangan berhasil",
 "data": { ... }
}
```

### Gagal / Error
```json
{
 "success": false,
 "message": "Keterangan error",
 "errors": { ... }
}
```

---

## 1. Autentikasi

### 1.1 Registrasi Akun Baru

> Langkah 1 dari 2 Kirim data pendaftaran, sistem mengirimkan OTP ke email.

**`POST /api/auth/register`**

**Request Body:**
```json
{
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com",
 "password": "password123",
 "password_confirmation": "password123"
}
```

| Field | Tipe | Wajib | Keterangan |
| ----------------------- | ------ | ----- | ----------------------------------- |
| `nama_lengkap` | string | | Nama lengkap user, maks 255 karakter |
| `email` | string | | Format email valid, harus unik |
| `password` | string | | Minimal 8 karakter |
| `password_confirmation` | string | | Harus sama dengan `password` |

**Respon Sukses `201`:**
```json
{
 "success": true,
 "message": "Kode OTP registrasi telah dikirim ke email kamu.",
 "requires_otp": true
}
```

**Respon Gagal `422` (Validasi):**
```json
{
 "message": "The email has already been taken.",
 "errors": {
 "email": ["Email sudah digunakan."]
 }
}
```

---

### 1.2 Verifikasi OTP Registrasi

> Langkah 2 dari 2 Masukkan OTP yang dikirim ke email untuk membuat akun.

**`POST /api/auth/register/verify-otp`**

**Request Body:**
```json
{
 "email": "budi@email.com",
 "otp": "123456"
}
```

| Field | Tipe | Wajib | Keterangan |
| ------- | ------ | ----- | ---------------------------- |
| `email` | string | | Email yang dipakai registrasi |
| `otp` | string | | 6 digit kode OTP dari email |

**Respon Sukses `201`:**
```json
{
 "success": true,
 "message": "Email berhasil diverifikasi. Akun berhasil dibuat.",
 "data": {
 "id": 1,
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com",
 "created_at": "2026-06-21T09:00:00.000000Z"
 }
}
```

**Respon Gagal `422`:**
```json
{
 "success": false,
 "message": "OTP tidak valid atau sudah kadaluarsa."
}
```

> **Catatan:** OTP berlaku selama **10 menit** setelah dikirim.

---

### 1.3 Kirim Ulang OTP Registrasi

**`POST /api/auth/register/resend-otp`**

**Request Body:**
```json
{
 "email": "budi@email.com"
}
```

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Kode OTP baru telah dikirim ke email kamu."
}
```

---

### 1.4 Login

**`POST /api/auth/login`**

**Request Body:**
```json
{
 "email": "budi@email.com",
 "password": "password123"
}
```

| Field | Tipe | Wajib | Keterangan |
| ---------- | ------ | ----- | ------------------ |
| `email` | string | | Email terdaftar |
| `password` | string | | Password akun |

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Login berhasil.",
 "data": {
 "id": 1,
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com",
 "role": "user"
 },
 "token": "1|abc123xyz..."
}
```

> **Simpan `token` ini di local storage / secure storage.** Token digunakan di semua request yang memerlukan login.

**Respon Gagal `401`:**
```json
{
 "success": false,
 "message": "Email atau password salah."
}
```

---

### 1.5 Lupa Password Kirim OTP

> Langkah 1 dari 3 proses reset password.

**`POST /api/auth/forgot-password`**

**Request Body:**
```json
{
 "email": "budi@email.com"
}
```

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Kode OTP telah dikirim ke email kamu."
}
```

**Respon Gagal `422`:**
```json
{
 "message": "The selected email is invalid.",
 "errors": {
 "email": ["The selected email is invalid."]
 }
}
```

---

### 1.6 Lupa Password Verifikasi OTP

> Langkah 2 dari 3. Jika OTP valid, sistem memberikan `reset_token`.

**`POST /api/auth/verify-otp`**

**Request Body:**
```json
{
 "email": "budi@email.com",
 "otp": "654321"
}
```

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "OTP valid.",
 "reset_token": "AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz12"
}
```

> **Simpan `reset_token` ini** untuk digunakan di langkah selanjutnya.

---

### 1.7 Lupa Password Reset Password

> Langkah 3 dari 3. Gunakan `reset_token` dari langkah sebelumnya.

**`POST /api/auth/reset-password`**

**Request Body:**
```json
{
 "email": "budi@email.com",
 "reset_token": "AbCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz12",
 "password": "passwordbaru123",
 "password_confirmation": "passwordbaru123"
}
```

| Field | Tipe | Wajib | Keterangan |
| ----------------------- | ------ | ----- | ---------------------------------- |
| `email` | string | | Email akun |
| `reset_token` | string | | Token dari langkah verifikasi OTP |
| `password` | string | | Password baru, minimal 6 karakter |
| `password_confirmation` | string | | Harus sama dengan `password` |

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Password berhasil direset. Silakan login kembali."
}
```

---

### 1.8 Logout

> **Memerlukan Login**

**`POST /api/auth/logout`**

**Request Body:** Tidak ada

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Logout berhasil."
}
```

---

### 1.9 Ambil Data Diri (Me)

> **Memerlukan Login**

**`GET /api/auth/me`**

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": {
 "id": 1,
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com",
 "role": "user",
 "created_at": "2026-06-21T09:00:00.000000Z"
 }
}
```

---

## 2. Profil User

### 2.1 Ambil Profil Lengkap

> **Memerlukan Login**

**`GET /api/user/profile`**

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": {
 "id": 1,
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com",
 "no_telepon": "08123456789",
 "kota": "Bandung",
 "foto_profil": "users/foto_abc123.jpg",
 "foto_profil_url": "https://supabase.co/storage/v1/...",
 "created_at": "2026-06-21T09:00:00.000000Z"
 }
}
```

> **Gunakan `foto_profil_url`** (bukan `foto_profil`) untuk menampilkan foto profil di aplikasi.

---

### 2.2 Update Profil

> **Memerlukan Login** | Format: `multipart/form-data`

**`PUT /api/user/profile`** 
(Atau `POST /api/user/profile` jika metode PUT tidak didukung)

**Request Body (form-data):**

| Field | Tipe | Wajib | Keterangan |
| -------------- | ------ | ----- | ----------------------------------------------- |
| `nama_lengkap` | string | | Nama lengkap baru, maks 255 karakter |
| `no_telepon` | string | | Nomor telepon baru, maks 20 karakter |
| `kota` | string | | Kota baru, maks 100 karakter |
| `foto_profil` | file | | File foto (JPG/JPEG/PNG), maks **1MB** |

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Profil berhasil diupdate.",
 "data": {
 "id": 1,
 "nama_lengkap": "Budi Santoso Baru",
 "email": "budi@email.com",
 "no_telepon": "08123456789",
 "kota": "Jakarta",
 "foto_profil": "users/foto_baru.jpg",
 "foto_profil_url": "https://supabase.co/storage/v1/..."
 }
}
```

---

### 2.3 Ganti Password

> **Memerlukan Login**
> Setelah berhasil, **semua sesi akan diakhiri** dan user perlu login ulang.

**`PUT /api/user/change-password`**

**Request Body:**
```json
{
 "password_lama": "passwordlama123",
 "password_baru": "passwordbaru456",
 "password_baru_confirmation": "passwordbaru456"
}
```

| Field | Tipe | Wajib | Keterangan |
| ---------------------------- | ------ | ----- | ------------------------------------ |
| `password_lama` | string | | Password saat ini |
| `password_baru` | string | | Password baru, minimal 6 karakter |
| `password_baru_confirmation` | string | | Harus sama dengan `password_baru` |

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Password berhasil diubah. Silakan login kembali."
}
```

**Respon Gagal `422`:**
```json
{
 "success": false,
 "message": "Password lama tidak sesuai."
}
```

---

### 2.4 Hapus Akun

> **Memerlukan Login**
> **Permanen! Akun tidak dapat dipulihkan.**

**`DELETE /api/user/account`**

**Request Body:**
```json
{
 "password": "password123"
}
```

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Akun berhasil dihapus."
}
```

---

### 2.5 Statistik Laporan User

> **Memerlukan Login**

**`GET /api/user/stats`**

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": {
 "total": 10,
 "terverifikasi": 4,
 "menunggu_validasi": 3,
 "ditolak": 1,
 "selesai": 2
 }
}
```

| Field | Keterangan |
| ------------------- | ------------------------------------------ |
| `total` | Total semua laporan yang pernah dibuat |
| `terverifikasi` | Laporan yang sudah divalidasi admin |
| `menunggu_validasi` | Laporan yang belum ditinjau admin |
| `ditolak` | Laporan yang ditolak admin |
| `selesai` | Laporan yang sudah selesai ditangani |

---

## 3. Laporan (Reports)

### Referensi Status Laporan

| Status | Keterangan |
| -------------------- | --------------------------------------------- |
| `menunggu_validasi` | Laporan baru masuk, belum ditinjau admin |
| `divalidasi` | Admin sudah memvalidasi laporan |
| `ditolak` | Laporan ditolak admin (lihat `alasan_penolakan`) |
| `diproses` | Laporan sedang dalam penanganan |
| `selesai` | Laporan selesai ditangani |

### Referensi Kategori Laporan

Nilai yang valid untuk field `kategori`:
- `Sampah` Masalah sampah liar atau pembuangan sembarangan
- `Air` Pencemaran air atau banjir
- `Udara` Polusi udara atau asap
- `Tanah` Kerusakan tanah atau erosi
- `Kebisingan` Polusi suara
- `Lainnya` Kategori lain di luar yang tersedia

---

### 3.1 Buat Laporan Baru

> **Memerlukan Login** | Format: `multipart/form-data`

**`POST /api/reports`**

**Request Body (form-data):**

| Field | Tipe | Wajib | Keterangan |
| -------------- | ------- | ----- | --------------------------------------------------- |
| `judul` | string | | Judul singkat laporan, maks 255 karakter |
| `kategori` | string | | Kategori isu lingkungan (lihat referensi di atas) |
| `deskripsi` | string | | Deskripsi lengkap isu |
| `lokasi` | string | | Nama alamat atau lokasi kejadian |
| `latitude` | decimal | | Koordinat latitude (contoh: `-6.91474`) |
| `longitude` | decimal | | Koordinat longitude (contoh: `107.60940`) |
| `foto` | file | | Foto bukti (JPG/JPEG/PNG/WebP), maks **10MB** |
| `is_anonymous` | boolean | | `true` untuk laporan anonim, default `false` |

**Respon Sukses `201`:**
```json
{
 "success": true,
 "message": "Laporan berhasil dibuat.",
 "data": {
 "id": 42,
 "nomor_laporan": "LAP-21062026-000042",
 "judul": "Tumpukan Sampah di Pinggir Jalan",
 "kategori": "Sampah",
 "deskripsi": "Ada tumpukan sampah besar di pinggir Jl. Merdeka No.5",
 "lokasi": "Jl. Merdeka No.5, Bandung",
 "latitude": -6.91474,
 "longitude": 107.6094,
 "status": "menunggu_validasi",
 "created_at": "2026-06-21T09:00:00.000000Z",
 "validated_at": null,
 "alasan_penolakan": null,
 "user": {
 "id": 1,
 "nama": "Budi Santoso",
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com"
 },
 "admin": null,
 "photos": [
 {
 "id": 10,
 "file_path": "reports/foto_abc123.jpg",
 "url": "https://supabase.co/storage/v1/...",
 "file_type": "image/jpeg",
 "file_size": 524288,
 "uploaded_at": "2026-06-21T09:00:00.000000Z"
 }
 ]
 }
}
```

**Respon Gagal `409` (Duplikat):**
```json
{
 "success": false,
 "message": "Sudah ada laporan serupa di sekitar lokasi ini. Silakan cek laporan yang sudah ada."
}
```

> **Sistem deteksi duplikat:** Jika ada laporan dengan **kategori sama** dalam radius **~20 meter** dan dibuat dalam **14 hari terakhir**, laporan baru akan ditolak otomatis (HTTP 409).

> **Kompresi foto otomatis:** Foto yang diunggah akan dikompres otomatis oleh sistem menjadi maksimal **512KB**. Developer tidak perlu mengompres di sisi client.

---

### 3.2 Daftar Laporan Milik Saya

> **Memerlukan Login** | Hasil dipaginasi (10 per halaman)

**`GET /api/reports/my`**

**Query Parameters (opsional):**

| Parameter | Keterangan |
| --------- | --------------------------------------- |
| `page` | Nomor halaman (default: 1) |

Contoh: `GET /api/reports/my?page=2`

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": [
 {
 "id": 42,
 "nomor_laporan": "LAP-21062026-000042",
 "judul": "Tumpukan Sampah di Pinggir Jalan",
 "kategori": "Sampah",
 "deskripsi": "...",
 "lokasi": "Jl. Merdeka No.5, Bandung",
 "latitude": -6.91474,
 "longitude": 107.6094,
 "status": "menunggu_validasi",
 "created_at": "2026-06-21T09:00:00.000000Z",
 "validated_at": null,
 "alasan_penolakan": null,
 "user": { ... },
 "admin": null,
 "photos": [ ... ]
 }
 ],
 "meta": {
 "total": 10,
 "per_page": 10,
 "current_page": 1,
 "last_page": 1
 }
}
```

---

### 3.3 Detail Laporan

> **Memerlukan Login**
> Hanya bisa diakses jika laporan milik user sendiri, ATAU laporan sudah berstatus `divalidasi` / `selesai`.

**`GET /api/reports/{id}`**

**Path Parameter:**

| Parameter | Keterangan |
| --------- | ------------------- |
| `id` | ID numerik laporan |

Contoh: `GET /api/reports/42`

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": {
 "id": 42,
 "nomor_laporan": "LAP-21062026-000042",
 "judul": "Tumpukan Sampah di Pinggir Jalan",
 "kategori": "Sampah",
 "deskripsi": "Ada tumpukan sampah besar di pinggir Jl. Merdeka No.5",
 "lokasi": "Jl. Merdeka No.5, Bandung",
 "latitude": -6.91474,
 "longitude": 107.6094,
 "status": "divalidasi",
 "created_at": "2026-06-21T09:00:00.000000Z",
 "validated_at": "2026-06-22T10:00:00.000000Z",
 "alasan_penolakan": null,
 "user": {
 "id": 1,
 "nama": "Budi Santoso",
 "nama_lengkap": "Budi Santoso",
 "email": "budi@email.com"
 },
 "admin": {
 "id": 1,
 "username": "admin_lestari"
 },
 "photos": [
 {
 "id": 10,
 "file_path": "reports/foto_abc123.jpg",
 "url": "https://supabase.co/storage/v1/...",
 "file_type": "image/jpeg",
 "file_size": 524288,
 "uploaded_at": "2026-06-21T09:00:00.000000Z"
 }
 ],
 "logs": [
 {
 "aksi": "Laporan diterima sistem",
 "status": "menunggu_validasi",
 "catatan": null,
 "created_at": "2026-06-21T09:00:00.000000Z",
 "admin": null
 },
 {
 "aksi": "Laporan divalidasi",
 "status": "divalidasi",
 "catatan": null,
 "created_at": "2026-06-22T10:00:00.000000Z",
 "admin": {
 "id": 1,
 "username": "admin_lestari"
 }
 }
 ]
 }
}
```

> **Field `logs`:** Riwayat perubahan status laporan berguna untuk menampilkan timeline progress laporan ke user.

**Respon Gagal `404`:**
```json
{
 "success": false,
 "message": "Laporan tidak ditemukan atau Anda tidak memiliki akses untuk melihatnya."
}
```

---

### 3.4 Peta Laporan (Publik)

> **Tidak memerlukan login** endpoint publik

**`GET /api/reports/map`**

Mengambil semua laporan yang sudah terverifikasi (`divalidasi`) untuk ditampilkan di peta.

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": [
 {
 "id": 42,
 "nomor_laporan": "LAP-21062026-000042",
 "judul": "Tumpukan Sampah di Pinggir Jalan",
 "kategori": "Sampah",
 "deskripsi": "...",
 "lokasi": "Jl. Merdeka No.5, Bandung",
 "latitude": -6.91474,
 "longitude": 107.6094,
 "status": "divalidasi",
 "created_at": "2026-06-21T09:00:00.000000Z",
 "validated_at": "2026-06-22T10:00:00.000000Z",
 "alasan_penolakan": null,
 "user": {
 "id": null,
 "nama": "Anonim",
 "nama_lengkap": "Anonim",
 "email": "anonim@lestari.com"
 },
 "photos": [ ... ]
 }
 ]
}
```

> **Privasi Anonim:** Jika pelapor memilih laporan anonim (`is_anonymous: true`), field `user` akan berisi data anonim (`id: null`, `nama: "Anonim"`) meskipun laporan ditampilkan publik.

---

## 4. Notifikasi

### 4.1 Daftar Notifikasi

> **Memerlukan Login** | Menampilkan 20 notifikasi terbaru

**`GET /api/notifications`**

**Respon Sukses `200`:**
```json
{
 "success": true,
 "data": [
 {
 "id": 5,
 "pesan": "Laporan LAP-21062026-000042 kamu telah divalidasi oleh admin.",
 "status_baru": "divalidasi",
 "is_read": false,
 "report_id": 42,
 "created_at": "2026-06-22T10:00:00.000000Z"
 },
 {
 "id": 4,
 "pesan": "Laporan LAP-20062026-000038 kamu telah selesai ditangani.",
 "status_baru": "selesai",
 "is_read": true,
 "report_id": 38,
 "created_at": "2026-06-20T15:30:00.000000Z"
 }
 ]
}
```

| Field | Keterangan |
| ------------ | --------------------------------------------------- |
| `pesan` | Teks notifikasi yang ditampilkan ke user |
| `status_baru`| Status baru laporan yang memicu notifikasi |
| `is_read` | `true` jika sudah dibaca, `false` jika belum |
| `report_id` | ID laporan terkait (untuk navigasi ke detail laporan) |

---

### 4.2 Jumlah Notifikasi Belum Dibaca

> **Memerlukan Login** | Gunakan untuk badge/indikator di ikon notifikasi

**`GET /api/notifications/unread-count`**

**Respon Sukses `200`:**
```json
{
 "success": true,
 "count": 3
}
```

---

### 4.3 Tandai Semua Notifikasi Sudah Dibaca

> **Memerlukan Login**

**`POST /api/notifications/mark-read`**

**Request Body:** Tidak ada

**Respon Sukses `200`:**
```json
{
 "success": true,
 "message": "Semua notifikasi sudah ditandai dibaca."
}
```

---

## 5. Feedback Aplikasi

### 5.1 Kirim Feedback

> **Memerlukan Login**

**`POST /api/feedbacks`**

**Request Body:**
```json
{
 "rating": 5,
 "komentar": "Aplikasi sangat membantu untuk melaporkan masalah lingkungan!"
}
```

| Field | Tipe | Wajib | Keterangan |
| ---------- | ------- | ----- | -------------------------------------------- |
| `rating` | integer | | Penilaian 1 sampai 5 bintang |
| `komentar` | string | | Komentar atau ulasan, maks 1000 karakter |

**Respon Sukses `201`:**
```json
{
 "success": true,
 "message": "Terima kasih atas feedback Anda!",
 "data": {
 "id": 15,
 "rating": 5,
 "komentar": "Aplikasi sangat membantu untuk melaporkan masalah lingkungan!",
 "created_at": "2026-06-21T09:00:00.000000Z"
 }
}
```

---

## Kode Status HTTP

| Kode | Nama | Kondisi |
| ----- | ----------------------- | ------------------------------------------------------------------ |
| `200` | OK | Request berhasil |
| `201` | Created | Data baru berhasil dibuat |
| `401` | Unauthorized | Belum login atau token tidak valid/kadaluarsa |
| `403` | Forbidden | Tidak punya izin mengakses resource ini |
| `404` | Not Found | Data yang dicari tidak ditemukan |
| `409` | Conflict | Terdeteksi laporan duplikat di sekitar lokasi |
| `422` | Unprocessable Entity | Data tidak lolos validasi (cek field `errors`) |
| `500` | Internal Server Error | Terjadi error di sisi server |

---

## Alur Penggunaan yang Disarankan

### Alur Registrasi Baru
```
1. POST /api/auth/register Kirim data pendaftaran
2. POST /api/auth/register/verify-otp Verifikasi OTP dari email
3. POST /api/auth/login Login dengan akun baru
```

### Alur Reset Password
```
1. POST /api/auth/forgot-password Kirim email, sistem kirim OTP
2. POST /api/auth/verify-otp Verifikasi OTP, dapatkan reset_token
3. POST /api/auth/reset-password Reset password dengan reset_token
```

### Alur Buat Laporan
```
1. GET /api/user/stats (Opsional) Tampilkan statistik
2. POST /api/reports Buat laporan baru
3. GET /api/reports/my Lihat daftar laporan saya
4. GET /api/reports/{id} Lihat detail + riwayat status
```

### Alur Notifikasi
```
1. GET /api/notifications/unread-count Cek badge notifikasi (polling)
2. GET /api/notifications Tampilkan daftar notifikasi
3. POST /api/notifications/mark-read Tandai semua sudah dibaca
```

---

## Aturan Upload File

| Jenis File | Ukuran Maks | Format yang Diterima | Kompresi Otomatis |
| -------------- | ----------- | ----------------------- | ----------------- |
| Foto Laporan | **10 MB** | JPG, JPEG, PNG, WebP | Maks 512KB |
| Foto Profil | **1 MB** | JPG, JPEG, PNG | Tidak |

---

## Tips untuk Developer Mobile

1. **Simpan Token dengan Aman:** Gunakan `flutter_secure_storage` (Flutter) atau `Keychain/Keystore` untuk menyimpan Bearer Token.

2. **Handle 401 Otomatis:** Buat interceptor HTTP yang mendeteksi status 401 dan mengarahkan user ke halaman login.

3. **Polling Notifikasi:** Untuk badge notifikasi, lakukan polling ke `GET /api/notifications/unread-count` setiap 30-60 detik saat app aktif.

4. **Refresh Setelah Update Profil:** Setelah `PUT /api/user/profile`, refresh data user dari `GET /api/user/profile` untuk mendapatkan `foto_profil_url` terbaru.

5. **Format Multipart:** Saat mengirim data dengan foto, gunakan `multipart/form-data`. Pastikan semua field dikirim sebagai string (termasuk `latitude`, `longitude`, dan `is_anonymous`).

6. **Pagination Laporan:** Endpoint `GET /api/reports/my` menggunakan pagination 10 item per halaman. Implementasikan infinite scroll atau tombol "Muat Lebih Banyak" menggunakan field `meta.last_page` dan `meta.current_page`.
