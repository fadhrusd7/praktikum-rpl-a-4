# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Sistem Monitoring Isu Lingkungan Berbasis Peta

---

# BAB 1 – PENDAHULUAN

## 1.1 Tujuan Dokumen
Dokumen ini berisi Software Requirements Specification (SRS) untuk sistem monitoring isu lingkungan berbasis peta. Dokumen ini digunakan sebagai acuan pengembangan sistem oleh tim developer dan pemangku kepentingan.

---

## 1.2 Ruang Lingkup
Sistem ini merupakan aplikasi hybrid berbasis peta yang terdiri dari platform web dan mobile.

Pengguna dapat melaporkan isu lingkungan berdasarkan lokasi, dan admin dapat memverifikasi serta memperbarui status laporan hingga selesai.

Sistem mencakup:
- Registrasi dan autentikasi user/admin
- Pelaporan isu lingkungan
- Visualisasi laporan pada peta
- Monitoring status laporan
- Manajemen laporan oleh admin

---

## 1.3 Definisi dan Akronim

| Istilah | Definisi |
|--------|----------|
| SRS | Software Requirements Specification |
| FR | Functional Requirement |
| NFR | Non Functional Requirement |
| US | User Story |
| AC | Acceptance Criteria |
| MVP | Minimum Viable Product |
| User | Pengguna sistem yang membuat laporan |
| Admin | Pengelola dan validator laporan |
| Laporan | Data isu lingkungan berisi lokasi, deskripsi, foto |
| MapTiler | Layanan peta untuk visualisasi geospasial |
| API | Application Programming Interface |

---

# BAB 2 – DESKRIPSI UMUM

---

## 2.1 Perspektif Produk

Sistem terdiri dari beberapa komponen:

- Frontend Web: React
- Mobile App: Kotlin
- Backend: Laravel (REST API)
- Database: Supabase
- Map Service: MapTiler

Arsitektur menggunakan model client-server, di mana semua client (web & mobile) berkomunikasi dengan backend Laravel yang terhubung ke Supabase sebagai database utama.

---

## 2.2 Fungsi Produk

Sistem menyediakan fungsi utama:

- Registrasi dan login user/admin
- Pembuatan laporan isu lingkungan
- Upload foto laporan
- Visualisasi laporan pada peta
- Validasi laporan oleh admin
- Pembaruan status laporan
- Monitoring laporan oleh user dan admin

---

## 2.3 Karakteristik Pengguna

### User
Masyarakat umum yang dapat membuat laporan dan memantau statusnya.

### Admin
Petugas yang bertugas memverifikasi, menolak, dan menyelesaikan laporan.

---

## 2.4 Batasan Sistem

- Semua fitur wajib login
- Tidak ada fitur anonim pada MVP
- Foto maksimal 5 MB
- Validasi dilakukan manual oleh admin
- Data lokasi bergantung pada input user
- Tidak menggunakan AI untuk validasi laporan

---

# BAB 3 – KEBUTUHAN FUNGSIONAL

| ID | Deskripsi | Prioritas | Referensi US |
|----|----------|-----------|--------------|

---

## FR-01 – Autentikasi Sistem
Sistem menyediakan registrasi dan login untuk user dan admin.

**High** | US-07, US-08, US-09

---

## FR-02 – Pembuatan Laporan
User dapat membuat laporan isu lingkungan dengan judul, deskripsi, lokasi, dan foto (opsional). Status awal: **menunggu validasi**.

**High** | US-01

---

## FR-03 – Visualisasi Peta
Sistem menampilkan laporan **hanya dengan status "terverifikasi"** pada peta MapTiler.

**High** | US-02

---

## FR-04 – Tracking Laporan User
User dapat melihat daftar laporan miliknya beserta status:
- menunggu validasi
- ditolak
- terverifikasi
- selesai

**Medium** | US-03

---

## FR-05 – Dashboard Admin
Admin dapat melihat seluruh laporan beserta detail dan statusnya.

**High** | US-05, US-06

---

## FR-06 – Validasi Laporan
Admin dapat:
- menyetujui laporan → terverifikasi
- menolak laporan → ditolak + alasan

**High** | US-05

---

## FR-07 – Penyelesaian Laporan
Admin dapat mengubah status laporan dari **terverifikasi → selesai**.

**High** | US-05

---

## FR-08 – Pengelolaan Laporan Tidak Valid
Laporan dengan status **ditolak** tidak ditampilkan pada sistem publik (soft delete behavior).

**Medium** | US-05

---

# BAB 4 – KEBUTUHAN NON FUNGSIONAL

---

## NFR-01 – Performance
Halaman utama, peta, dan dashboard harus dimuat < 3 detik pada koneksi ≥ 10 Mbps.

Metode: Google Lighthouse

---

## NFR-02 – Security
- Password dienkripsi menggunakan bcrypt
- Komunikasi menggunakan HTTPS
- Role-based access control (user/admin)

---

## NFR-03 – Usability
- Responsive web (min 360px)
- Mobile friendly Kotlin app
- UI sederhana dan mudah digunakan

---

## NFR-04 – Reliability
Sistem memiliki uptime minimal 99% per bulan.

Metode: monitoring server (Grafana / logging system)

---

## NFR-05 – Maintainability
- Backend modular (Laravel)
- Logging sistem aktif
- Kode terdokumentasi
- Deployment tidak downtime lebih dari 30 menit

---

# BAB 5 – CATATAN & ASUMSI

---

## 5.1 Asumsi Teknologi

- Frontend Web: React
- Mobile: Kotlin
- Backend: Laravel
- Database: Supabase
- Map Service: MapTiler
- API: REST API

---

## 5.2 Asumsi Pengguna

- Semua user wajib login
- Tidak ada fitur anonim pada MVP
- Validasi dilakukan manual oleh admin

---

## 5.3 Dependensi Sistem

- MapTiler API
- Laravel backend server
- Supabase database
- Internet connection
- Browser modern / Android device

---

## 5.4 Batasan Teknis

<<<<<<< HEAD
- Foto maksimal 5 MB
=======
- Foto maksimal 500 Kb
>>>>>>> aa0382c70d92f50451fab90b52e09caf015213c2
- Sistem berbasis online (tidak offline mode)
- Mobile hanya mendukung Android (Kotlin)
- Web mendukung browser modern

---