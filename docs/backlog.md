# Backlog


## Must-have
|AC              | User Story    | Role     | Prioritas   |
| -------------- | ------------- | -------- | ----------- |
| AC-1 : Given user sudah login, When user mengisi deskripsi dan lokasi lalu mengirim laporan, Then sistem menyimpan laporan dengan status “menunggu validasi". AC-2: Given user tidak mengisi deskripsi atau lokasi, When user mencoba mengirim laporan, Then sistem menolak dan menampilkan pesan error.| Melaporkan isu lingkungan | User   | Must-have  |
| AC-1 : Given user membuka halaman peta, When sistem memuat data laporan, Then peta menampilkan penanda lokasi dari setiap laporan. AC-2: Given tidak ada data laporan, When user membuka peta, Then sistem menampilkan peta kosong dengan pesan "belum laporan". | Melihat laporan di peta | User   | Must-have  |
| AC-1 : Given user berada di halaman registrasi, When user mengisi data (nama, email, password) dengan benar, Then sistem berhasil membuat akun dan menyimpan data user. AC-2 : Given user mengisi email yang sudah terdaftar, When user mencoba registrasi, Then sistem menolak dan menampilkan pesan "email sudah digunakan". | Registrasi dan login user | User   | Must-have  |

## Should-have
|AC              | User Story    | Role     | Prioritas   |
| -------------- | ------------- | -------- | ----------- |
| AC-1: Given user telah mengirim laporan, When user membuka daftar laporan milik user, Then sistem menampilkan status laporan (menunggu, diproses, selesai). AC-2: Given user belum pernah membuat laporan, When user membuka daftar laporan, Then sistem menampilkan pesan "belum ada laporan".| Mengecek status laporan | User   | Should-have  |
| AC-1: Given admin berada di dashboard, When admin membuka halaman laporan, Then sistem menampilkan seluruh laporan beserta statusnya.AC-2: Given tidak ada laporan dalam sistem, When admin membuka halaman laporan, Then sistem menampilkan pesan "tidak ada data". | Melihat seluruh laporan | Admin   | Should-have  |
| AC-1: Given laporan sudah divalidasi, When admin mengubah status menjadi “diproses” atau “selesai”, Then sistem memperbarui status laporan dan menyimpannya. AC-2: Given laporan belum divalidasi, When admin mencoba mengubah status, Then sistem menolak perubahan status. | Update status laporan | Admin  | Should-have  |
| AC-1: Given admin berada di dashboard, When sistem menampilkan data, Then sistem menampilkan jumlah laporan berdasarkan kategori dan status. AC-2: Given terdapat data laporan, When sistem memproses data, Then sistem menampilkan tren laporan dalam bentuk grafik mingguan. | Melihat statistik di dashboard admin | Admin  | Should-have  |

## Could-have
|AC              | User Story    | Role     | Prioritas   |
| -------------- | ------------- | -------- | ----------- |
| AC-1: Given status laporan berubah, When sistem memperbarui status, Then sistem mengirim notifikasi kepada user terkait. AC-2: Given user membuka notifikasi, When user melihat detail, Then sistem menampilkan informasi perubahan status laporan.| Menerima notifikasi saat status laporan berubah | User   | Could-have  |
| AC-1: Given user berada di halaman laporan/peta, When user memilih kategori tertentu, Then sistem menampilkan laporan sesuai kategori. AC-2: Given tidak ada laporan pada kategori tersebut, When filter diterapkan, Then sistem menampilkan pesan "tidak ada laporan". | Memfilter laporan berdasarkan kategori | User   | Could-have  |
| AC-1: Given user telah membuat laporan sebelumnya, When user membuka riwayat laporan, Then sistem menampilkan daftar laporan yang pernah dibuat. AC-2: Given user belum pernah membuat laporan, When membuka riwayat, Then sistem menampilkan pesan "belum ada laporan". | Melihat riwayat laporan | User  | Could-have  |
| AC-1: Given user membuat laporan, When user memilih mode anonim, Then sistem tidak menampilkan identitas user pada laporan. AC-2: Given laporan anonim ditampilkan, When user lain/admin melihat laporan, Then sistem hanya menampilkan data laporan tanpa identitas pelapor. | Membuat laporan secara anonim | User  | Could-have  |

## Won't-have
|AC              | User Story    | Role     | Prioritas   |
| -------------- | ------------- | -------- | ----------- |
| AC-1: Given user mengirim laporan, When sistem memproses laporan, Then sistem melakukan analisis otomatis untuk menentukan validitas laporan. AC-2: Given hasil analisis tersedia, When sistem menilai laporan, Then sistem memberi rekomendasi valid/tidak valid.| Validasi laporan otomatis berbasis AI | System   | Won't-have  |
| AC-1: Given user membuka detail laporan, When user menambahkan komentar, Then sistem menyimpan dan menampilkan komentar tersebut. AC-2: Given terdapat komentar, When user lain membuka laporan, Then sistem menampilkan seluruh komentar. | Memberikan komentar pada laporan | User   | Won't-have  |
| AC-1: Given user telah membuat laporan sebelumnya, When user membuka riwayat laporan, Then sistem menampilkan daftar laporan yang pernah dibuat. AC-2: Given user belum pernah membuat laporan, When membuka riwayat, Then sistem menampilkan pesan "belum ada laporan". | MBlur wajah otomatis pada foto laporan | System  | Won't-have  |