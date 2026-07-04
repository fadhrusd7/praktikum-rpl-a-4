# Retrospektif Tim - Lestari

Retrospektif adalah evaluasi diri tim setelah menyelesaikan proyek. Format ini berdasarkan metodologi Agile.

Tanggal retro: 2026-07-04
Moderator: Fadhil Rusadi
Notulen: Deoshi Anessah Zheren Areja

---

## What went well? (Apa yang berjalan baik)

- Komunikasi tim berjalan lancar melalui grup WhatsApp dan meeting rutin setiap minggu
- Pembagian tugas jelas: Fadhil (Backend), Nessa (Frontend User), Besty (Frontend Admin), Dina (Mobile)
- Penggunaan Supabase sebagai BaaS mempercepat development karena tidak perlu setup database server sendiri
- Dokumentasi dibuat secara bertahap di setiap minggu praktikum sehingga tidak menumpuk di akhir
- Git workflow dengan feature branches membantu menghindari conflict dan memudahkan code review
- Peta interaktif dengan MapTiler berhasil diimplementasikan dengan baik untuk menampilkan laporan verified

---

## What didn't go well? (Apa yang tidak berjalan baik)

- Meeting sync online kadang molor karena kesibukan masing-masing anggota
- Debugging API yang kompleks terutama untuk fitur upload foto ke Supabase Storage
- Koordinasi antara frontend dan backend terkadang miskomunikasi tentang format response API
- Fitur login Google OAuth membutuhkan konfigurasi yang cukup rumit di Console Google Cloud
- Waktu pengembangan mobile app lebih lambat dari website karena belum familier dengan Kotlin
- Beberapa feature branches tidak di-merge tepat waktu sehingga terjadi duplicate work

---

## What can we improve? (Apa yang bisa diperbaiki ke depan)

- Tentukan deadline individu yang lebih ketat agar tidak ada pekerjaan yang menumpuk di akhir
- Buat API contract lebih awal agar frontend dan backend bisa develop secara parallel
- Lakukan code review sebelum merge ke branch utama untuk menjaga kualitas kode
- Gunakan Postman/Echo secara lebih disiplin untuk testing API sebelum integrate dengan frontend
- Dokumentasikan error dan solusi yang pernah dihadapi agar tim bisa belajar dari pengalaman
- Pertimbangkan penggunaan project management tool seperti Trello atau Jira untuk tracking progress
- Sisihkan waktu buffer untuk contingency terutama saat menghadapi bug yang tidak terduga

---

## Shout-outs (Apresiasi untuk anggota tim)

- Terima kasih **Fadhil** yang selalu siap bantu debugging backend dan men-setup server API di Supabase
- Terima kasih **Dina** yang gigih belajar Kotlin dan berhasil mengimplementasikan fitur login dan pelaporan di mobile
- Terima kasih **Besty** yang teliti membuat dashboard admin dan memastikan semua fitur admin berfungsi dengan baik
- Terima kasih **Nessa** yang kreatif merancang UI/UX halaman user dan selalu cepat dalam merevisi tampilan
- Terima kasih untuk seluruh tim yang saling mendukung dan tidak pernah menyerah meskipun ada banyak hambatan

---

## Kesimpulan

Proyek Lestari berhasil diselesaikan dalam waktu satu semester dengan menghasilkan MVP yang fungsional. Tim telah belajar banyak hal teknis maupun non-teknis. Ke depan, tim berharap dapat menerapkan lesson learned ini untuk proyek-proyek selanjutnya.
