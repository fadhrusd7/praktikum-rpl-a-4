# Data Dictionary
## Admin
| Kolom       | Tipe Data     | Constraint              | Keterangan            |
| ----------- | ------------- | ----------------------  | --------------------- |
| id          | INT           | PK, AUTO_INCREMENT      | ID unik akun admin    |
| username    | VARCHAR(100)  | NOT NULL                | Username admin        |
| email       | VARCHAR(255)  | UNIQUE, NOT NUL         | Email untuk login ke dashboard admin     |
| password    | VARCHAR(255)  | NOT NULL                | Password terenkripsi  |
| created_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Waktu akun masuk atau login     |

Relasi :
- admin.id : mengacu dari report_admin.id (1 admin dapat mengelola banyak laporan)

Traceability : 
- US-10 (login admin)

## User
| Kolom       | Tipe Data     | Constraint              | Keterangan                       |
| ----------- | ------------- | ----------------------- | -------------------------------- |
| id          | INT           | PK, AUTO_INCREMENT      | ID unik akun pengguna atau pelapor   |
| username    | VARCHAR(100)  | NOT NULL                | Username pengguna atau pelapor       |
| email       | VARCHAR(255)  | UNIQUE, NOT NULL        | Email untuk registrasi dan login |
| password    | VARCHAR(255)  | NOT NULL                | Password terenkripsi             |
| created_at  | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Waktu akun dibuat                |

Relasi :
- user.id : mengacu dari report_user.id (1 masyarakat dapat membuat banyak laporan)

Traceability : 
- US-9 (registrasi akun user)

## Report
| Kolom       | Tipe Data     | Constraint              | Keterangan        |
| ----------- | ------------- | ----------------------  | ----------------- |
| id          | INT           | PK, AUTO_INCREMENT      | ID unik laporan    |
| user_id     | INT           | FK → user.id, NOT NULL  | ID User pelapor pemilik laporan      |
| admin_id    | INT           | FK → admin.id, NULL     | ID Admin yang menangani laporan (NULL jika belum diproses) |
| judul       | TEXT          | NOT NULL                | Judul singkat laporan |
| deskripsi   | VARCHAR(255)  | NOT NULL                | Deskripsi lengkap isu lingkungan yang dilaporkan |
| lokasi      | DECIMAL(10,8) | NOT NULL                | Nama alamat atau lokasi kejadian |
| latitude    | DECIMAL(11,8) | NOT NULL                | Koordinat latitude (bersifat wajib diambil otomatis dari GPS sistem)|
| longtitude  | VARCHAR(255)  | NOT NULL                | Koordinat latitude (bersifat wajib diambil otomatis dari GPS sistem )|
| status      | ENUM('menunggu_validasi', 'divalidasi', 'ditolak', 'diproses', 'selesai') | NOT NULL, DEFAULT 'menunggu_validasi'  | Status progress laporan saat ini |
| alasan_penolakan  | TEXT    | NULL                    | Alasan penolakan oleh admin (diisi hanya jika status = ditolak, ditampilkan ke masyarakat) |
| validated_at   | TIMESTAMP   | NULL                   | Waktu laporan divalidasi oleh pengelola |
| created_at   | TIMESTAMP  | NOT NULL, DEFAULT NOW()   | Waktu laporan pertama dibuat |
| updated_at   | TIMESTAMP  | NOT NULL, DEFAULT NOW() ON UPDATE NOW()  | Waktu terakhir laporan diperbarui |

Relasi :
- admin.id : mengacu dari report_admin.id (1 admin dapat mengelola banyak laporan)
- report_user_id : user.id (setiap laporan dimiliki oleh satu masyarakat)
- report_admin_id : admin.id (setiap laporan ditangani oleh satu pengelola, nullable)
- laporan.id : dirujuk oleh foto_laporan.laporan_id (1 laporan dapat memiliki banyak foto)

Traceability : 
- US-1 (buat laporan + GPS)
- US-2 (peta lokasi), US-3 (cek status) 
- US-5 (validasi + alasan tolak) 
- US-6 (lihat semua laporan)
- US-7 (update status) 
- US-8 (hapus laporan)

## Photo
| Kolom       | Tipe Data     | Constraint            | Keterangan        |
| ----------- | ------------- | --------------------  | ----------------- |
| id          | INT           | PK, AUTO_INCREMENT      | ID unik foto |
| laporan_id  | INT           | FK → laporan.id, NOT NULL  | Laporan yang foto dilampirkan     |
| file_path   | VARCHAR(500)  | NOT NULL              | Path atau URL file foto di server/storage     |
| file_type   | VARCHAR(500)  | NOT NULL              | Format file yang diterima sistem hanya jpeg, png, webp     |
| file_size   | INT           | NOT NULL              |  Ukuran file dalam bytes (backend menolak jika melebihi batas maksimal)|
| uploaded_a  | TIMESTAMP     | NOT NULL, DEFAULT NOW()  | Waktu foto diunggah      |

Relasi :
- foto_laporan.laporan_id → laporan.id (setiap foto adalah lampiran dari satu laporan)

Traceability :  
- US-4 (unggah foto bukti laporan)