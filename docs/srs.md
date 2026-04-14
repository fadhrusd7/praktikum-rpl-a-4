# Software Requirements Specification (SRS)

## BAB 1
## PENDAHULUAN

### 1.1 Tujuan Dokumen
Dokumen ini merupakan Software Requirements Specification (SRS) untuk sistem monitoring isu lingkungan berbasis peta. Dokumen ini mendefinisikan kebutuhan fungsional dan non-fungsional sistem secara terstruktur sebagai acuan bagi tim pengembang dan pemangku kepentingan dalam proses pembangunan perangkat lunak.

### 1.2 Ruang Lingkup
Sistem yang dikembangkan adalah suatu aplikasi hybrid berbasis peta yang mencakup platform web dan mobile. Aplikasi memungkinkan masyarakat (user) untuk melaporkan isu lingkungan, seperti tumpukan sampah yang tidak pada tempatnya, genangan air, dan kerusakan fasilitas umum secara langsung berdasarkan lokasi kejadian. Sistem juga menyediakan fitur bagi admin untuk memverifikasi, memantau, dan memperbarui status laporan.

###  Definisi dan Akronim
| Istilah   | Definisi                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SRS       | Software Requirements Specification adalah dokumen spesifikasi kebutuhan perangkat lunak                                                                      |
| FR        | Functional Requirement adalah kebutuhan fungsional sistem                                                                                                     |
| NFR       | Non Functional Requirement adalah kebutuhan non-fungsional sistem                                                                                             |
| US        | User Story adalah deskripsi kebutuhan dari sudut pandang pengguna                                                                                             |
| AC        | Acceptance Criteria adalah kriteria penerimaan sebuah user story                                                                                              |
| MVP       | Minimum Viable Product adalah versi produk dengan fitur inti yang dapat digunakan                                                                             |
| OSM       | Open Street Map adalah platform peta open source yang digunakan sebagai tile provider pada platform web (via Leaflet.js) dan mobile (via React Native Maps)   |
| Admin     | Pengguna dengan hak akses untuk mengelola dan memvalidasi laporan                                                                                             |
| User      | Masyarakat umum yang menggunakan sistem untuk melaporkan isu lingkungan                                                                                       |
| Laporan   | Data isu lingkungan yang dikirim oleh user beserta lokasi dan fotoData isu lingkungan yang dikirim oleh user beserta lokasi dan foto                          |


## BAB 2
## DESKRIPSI UMUM

### 2.1 Perspektif Produk
Sistem ini merupakan aplikasi hybrid yang terdiri dari platform web dan mobile native. Platform web menggunakan Leaflet.js dengan OpenStreetMap (OSM) tile untuk menampilkan peta interaktif, sedangkan platform mobile dikembangkan menggunakan React Native Maps dengan OSM tile. Kedua platform beroperasi dengan arsitektur client-server yang sama dan membutuhkan koneksi internet untuk digunakan.

### 2.2 Fungsi Produk
- Pembuatan laporan isu lingkungan beserta foto dan lokasi.
- Visualisasi laporan pada peta interaktif.
- Verifikasi dan pengelolaan laporan oleh admin.
- Pemantauan status laporan oleh user.

### 2.3 Karakteristik Pengguna
- User (Masyarakat Umum)
    Pengguna awam yang tidak memerlukan keahlian teknis khusus. Berinteraksi dengan sistem melalui antarmuka yang sederhana dan intuitif untuk melaporkan isu lingkungan di sekitarnya.
- Admin
    Petugas atau pihak berwenang yang bertanggung jawab memvalidasi, memantau, dan memperbarui status laporan. Admin memiliki akses ke seluruh laporan melalui dashboard khusus.

### 2.4 Batasan
- Sistem hanya dapat diakses oleh pengguna yang telah terdaftar dan login.
- Laporan baru masuk dengan status default ‘menunggu validasi’ sebelum diproses admin.
- Foto yang diunggah bersifat opsional, dengan batas ukuran maksimal 5 MB per file.
- Sistem tidak memiliki fitur moderasi otomatis berbasis AI pada tahap awal pengembangan.
- Data lokasi sepenuhnya bergantung pada input user.

## BAB 3
## KEBUTUHAN FUNGSIONAL 
| ID         | Deskripsi                                                                                                                                                                                        | Prioritas     | Referensi US           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------  |
| FR-01      | Sistem menyediakan fitur registrasi akun dengan data diri dan login untuk user maupun admin                                                                                                      | High          | US-09, US-10           |
| FR-02      | Sistem memungkinkan user yang sudah login membuat laporan isu lingkungan dengan mengisi judul, deskripsi, lokasi, dan foto (opsional). Laporan tersimpan dengan status awal ‘menunggu validasi’  | High          | US-01, US-04           |
| FR-03      | Sistem menampilkan seluruh laporan dalam bentuk penanda (marker) pada peta interaktif sehingga lokasi setiap isu dapat diketahui secara virtual                                                  | High          | US-02                  |
| FR-04      | Sistem memungkinkan user melihat laporan miliknya beserta status terkini (menunggu validasi, diproses, terverifikasi)                                                                            | Medium        | US-03                  |
| FR-05      | Sistem memungkinkan admin melihat seluruh laporan yang masuk melalui dashboard beserta status dan detailnya.                                                                                     | High          | US-05, US-06           |
| FR-06      | Sistem memungkinkan admin memvalidasi laporan dengan menyetujui atau menolak. Status laporan diperbarui otomatis sesuai dengan keputusan admin.                                                  | High          | US-05                  |
| FR-07      | Sistem memungkinkan admin memperbarui status laporan yang sudah divalidasi menjadi “diproses dan “terverifikasi”.                                                                                | Medium        | US-07                  |
| FR-08      | Sistem memungkinkan admin menghapus laporan yang dinyatakan tidak valid agar data tetap akurat.                                                                                                  | Medium        | US-08                  |


## BAB 4
## KEBUTUHAN NON FUNGSIONAL
| ID         | Kategori        | Kebutuhan                                                                                                                                                                                                                     | Metode Verifikasi                                                                                                             `|
| ---------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | 
| NFR-01     | Performance     | Halaman utama, peta, dan dashboard harus termuat dalam waktu < 3 detik pada koneksi broadband standar (≥ 10 Mbps)                                                                                                             | Google Lighthouse                                                                                                              |
| NFR-02     | Security        | Password disimpan dalam format terenkripsi menggunakan bcrypt dengan salt minimal 10 rounds. Seluruh komunikasi client-server menggunakan HTTPS                                                                               | Inspeksi database dan konfigurasi server                                                                                       |
| NFR-03     | Usability       | Antarmuka responsif dan dapat digunakan pada perangkat mobile (layar ≥ 360px) melalui aplikasi React Native maupun desktop melalui browser web tanpa zoom horizontal                                                          | Pengujian pada perangkat Android dan iOS (aplikasi React Native) dan browser desktop atau mobile standar (web)                 |
| NFR-04     | Reliability     | Sistem memiliki uptime minimal 99% dalam satu bulan kalender (downtime ≤ 7,2 jam/bulan)                                                                                                                                       | Monitoring via Grafana                                                                                                         |
| NFR-05     | Maintainability | Sistem dibangun secara modular dengan standar kode yang konsisten, dependensi terdokumentasi pada package.json, update dapat dilakukan tanpa downtime lebih dari 30 menit, dan error tercatat otomatis melalui logging system | Verifikasi dilakukan melalui code review, static code analysis (ESLint/SonarQube), simulasi deployment, dan inspeksi log error |


## BAB 5
## CATATAN DAN ASUMSI

### 5.1 Asumsi Teknologi
- Sistem menggunakan dua stack peta yang berbeda sesuai platform yakni pada platform web menggunakan Leatfet.js dengan OpenStreetMap (OSM) tile, sedangkan platform mobile menggunakan React Native Maps dengan OSM tile. Kedua platform memanfaatkan OSM sebagai sumber data peta yang bersifat open-source dan gratis
- Fitur peta bergantung pada ketersediaan tile server OpenStreetMap (OSM). penggunaan OSM tidak memerlukan API key berbayar, namun tunduk pada kebijakan penggunaan OSM tile server.

### 5.2 Asumsi Pengguna
- Setiap user harus memiliki akun terdaftar untuk dapat mengakses fitur pelaporan.
- Tidak ada fitur laporan anonim pada MVP.
- Validasi laporan sepenuhnya dilakukan oleh admin, bukan secara otomatis.

### 5.3 Dependensi
- Layanan OpenStreetMap (OSM)
    Sistem ini bergantung pada layanan tile server OpenStreetMap (OSM) untuk menampilkan peta dan marker lokasi laporan. Jika layanan OSM mengalami gangguan atau pembatasan akses, maka fitur peta tidak dapat digunakan secara optimal.
    
- Library Pemetaan
    - Platform web bergantung pada Leatfet.js
    - Platform mobile bergantung pada React Native Maps, Perubahan versi atau ketidakcocokan library dapat mempengaruhi tampilan dan fungsi peta

- Koneksi Internet
    Sistem memerlukan koneksi internet aktif untuk : 
    - Proses login dan registrasi (FR-01)
    - Pengiriman laporan (FR-02)
    - Pengambilan data laporan dan peta (FR-03, FR-04, FR-05)

- Backend Server dan Database
    Sistem bergantung pada server backend untuk :
    - Penyimpanan data pengguna
    - Penyimpanan laporan dan status
    - Proses validasi oleh admin

- Layanan Penyimpanan File
    Fitur unggah foto (FR-02) bergantung pada layanan penyimpanan file (misalnya cloud storage atau server lokal). Jika layanan ini gagal, maka user tidak dapat mengunggah atau melihat foto laporan.

- Perangkat dan Sistem Operasi Pengguna
    - Aplikasi mobile bergantung pada kompatibilitas dengan Android
    - Aplikasi web bergantung pada browser modern (Chrome, Edge, Firefox, dan lain-lain)



### 5.4 Batasan Teknis
- Foto yang diunggah diasumsikan memiliki batas ukuran maksimal 5 MB per file untuk menjaga performa penyimpanan.
- Sistem dapat diakses melalui dua platform: (1) aplikasi mobile berbasis React Native untuk perangkat Android, dan (2) browser web untuk pengguna desktop. Keduanya membutuhkan koneksi internet aktif.



