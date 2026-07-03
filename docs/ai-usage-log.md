# AI-Usage Log

Dokumentasi penggunaan AI dalam proyek EnviroGuard.

Format dokumentasi ini mengikuti prinsip transparansi dalam Responsible AI Use.

## Prinsip yang Dijaga

- **Transparansi**: Semua penggunaan AI didokumentasikan secara jujur
- **Verifikasi**: Output AI selalu diverifikasi sebelum digunakan
- **Keamanan Data**: Tidak ada credential atau data sensitif yang dimasukkan ke prompt AI
- **Pemahaman**: Tim memahami setiap kode yang dihasilkan AI

---

## Ringkasan Penggunaan AI

| Kategori |工具/Platform | Frekuensi | Status |
|----------|--------------|-----------|--------|
| Code Generation | ChatGPT, Copilot | Sedang | ✅ Diverifikasi |
| Debugging | ChatGPT, Copilot | Tinggi | ✅ Diverifikasi |
| Documentation | ChatGPT | Rendah | ✅ Diverifikasi |
| Mobile Dev | ChatGPT | Sedang | ✅ Diverifikasi |

---

## Penggunaan Detail

### 1. Code Generation

**Tools**: ChatGPT, GitHub Copilot

**Prompt Examples**:
- "Generate Laravel controller for report management"
- "Create Kotlin function for reverse geocoding"

**Verifikasi**: Semua kode dicek dan dipahami sebelum diintegrasikan

---

### 2. Debugging & Error Solving

**Tools**: ChatGPT

**Contoh Penggunaan**:
- Troubleshooting error CORS pada API
- Fixing boolean casting pada PostgreSQL
- Debugging Supabase storage upload issues

**Verifikasi**: Error di-replicate dan solusinya diuji sebelum di-commit

---

### 3. Documentation

**Tools**: ChatGPT

**Penggunaan**:
- Membuat template dokumentasi
- Parafrase dokumentasi teknis

**Verifikasi**: Isi diverifikasi oleh tim sebelum publish

---

### 4. Mobile Development (Kotlin/Android)

**Tools**: ChatGPT, Copilot

**Penggunaan**:
- Generate layout XML
- Create ViewModel and Repository classes
- Handle API response parsing

**Verifikasi**: Semua fitur diuji di emulator dan device nyata

---

## Refleksi Efektivitas Penggunaan AI

### Yang Berhasil
- ✅ Accelerating boilerplate code generation
- ✅ Faster debugging dengan search kemampuan AI
- ✅ Improving documentation quality

### Yang Kurang Berhasil
- ⚠️ AI sometimes generates outdated API code (Laravel changes)
- ⚠️ Mobile code suggestions need adjustment for project structure
- ⚠️ Complex SQL queries need manual optimization

### Lesson Learned
1. AI is a powerful tool, but understanding the codebase is essential
2. Always verify AI output before production use
3. Document the context of AI usage for future reference

---

## Checklist Responsible AI Use

- [x] Penggunaan AI didokumentasikan
- [x] Output AI diverifikasi sebelum digunakan
- [x] Tidak ada data sensitif di prompt
- [x] Tim memahami kode yang dihasilkan AI

---

*Last Updated: 2026-07-03*
