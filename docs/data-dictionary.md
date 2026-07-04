# Data Dictionary

## Admin (Table: `admins`)

| Kolom          | Tipe Data    | Constraint              | Keterangan                           |
| -------------- | ------------ | ----------------------- | ------------------------------------ |
| id             | BIGINT       | PK, AUTO_INCREMENT      | ID unik akun admin                   |
| username       | VARCHAR(100) | UNIQUE, NOT NULL        | Username admin                       |
| email          | VARCHAR(255) | UNIQUE, NOT NULL        | Email untuk login ke dashboard admin |
| password       | VARCHAR(255) | NOT NULL                | Password terenkripsi                 |
| remember_token | VARCHAR(100) | NULL                    | Token untuk fitur remember me        |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Waktu akun masuk atau login          |
| updated_at     | TIMESTAMP    | NULL                    | Waktu terakhir akun diperbarui       |

Relasi:

- `admins.id` : dirujuk oleh `reports.admin_id` dan `report_logs.admin_id`

Traceability:

- US-10 (login admin)

## User (Table: `users`)

| Kolom             | Tipe Data    | Constraint              | Keterangan                         |
| ----------------- | ------------ | ----------------------- | ---------------------------------- |
| id                | BIGINT       | PK, AUTO_INCREMENT      | ID unik akun pengguna atau pelapor |
| username          | VARCHAR(100) | UNIQUE, NOT NULL        | Username pengguna atau pelapor     |
| email             | VARCHAR(255) | UNIQUE, NOT NULL        | Email untuk registrasi dan login   |
| email_verified_at | TIMESTAMP    | NULL                    | Waktu email diverifikasi           |
| password          | VARCHAR(255) | NOT NULL                | Password terenkripsi               |
| nama_depan        | VARCHAR(100) | NULL                    | Nama depan pengguna                |
| nama_belakang     | VARCHAR(100) | NULL                    | Nama belakang pengguna             |
| no_telepon        | VARCHAR(20)  | NULL                    | Nomor telepon pengguna             |
| kota              | VARCHAR(100) | NULL                    | Kota asal pengguna                 |
| foto_profil       | VARCHAR(500) | NULL                    | Path atau URL foto profil pengguna |
| remember_token    | VARCHAR(100) | NULL                    | Token untuk fitur remember me      |
| created_at        | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Waktu akun dibuat                  |
| updated_at        | TIMESTAMP    | NULL                    | Waktu terakhir akun diperbarui     |

Relasi:

- `users.id` : dirujuk oleh `reports.user_id` dan `feedbacks.user_id`

Traceability:

- US-9 (registrasi akun user)

## Report (Table: `reports`)

| Kolom            | Tipe Data     | Constraint                            | Keterangan                                                          |
| ---------------- | ------------- | ------------------------------------- | ------------------------------------------------------------------- |
| id               | BIGINT        | PK, AUTO_INCREMENT                    | ID unik laporan                                                     |
| nomor_laporan    | VARCHAR(22)   | UNIQUE, NULL                          | Nomor referensi laporan (Format: LAP-DDMMYYYY-XXXXXX)               |
| user_id          | BIGINT        | FK → users.id, NOT NULL               | ID User pelapor pemilik laporan                                     |
| admin_id         | BIGINT        | FK → admins.id, NULL                  | ID Admin yang menangani laporan                                     |
| judul            | VARCHAR(255)  | NOT NULL                              | Judul singkat laporan                                               |
| kategori         | VARCHAR(100)  | NULL                                  | Kategori dari laporan yang dibuat                                   |
| deskripsi        | TEXT          | NOT NULL                              | Deskripsi lengkap isu lingkungan                                    |
| lokasi           | VARCHAR(255)  | NOT NULL                              | Nama alamat atau lokasi kejadian                                    |
| latitude         | DECIMAL(11,8) | NOT NULL                              | Koordinat latitude                                                  |
| longitude        | DECIMAL(11,8) | NOT NULL                              | Koordinat longitude                                                 |
| status           | ENUM          | NOT NULL, DEFAULT 'menunggu_validasi' | 'menunggu_validasi', 'divalidasi', 'ditolak', 'diproses', 'selesai' |
| alasan_penolakan | TEXT          | NULL                                  | Alasan penolakan oleh admin                                         |
| validated_at     | TIMESTAMP     | NULL                                  | Waktu laporan divalidasi                                            |
| created_at       | TIMESTAMP     | NOT NULL, DEFAULT NOW()               | Waktu laporan pertama dibuat                                        |
| updated_at       | TIMESTAMP     | NULL                                  | Waktu terakhir laporan diperbarui                                   |

Relasi:

- `reports.id` : dirujuk oleh `photos.report_id` dan `report_logs.report_id`

Traceability:

- US-1 (buat laporan + GPS)
- US-2 (peta lokasi), US-3 (cek status)
- US-5 (validasi + alasan tolak)
- US-6 (lihat semua laporan)
- US-7 (update status)
- US-8 (hapus laporan)

## Photo (Table: `photos`)

| Kolom       | Tipe Data    | Constraint                | Keterangan                                |
| ----------- | ------------ | ------------------------- | ----------------------------------------- |
| id          | BIGINT       | PK, AUTO_INCREMENT        | ID unik foto                              |
| report_id   | BIGINT       | FK → reports.id, NOT NULL | Laporan yang foto dilampirkan             |
| file_path   | VARCHAR(500) | NOT NULL                  | Path atau URL file foto di server/storage |
| file_type   | VARCHAR(50)  | NOT NULL                  | Format file foto                          |
| file_size   | INT          | NOT NULL                  | Ukuran file dalam bytes                   |
| uploaded_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Waktu foto diunggah                       |

Relasi:

- `photos.report_id` → `reports.id` (setiap foto adalah lampiran dari satu laporan)

Traceability:

- US-4 (unggah foto bukti laporan)

## Report Logs (Table: `report_logs`)

| Kolom      | Tipe Data    | Constraint                | Keterangan                             |
| ---------- | ------------ | ------------------------- | -------------------------------------- |
| id         | BIGINT       | PK, AUTO_INCREMENT        | ID log                                 |
| report_id  | BIGINT       | FK → reports.id, NOT NULL | Laporan yang terkait log               |
| admin_id   | BIGINT       | FK → admins.id, NULL      | Admin yang melakukan aksi pada laporan |
| status     | VARCHAR(255) | NOT NULL                  | Status laporan saat log dicatat        |
| aksi       | VARCHAR(255) | NOT NULL                  | Aksi yang dilakukan pada laporan       |
| catatan    | TEXT         | NULL                      | Catatan opsional terkait aksi          |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Waktu log dibuat                       |

Relasi:

- `report_logs.report_id` → `reports.id`
- `report_logs.admin_id` → `admins.id`

## Feedbacks (Table: `feedbacks`)

| Kolom      | Tipe Data | Constraint              | Keterangan                         |
| ---------- | --------- | ----------------------- | ---------------------------------- |
| id         | BIGINT    | PK, AUTO_INCREMENT      | ID feedback                        |
| user_id    | BIGINT    | FK → users.id, NOT NULL | User yang memberikan feedback      |
| rating     | INT       | NOT NULL                | Rating 1-5 bintang                 |
| komentar   | TEXT      | NULL                    | Masukan/komentar dari user         |
| created_at | TIMESTAMP | NULL                    | Waktu feedback dibuat              |
| updated_at | TIMESTAMP | NULL                    | Waktu terakhir feedback diperbarui |

Relasi:

- `feedbacks.user_id` → `users.id`
