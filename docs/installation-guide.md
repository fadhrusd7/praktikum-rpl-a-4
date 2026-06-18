# Buku Panduan Instalasi dan Setup (Developer / IT Admin) - Sistem Lestari

Panduan ini berisi langkah-langkah teknis untuk melakukan instalasi dan setup Sistem Lestari di lingkungan pengembangan (lokal) mulai dari *clone* repositori, pengaturan basis data, hingga konfigurasi pihak ketiga seperti Supabase, Google OAuth, dan SMTP Email.

---

## 1. Prasyarat Sistem
Pastikan perangkat Anda telah terinstal perangkat lunak berikut:
- **PHP** (minimal versi 8.1+)
- **Composer** (untuk manajemen dependensi PHP)
- **Node.js** (minimal versi 18+) & **npm**
- **Git**

---

## 2. Clone Repositori

Buka terminal/CMD, lalu jalankan perintah berikut untuk mengunduh kode sumber Sistem Lestari:

```bash
# Clone repositori
git clone https://github.com/fadhrusd7/praktikum-rpl-A-4.git

# Masuk ke direktori proyek
cd praktikum-rpl-A-4
```

---

## 3. Setup Backend (Laravel)

Sistem Lestari menggunakan Laravel untuk API Backend. 

### 3.1. Instalasi Dependensi Backend
Buka terminal baru, navigasikan ke folder backend:
```bash
cd src/backend
composer install
```

### 3.2. Persiapan File Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Generate *Application Key* untuk Laravel:
```bash
php artisan key:generate
```

### 3.3. Pengaturan Database (Supabase PostgreSQL)
Aplikasi ini menggunakan PostgreSQL yang disediakan oleh Supabase.
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Masuk ke **Project Settings** -> **Database**.
3. Salin URL Koneksi (Connection String) untuk PostgreSQL.
4. Buka file `.env` di `src/backend/.env` dan ubah konfigurasi berikut:

```env
DB_CONNECTION=pgsql
DB_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```
*(Catatan: Anda bisa menggunakan `DB_URL` secara langsung atau mengisi `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` secara terpisah).*

### 3.4. Pengaturan Storage (Supabase S3)
Supabase Storage digunakan untuk menyimpan **Foto Laporan** dan **Foto Profil**.
1. Di dasbor Supabase, masuk ke menu **Storage**.
2. Buat 2 bucket baru (pastikan bersifat **Public**):
   - Bucket 1: `report-foto`
   - Bucket 2: `profile-photos`
3. Masuk ke **Project Settings** -> **API** untuk mendapatkan URL proyek.
4. Masuk ke **Project Settings** -> **Storage** untuk membuat S3 Access Keys.
5. Tambahkan/ubah konfigurasi berikut di `src/backend/.env`:

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

### 3.5. Pengaturan SMTP Email (Google App Password)
Email digunakan untuk mengirimkan OTP Registrasi dan Lupa Password.
1. Gunakan akun Google/Gmail yang akan bertindak sebagai pengirim email.
2. Aktifkan **Verifikasi 2 Langkah (2-Step Verification)** di akun Google tersebut.
3. Masuk ke [Google Account Security](https://myaccount.google.com/security) -> **App Passwords** (Sandi Aplikasi).
4. Buat sandi aplikasi baru dengan nama "Lestari App", lalu salin 16 digit *App Password* yang dihasilkan.
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

### 3.6. Pengaturan Google OAuth (Login via Google)
Untuk mengaktifkan fitur *Sign-in with Google*:
1. Buat proyek di [Google Cloud Console](https://console.cloud.google.com/).
2. Siapkan **OAuth Consent Screen**.
3. Buka **Credentials** -> Buat kredensial **OAuth Client ID** (Pilih tipe *Web Application*).
4. Tambahkan *Authorized redirect URIs*: `http://localhost:8000/api/auth/google/callback`
5. Salin *Client ID* dan *Client Secret*, lalu masukkan ke `src/backend/.env`:

```env
GOOGLE_CLIENT_ID=client_id_anda.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=client_secret_anda
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### 3.7. Migrasi Database dan Seeding
Setelah seluruh konfigurasi di `.env` selesai, jalankan perintah ini untuk membangun tabel database dan mengisi data *dummy* (termasuk akun Admin default):
```bash
php artisan migrate:fresh --seed
```
*Catatan: Anda mungkin memerlukan file seeding (jika tersedia), atau gunakan SQL script langsung ke Supabase jika dibutuhkan.*

---

## 4. Setup Frontend (Website)

Frontend menggunakan Vanilla JS yang di-build menggunakan Vite.

### 4.1. Instalasi Dependensi Frontend
Buka terminal baru, navigasikan ke folder website:
```bash
cd src/website
npm install
```

### 4.2. Pengaturan Environment Frontend (`.env`)
Salin file `.env.example` (jika ada) ke `.env`, atau buat file baru bernama `.env` di dalam `src/website/`.

```env
# URL & API Key Supabase
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=kunci_anon_public_supabase_anda

# Konfigurasi Backend & Routing
VITE_API_BASE_URL=/api
VITE_APP_URL=http://localhost:5173

# Konfigurasi MapTiler (Untuk Peta Laporan)
# Dapatkan kunci di https://maptiler.com/
VITE_MAPTILER_KEY=kunci_api_maptiler_anda

# Redirects
VITE_PATH_LOGIN=/users/auth/login.html
VITE_PATH_USER=/users/dashboard/map-users.html
VITE_PATH_ADMIN=/admin/dashboard/dashboard-admin.html
VITE_REDIRECT_LOGIN=/users/auth/login.html
VITE_REDIRECT_ADMIN_LOGIN=/admin/login/login-admin.html
VITE_REDIRECT_URL_USER=/users/dashboard/map-users.html
VITE_REDIRECT_URL_ADMIN=/admin/dashboard/dashboard-admin.html
```

---

## 5. Menjalankan Aplikasi secara Lokal (Development)

Untuk menjalankan Sistem Lestari, Anda perlu menjalankan kedua sisi (Backend dan Frontend) secara bersamaan.

### 5.1. Menjalankan Backend (Terminal 1)
```bash
cd src/backend
php artisan serve --port=8000
```
API akan berjalan di `http://localhost:8000`.

### 5.2. Menjalankan Frontend (Terminal 2)
```bash
cd src/website
npm run dev
```
Website akan berjalan di `http://localhost:5173`. Frontend sudah terkonfigurasi (melalui `vite.config.js`) untuk memproksi *request* `/api` secara otomatis ke port `8000`.

---

## 6. Selesai!
Sekarang Anda dapat membuka browser dan mengakses:
- **Aplikasi Publik & Pelapor**: `http://localhost:5173`
- **Login Admin**: `http://localhost:5173/admin/login/login-admin.html`

**Selamat mengembangkan Sistem Lestari!** 
