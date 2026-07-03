# Penjelasan Lengkap Source Code Mobile - Bagian 1
**Fokus Fitur: Setup Dasar, Autentikasi (Auth), dan Pembuatan Laporan (Report)**

Total file: ~37 file. Dokumen ini menjelaskan fungsi teknis dari setiap *source code* (src) yang ada pada bagian ini.

---

## 1. Konfigurasi Awal & Entry Point (Setup Dasar)

### 1.1. Application & Manifest
*   **`AndroidManifest.xml`**
    Mengatur *permission* penting seperti internet dan lokasi, serta mendaftarkan `MainActivity` sebagai titik masuk (*launcher*) aplikasi.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AndroidManifest.xml]()`
    > *Penjelasan: Deklarasi `<uses-permission>` dan `<activity>` pada manifest.*

*   **`LestariApp.kt`**
    Merupakan kelas turunan `Application` yang pertama kali berjalan.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode LestariApp.kt]()`
    > *Penjelasan: Implementasi `onCreate()` untuk menginisialisasi `MTConfig.apiKey` agar peta MapTiler dapat berfungsi di seluruh aplikasi.*

### 1.2. Activity & Controller
*   **`MainActivity.kt`**
    *Entry point* dari sisi UI. Bertugas menentukan tujuan awal navigasi.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode MainActivity.kt]()`
    > *Penjelasan: Potongan kode yang memanggil `tokenPreferences.isLoggedIn()`. Jika *true*, startDestination diset ke `AuthRoutes.MAIN`, jika *false* ke `AuthRoutes.LOGIN`.*

*   **`controller/AppController.kt`**
    Mengatur state tab yang sedang aktif dan callback untuk event global seperti _logout_.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AppController.kt]()`
    > *Penjelasan: Deklarasi `var selectedTab` menggunakan `mutableStateOf` dan fungsi `logout()` yang memicu `onLogoutRequested`.*

*   **`model/MainTab.kt`**
    Enum class sederhana penanda tab.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode MainTab.kt]()`
    > *Penjelasan: Definisi `enum class MainTab` yang berisi Map, Report, History, dan Profile.*

---

## 2. Fitur Autentikasi (Auth)
Keseluruhan _flow_ mulai dari login hingga ganti password.

### 2.1. API & Model (Data Transfer Object)
*   **`data/api/RetrofitClient.kt`**
    Pembuat *instance* Retrofit.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode RetrofitClient.kt]()`
    > *Penjelasan: Konfigurasi `OkHttpClient` dengan `HttpLoggingInterceptor` dan pembuatan *instance* dari berbagai ApiService.*

*   **`data/api/AuthApiService.kt`**
    Kumpulan endpoint autentikasi.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AuthApiService.kt]()`
    > *Penjelasan: Pemetaan *endpoint* seperti `@POST("auth/login")` dan `@GET("auth/google")` dengan parameter request body.*

*   **`data/model/LoginRequest.kt` & `RegisterRequest.kt`**
    Model _request_ body.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Login & Register Request]()`
    > *Penjelasan: Data class yang mendefinisikan *payload* JSON (contoh: email, password) ke server.*

*   **`data/model/AuthResponse.kt`**
    Model yang menampung format JSON respon dari backend Laravel.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AuthResponse.kt]()`
    > *Penjelasan: Data class `AuthResponse` yang memuat field `success`, `message`, `data` (UserData), dan `token`.*

### 2.2. Helper & Config
*   **`data/GoogleAuthConfig.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode GoogleAuthConfig.kt]()`
    > *Penjelasan: Menyimpan konstanta `CALLBACK_PATH` untuk mencegat redirect URL OAuth Google dari backend.*

*   **`data/TokenPreference.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode TokenPreference.kt]()`
    > *Penjelasan: Memanfaatkan `SharedPreferences` Android untuk fungsi `saveAuthData()` (menyimpan JWT), `getToken()`, dan `clearAuthData()`.*

### 2.3. Repository & ViewModel
*   **`data/repository/AuthRepository.kt`**
    Lapisan _business logic_.
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AuthRepository.kt]()`
    > *Penjelasan: Blok fungsi `login()` yang mengeksekusi `apiService.login`. Di dalamnya ada logika ekstraksi token dan penyimpanannya via `tokenPreferences.saveAuthData()` yang dibungkus menggunakan *sealed class* `Resource`.*

*   **`ui/viewmodel/AuthViewModel.kt` & `AuthViewModelFactory.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AuthViewModel.kt]()`
    > *Penjelasan: Penggunaan `MutableStateFlow(AuthUiState())` untuk mempublikasikan status UI (loading/sukses/gagal). Pemanggilan fungsi *repository* dilakukan di dalam `viewModelScope.launch`.*

### 2.4. Komponen UI Reusable
*   **`ui/component/AuthComponent.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AuthComponent.kt]()`
    > *Penjelasan: Pembuatan _composable_ kustom `AuthTextField` berbasis `OutlinedTextField` yang dimodifikasi warnanya.*

*   **`ui/component/GoogleAuthWebView.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode GoogleAuthWebView.kt]()`
    > *Penjelasan: Implementasi `AndroidView` yang memuat `WebView`. Terdapat blok krusial `shouldOverrideUrlLoading` untuk mengekstrak token dari callback URL.*

### 2.5. UI Screens Auth (Halaman Autentikasi)
*   **`ui/screen/auth/AuthNavGraph.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode AuthNavGraph.kt]()`
    > *Penjelasan: Konfigurasi `NavHost` yang mendaftarkan seluruh *routes* (rute) halaman Auth seperti LOGIN, REGISTER, dan REGISTER_OTP.*

*   **`ui/screen/auth/LoginScreen.kt` & `RegisterScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Login/Register Screen]()`
    > *Penjelasan: Kode Jetpack Compose yang merender _text fields_, _buttons_, dan menghubungkan event klik (`onClick`) dengan memanggil method dari `AuthViewModel`.*

*   **`ui/screen/auth/ForgotPasswordScreen.kt` & `ResetPasswordScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Lupa Sandi]()`
    > *Penjelasan: Kode *screen* untuk tahapan input email dan pembaruan sandi (reset).*

*   **`ui/screen/auth/otpVerificationScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode OTP Verification]()`
    > *Penjelasan: Antarmuka kotak-kotak input OTP yang membaca 6-digit angka dan men-trigger verifikasi API.*

*   **`ui/screen/auth/PasswordSuccessScreen.kt` & `RegisterSuccessScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode Success Screens]()`
    > *Penjelasan: Layar status statis berisi ilustrasi sukses.*

---

## 3. Fitur Laporan (Report) & Tema (Theme)

### 3.1. API & Model Report
*   **`data/api/ReportApiService.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportApiService.kt (POST)]()`
    > *Penjelasan: Endpoint `@POST("reports")` yang dibubuhi anotasi `@Multipart` beserta anotasi `@Part` pada parameternya untuk *upload* gambar.*

*   **`data/model/ReportResponse.kt` & `ReportModels.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportResponse.kt]()`
    > *Penjelasan: Kelas DTO kompleks `ReportData` yang menampung relasi tabel, daftar log, daftar foto, hingga relasi dengan *user* dan *admin*.*

### 3.2. Repository & ViewModel Report
*   **`data/repository/ReportRepository.kt`** (Bagian Pembuatan Laporan)
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportRepository.kt (Multipart)]()`
    > *Penjelasan: Logika yang memparsing `Uri` foto dari Android `ContentResolver` menjadi array _byte_ dan mengubahnya ke `MultipartBody.Part`.*

*   **`ui/viewmodel/ReportViewModel.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportViewModel.kt]()`
    > *Penjelasan: Fungsi `createReport()` yang mengkomunikasikan UI dengan repository dan menyediakan `submitState` (loading).*

### 3.3. UI Screen & Navigasi Utama
*   **`ui/screen/report/ReportWizardScreen.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode ReportWizardScreen.kt]()`
    > *Penjelasan: Struktur kode yang memuat `HorizontalPager` (multi-tahap) dari memilih lokasi di mini-map, form data laporan, dan konfirmasi akhir sebelum di-_submit_.*

*   **`ui/app/LestariUserApp.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode LestariUserApp.kt]()`
    > *Penjelasan: *Root UI* yang memuat `Scaffold` dan `BottomNavigationBar`.*

### 3.4. Tema (Theme)
*   **`ui/theme/Theme.kt`, `Color.kt`, `AppColors.kt`, `Type.kt`**
    > *[PLACEHOLDER GAMBAR]*
    > `![Screenshot Kode File-file Theme]()`
    > *Penjelasan: Pendefinisian `MaterialTheme`, tipe font kustom (Poppins) di `Type.kt`, serta konstanta Hex warna di `AppColors.kt` (seperti `CatRed`, `Forest`).*
