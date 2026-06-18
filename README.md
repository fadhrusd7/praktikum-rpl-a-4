# KELOMPOK 4

## Nama Anggota

| Nama                        | NIM      |
| --------------------------- | -------- |
| Fadhil Rusadi               | L0124013 |
| Besty Mega Fauziah          | L0124007 |
| Deoshi Anessah Zheren Areja | L0124009 |
| Dina Hamala Nur Rosyidah    | L0124010 |

---

## Fitur yang Telah Diimplementasikan

Berikut adalah daftar fitur yang sudah ada pada sistem saat ini, merujuk pada `docs/backlog.md`:

### Must-have (Selesai 100%)

- **Registrasi akun user**: User dapat mendaftar menggunakan email.
- **Login user**: User dapat login dengan kredensial yang didaftarkan.
- **Login admin**: Admin dapat login ke dalam dashboard khusus admin.
- **Melaporkan isu lingkungan**: User dapat membuat laporan baru beserta lokasi koordinat.
- **Melihat laporan di peta**: Laporan yang sudah terverifikasi akan tampil di peta publik.

### Should-have (Selesai 100%)

- **Mengecek status laporan**: User dapat melihat daftar laporan yang pernah dibuat beserta status terkininya.
- **Mengunggah foto laporan**: Laporan dapat dilengkapi dengan bukti foto.
- **Validasi dan pembaruan status laporan**: Admin dapat memverifikasi, menolak, atau menyelesaikan laporan.
- **Melihat seluruh laporan**: Admin dapat mengelola semua laporan di dashboard.
- **Melihat statistik dashboard admin**: Dashboard admin menampilkan jumlah dan grafik ringkasan laporan.

#### Could-have (Selesai 100%)

- **Melihat riwayat laporan**: User dapat melihat riwayat laporannya melalui menu "My Reports".
- **Memfilter laporan berdasarkan kategori**: Sistem telah mendukung penyimpanan dan penyortiran kategori pada laporan.
- **Menerima notifikasi perubahan status laporan**: User akan mendapatkan notifikasi saat status laporannya berubah
- **Membuat laporan secara anonim**: User dapat mengirim laporan tanpa menampilkan identitas pribadi.

### Nice-to-have (Ekstra / Di luar Backlog Awal)

Fitur-fitur tambahan yang telah berhasil diimplementasikan untuk meningkatkan fungsionalitas dan pengalaman pengguna:

- **Login via Google**: Alternatif login cepat menggunakan akun Google (OAuth).
- **Verifikasi OTP (Email)**: Digunakan pada saat registrasi untuk memastikan email valid.
- **Reset & Lupa Password**: Memungkinkan user mereset password via OTP yang dikirim ke email.
- **Manajemen Profil User**: User dapat melihat statistik profilnya, mengubah foto profil, mengubah password, hingga menghapus akun.
- **Sistem Feedback**: User dapat mengirimkan kritik & saran yang kemudian dapat dikelola oleh admin.

---

## Teknologi yang Digunakan

Aplikasi ini dibangun menggunakan arsitektur *client-server* dengan beberapa teknologi utama, yaitu:

- **Frontend (Website)**: HTML, CSS (Vanilla), JavaScript, dan Vite sebagai *build tool*.
- **Backend (API)**: PHP 8+ dengan *framework* Laravel.
- **Mobile App**: Kotlin (Android).
- **Database & Storage**: Supabase (PostgreSQL) untuk basis data utama dan penyimpanan *file* (foto laporan).
- **Layanan Peta**: MapTiler API untuk visualisasi geospasial.
