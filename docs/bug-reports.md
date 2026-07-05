# Bug Reports - Lestari

Dokumentasi bug yang ditemukan selama development dan testing.

---

## Ringkasan

| Severity | Total | Open | Fixed |
|----------|-------|------|-------|
| Critical | 0 | 0 | 0 |
| High | 3 | 0 | 3 |
| Medium | 4 | 0 | 4 |
| Low | 2 | 0 | 2 |
| **Total** | **9** | **0** | **9** |

---

## Bug Reports

### [BR-001]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-19 |
| **Severity** | High |
| **Status** | Fixed |
| **PR Reference** | #89 |
| **Deskripsi** | UI website tidak responsif saat dibuka di mobile browser |
| **Steps to Reproduce** | 1. Buka website Lestari di mobile browser<br>2. Perhatikan tampilan dashboard dan form |
| **Expected Result** | Tampilan responsive dan enak dilihat di mobile |
| **Actual Result** | Layout berantakan, text overflow, button tidak proporsional |
| **Assignee** | Fadhil Rusadi |
| **Fixed By** | Fadhil Rusadi |
| **Fixed Date** | 2026-06-19 |

---

### [BR-002]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-15 |
| **Severity** | High |
| **Status** | Fixed |
| **PR Reference** | #86 |
| **Deskripsi** | Submission laporan gagal tanpa feedback error ke user |
| **Steps to Reproduce** | 1. Submit laporan baru<br>2. Tanpa pilih lokasi di peta<br>3. Klik submit |
| **Expected Result** | Muncul pesan error validasi |
| **Actual Result** | Form submit tapi tidak ada feedback, laporan tidak tersimpan |
| **Assignee** | Deoshi Anessah Zheren Areja |
| **Fixed By** | Deoshi Anessah Zheren Areja |
| **Fixed Date** | 2026-06-15 |

---

### [BR-003]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-11 |
| **Severity** | High |
| **Status** | Fixed |
| **PR Reference** | #83 |
| **Deskripsi** | Dashboard admin tidak menampilkan statistik laporan |
| **Steps to Reproduce** | 1. Login sebagai admin<br>2. Buka dashboard admin |
| **Expected Result** | Statistik (jumlah laporan per status) tampil dengan benar |
| **Actual Result** | Statistik tidak muncul / blank |
| **Assignee** | Besty Mega Fauziah |
| **Fixed By** | Besty Mega Fauziah |
| **Fixed Date** | 2026-06-11 |

---

### [BR-004]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-10 |
| **Severity** | Medium |
| **Status** | Fixed |
| **PR Reference** | #81 |
| **Deskripsi** | Halaman history user tidak menampilkan data laporan dengan benar |
| **Steps to Reproduce** | 1. Login sebagai user<br>2. Buka menu riwayat<br>3. Perhatikan daftar laporan |
| **Expected Result** | Semua laporan user tampil dengan status yang sesuai |
| **Actual Result** | Data tidak tampil atau tidak sesuai |
| **Assignee** | Deoshi Anessah Zheren Areja |
| **Fixed By** | Deoshi Anessah Zheren Areja |
| **Fixed Date** | 2026-06-10 |

---

### [BR-005]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-09 |
| **Severity** | Medium |
| **Status** | Fixed |
| **PR Reference** | #77 |
| **Deskripsi** | Validasi laporan tidak berjalan dengan baik |
| **Steps to Reproduce** | 1. Submit laporan dengan deskripsi kosong<br>2. Submit tanpa foto |
| **Expected Result** | Validasi memunculkan error untuk field yang wajib |
| **Actual Result** | Laporan bisa submit meski ada field kosong |
| **Assignee** | Fadhil Rusadi |
| **Fixed By** | Fadhil Rusadi |
| **Fixed Date** | 2026-06-09 |

---

### [BR-006]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-09 |
| **Severity** | Medium |
| **Status** | Fixed |
| **PR Reference** | #77 |
| **Deskripsi** | Login Google OAuth redirect URL tidak正确 |
| **Steps to Reproduce** | 1. Klik login dengan Google<br>2. Setelah authorize di Google |
| **Expected Result** | Redirect ke halaman utama dengan session aktif |
| **Actual Result** | Redirect loop atau error page |
| **Assignee** | Fadhil Rusadi |
| **Fixed By** | Fadhil Rusadi |
| **Fixed Date** | 2026-06-09 |

---

### [BR-007]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-09 |
| **Severity** | Medium |
| **Status** | Fixed |
| **PR Reference** | #75 |
| **Deskripsi** | Status laporan tidak update setelah admin mengubahnya |
| **Steps to Reproduce** | 1. Admin ubah status laporan<br>2. User cek status |
| **Expected Result** | Status terbaru tampil |
| **Actual Result** | Status masih yang lama |
| **Assignee** | Fadhil Rusadi |
| **Fixed By** | Fadhil Rusadi |
| **Fixed Date** | 2026-06-09 |

---

### [BR-008]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-09 |
| **Severity** | Low |
| **Status** | Fixed |
| **PR Reference** | #74 |
| **Deskripsi** | Upload foto bukti gagal tanpa notifikasi |
| **Steps to Reproduce** | 1. Upload foto dengan format yang tidak didukung<br>2. Submit laporan |
| **Expected Result** | Error message: format file tidak didukung |
| **Actual Result** | Tidak ada feedback, foto tidak ter-upload |
| **Assignee** | Besty Mega Fauziah |
| **Fixed By** | Besty Mega Fauziah |
| **Fixed Date** | 2026-06-09 |

---

### [BR-009]

| Field | Isi |
|-------|-----|
| **Tanggal** | 2026-06-18 |
| **Severity** | Low |
| **Status** | Fixed |
| **PR Reference** | #88 |
| **Deskripsi** | Search bar di halaman peta map users tidak berfungsi |
| **Steps to Reproduce** | 1. Buka halaman peta laporan<br>2. Ketik di search bar |
| **Expected Result** | Laporan terfilter sesuai keyword |
| **Actual Result** | Search tidak memberikan hasil |
| **Assignee** | Deoshi Anessah Zheren Areja |
| **Fixed By** | Deoshi Anessah Zheren Areja |
| **Fixed Date** | 2026-06-18 |

---

## Catatan

- Semua bug sudah diperbaiki sebelum release v1.0.0
- Testing regression dilakukan untuk memastikan bug tidak muncul kembali
- Detail lebih lengkap bisa dilihat di Pull Request masing-masing
