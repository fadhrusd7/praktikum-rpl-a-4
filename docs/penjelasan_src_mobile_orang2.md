# Penjelasan Lengkap Source Code Mobile - Bagian 2
**Fokus Fitur: Peta Interaktif (Map), Riwayat Laporan (History), Profil, dan Notifikasi**

Total file: ~39 file. Dokumen ini menjelaskan fungsi teknis dari setiap *source code* (src) yang ada pada bagian ini.

---

## 1. Fitur Peta Interaktif (Map)

### 1.1. Model & UI Helper
*   **`model/Report.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Report.kt (Mapper)]()`
    > *Penjelasan: Berisi fungsi *mapper* `toReportItem()` untuk mengkonversi struktur DTO kotor `ReportData` menjadi `ReportItem` yang bersih. Di sini juga ada ekstensi `toReadableDate()` untuk parsing *timestamp*.*

*   **`util/LocationHelper.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode LocationHelper.kt]()`
    > *Penjelasan: Helper memanfaatkan `FusedLocationProviderClient` untuk mengakses koordinat latitude dan longitude GPS saat ini, beserta pengecekan _permission_ lokasi.*

*   **`data/GeocodingService.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode GeocodingService.kt]()`
    > *Penjelasan: Menjalankan HTTP request manual ke API Geocoder MapTiler untuk mengubah koordinat ke string alamat (`reverseGeocode`) atau sebaliknya (`geocode`).*

### 1.2. UI Peta & ViewModel
*   **`ui/viewmodel/MapViewModel.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode MapViewModel.kt]()`
    > *Penjelasan: Pengambilan semua titik laporan terverifikasi dengan `repository.getAllReports()` dan ditampung ke dalam `reportsState` StateFlow.*

*   **`map/MapTilerView.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode MapTilerView.kt]()`
    > *Penjelasan: Integrasi SDK pihak ketiga melalui `AndroidView`. Fungsi `onMapReady` mengatur lapisan kluster titik laporan dan menggambar _marker_ dengan warna berdasarkan kategorinya pada peta.*

*   **`ui/screen/map/MapScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode MapScreen.kt]()`
    > *Penjelasan: Layar yang menjadi *container* `MapTilerView` dan memiliki logika deteksi sentuhan jika _marker_ laporan di-klik.*

*   **`ui/screen/map/ReportMapBottomSheet.kt` & `ReportDetailContent.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode BottomSheet Map]()`
    > *Penjelasan: Kode UI untuk jendela _slide-up_ (*bottom sheet*) yang menampilkan komponen `ReportDetailContent` (rincian laporan yang di-klik di atas peta).*

---

## 2. Fitur Riwayat Laporan (History)

### 2.1. Repository & ViewModel
*   **`data/repository/ReportRepository.kt`** (Fungsi GET)
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportRepository.kt (GET API)]()`
    > *Penjelasan: Logika API _call_ untuk fungsi `getMyReports()` yang mereturn _array_ list, serta `getReportDetail(id)` untuk mereturn satu laporan komplit beserta _logs_.*

*   **`ui/viewmodel/HistoryViewModel.kt` & `HistoryViewModelFactory.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode HistoryViewModel.kt]()`
    > *Penjelasan: ViewModel yang mengendalikan _state_ untuk *pull-to-refresh* daftar laporan dan *state* untuk detail laporan ketika ditekan.*

### 2.2. UI Screen History
*   **`ui/screen/history/HistoryScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode HistoryScreen.kt]()`
    > *Penjelasan: Kode *Compose* yang mengimplementasikan `LazyColumn` untuk merender baris (`item`) laporan yang ada di riwayat pengguna.*

*   **`ui/screen/history/ReportDetailScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportDetailScreen.kt]()`
    > *Penjelasan: *Layout* komplit yang menampilkan gambar laporan besar di atas, keterangan aduan, dan pada bagian bawah merender daftar `LogItem` atau _timeline_ persetujuan.*

---

## 3. Fitur Profil (User Profile & Akun)

### 3.1. API & Model Profil
*   **`data/model/UserData.kt` & `UserProfile.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode UserProfile.kt]()`
    > *Penjelasan: Struktur data pengembalian JSON pengguna, memuat properti `foto_profil_url` dari server.*

*   **`data/model/ChangePasswordModels.kt` & `FeedbackModels.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Models Password & Feedback]()`
    > *Penjelasan: Request DTO untuk payload API ganti sandi dan pengiriman _rating/feedback_.*

*   **`data/api/UserApiService.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode UserApiService.kt]()`
    > *Penjelasan: Definisi *endpoint* `@GET("user/profile")`, `@POST("user/profile")` (menggunakan multipart), `@PUT("user/change-password")`, dan `@POST("feedbacks")`.*

*   **`data/repository/UserRepository.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode UserRepository.kt]()`
    > *Penjelasan: Menghandle response API profil. Contoh pada fungsi `updateProfile()`, file foto pengguna akan di-_stream_ menjadi `MultipartBody.Part`.*

### 3.2. ViewModel Profil
*   **`ui/viewmodel/ProfileViewModel.kt` & `ProfileViewModelFactory.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ProfileViewModel.kt]()`
    > *Penjelasan: Menampung data statistik akun (jumlah laporan divalidasi/ditolak) dan data profil.*

*   **`ui/viewmodel/ChangePasswordViewModel.kt` & `EditProfileViewModel.kt` & `FeedbackViewModel.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Sub-ViewModels Profil]()`
    > *Penjelasan: Memisahkan _state_ antar *sub-screen*. Contoh di `ChangePasswordViewModel` mengatur validasi *input* sandi secara _real-time_.*

### 3.3. UI Screen Profil
*   **`ui/screen/profile/ProfileScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ProfileScreen.kt]()`
    > *Penjelasan: *Layout* informasi dasar pengguna, foto berbingkai melingkar (`CircleShape`), tombol pengaturan (edit), dan area statistik pelaporan.*

*   **`ui/screen/profile/EditProfileScreen.kt` & `EditProfileUiState.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode EditProfileScreen.kt]()`
    > *Penjelasan: *Form* interaktif pengguna untuk merubah data kota, nama, atau mengimpor file foto baru menggunakan *image picker*.*

*   **`ui/screen/profile/ChangePasswordScreen.kt` & `ChangePasswordUiState.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ChangePasswordScreen.kt]()`
    > *Penjelasan: Antarmuka yang memiliki 3 buah `AuthTextField` khusus untuk form kata sandi dan sebuah *alert dialog* penghapusan akun.*

*   **`ui/screen/profile/FeedbackScreen.kt` & `FeedbackUiState.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode FeedbackScreen.kt]()`
    > *Penjelasan: Membuat _row_ bintang penilaian (*Rating*) yang bisa di-klik pengguna (merubah indeks *rating*) dan kotak teks panjang untuk mengirim saran.*

---

## 4. Fitur Notifikasi & Utility Umum

### 4.1. Notifikasi API, Repository & ViewModel
*   **`data/api/NotificationApiService.kt`** & **`NotificationModels.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Notification API & Models]()`
    > *Penjelasan: *Endpoint* dan DTO untuk me-_retrieve_ index notifikasi terbaru dari server (`@GET("notifications")`).*

*   **`data/repository/NotificationRepository.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode NotificationRepository.kt]()`
    > *Penjelasan: Memfasilitasi API Call dan pengecekan jumlah angka belum dibaca (*unread count*).*

*   **`ui/viewmodel/NotificationViewModel.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode NotificationViewModel.kt]()`
    > *Penjelasan: ViewModel ini mengatur status _fetching_ secara terus menerus (Polling).*

*   **`ui/component/NotificationBottomSheet.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode NotificationBottomSheet.kt]()`
    > *Penjelasan: Menggunakan `ModalBottomSheet` dari Jetpack Compose untuk merender baris notifikasi yang bisa di-klik.*

### 4.2. Helper, State & Component Umum
*   **`util/Resource.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Resource.kt]()`
    > *Penjelasan: *Sealed class* berisikan tipe `Success<T>`, `Error`, dan `Loading` untuk membungkus balikan/hasil *network request* secara global.*

*   **`ui/component/AppHeader.kt` & `BottomNavigationBar.kt` & `CommonCards.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Komponen UI Umum]()`
    > *Penjelasan: File ini memisahkan definisi AppBar/TopBar (`AppHeader`), deretan tab bawah (`BottomNavigationBar`), dan _box_ berbentuk Card dengan radius siku tumpul (`CommonCards`).*
