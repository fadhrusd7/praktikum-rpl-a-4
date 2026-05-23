# Product Backlog

## Must-have

| AC | User Story | Role | Prioritas |
|---|---|---|---|
| AC-1: Given user sudah login, When user mengisi deskripsi dan lokasi lalu mengirim laporan, Then sistem menyimpan laporan dengan status "menunggu validasi". AC-2: Given user tidak mengisi deskripsi atau lokasi, When user mencoba mengirim laporan, Then sistem menolak dan menampilkan pesan error. | Melaporkan isu lingkungan | User | Must-have |
| AC-1: Given user sudah login, When user membuka halaman peta, Then peta menampilkan penanda lokasi dari laporan yang berstatus "terverifikasi". AC-2: Given tidak ada data laporan, When user membuka halaman peta, Then sistem menampilkan peta kosong dengan pesan "belum ada laporan". AC-3: Given terdapat laporan dengan berbagai status, When sistem menampilkan data pada peta, Then hanya laporan dengan status "terverifikasi" yang ditampilkan. AC-4: Given terdapat laporan dengan status "selesai", When sistem memuat data laporan pada peta, Then laporan tidak ditampilkan pada peta. | Melihat laporan di peta | User | Must-have |
| AC-1: Given user berada di halaman registrasi, When user mengisi data (nama, email, password) dengan benar, Then sistem berhasil membuat akun dan menyimpan data user. AC-2: Given user mengisi email yang sudah terdaftar, When user mencoba registrasi, Then sistem menolak dan menampilkan pesan "email sudah digunakan". | Registrasi akun user | User | Must-have |
| AC-1: Given user memiliki akun, When user memasukkan email dan password yang benar, Then sistem mengarahkan user ke halaman utama. AC-2: Given user memasukkan data login yang salah, When user mencoba login, Then sistem menolak dan menampilkan pesan error. | Login user | User | Must-have |
| AC-1: Given admin memiliki akun khusus, When admin memasukkan email dan password yang benar, Then sistem mengarahkan admin ke dashboard admin. AC-2: Given admin memasukkan data login yang salah, When admin mencoba login, Then sistem menolak dan menampilkan pesan error. AC-3: Given user bukan admin, When user mencoba mengakses dashboard admin, Then sistem menolak akses dan menampilkan pesan unauthorized. | Login admin | Admin | Must-have |

---

## Should-have

| AC | User Story | Role | Prioritas |
|---|---|---|---|
| AC-1: Given user sudah login dan telah mengirim laporan, When user membuka daftar laporan milik user tersebut, Then sistem menampilkan status laporan (menunggu validasi, ditolak, terverifikasi, dan selesai). AC-2: Given user belum pernah membuat laporan, When user membuka daftar laporan, Then sistem menampilkan pesan "belum ada laporan". | Mengecek status laporan | User | Should-have |
| AC-1: Given user sudah login dan membuat laporan, When user mengunggah foto, Then sistem menyimpan foto sebagai bukti laporan. AC-2: Given user mengunggah file bukan gambar, When sistem memproses upload, Then sistem menolak file dan menampilkan pesan error. | Mengunggah foto laporan | User | Should-have |
| AC-1: Given admin sudah login dan membuka daftar laporan, When admin memilih untuk menyetujui laporan, Then sistem mengubah status laporan menjadi "terverifikasi". AC-2: Given admin menolak laporan, When admin memasukkan alasan penolakan, Then sistem mengubah status menjadi "ditolak" dan menyimpan alasan tersebut. AC-3: Given laporan telah terverifikasi, When admin mengubah status laporan menjadi "selesai", Then sistem memperbarui status laporan dan menyimpannya. | Validasi dan pembaruan status laporan | Admin | Should-have |
| AC-1: Given admin sudah login dan berada di dashboard, When admin membuka halaman laporan, Then sistem menampilkan seluruh laporan beserta status-statusnya. AC-2: Given tidak ada laporan dalam sistem, When admin membuka halaman laporan, Then sistem menampilkan pesan "tidak ada data". | Melihat seluruh laporan | Admin | Should-have |
| AC-1: Given admin berada di dashboard, When sistem menampilkan data, Then sistem menampilkan jumlah laporan berdasarkan status. AC-2: Given terdapat data laporan, When sistem memproses data, Then sistem menampilkan grafik laporan berdasarkan status. | Melihat statistik dashboard admin | Admin | Should-have |

---

## Could-have

| AC | User Story | Role | Prioritas |
|---|---|---|---|
| AC-1: Given status laporan berubah, When sistem memperbarui status, Then sistem mengirim notifikasi kepada user terkait. AC-2: Given user membuka notifikasi, When user melihat detail, Then sistem menampilkan informasi perubahan status laporan. | Menerima notifikasi perubahan status laporan | User | Could-have |
| AC-1: Given user berada di halaman laporan/peta, When user memilih kategori tertentu, Then sistem menampilkan laporan sesuai kategori. AC-2: Given tidak ada laporan pada kategori tersebut, When filter diterapkan, Then sistem menampilkan pesan "tidak ada laporan". | Memfilter laporan berdasarkan kategori | User | Could-have |
| AC-1: Given user telah membuat laporan sebelumnya, When user membuka riwayat laporan, Then sistem menampilkan daftar laporan yang pernah dibuat. AC-2: Given user belum pernah membuat laporan, When membuka riwayat, Then sistem menampilkan pesan "belum ada laporan". | Melihat riwayat laporan | User | Could-have |
| AC-1: Given user membuat laporan, When user memilih mode anonim, Then sistem tidak menampilkan identitas user pada laporan. AC-2: Given laporan anonim ditampilkan, When user lain/admin melihat laporan, Then sistem hanya menampilkan data laporan tanpa identitas pelapor. | Membuat laporan secara anonim | User | Could-have |

---

## Won't-have

| AC | User Story | Role | Prioritas |
|---|---|---|---|
| AC-1: Given user mengirim laporan, When sistem memproses laporan, Then sistem melakukan analisis otomatis untuk menentukan validitas laporan. AC-2: Given hasil analisis tersedia, When sistem menilai laporan, Then sistem memberi rekomendasi valid/tidak valid. | Validasi laporan otomatis berbasis AI | System | Won't-have |
| AC-1: Given user membuka detail laporan, When user menambahkan komentar, Then sistem menyimpan dan menampilkan komentar tersebut. AC-2: Given terdapat komentar, When user lain membuka laporan, Then sistem menampilkan seluruh komentar. | Memberikan komentar pada laporan | User | Won't-have |
| AC-1: Given user mengunggah foto laporan, When sistem memproses gambar, Then sistem melakukan blur wajah otomatis pada foto. AC-2: Given proses blur selesai, When foto ditampilkan, Then wajah pada foto tampak tersamarkan. | Blur wajah otomatis pada foto laporan | System | Won't-have |