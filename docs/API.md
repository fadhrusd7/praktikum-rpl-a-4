# Dokumentasi API Lestari

**Base URL**: `/api`

Dokumentasi ini berisi daftar semua alamat (endpoint) yang tersedia di sistem backend aplikasi Lestari.

> **Catatan Akses**
> Endpoint dengan tanda [Butuh Login] memerlukan token akses. Caranya dengan menambahkan header `Authorization: Bearer <token>`.

---

## 1. Autentikasi User (Masyarakat)

Semua endpoint di bawah menggunakan awalan `/auth`.

| Method | Endpoint                     | Keterangan                                                   | Data yang Dikirim (Payload)                                  |
| ------ | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `POST` | `/auth/register`             | Mendaftar akun baru dan mengirim kode OTP ke email.          | `nama_lengkap`, `email`, `password`, `password_confirmation` |
| `POST` | `/auth/register/verify-otp`  | Memeriksa kode OTP untuk meresmikan pembuatan akun.          | `email`, `otp`                                               |
| `POST` | `/auth/register/resend-otp`  | Mengirim ulang kode OTP registrasi ke email.                 | `email`                                                      |
| `POST` | `/auth/login`                | Masuk ke akun menggunakan email dan password.                | `email`, `password`                                          |
| `GET`  | `/auth/google`               | Mengarahkan user ke halaman login Google.                    | Tidak ada                                                    |
| `GET`  | `/auth/google/callback`      | Menangani proses setelah user berhasil login dari Google.    | Tidak ada                                                    |
| `POST` | `/auth/forgot-password`      | Meminta kode OTP untuk mengatur ulang password.              | `email`                                                      |
| `POST` | `/auth/verify-otp`           | Memeriksa kode OTP untuk mereset password.                   | `email`, `otp`                                               |
| `POST` | `/auth/reset-password`       | Mengganti password lama dengan yang baru setelah OTP sesuai. | `email`, `reset_token`, `password`, `password_confirmation`  |
| `POST` | `/auth/logout` [Butuh Login] | Keluar dari akun dan menghapus token akses.                  | Tidak ada                                                    |
| `GET`  | `/auth/me` [Butuh Login]     | Mengambil data profil singkat user yang sedang login.        | Tidak ada                                                    |

---

## 2. Autentikasi Admin

Semua endpoint di bawah menggunakan awalan `/admin`.

| Method | Endpoint                      | Keterangan                                        | Data yang Dikirim (Payload) |
| ------ | ----------------------------- | ------------------------------------------------- | --------------------------- |
| `POST` | `/admin/login`                | Masuk ke akun admin untuk mengakses dashboard.    | `email`, `password`         |
| `POST` | `/admin/logout` [Butuh Login] | Keluar dari akun admin dan menghapus token akses. | Tidak ada                   |
| `GET`  | `/admin/me` [Butuh Login]     | Mengambil informasi admin yang sedang login.      | Tidak ada                   |

_(Catatan: Token untuk admin berbeda dengan token untuk user biasa)_

---

## 3. Laporan (User dan Publik)

| Method | Endpoint                      | Keterangan                                                                                              | Data yang Dikirim (Payload)                                                                                       |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/reports/map`                | **(Publik)** Mengambil semua laporan yang sudah diverifikasi untuk ditampilkan di peta.                 | Tidak ada                                                                                                         |
| `POST` | `/reports` [Butuh Login]      | Membuat laporan isu lingkungan baru. (Gunakan format `multipart/form-data`)                             | `judul`, `kategori`, `deskripsi`, `lokasi`, `latitude`, `longitude`, `foto` (opsional), `is_anonymous` (opsional) |
| `GET`  | `/reports/my` [Butuh Login]   | Mengambil daftar laporan milik user yang sedang login secara bertahap (paginated).                      | Tidak ada                                                                                                         |
| `GET`  | `/reports/{id}` [Butuh Login] | Melihat detail sebuah laporan. Hanya bisa diakses oleh pembuatnya atau jika laporan sudah diverifikasi. | `id` laporan di URL                                                                                               |

---

## 4. Manajemen Profil User

Semua endpoint di bawah memerlukan token akses [Butuh Login].

| Method   | Endpoint                | Keterangan                                                                                   | Data yang Dikirim (Payload)                                    |
| -------- | ----------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `GET`    | `/user/stats`           | Melihat statistik laporan dari user saat ini (total laporan, selesai, ditolak, dan lainnya). | Tidak ada                                                      |
| `GET`    | `/user/profile`         | Mengambil data lengkap profil user.                                                          | Tidak ada                                                      |
| `PUT`    | `/user/profile`         | Memperbarui profil (termasuk mengunggah foto profil baru).                                   | `nama_lengkap`, `no_telepon`, `kota`, `foto_profil` (opsional) |
| `PUT`    | `/user/change-password` | Mengganti password dengan memasukkan password lama terlebih dahulu.                          | `password_lama`, `password_baru`, `password_baru_confirmation` |
| `DELETE` | `/user/account`         | Menghapus akun secara permanen.                                                              | `password`                                                     |

---

## 5. Notifikasi dan Feedback (User)

Semua endpoint di bawah memerlukan token akses [Butuh Login].

| Method | Endpoint                      | Keterangan                                                | Data yang Dikirim (Payload)             |
| ------ | ----------------------------- | --------------------------------------------------------- | --------------------------------------- |
| `GET`  | `/notifications`              | Mengambil 20 notifikasi terbaru milik user.               | Tidak ada                               |
| `GET`  | `/notifications/unread-count` | Mendapatkan jumlah notifikasi yang belum dibaca.          | Tidak ada                               |
| `POST` | `/notifications/mark-read`    | Menandai semua notifikasi user sebagai sudah dibaca.      | Tidak ada                               |
| `POST` | `/feedbacks`                  | Mengirimkan penilaian (rating) dan ulasan untuk aplikasi. | `rating` (angka 1 sampai 5), `komentar` |

---

## 6. Dashboard Admin (Manajemen Laporan)

Semua endpoint di bawah memerlukan token akses khusus Admin [Butuh Login].

| Method   | Endpoint                       | Keterangan                                                                                      | Data Tambahan di URL (Query)                              |
| -------- | ------------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `GET`    | `/admin/reports`               | Mengambil semua laporan dengan fitur halaman (pagination), penyaringan (filter), dan pencarian. | `status`, `kategori`, `search`, `page`                    |
| `GET`    | `/admin/reports/{id}`          | Mengambil detail lengkap laporan beserta riwayat perubahannya.                                  | `id` laporan di URL                                       |
| `PATCH`  | `/admin/reports/{id}/validate` | Menerima atau menolak laporan yang baru masuk.                                                  | `status` (terverifikasi atau ditolak), `alasan_penolakan` |
| `PATCH`  | `/admin/reports/{id}/status`   | Mengubah status laporan (contoh: dari terverifikasi menjadi selesai).                           | `status`                                                  |
| `DELETE` | `/admin/reports/{id}`          | Menghapus laporan secara permanen dari sistem.                                                  | `id` laporan di URL                                       |

---

## 7. Statistik dan Feedback (Admin)

Semua endpoint di bawah memerlukan token akses khusus Admin [Butuh Login].

| Method   | Endpoint                 | Keterangan                                                                                                    | Data yang Dikirim (Payload) |
| -------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `GET`    | `/admin/stats`           | Mengambil ringkasan data (total laporan per status, grafik harian 7 hari terakhir, sebaran kategori laporan). | Tidak ada                   |
| `GET`    | `/admin/profile-stats`   | Melihat jumlah laporan yang berhasil divalidasi oleh admin yang sedang login.                                 | Tidak ada                   |
| `GET`    | `/admin/feedbacks`       | Mengambil daftar ulasan dari user.                                                                            | `page`                      |
| `GET`    | `/admin/feedbacks/stats` | Melihat rata-rata penilaian, total ulasan, dan sebaran bintang (1 sampai 5).                                  | Tidak ada                   |
| `DELETE` | `/admin/feedbacks/{id}`  | Menghapus ulasan tertentu.                                                                                    | `id` ulasan di URL          |

---

## Aturan Upload dan Kode Status Respon

**Aturan Upload Foto:**

- Foto Laporan: Ukuran maksimal 10MB (akan diperkecil otomatis oleh sistem menjadi maksimal 512KB). Format yang diterima: JPG, JPEG, PNG, WebP.
- Foto Profil: Ukuran maksimal 1MB. Format yang diterima: JPG, JPEG, PNG.

**Kode Respon HTTP yang Sering Muncul:**

- `200 OK` - Permintaan berhasil diproses.
- `201 Created` - Permintaan berhasil dan data baru telah disimpan.
- `401 Unauthorized` - Anda belum login atau token sudah tidak berlaku.
- `403 Forbidden` - Anda tidak memiliki izin mengakses endpoint ini (contoh: user biasa mencoba membuka fitur admin).
- `404 Not Found` - Data yang dicari tidak ditemukan.
- `409 Conflict` - Terdeteksi ada laporan yang mirip di sekitar lokasi tersebut.
- `422 Unprocessable Entity` - Data yang dikirimkan tidak sesuai aturan (contoh: password terlalu pendek).
- `500 Internal Server Error` - Terjadi kesalahan pada sistem server.
