# Test Cases & Execution Results - Sistem Lestari

Dokumen ini berisi draf dan hasil pengujian manual (test cases) untuk MVP Sistem Lestari, yang mencakup platform **Website** dan **Mobile**. Pengujian mencakup skenario *happy path* (kasus normal/sukses) dan *unhappy path* (kasus negatif/error).

---

## Ringkasan Eksekusi
- **Total Test Cases**: 13
- **Passed**: 13
- **Failed**: 0
- **Blocked**: 0

---

## 1. Web Application Test Cases

Aplikasi web Sistem Lestari bertindak sebagai antarmuka utama bagi pengguna untuk mendaftar, login, mengirimkan laporan, melihat peta interaktif, serta dashboard admin untuk verifikasi.

| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-WEB-01** | Registrasi Akun Baru (*Happy Path*) | Halaman Registrasi terbuka (`/users/auth/register.html`) | 1. Masukkan nama lengkap valid<br>2. Masukkan email baru (belum terdaftar)<br>3. Masukkan password valid (min. 8 karakter)<br>4. Klik tombol "Daftar"<br>5. Masukkan OTP yang dikirim ke email | Akun berhasil dibuat, OTP terverifikasi, dan user diarahkan ke halaman login. | Akun berhasil terbuat dan diarahkan ke halaman login setelah memasukkan OTP dengan benar. | **Pass** |
| **TC-WEB-02** | Registrasi dengan Email Sudah Terdaftar (*Unhappy Path*) | Halaman Registrasi terbuka (`/users/auth/register.html`) | 1. Masukkan nama lengkap<br>2. Masukkan email yang sudah terdaftar sebelumnya<br>3. Masukkan password<br>4. Klik tombol "Daftar" | Sistem menampilkan pesan kesalahan "Email sudah digunakan" atau sejenisnya dan pendaftaran gagal. | Muncul pesan error bahwa email sudah terdaftar dan tidak bisa melanjutkan pendaftaran. | **Pass** |
| **TC-WEB-03** | Login User Kredensial Valid (*Happy Path*) | Halaman Login terbuka (`/users/auth/login.html`) | 1. Masukkan email terdaftar<br>2. Masukkan password yang benar<br>3. Klik tombol "Login" | Sistem berhasil memvalidasi kredensial dan mengarahkan user ke halaman Dashboard/Peta utama. | Berhasil login dan dialihkan ke halaman dashboard peta pengguna. | **Pass** |
| **TC-WEB-04** | Login User Password Salah (*Unhappy Path*) | Halaman Login terbuka (`/users/auth/login.html`) | 1. Masukkan email terdaftar<br>2. Masukkan password yang salah<br>3. Klik tombol "Login" | Sistem menolak login dan menampilkan pesan kesalahan "Email atau password salah". | Muncul alert/pesan error bahwa kredensial tidak cocok, pengguna tetap di halaman login. | **Pass** |
| **TC-WEB-05** | Login Admin Kredensial Valid (*Happy Path*) | Halaman Login Admin terbuka (`/admin/login/login-admin.html`) | 1. Masukkan email admin default<br>2. Masukkan password admin yang benar<br>3. Klik tombol "Login" | Sistem berhasil masuk dan mengarahkan admin ke Dashboard Admin khusus. | Berhasil dialihkan ke halaman dashboard admin khusus dengan daftar statistik laporan. | **Pass** |
| **TC-WEB-06** | Membuat Laporan Isu Lingkungan Baru (*Happy Path*) | User sudah login dan berada di halaman buat laporan (`/users/dashboard/report-users.html`) | 1. Masukkan judul laporan<br>2. Isi deskripsi masalah lingkungan<br>3. Tentukan titik lokasi pada peta<br>4. Unggah foto bukti valid (`.jpg`/`.png`) jika ada<br>5. Klik tombol "Kirim Laporan" | Laporan berhasil disimpan dengan status awal "Menunggu Validasi" dan muncul pesan sukses. | Laporan berhasil terkirim dan tersimpan di database dengan status "Menunggu Validasi". | **Pass** |
| **TC-WEB-07** | Membuat Laporan Tanpa Deskripsi dan Lokasi (*Unhappy Path*) | User sudah login dan berada di halaman buat laporan (`/users/dashboard/report-users.html`) | 1. Kosongkan deskripsi<br>2. Tidak memilih titik lokasi pada peta<br>3. Klik tombol "Kirim Laporan" | Sistem memvalidasi input, menolak pengiriman, dan memunculkan pesan error/peringatan input wajib. | Form mendeteksi input kosong dan memunculkan pesan peringatan bahwa deskripsi dan lokasi wajib diisi. | **Pass** |
| **TC-WEB-08** | Mengunggah Bukti Foto dengan Format Non-Gambar (*Unhappy Path*) | User sudah login dan berada di halaman buat laporan (`/users/dashboard/report-users.html`) | 1. Isi judul, deskripsi, dan lokasi<br>2. Unggah file dokumen non-gambar (misal `.pdf` atau `.txt`) pada input foto<br>3. Klik tombol "Kirim Laporan" | Sistem memvalidasi tipe file, menolak berkas tersebut, dan menampilkan pesan kesalahan format berkas. | Sistem menampilkan alert bahwa file yang diunggah harus berformat gambar (.jpg, .jpeg, .png). | **Pass** |
| **TC-WEB-09** | Melihat Laporan Terverifikasi di Peta (*Happy Path*) | User berada di halaman peta publik (`/users/dashboard/map-users.html`) | 1. Akses halaman peta utama<br>2. Perhatikan penanda (marker) yang muncul | Peta menampilkan penanda lokasi dari laporan yang berstatus "Terverifikasi" saja. Laporan berstatus lainnya tidak tampil. | Marker laporan berstatus "Terverifikasi" muncul di peta, sedangkan laporan yang masih menunggu/ditolak/selesai tidak terlihat. | **Pass** |
| **TC-WEB-10** | Mengecek Riwayat dan Status Laporan (*Happy Path*) | User sudah login dan membuka menu riwayat laporan (`/users/dashboard/history.html`) | 1. Buka menu riwayat laporan milik user<br>2. Lihat daftar dan statusnya | Sistem menampilkan daftar seluruh laporan yang pernah dikirim oleh akun tersebut beserta status terkininya. | Daftar laporan tampil lengkap dengan label status (Menunggu Validasi, Ditolak, Terverifikasi, Selesai). | **Pass** |
| **TC-WEB-11** | Validasi dan Pembaruan Status Laporan oleh Admin (*Happy Path*) | Admin sudah login dan membuka dashboard daftar laporan | 1. Pilih salah satu laporan masuk<br>2. Klik opsi verifikasi / ubah status menjadi "Terverifikasi" atau "Selesai"<br>3. Simpan perubahan | Status laporan berhasil diperbarui dalam database dan ter-update di sisi pengguna. | Status laporan ter-update menjadi "Terverifikasi" dan langsung memicu pembaruan marker pada peta publik. | **Pass** |

---

## 2. Mobile Application Test Cases

Aplikasi mobile saat ini bertindak sebagai pendukung ekosistem Sistem Lestari (dalam tahap inisiasi dan implementasi awal). Pengujian difokuskan pada fungsionalitas dasar aplikasi Android.

| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-MOB-01** | Instalasi dan Menjalankan Aplikasi Mobile (*Happy Path*) | Perangkat Android (Emulator atau HP Fisik) aktif | 1. Lakukan instalasi file APK aplikasi Lestari Mobile<br>2. Ketuk ikon aplikasi untuk membukanya | Aplikasi berhasil terinstal tanpa error dan langsung terbuka ke halaman utama (*splash screen* / *main screen*). | Aplikasi berhasil dipasang di emulator/perangkat fisik dan terbuka dengan lancar tanpa *crash*. | **Pass** |
| **TC-MOB-02** | Menampilkan Pesan Greeting di Halaman Utama (*Happy Path*) | Aplikasi Mobile Lestari berhasil dibuka | 1. Perhatikan tampilan halaman utama yang dimuat pertama kali | Tampilan utama menampilkan teks greeting "Hello Android!" sesuai desain boilerplate awal aplikasi. | Halaman utama memuat teks "Hello Android!" dengan layout Scaffold yang rapi. | **Pass** |

---

## Panduan Pengujian Silang (Cross-Testing)
Untuk memastikan kualitas pengujian yang maksimal:
1. Lakukan pengujian menggunakan browser yang berbeda di sisi Web (misalnya **Google Chrome**, **Mozilla Firefox**, dan **Microsoft Edge**).
2. Lakukan pengujian pada resolusi layar yang berbeda (Desktop dan Mobile Responsive di browser).
3. Lakukan pengujian aplikasi Mobile pada versi SDK Android yang berbeda (misalnya Android 10, Android 11, dan Android 13) menggunakan emulator.
