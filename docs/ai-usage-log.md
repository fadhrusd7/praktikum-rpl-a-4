# AI-Usage Log

Dokumentasi penggunaan AI dalam proyek **Lestari**.

Format dokumentasi ini mengikuti prinsip transparansi dalam Responsible AI Use.

## Prinsip yang Dijaga

- **Transparansi**: Semua penggunaan AI didokumentasikan secara jujur
- **Verifikasi**: Output AI selalu diverifikasi sebelum digunakan
- **Keamanan Data**: Tidak ada credential atau data sensitif yang dimasukkan ke prompt AI
- **Pemahaman**: Tim memahami setiap kode yang dihasilkan AI

---

## Ringkasan Penggunaan AI

| Kategori | Platform | Frekuensi | Status |
|----------|--------------|-----------|--------|
| Code Generation | Claude AI, ChatGPT, Copilot | Sedang | Diverifikasi |
| Debugging | Claude AI, ChatGPT, Copilot | Tinggi | Diverifikasi |
| Documentation | Claude AI, ChatGPT | Rendah | Diverifikasi |
| Mobile Dev | Claude AI, ChatGPT | Sedang | Diverifikasi |
| Backend Dev | Claude AI | Tinggi | Diverifikasi |

---

## Penggunaan Detail

### 1. Code Generation

**Tools**: Claude AI, ChatGPT, GitHub Copilot

**Prompt Examples**:
- "Generate Laravel controller for report management"
- "Create Kotlin function for reverse geocoding"

**Verifikasi**: Semua kode dicek dan dipahami sebelum diintegrasikan

---

### 2. Debugging & Error Solving

**Tools**: Claude AI, ChatGPT

**Contoh Penggunaan**:
- Troubleshooting error CORS pada API
- Fixing boolean casting pada PostgreSQL
- Debugging Supabase storage upload issues

**Verifikasi**: Error di-replicate dan solusinya diuji sebelum di-commit

---

### 3. Documentation

**Tools**: Claude AI, ChatGPT

**Penggunaan**:
- Membuat template dokumentasi
- Parafrase dokumentasi teknis

**Verifikasi**: Isi diverifikasi oleh tim sebelum publish

---

### 4. Mobile Development (Kotlin/Android)

**Tools**: Claude AI, ChatGPT, Copilot

**Penggunaan**:
- Generate layout XML
- Create ViewModel and Repository classes
- Handle API response parsing

**Verifikasi**: Semua fitur diuji di emulator dan device nyata

---

### 5. Backend Development (Laravel)

**Tools**: Claude AI

**Penggunaan**:
- Setup project Laravel
- Setup Migrasi database
- Membuat Controller dan Model
- Membuat routing API

**Evidence/Bukti**:
- Konsep & Persiapan setup project: 
    - https://claude.ai/share/9c0f3309-f613-4e6d-ace7-221f59de18a4
- Setup Laravel: 
    - https://claude.ai/share/6339b6e5-4352-4b30-9a59-71ffbab202ad
- Setup Backend (Migrasi, Controller, Model, dll):
  - https://claude.ai/share/90c23922-385a-402d-a0f4-84165d8c1ba0
  - https://claude.ai/share/de9b2361-3581-48fe-861d-224996e16c6b

**Verifikasi**: Semua endpoint diuji dengan Postman dan fitur dicek di frontend

### Yang Berhasil
- Accelerating boilerplate code generation
- Faster debugging dengan search kemampuan AI
- Improving documentation quality

### Yang Kurang Berhasil
- AI sometimes generates outdated API code (Laravel changes)
- Mobile code suggestions need adjustment for project structure
- Complex SQL queries need manual optimization

### Lesson Learned
1. AI is a powerful tool, but understanding the codebase is essential
2. Always verify AI output before production use
3. Document the context of AI usage for future reference

---

## Checklist Responsible AI Use

- Penggunaan AI didokumentasikan
- Output AI diverifikasi sebelum digunakan
- Tidak ada data sensitif di prompt
- Tim memahami kode yang dihasilkan AI

---

*Last Updated: 2026-07-04*
