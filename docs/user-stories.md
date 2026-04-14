# User Stories

1. As a user, I want to melaporkan isu lingkungan, so that I bisa menginformasikan kepada admin/pihak yang berwajib
    AC-1:
    Given user sudah login,
    When user mengisi deskripsi dan lokasi lalu mengirim laporan,
    Then sistem menyimpan laporan dengan status “menunggu validasi”

2. As a user, I want to melihat laporan di peta, so that I bisa mengetahui lokasi tepat isu/permasalahan tersebut berada
    AC-1:
    Given user membuka halaman peta,
    When sistem memuat data laporan,
    Then peta menampilkan penanda lokasi dari setiap laporan

3. As a user, I want to mengecek status laporan, so that I bisa mengetahui progress laporan
    AC-1:
    Given user telah mengirim laporan,
    When user membuka daftar laporan milik user tsb,
    Then sistem menampilkan status laporan (menunggu, diproses, selesai)

4. As a user, I want to mengunggah foto, so that laporan saya lebih valid
    AC-1:
    Given user membuat laporan,
    When user mengunggah foto,
    Then sistem menyimpan foto sebagai bukti laporan

5. As an admin, I want to melakukan validasi laporan, so that I bisa melakukan filter terhadap laporan yang salah atau tidak valid
    AC-1:
    Given admin membuka daftar laporan,
    When admin memilih untuk menyetujui atau menolak laporan, 
    Then sistem memperbarui status laporan sesuai keputusan admin

6. As an admin, I want to melihat seluruh laporan, so that I bisa melakukan monitor terhadap seluruh laporan/isu
    AC-1:
    Given admin berada di dashboard
    When admin membuka halaman laporan
    Then sistem menampilkan seluruh laporan beserta status-statusnya

7. As an admin, I want to melakukan update status terhadap laporan, so that user dapat mengetahui progress dari laporan
    AC-1:
    Given laporan sudah divalidasi, 
    When admin mengubah status menjadi “diproses” atau “selesai”,
    Then sistem memperbarui status laporan dan menyimpannya

8. As an admin, I want to menghapus laporan yang tidak valid, so that sistem tetap valid/bersih/clean
    AC-1:
    Given terdapat laporan yang tidak valid,
    When admin menghapus laporan tersebut,
    Then sistem menghapus laporan dari daftar

9. As a user, I want to melakukan registrasi akun, so that saya dapat menggunakan sistem untuk membuat laporan.
    AC-1:
    Given user berada di halaman registrasi,
    When user mengisi data (nama, email, password) dengan benar,
    Then sistem berhasil membuat akun dan menyimpan data user.

    AC-2:
    Given user mengisi email yang sudah terdaftar,
    When user mencoba registrasi,
    Then sistem menolak dan menampilkan pesan "email sudah digunakan".

10. As an admin, I want to login ke dalam sistem, so that saya dapat mengelola dan memantau laporan.
    AC-1:
    Given admin memiliki akun,
    When admin memasukkan email dan password yang benar,
    Then sistem mengarahkan admin ke dashboard admin.

    AC-2:
    Given admin memasukkan data login yang salah,
    When admin mencoba login,
    Then sistem menolak dan menampilkan pesan error.