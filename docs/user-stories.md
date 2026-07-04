# User Stories

1. As a user, I want to melaporkan isu lingkungan, so that I bisa menginformasikan kepada admin/pihak yang berwajib.
    - AC-1:
        Given user sudah login,
        When user mengisi deskripsi dan lokasi lalu mengirim laporan,
        Then sistem menyimpan laporan dengan status "menunggu validasi".
    
    - AC-2:
        Given user tidak mengisi deskripsi atau lokasi,
        When user mencoba mengirim laporan,
        Then sistem menolak dan menampilkan pesan error.

2. As a user, I want to melihat laporan di peta, so that I bisa mengetahui lokasi tepat isu/permasalahan tersebut berada.
    - AC-1:
        Given user sudah login,
        When user membuka halaman peta,
        Then peta menampilkan penanda lokasi dari laporan yang berstatus "terverifikasi".

    - AC-2:
        Given tidak ada data laporan,
        When user membuka halaman peta,
        Then sistem menampilkan peta kosong dengan pesan "belum ada laporan".

    - AC-3:
        Given terdapat laporan dengan berbagai status,
        When sistem menampilkan data pada peta,
        Then hanya laporan dengan status "terverifikasi" yang ditampilkan.

    - AC-4:
        Given terdapat laporan dengan status "selesai",
        When sistem memuat data laporan pada peta,
        Then laporan tidak ditampilkan pada peta.

3. As a user, I want to mengecek status laporan, so that I bisa mengetahui progress laporan.
    - AC-1:
        Given user sudah login dan telah mengirim laporan,
        When user membuka daftar laporan milik user tersebut,
        Then sistem menampilkan status laporan (menunggu validasi, ditolak, terverifikasi, dan selesai).

    - AC-2:
        Given user belum pernah membuat laporan,
        When user membuka daftar laporan,
        Then sistem menampilkan pesan "belum ada laporan".

4. As a user, I want to memberi bukti berupa foto, so that laporan saya lebih valid.
    - AC-1:
        Given user sudah login dan membuat laporan,
        When user mengunggah foto,
        Then sistem menyimpan foto sebagai bukti laporan.

    - AC-2:
        Given user mengunggah file bukan gambar,
        When sistem memproses upload,
        Then sistem menolak file dan menampilkan pesan error.

5. As an admin, I want to melakukan validasi dan pembaruan status laporan, so that saya dapat menentukan tindak lanjut dari laporan user.
    - AC-1:
        Given admin sudah login dan membuka daftar laporan,
        When admin memilih untuk menyetujui laporan,
        Then sistem mengubah status laporan menjadi "terverifikasi".

    - AC-2:
        Given admin menolak laporan,
        When admin memasukkan alasan penolakan,
        Then sistem mengubah status menjadi "ditolak" dan menyimpan alasan tersebut.

    - AC-3:
        Given laporan telah terverifikasi,
        When admin mengubah status laporan menjadi "selesai",
        Then sistem memperbarui status laporan dan menyimpannya.

6. As an admin, I want to melihat seluruh laporan, so that I bisa melakukan monitor terhadap seluruh laporan/isu.
    - AC-1:
        Given admin sudah login dan berada di dashboard,
        When admin membuka halaman laporan,
        Then sistem menampilkan seluruh laporan beserta status-statusnya.
    
    - AC-2:
        Given tidak ada laporan dalam sistem,
        When admin membuka halaman laporan,
        Then sistem menampilkan pesan "tidak ada data".

7. As a user, I want to melakukan registrasi akun, so that saya dapat mengakses fitur pelaporan dalam sistem.
    - AC-1:
        Given user berada di halaman registrasi,
        When user mengisi data (nama, email, password) dengan benar,
        Then sistem berhasil membuat akun dan menyimpan data user.

    - AC-2:
        Given user mengisi email yang sudah terdaftar,
        When user mencoba registrasi,
        Then sistem menolak dan menampilkan pesan "email sudah digunakan".

8. As a user, I want to login ke dalam sistem, so that saya dapat membuat dan memantau laporan saya.
    - AC-1:
        Given user memiliki akun,
        When user memasukkan email dan password yang benar,
        Then sistem mengarahkan user ke halaman utama.

    - AC-2:
        Given user memasukkan data login yang salah,
        When user mencoba login,
        Then sistem menolak dan menampilkan pesan error.

9. As an admin, I want to login ke dalam sistem, so that saya dapat mengelola dan memantau laporan.
    - AC-1:
        Given admin memiliki akun khusus,
        When admin memasukkan email dan password yang benar,
        Then sistem mengarahkan admin ke dashboard admin.

    - AC-2:
        Given admin memasukkan data login yang salah,
        When admin mencoba login,
        Then sistem menolak dan menampilkan pesan error.

    - AC-3:
        Given user bukan admin,
        When user mencoba mengakses dashboard admin,
        Then sistem menolak akses dan menampilkan pesan unauthorized.