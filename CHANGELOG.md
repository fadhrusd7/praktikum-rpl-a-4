# Changelog - Lestari

Semua perubahan penting pada proyek ini akan didokumentasikan di dalam file ini.

Format penulisan didasarkan pada standar [Keep a Changelog](https://keepachangelog.com/id-ID/1.0.0/).

## [1.0.0] - 2026-07-03

### Added
- Fitur registrasi akun pengguna menggunakan alamat email dengan proses verifikasi OTP.
- Fitur login pengguna menggunakan kredensial email dan password yang terdaftar.
- Fitur alternatif login cepat dan aman menggunakan akun Google (OAuth).
- Akses login khusus untuk admin ke dalam halaman dashboard admin.
- Fitur lupa dan reset password menggunakan verifikasi OTP yang dikirimkan melalui email.
- Manajemen profil pengguna untuk melihat statistik laporan pribadi, mengubah foto profil, mengubah password, serta menghapus akun.
- Fitur pembuatan laporan permasalahan lingkungan yang dilengkapi dengan penentuan lokasi koordinat secara spesifik.
- Pilihan untuk membuat laporan secara anonim tanpa menampilkan identitas asli pelapor ke publik.
- Fitur unggah foto dokumentasi sebagai bukti pelaporan, terintegrasi dengan sistem penyimpanan Supabase.
- Tampilan interaktif persebaran laporan yang telah terverifikasi pada peta publik menggunakan MapTiler API.
- Menu "My Reports" untuk memudahkan pengguna dalam melihat daftar riwayat laporannya beserta status terkini.
- Fitur pemfilteran laporan berdasarkan kategori permasalahan yang dilaporkan.
- Sistem notifikasi untuk memberikan pemberitahuan secara *real-time* kepada pengguna saat status laporannya berubah.
- Manajemen pengelolaan laporan di dashboard admin yang memungkinkan admin untuk memverifikasi, menolak, atau menyelesaikan laporan.
- Tampilan visualisasi data statistik komprehensif dan grafik ringkasan jumlah laporan pada dashboard admin.
- Sistem *feedback* yang memungkinkan pengguna memberikan kritik maupun saran, beserta fitur pengelolaan *feedback* bagi admin.

### Fixed
- Perbaikan tampilan antarmuka (UI) website agar tampil lebih responsif saat diakses melalui perangkat *mobile*.
- Perbaikan fungsionalitas bilah pencarian (*searchbar*) pada fitur peta laporan pengguna.
- Perbaikan penanganan parameter *Content-Type* pada *FormData* secara dinamis dan implementasi penanganan *error* pada antarmuka API.
- Perbaikan format pemetaan nilai *boolean* pada kolom `is_anonymous` agar data dapat tersimpan dengan benar di database PostgreSQL.
- Perbaikan masalah pada grafik dan data statistik admin yang sebelumnya gagal dimuat.
- Perbaikan tampilan teks (*font*), koreksi kalkulasi volume laporan harian, dan penyempurnaan sistem paginasi di halaman riwayat laporan.
- Perbaikan tampilan dan alur navigasi saat pengguna melakukan unggah foto bukti laporan.
- Pembaruan informasi pada detail laporan di peta yang memungkinkan pengguna untuk mengetahui identitas admin yang telah memverifikasi laporan.
- Perbaikan masalah CORS (Cross-Origin Resource Sharing) yang sebelumnya memblokir komunikasi antara API dan *frontend*.
- Perbaikan masalah terkait tidak munculnya data foto bukti dan identitas pelapor pada antarmuka pengguna maupun dashboard admin.
- Penyesuaian pengaturan pembaruan otomatis kolom waktu (`updated_at`) pada model Photo di backend untuk mengatasi masalah pengunggahan ke Supabase.
- Penyempurnaan berbagai sistem validasi *input* terkait pembuatan laporan baru, proses autentikasi OAuth, serta validasi teks pada deskripsi (caption) laporan.
- Perbaikan logika pada pembaruan status laporan dan penyesuaian sistem pengiriman notifikasi agar berjalan lebih akurat.
- Perbaikan masalah pemuatan dan struktur impor fungsi utama pemetaan (seperti `reverseGeocode`) untuk mencegah terjadinya *error* pada *frontend*.
