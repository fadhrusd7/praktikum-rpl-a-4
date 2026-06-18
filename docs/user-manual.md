# Buku Panduan Pengguna (User Manual) Sistem Lestari

## 1. Pendahuluan
Selamat datang di **Sistem Lestari**, sebuah platform pelaporan isu lingkungan berbasis spasial. Melalui sistem ini, masyarakat dapat melaporkan berbagai permasalahan lingkungan yang ditemui di sekitar mereka, seperti penumpukan sampah, polusi, jalan rusak, atau kerusakan fasilitas umum. Laporan yang diverifikasi akan ditampilkan secara publik pada peta agar mendapat perhatian lebih lanjut.

Panduan ini ditujukan untuk memandu Anda, baik sebagai pengguna umum (Pelapor) maupun Admin, dalam menggunakan berbagai fitur yang tersedia di website Sistem Lestari.

---

## Bagian 1: Panduan Pengguna (User/Pelapor)

### 2. Memulai (Getting Started)

#### 2.1 Pendaftaran Akun (Register)
Untuk dapat membuat laporan, Anda perlu memiliki akun terlebih dahulu.
1. Buka halaman utama website Sistem Lestari.
2. Klik tombol **Daftar** atau **Register**.
3. Isi formulir pendaftaran dengan nama, alamat email yang aktif, dan kata sandi.
4. Sistem akan mengirimkan kode **OTP (One Time Password)** ke email Anda.
5. Masukkan kode OTP tersebut untuk memverifikasi akun Anda.

![Placeholder Gambar: Halaman Pendaftaran Akun](/docs/assets/placeholder-register.png)
*Keterangan Gambar: Form pendaftaran akun yang meminta nama, email, kata sandi, serta halaman verifikasi OTP.*

#### 2.2 Masuk (Login)
1. Buka halaman **Login**.
2. Masukkan alamat **Email** dan **Kata Sandi** yang telah didaftarkan.
3. Alternatif lainnya, Anda dapat menggunakan tombol **Login via Google** untuk akses masuk yang lebih cepat tanpa perlu mengingat kata sandi.
4. Klik **Masuk**.

![Placeholder Gambar: Halaman Login](/docs/assets/placeholder-login.png)
*Keterangan Gambar: Form login dengan kolom email, kata sandi, serta tombol "Login with Google".*

> **Lupa Kata Sandi?** Jika Anda lupa kata sandi, klik tautan "Lupa Kata Sandi?", masukkan email Anda, dan sistem akan mengirimkan OTP untuk proses atur ulang (reset) kata sandi.

### 3. Eksplorasi Peta Publik (Public Map)
Bahkan tanpa login, pengguna dapat melihat peta persebaran isu lingkungan.
1. Buka menu **Peta** (Map) di navigasi utama.
2. Anda akan melihat peta interaktif (menggunakan MapTiler) yang menampilkan titik-titik (pin) laporan dari seluruh pengguna yang sudah **terverifikasi**.
3. Klik pada salah satu titik untuk melihat detail laporan (foto bukti, deskripsi, dan kategori isu).

![Placeholder Gambar: Peta Laporan Publik](/docs/assets/placeholder-public-map.png)
*Keterangan Gambar: Tampilan peta interaktif yang memperlihatkan titik koordinat laporan lingkungan yang telah disetujui.*

### 4. Membuat Laporan Isu Lingkungan
Fitur utama untuk berkontribusi melestarikan lingkungan.
1. Setelah login, klik tombol **Buat Laporan** (Report Issue).
2. Tentukan **Lokasi Koordinat** masalah lingkungan tersebut langsung melalui peta yang disediakan.
3. Pilih **Kategori** laporan (contoh: Sampah, Infrastruktur, Polusi).
4. Tulis **Deskripsi** singkat mengenai masalah tersebut.
5. Unggah **Foto Bukti** kejadian di lokasi.
6. Anda dapat mencentang opsi **Lapor Secara Anonim** jika tidak ingin identitas (nama) Anda ditampilkan pada publik.
7. Klik **Kirim Laporan**.

![Placeholder Gambar: Form Pembuatan Laporan](/docs/assets/placeholder-create-report.png)
*Keterangan Gambar: Form pelaporan yang berisi peta untuk memilih lokasi, dropdown kategori, form unggah foto, dan checkbox anonim.*

### 5. Memantau Status Laporan (My Reports)
1. Buka menu **Laporan Saya** (My Reports) melalui profil atau bilah navigasi.
2. Di sini, Anda dapat melihat seluruh riwayat laporan yang pernah Anda buat.
3. Pantau status terkini dari masing-masing laporan:
   - **Menunggu Verifikasi (Pending):** Laporan baru dikirim dan sedang ditinjau Admin.
   - **Terverifikasi (Verified):** Laporan disetujui dan kini tampil di peta publik.
   - **Ditolak (Rejected):** Laporan dianggap tidak valid (biasanya karena foto tidak jelas atau bukan isu lingkungan).
   - **Selesai (Resolved):** Isu lingkungan tersebut telah ditangani.
4. Anda akan menerima **Notifikasi** setiap kali ada perubahan status pada laporan Anda.

![Placeholder Gambar: Halaman Laporan Saya](/docs/assets/placeholder-my-reports.png)
*Keterangan Gambar: Tabel/Daftar riwayat laporan pengguna beserta lencana (badge) status laporannya.*

### 6. Manajemen Profil dan Feedback
- **Profil:** Klik menu profil untuk mengubah foto profil, mengganti kata sandi, melihat statistik pribadi (jumlah laporan yang dibuat), hingga opsi menghapus akun (delete account) secara permanen.
- **Feedback:** Jika Anda memiliki kritik atau saran pengembangan terkait Sistem Lestari, Anda dapat mengirimkannya melalui menu **Kirim Feedback**.

---

## Bagian 2: Panduan Administrator (Admin)

Bagian ini dikhususkan bagi pihak pengelola sistem (Admin).

### 7. Login Admin dan Dasbor Utama (Admin Dashboard)
1. Akses halaman login khusus Admin.
2. Setelah masuk, Admin akan diarahkan ke **Dashboard**.
3. Dashboard menampilkan statistik ringkasan, seperti:
   - Total keseluruhan laporan.
   - Jumlah laporan baru (Pending).
   - Jumlah laporan yang terselesaikan (Resolved).
   - Grafik interaktif tren laporan per kategori atau per waktu.

![Placeholder Gambar: Dasbor Admin](/docs/assets/placeholder-admin-dashboard.png)
*Keterangan Gambar: Tampilan dasbor analitik admin yang memuat metrik angka dan grafik laporan.*

### 8. Manajemen Laporan
Sebagai Admin, Anda bertanggung jawab memvalidasi laporan dari masyarakat.
1. Buka menu **Manajemen Laporan** (Manage Reports).
2. Anda akan melihat seluruh daftar laporan masuk. Anda dapat memfilternya berdasarkan kategori atau status (Pending).
3. Klik laporan tertentu untuk meninjau detailnya (foto dan lokasi).
4. Lakukan pembaruan status:
   - Klik **Verifikasi** agar laporan tampil di peta publik.
   - Klik **Tolak** jika laporan bersifat *spam* atau tidak relevan.
   - Klik **Tandai Selesai** (Resolve) jika masalah tersebut sudah diperbaiki di lapangan.
   
*(Setiap aksi perubahan status ini akan otomatis mengirimkan notifikasi ke pengguna yang membuat laporan).*

![Placeholder Gambar: Tabel Manajemen Laporan Admin](/docs/assets/placeholder-admin-manage-reports.png)
*Keterangan Gambar: Tabel yang berisi daftar laporan beserta tombol aksi cepat (Verifikasi, Tolak, Selesai).*

### 9. Manajemen Feedback
1. Buka menu **Feedback**.
2. Anda dapat membaca seluruh kritik dan saran yang dikirimkan oleh pengguna untuk bahan evaluasi pengembangan Sistem Lestari ke depannya.

---

## 10. Keluar (Logout)
Untuk menjaga keamanan akun Anda, pastikan untuk selalu menekan tombol **Keluar** atau **Logout** dari menu profil setelah selesai menggunakan sistem, terutama bila Anda mengaksesnya melalui perangkat publik.

---

## 11. Bantuan dan Pertanyaan Umum (FAQ)

**T: Apakah saya wajib mengunggah foto saat membuat laporan?**
J: Ya, foto bukti wajib disertakan agar Admin dapat memvalidasi laporan Anda dengan akurat.

**T: Apa bedanya akun saya dengan akun anonim?**
J: Anda tetap membutuhkan akun untuk melapor. Namun, jika opsi "Anonim" dicentang, nama Anda di sistem publik (seperti di peta) akan disembunyikan dan diganti menjadi "Anonim", menjaga kerahasiaan identitas Anda.

**T: Bagaimana cara menghapus laporan yang sudah dibuat?**
J: Saat ini pengguna tidak dapat menghapus laporan sendiri jika sudah dikirimkan. Anda dapat menghubungi admin melalui fitur Feedback jika terdapat kesalahan pelaporan.

---

## Bagian 3: Cara Akses (Panduan Instalasi dan Konfigurasi Lokal)

Bagian ini berisi langkah teknis untuk melakukan instalasi dan pengaturan Sistem Lestari di lingkungan pengembangan (lokal) mulai dari proses salin (clone) repositori, pengaturan basis data, hingga konfigurasi pihak ketiga seperti Supabase, Google OAuth, dan SMTP Email.

### 12. Prasyarat Sistem
Pastikan perangkat Anda telah terinstal perangkat lunak berikut:
- **PHP** (minimal versi 8.1+)
- **Composer** (untuk manajemen dependensi PHP)
- **Node.js** (minimal versi 18+) dan **npm**
- **Git**

### 13. Salin Repositori (Clone)

Buka terminal atau CMD, lalu jalankan perintah berikut untuk mengunduh kode sumber Sistem Lestari:

```bash
# Clone repositori
git clone https://github.com/fadhrusd7/praktikum-rpl-A-4.git

# Masuk ke direktori proyek
cd praktikum-rpl-A-4
```

### 14. Pengaturan Backend (Laravel)

Sistem Lestari menggunakan Laravel untuk API Backend. 

#### 14.1. Instalasi Dependensi Backend
Buka terminal baru, navigasikan ke folder backend:
```bash
cd src/backend
composer install
```

#### 14.2. Persiapan File Environment (.env)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buat kunci aplikasi (Application Key) untuk Laravel:
```bash
php artisan key:generate
```

#### 14.3. Pengaturan Database (Supabase PostgreSQL)
Aplikasi ini menggunakan PostgreSQL yang disediakan oleh Supabase.
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Masuk ke **Project Settings** lalu **Database**.
3. Salin URL Koneksi (Connection String) untuk PostgreSQL.
4. Buka file `.env` di `src/backend/.env` dan ubah konfigurasi berikut:

```env
DB_CONNECTION=pgsql
DB_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```
*(Catatan: Anda bisa menggunakan DB_URL secara langsung atau mengisi DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD secara terpisah).*

#### 14.4. Pengaturan Storage (Supabase S3)
Supabase Storage digunakan untuk menyimpan **Foto Laporan** dan **Foto Profil**.
1. Di dasbor Supabase, masuk ke menu **Storage**.
2. Buat 2 bucket baru (pastikan bersifat **Public**):
   - Bucket 1: report-foto
   - Bucket 2: profile-photos
3. Masuk ke **Project Settings** lalu **API** untuk mendapatkan URL proyek.
4. Masuk ke **Project Settings** lalu **Storage** untuk membuat S3 Access Keys.
5. Tambahkan atau ubah konfigurasi berikut di `src/backend/.env`:

```env
FILESYSTEM_DISK=supabase

SUPABASE_ENDPOINT=https://[PROJECT_ID].storage.supabase.co/storage/v1/s3
SUPABASE_ACCESS_KEY_ID=kunci_akses_s3_anda
SUPABASE_SECRET_ACCESS_KEY=rahasia_akses_s3_anda
SUPABASE_REGION=ap-southeast-1
SUPABASE_BUCKET=report-foto
SUPABASE_PROFILE_BUCKET=profile-photos
SUPABASE_PUBLIC_URL=https://[PROJECT_ID].supabase.co
```

#### 14.5. Pengaturan SMTP Email (Google App Password)
Email digunakan untuk mengirimkan OTP Registrasi dan Lupa Password.
1. Gunakan akun Google atau Gmail yang akan bertindak sebagai pengirim email.
2. Aktifkan **Verifikasi 2 Langkah (2-Step Verification)** di akun Google tersebut.
3. Masuk ke [Google Account Security](https://myaccount.google.com/security) lalu **App Passwords** (Sandi Aplikasi).
4. Buat sandi aplikasi baru dengan nama "Lestari App", lalu salin 16 digit Sandi Aplikasi yang dihasilkan.
5. Konfigurasi `src/backend/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=email_anda@gmail.com
MAIL_PASSWORD=16_digit_app_password_tanpa_spasi
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="email_anda@gmail.com"
MAIL_FROM_NAME="Sistem Lestari"
```

#### 14.6. Pengaturan Google OAuth (Login via Google)
Untuk mengaktifkan fitur Masuk dengan Google:
1. Buat proyek di [Google Cloud Console](https://console.cloud.google.com/).
2. Siapkan **OAuth Consent Screen**.
3. Buka **Credentials** lalu Buat kredensial **OAuth Client ID** (Pilih tipe Aplikasi Web).
4. Tambahkan URI pengalihan yang diizinkan (Authorized redirect URIs): `http://localhost:8000/api/auth/google/callback`
5. Salin Client ID dan Client Secret, lalu masukkan ke `src/backend/.env`:

```env
GOOGLE_CLIENT_ID=client_id_anda.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=client_secret_anda
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

#### 14.7. Migrasi Database dan Seeding
Setelah seluruh konfigurasi di `.env` selesai, jalankan perintah ini untuk membangun tabel database dan mengisi data awal (termasuk akun Admin bawaan):
```bash
php artisan migrate:fresh --seed
```

### 15. Pengaturan Frontend (Website)

Frontend menggunakan Vanilla JS yang dibangun menggunakan Vite.

#### 15.1. Instalasi Dependensi Frontend
Buka terminal baru, navigasikan ke folder website:
```bash
cd src/website
npm install
```

#### 15.2. Pengaturan Environment Frontend (.env)
Salin file `.env.example` (jika ada) ke `.env`, atau buat file baru bernama `.env` di dalam `src/website/`.

```env
# URL dan API Key Supabase
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=kunci_anon_public_supabase_anda

# Konfigurasi Backend dan Routing
VITE_API_BASE_URL=/api
VITE_APP_URL=http://localhost:5173

# Konfigurasi MapTiler (Untuk Peta Laporan)
# Dapatkan kunci di https://maptiler.com/
VITE_MAPTILER_KEY=kunci_api_maptiler_anda

# Pengalihan (Redirects)
VITE_PATH_LOGIN=/users/auth/login.html
VITE_PATH_USER=/users/dashboard/map-users.html
VITE_PATH_ADMIN=/admin/dashboard/dashboard-admin.html
VITE_REDIRECT_LOGIN=/users/auth/login.html
VITE_REDIRECT_ADMIN_LOGIN=/admin/login/login-admin.html
VITE_REDIRECT_URL_USER=/users/dashboard/map-users.html
VITE_REDIRECT_URL_ADMIN=/admin/dashboard/dashboard-admin.html
```

### 16. Menjalankan Aplikasi secara Lokal (Development)

Untuk menjalankan Sistem Lestari, Anda perlu menjalankan kedua sisi (Backend dan Frontend) secara bersamaan.

#### 16.1. Menjalankan Backend (Terminal 1)
```bash
cd src/backend
php artisan serve --port=8000
```
API akan berjalan di `http://localhost:8000`.

#### 16.2. Menjalankan Frontend (Terminal 2)
```bash
cd src/website
npm run dev
```
Website akan berjalan di `http://localhost:5173`. Frontend sudah terkonfigurasi (melalui `vite.config.js`) untuk memproksi permintaan `/api` secara otomatis ke port `8000`.

### 17. Selesai
Sekarang Anda dapat membuka peramban web dan mengakses:
- **Aplikasi Publik dan Pelapor**: `http://localhost:5173`
- **Login Admin**: `http://localhost:5173/admin/login/login-admin.html`

Selamat mengembangkan Sistem Lestari!
