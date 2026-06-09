// ============================================================
//  report-admin.js — Lestari Admin Panel
//  ES Module — sesuai API Reference & desain Figma
// ============================================================

import { requireAdminAuth }                    from '../shared/session.js';
import { initSidebarNavigation, setLoading }   from '../shared/ui.js';
import { adminAPI }                            from '../shared/api.js';
import { showToast }                           from '../shared/toast.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || '';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';

// ─── State ───────────────────────────────────────────────────
let currentStatus = 'semua';
let allReports    = [];
let currentReport = null;
let currentPage   = 1;
let totalRecords  = 0;
const ITEMS_PER_PAGE = 10;

// ─── DOM references ──────────────────────────────────────────
const viewTable  = document.getElementById('view-table');
const viewDetail = document.getElementById('view-detail');

// ─── Header date — bulan & tahun saat admin buka website ─────
// Dipanggil segera (DOM sudah siap saat module dievaluasi karena
// script type="module" di-defer secara default) DAN sekali lagi
// setelah DOMContentLoaded untuk jaminan.
function setHeaderDate() {
  const now   = new Date();
  const label = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  document.querySelectorAll('.header-date').forEach(el => (el.textContent = label));
}

// ─── Admin name mapping ──────────────────────────────────────
function mapAdminUsername(username) {
  if (!username) return 'Administrator';
  const match = String(username).match(/^admin(\d*)$/i);
  if (match) {
    const num = match[1] ? parseInt(match[1], 10) : 1;
    return `Administrator - ${num}`;
  }
  return username.charAt(0).toUpperCase() + username.slice(1);
}

async function loadAdminName() {
  try {
    const res   = await adminAPI.me();
    const admin = res?.data ?? res;
    const nameEl = document.getElementById('sidebarUserName');
    if (nameEl && admin?.username) nameEl.textContent = mapAdminUsername(admin.username);
  } catch { /* silent — default HTML tetap tampil */ }
}

// ─── Boot ────────────────────────────────────────────────────
initSidebarNavigation('laporan');
// Jalankan langsung — module script sudah defer by default jadi DOM pasti ada
setHeaderDate();
// Jaga-jaga: ulangi setelah DOMContentLoaded kalau rendering belum selesai
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setHeaderDate);
}
// ─── Status mapping: UI tab → API query param ────────────────
const STATUS_UI_TO_API = {
  semua:         null,
  tertunda:      'menunggu_validasi',
  terverifikasi: 'terverifikasi',
  selesai:       'selesai',
  ditolak:       'ditolak',
};

// Load admin name and initial data
loadAdminName();
loadReports(currentStatus, 1);
// ─── Tab group ───────────────────────────────────────────────
document.getElementById('tab-group').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  currentStatus = tab.dataset.status;
  loadReports(currentStatus, 1);
});

// ─── Search ──────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', e => {
  // Filter client-side within current page results
  renderTable(filterReports(e.target.value));
});

// ─── Breadcrumb back ─────────────────────────────────────────
document.getElementById('breadcrumb-back').addEventListener('click', () => {
  showTableView();
});



// ─── Load reports ────────────────────────────────────────────
async function loadReports(status, page = 1) {
  showTableLoading();
  try {
    const apiStatus = STATUS_UI_TO_API[status] ?? null;
    const response = await adminAPI.getReports(apiStatus, { page });

    // Normalize response shapes (array or { data, lastPage, total })
    allReports = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    totalRecords = response?.total ?? allReports.length;
    currentPage = Number(page) || 1;

    renderTable(allReports);
    renderPagination();
  } catch (err) {
    console.error(err);
    showTableEmpty('Gagal memuat laporan. Coba lagi.');
  }
}

// ─── Filter helper ───────────────────────────────────────────
function filterReports(query) {
  if (!query.trim()) return allReports;
  const q = query.toLowerCase();
  return allReports.filter(r =>
    (r.judul || r.title || '').toLowerCase().includes(q) ||
    (r.nomor_laporan || r.laporan_id || '').toLowerCase().includes(q) ||
    (r.kategori || r.category || '').toLowerCase().includes(q) ||
    String(r.id || '').toLowerCase().includes(q) ||
    (r.pelapor || r.user?.username || r.reporter?.name || '').toLowerCase().includes(q)
  );
}

// ─── Render table ────────────────────────────────────────────
function renderTable(reports) {
  const tbody = document.getElementById('table-body');
  const visibleReports = reports || [];
  if (!visibleReports.length) {
    showTableEmpty('Tidak ada laporan ditemukan.');
    return;
  }

  tbody.innerHTML = visibleReports.map(r => {
    const status   = normalizeStatus(r.status);
    const nama     = r.user?.username || r.pelapor || r.reporter?.name || '?';
    const initials = getInitials(nama);
    const dateStr  = formatDate(r.created_at || r.waktu || r.createdAt);
    const timeStr  = formatTime(r.created_at || r.waktu || r.createdAt);
    const judul    = r.judul || r.title || '-';
    const lap_id   = r.nomor_laporan || r.laporan_id || r.id || '-';
    const kategori = r.kategori || r.category || '-';

    return `
      <tr>
        <td>
          <div class="report-title-cell">
            <strong>${escHtml(judul)}</strong>
            <div class="report-meta">
              <span class="report-id">${escHtml(lap_id)}</span>
              <span class="badge badge-${status}">${statusLabel(status)}</span>
            </div>
          </div>
        </td>
        <td><span class="badge-category">${escHtml(kategori)}</span></td>
        <td>
          <div class="reporter-cell">
            <div class="reporter-avatar">${initials}</div>
            <span>${escHtml(nama)}</span>
          </div>
        </td>
        <td>
          <div class="time-cell">
            <span class="time-date">${dateStr}</span>
            <span class="time-clock">${timeStr} WIB</span>
          </div>
        </td>
        <td>
          <button class="btn-detail" data-id="${escHtml(String(r.id || ''))}"
                  data-status="${escHtml(status)}">Detail</button>
        </td>
      </tr>`;
  }).join('');

  // Bind detail buttons
  tbody.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => handleDetailClick(btn.dataset.id, btn.dataset.status));
  });
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const maxWebPage = totalRecords > 0
    ? Math.ceil(totalRecords / ITEMS_PER_PAGE)
    : Math.ceil(allReports.length / ITEMS_PER_PAGE) || 1;

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= maxWebPage;

  let pagesHtml = '';
  for (let i = 1; i <= maxWebPage; i++) {
    pagesHtml += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  pagination.innerHTML = `
    <button class="page-btn" id="prevPage" ${isPrevDisabled ? 'disabled' : ''}>←</button>
    ${pagesHtml}
    <button class="page-btn" id="nextPage" ${isNextDisabled ? 'disabled' : ''}>→</button>`;

  document.getElementById('prevPage')?.addEventListener('click', () => {
    if (currentPage > 1) loadReports(currentStatus, currentPage - 1);
  });

  document.getElementById('nextPage')?.addEventListener('click', () => {
    if (currentPage < maxWebPage) loadReports(currentStatus, currentPage + 1);
  });

  pagination.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.page);
      if (target !== currentPage) loadReports(currentStatus, target);
    });
  });
}

// ─── Table state helpers ─────────────────────────────────────
function showTableLoading() {
  document.getElementById('table-body').innerHTML = `
    <tr>
      <td colspan="5">
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Memuat laporan…</span>
        </div>
      </td>
    </tr>`;
}

function showTableEmpty(msg) {
  document.getElementById('table-body').innerHTML = `
    <tr>
      <td colspan="5">
        <div class="empty-state">${escHtml(msg)}</div>
      </td>
    </tr>`;
}

// ─── Handle detail click ─────────────────────────────────────
async function handleDetailClick(reportId, statusHint) {
  showDetailLoading(reportId);
  try {
    let report = null;
    // GET /api/admin/reports/{id}
    if (adminAPI.getReport) {
      report = await adminAPI.getReport(reportId);
    } else {
      report = allReports.find(r => String(r.id) === String(reportId));
    }
    if (!report) throw new Error('Laporan tidak ditemukan');
    currentReport = report;
    renderDetail(report);
  } catch (err) {
    console.error(err);
    showToast('Gagal memuat detail laporan.', 'error');
    showTableView();
  }
}

function showDetailLoading(reportId) {
  document.getElementById('breadcrumb-id').textContent = reportId;
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-wrap">
      <div class="loading-state"><div class="spinner"></div><span>Memuat detail…</span></div>
    </div>`;
  switchView('detail');
}

// ─── Render detail — router ───────────────────────────────────
function renderDetail(r) {
  const lapId  = r.nomor_laporan || r.laporan_id || r.id || '-';
  document.getElementById('breadcrumb-id').textContent = lapId;
  const status = normalizeStatus(r.status);
  let html = '';

  switch (status) {
    case 'tertunda':      html = renderTertunda(r);      break;
    case 'terverifikasi': html = renderTerverifikasi(r); break;
    case 'selesai':       html = renderSelesai(r);       break;
    case 'ditolak':       html = renderDitolak(r);       break;
    default:              html = renderTertunda(r);
  }

  document.getElementById('detail-content').innerHTML = html;
  bindDetailActions(r, status);
  initDetailMapThumb();
}

// ─── TERTUNDA ────────────────────────────────────────────────
// Tampilan: judul besar + status pill kanan atas
// Kiri : Bukti Visual, Deskripsi Laporan, Dilaporkan oleh
// Kanan: Deskripsi Laporan (peta), Tombol Verifikasi, Tombol Tolak, Catatan
function renderTertunda(r) {
  const judul  = escHtml(r.judul || r.title || '-');
  const lapId  = escHtml(r.nomor_laporan || r.laporan_id || r.id || '-');
  const desc   = escHtml(r.deskripsi || r.description || 'Tidak ada deskripsi.');
  const pelapor = escHtml(r.user?.username || r.pelapor || r.reporter?.name || '-');
  const foto   = getReportPhotoUrl(r);

  return `
  <div class="detail-wrap">
    <!-- Heading: judul besar + status pill -->
    <div class="detail-heading-block">
      <div>
        <h2>${judul}</h2>
        <div class="report-id-sub">${lapId}</div>
      </div>
      <span class="status-pill tertunda">Tertunda</span>
    </div>

    <div class="detail-grid">
      <!-- LEFT -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Bukti Visual -->
        <div class="detail-card">
          <div class="card-section-title">
            ${iconImage(20)}
            Bukti Visual
          </div>
          ${foto
            ? `<img src="${foto}" alt="Bukti Visual" class="evidence-img" />`
            : `<div class="evidence-placeholder">Tidak ada gambar</div>`}
        </div>

        <!-- Deskripsi -->
        <div class="detail-card">
          <div class="card-section-title">
            ${iconDoc(20)}
            Deskripsi Laporan
          </div>
          <p class="detail-desc-text">${desc}</p>
        </div>

        <!-- Pelapor -->
        <div class="reporter-row" style="padding:4px 0;">
          <div class="icon-user">${iconUser(16)}</div>
          <span><strong>Dilaporkan oleh:</strong> ${pelapor}</span>
        </div>
      </div>

      <!-- RIGHT -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Peta -->
        <div class="detail-card" style="padding:16px;">
          <div class="card-section-title">${iconPin(20)} Deskripsi Laporan</div>
          ${renderMapThumb(r)}
        </div>

        <!-- Tombol aksi -->
        <div class="action-area">
          <button class="btn btn-verify" id="btn-verify">
            <div class="btn-spinner"></div>
            <span class="btn-label">Verifikasi Laporan</span>
          </button>
          <button class="btn btn-reject" id="btn-reject">
            <div class="btn-spinner"></div>
            <span class="btn-label">Tolak Laporan</span>
          </button>
        </div>

        <!-- Catatan -->
        <div>
          <div class="catatan-label">
            ${iconDoc(14)}
            Catatan
          </div>
          <textarea id="catatan-input" class="catatan-textarea"
            placeholder="Berikan instruksi tambahan atau alasan jika laporan ditolak…"></textarea>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── TERVERIFIKASI ───────────────────────────────────────────
// Tampilan: status bar kiri (pill + id + judul), kanan tombol "Selesaikan Laporan"
// Kiri : Detail Laporan card + bottom boxes (verified + pelapor)
// Kanan: Peta, Log Aktivitas, Ubah ke Tertunda
function renderTerverifikasi(r) {
  return _renderVerifiedOrDone(r, 'terverifikasi');
}

// ─── SELESAI ─────────────────────────────────────────────────
// Sama dengan terverifikasi tapi tanpa tombol "Selesaikan", ada "Ubah ke Tertunda" di kanan atas
function renderSelesai(r) {
  return _renderVerifiedOrDone(r, 'selesai');
}

function _renderVerifiedOrDone(r, status) {
  const lapId      = escHtml(r.nomor_laporan || r.laporan_id || r.id || '-');
  const judul      = escHtml(r.judul || r.title || '-');
  const desc       = escHtml(r.deskripsi || r.description || '-');
  const kategori   = escHtml(r.kategori || r.category || '-');
  const waktuStr   = formatDateTime(r.created_at || r.waktu || r.createdAt);
  const pelapor    = escHtml(r.user?.username || r.pelapor || r.reporter?.name || '-');
  const verifiedBy = escHtml(r.admin?.username || r.verifiedBy || r.diverifikasiOleh || '-');
  const verifiedAt = formatDateTime(r.validated_at || r.verified_at || r.verifiedAt || r.waktuVerifikasi || null);
  const foto       = getReportPhotoUrl(r);

  // Tombol kanan atas hanya muncul di status terverifikasi
  const mainBtn = status === 'terverifikasi'
    ? `<button class="btn btn-complete" id="btn-complete" style="width:auto;padding:10px 22px;">
         <div class="btn-spinner"></div>
         <span class="btn-label">Selesaikan Laporan</span>
       </button>`
    : `<button class="btn btn-rollback" id="btn-rollback" style="width:auto;padding:10px 22px;">
         <div class="btn-spinner"></div>
         <span class="btn-label">Ubah ke Tertunda</span>
       </button>`;

  return `
  <div class="detail-wrap">
    <!-- Status bar -->
    <div class="detail-statusbar">
      <div class="detail-title-group">
        <span class="status-pill ${status}">${statusLabel(status)}</span>
        <div class="detail-title-info">
          <span class="report-num">${lapId}</span>
          <span class="report-name">${judul}</span>
        </div>
      </div>
      ${mainBtn}
    </div>

    <div class="detail-grid">
      <!-- LEFT -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Detail card -->
        <div class="detail-card">
          <div class="card-section-title">${iconDoc(20)} Detail Laporan</div>
          <p style="font-size:13px;font-weight:600;color:var(--gray-400);margin-bottom:6px;">Deskripsi</p>
          <p class="detail-desc-text">${desc}</p>
          <div class="detail-meta-grid">
            <div class="meta-item">
              <label>Kategori</label>
              <strong>${kategori}</strong>
            </div>
            <div class="meta-item">
              <label>Waktu</label>
              <strong>${waktuStr}</strong>
            </div>
          </div>
          <p class="foto-label">Bukti Foto</p>
          ${foto
            ? `<img src="${foto}" alt="Bukti" class="bukti-foto-img" />`
            : `<div class="evidence-placeholder" style="height:150px;font-size:13px;color:var(--gray-400);">Tidak ada foto</div>`}
        </div>

        <!-- Bottom boxes: Verified + Pelapor -->
        <div class="bottom-boxes">
          <div class="info-box verified-box">
            <div class="info-box-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Laporan Terverifikasi
            </div>
            <p class="info-box-sub">Terverifikasi pada ${verifiedAt || '-'}</p>
            <div class="info-box-name">
              ${iconUser(14)}
              Diverifikasi oleh ${verifiedBy}
            </div>
          </div>

          <div class="info-box reporter-box">
            <div class="info-box-title">Dilaporkan oleh:</div>
            <div class="reporter-row" style="margin-top:8px;">
              <div class="icon-user">${iconUser(16)}</div>
              <span>${pelapor}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Peta -->
        <div class="detail-card" style="padding:16px;">
          <div class="card-section-title">${iconPin(20)} Deskripsi Laporan</div>
          ${renderMapThumb(r)}
        </div>

        <!-- Log Aktivitas -->
        <div class="detail-card">
          <div class="log-title">LOG AKTIVITAS</div>
          ${renderLogAktivitas(r, status)}
        </div>

        <!-- Ubah ke Tertunda — hanya muncul di terverifikasi (di sini posisi bawah) -->
        ${status === 'terverifikasi'
          ? `<button class="btn btn-rollback" id="btn-rollback">
               <div class="btn-spinner"></div>
               <span class="btn-label">Ubah ke Tertunda</span>
             </button>`
          : ''}
      </div>
    </div>
  </div>`;
}

// ─── DITOLAK ─────────────────────────────────────────────────
// Tampilan: status bar kiri (pill Ditolak + id + judul), kanan "Ubah ke Tertunda"
// Kiri : Alasan Penolakan alert + Detail card
// Kanan: Peta, Log Aktivitas, Dilaporkan oleh box
function renderDitolak(r) {
  const lapId    = escHtml(r.nomor_laporan || r.laporan_id || r.id || '-');
  const judul    = escHtml(r.judul || r.title || '-');
  const alasan   = escHtml(r.alasan_penolakan || r.catatanAdmin || r.notes || 'Tidak ada alasan yang diberikan.');
  const desc     = escHtml(r.deskripsi || r.description || '-');
  const kategori = escHtml(r.kategori || r.category || '-');
  const waktuStr = formatDateTime(r.created_at || r.waktu || r.createdAt);
  const pelapor  = escHtml(r.user?.username || r.pelapor || r.reporter?.name || '-');
  const foto     = getReportPhotoUrl(r);
  const rejectedBy = escHtml(r.admin?.username || r.rejectedBy || r.ditolakOleh || 'Admin');

  return `
  <div class="detail-wrap">
    <!-- Status bar -->
    <div class="detail-statusbar">
      <div class="detail-title-group">
        <span class="status-pill ditolak">Ditolak</span>
        <div class="detail-title-info">
          <span class="report-num">${lapId}</span>
          <span class="report-name">${judul}</span>
        </div>
      </div>
      <button class="btn btn-rollback" id="btn-rollback" style="width:auto;padding:10px 22px;">
        <div class="btn-spinner"></div>
        <span class="btn-label">Ubah ke Tertunda</span>
      </button>
    </div>

    <div class="detail-grid">
      <!-- LEFT -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <!-- Alasan penolakan alert -->
        <div class="rejection-alert">
          <div class="rejection-alert-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span class="rejection-alert-title">Alasan Penolakan</span>
          </div>
          <p class="rejection-alert-body" style="margin-bottom: 8px;">${alasan}</p>
          
          <!-- TEKS TAMBAHAN DITOLAK OLEH SIAPA -->
          <p class="rejection-alert-by" style="font-size: 12px; color: #dc2626; font-weight: 500; margin-top: 6px;">
            Ditolak oleh ${rejectedBy}
          </p>
        </div>

        <!-- Detail card -->
        <div class="detail-card">
          <div class="card-section-title">${iconDoc(20)} Detail Laporan</div>
          <p style="font-size:13px;font-weight:600;color:var(--gray-400);margin-bottom:6px;">Deskripsi</p>
          <p class="detail-desc-text">${desc}</p>
          <div class="detail-meta-grid">
            <div class="meta-item">
              <label>Kategori</label>
              <strong>${kategori}</strong>
            </div>
            <div class="meta-item">
              <label>Waktu</label>
              <strong>${waktuStr}</strong>
            </div>
          </div>
          <p class="foto-label">Bukti Foto</p>
          ${foto
            ? `<img src="${foto}" alt="Bukti" class="bukti-foto-img" />`
            : `<div class="evidence-placeholder" style="height:150px;font-size:13px;color:var(--gray-400);">Tidak ada foto</div>`}
        </div>
      </div>

      <!-- RIGHT -->
      <div style="display:flex;flex-direction:column;gap:14px;">
        <!-- Peta -->
        <div class="detail-card" style="padding:16px;">
          <div class="card-section-title">${iconPin(20)} Lokasi Kejadian</div>
          ${renderMapThumb(r)}
        </div>

        <!-- Log Aktivitas -->
        <div class="detail-card">
          <div class="log-title">LOG AKTIVITAS</div>
          ${renderLogAktivitas(r, 'ditolak')}
        </div>

        <!-- Dilaporkan oleh box -->
        <div class="reporter-panel-box">
          <div class="reporter-panel-label">Dilaporkan oleh:</div>
          <div class="reporter-row">
            <div class="icon-user">${iconUser(16)}</div>
            <span>${pelapor}</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── Bind actions ────────────────────────────────────────────
//
//  PATCH /api/admin/reports/{id}/validate
//    → terverifikasi, ditolak   (syarat: status menunggu_validasi)
//    → payload: { status } atau { status, alasan_penolakan }
//
//  PATCH /api/admin/reports/{id}/status
//    → selesai, menunggu_validasi (rollback)
//
function bindDetailActions(r, status) {
  if (status === 'tertunda') {
    document.getElementById('btn-verify')?.addEventListener('click', () =>
      handleValidate('btn-verify', r.id, 'terverifikasi', null)
    );
    document.getElementById('btn-reject')?.addEventListener('click', () => {
      const notes = document.getElementById('catatan-input')?.value?.trim() || '';
      handleValidate('btn-reject', r.id, 'ditolak', notes);
    });
  }

  if (status === 'terverifikasi') {
    document.getElementById('btn-complete')?.addEventListener('click', () =>
      handleStatus('btn-complete', r.id, 'selesai')
    );
  }

  // Rollback tersedia di terverifikasi & ditolak
  document.getElementById('btn-rollback')?.addEventListener('click', () =>
    handleStatus('btn-rollback', r.id, 'menunggu_validasi')
  );
}

// ─── PATCH …/validate ────────────────────────────────────────
async function handleValidate(btnId, reportId, newStatus, alasanPenolakan) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  setLoading(btn, true);
  try {
    const payload = { status: newStatus };
    if (newStatus === 'ditolak' && alasanPenolakan) {
      payload.alasan_penolakan = alasanPenolakan;
    }
    await adminAPI.validateReport(reportId, payload);
    showToast(`Status laporan berhasil diubah ke "${statusLabel(normalizeStatus(newStatus))}".`, 'success');
    await _refreshAfterAction(reportId, newStatus);
  } catch (err) {
    console.error(err);
    showToast('Gagal mengubah status laporan. Coba lagi.', 'error');
    setLoading(btn, false);
  }
}

// ─── PATCH …/status ──────────────────────────────────────────
async function handleStatus(btnId, reportId, newStatus) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  setLoading(btn, true);
  try {
    await adminAPI.updateReportStatus(reportId, { status: newStatus });
    showToast(`Status laporan berhasil diubah ke "${statusLabel(normalizeStatus(newStatus))}".`, 'success');
    await _refreshAfterAction(reportId, newStatus);
  } catch (err) {
    console.error(err);
    showToast('Gagal mengubah status laporan. Coba lagi.', 'error');
    setLoading(btn, false);
  }
}

// ─── Shared post-action refresh ──────────────────────────────
async function _refreshAfterAction(reportId, newStatus) {
  await loadReports(currentStatus);
  const updated = allReports.find(rep => String(rep.id) === String(reportId))
    ?? { ...currentReport, status: newStatus };
  currentReport = updated;
  renderDetail(updated);
}

// ─── View switchers ──────────────────────────────────────────
function showTableView() {
  switchView('table');
}

function switchView(view) {
  if (view === 'detail') {
    viewTable.classList.add('hidden');
    viewDetail.classList.remove('hidden');
  } else {
    viewDetail.classList.add('hidden');
    viewTable.classList.remove('hidden');
  }
}

// ─── Log Aktivitas renderer ──────────────────────────────────
function renderLogAktivitas(r, status) {
  // Prioritaskan log dari API jika tersedia
  const rawLogs = r.logs || r.log_aktivitas || r.logAktivitas || r.activityLog || null;
  const logs    = rawLogs ? _mapApiLogs(rawLogs) : buildDefaultLog(r, status);

  return `<div class="log-list">${logs.map(log => `
    <div class="log-item">
      <div class="log-dot ${log.color}"></div>
      <div class="log-text">
        <span class="log-label">${escHtml(log.label)}</span>
        <span class="log-time">${escHtml(log.time)}</span>
      </div>
    </div>`).join('')}</div>`;
}

function _mapApiLogs(logs) {
  // Mapping status API → label UI
  const labelMap = {
    menunggu_validasi: { label: 'Menunggu Verifikasi',     color: 'yellow' },
    terverifikasi:     { label: 'Laporan terverifikasi',   color: 'green'  },
    divalidasi:         { label: 'Laporan terverifikasi',   color: 'green'  },
    diproses:           { label: 'Laporan terverifikasi',   color: 'green'  },
    selesai:           { label: 'Laporan selesai',          color: 'gray'   },
    ditolak:           { label: 'Laporan ditolak',          color: 'red'    },
    created:           { label: 'Laporan diterima sistem',  color: 'green'  },
  };
  return logs.map(log => {
    const mapped = labelMap[log.status] || { label: log.status || '-', color: 'green' };
    return {
      label: mapped.label,
      color: mapped.color,
      time:  formatDateTime(log.created_at || log.timestamp || log.time || ''),
    };
  });
}

function buildDefaultLog(r, status) {
  const logs    = [];
  const baseTime = r.created_at || r.waktu || r.createdAt || '';
  const updTime  = r.updated_at  || r.updatedAt  || baseTime;
  const verTime  = r.validated_at || r.verified_at || r.verifiedAt || updTime;

  if (status === 'ditolak') {
    logs.push({ label: 'Laporan ditolak',         color: 'red',    time: formatDateTime(updTime) });
    logs.push({ label: 'Menunggu Verifikasi',      color: 'yellow', time: formatDateTime(baseTime) });
    logs.push({ label: 'Laporan diterima sistem',  color: 'green',  time: formatDateTime(baseTime) });
  } else if (status === 'terverifikasi') {
    logs.push({ label: 'Laporan terverifikasi',    color: 'green',  time: formatDateTime(verTime) });
    logs.push({ label: 'Menunggu Verifikasi',      color: 'yellow', time: formatDateTime(baseTime) });
    logs.push({ label: 'Laporan diterima sistem',  color: 'green',  time: formatDateTime(baseTime) });
  } else if (status === 'selesai') {
    logs.push({ label: 'Laporan selesai',          color: 'gray',   time: formatDateTime(updTime) });
    logs.push({ label: 'Laporan terverifikasi',    color: 'green',  time: formatDateTime(verTime) });
    logs.push({ label: 'Menunggu Verifikasi',      color: 'yellow', time: formatDateTime(baseTime) });
    logs.push({ label: 'Laporan diterima sistem',  color: 'green',  time: formatDateTime(baseTime) });
  } else {
    logs.push({ label: 'Menunggu Verifikasi',      color: 'yellow', time: formatDateTime(baseTime) });
    logs.push({ label: 'Laporan diterima sistem',  color: 'green',  time: formatDateTime(baseTime) });
  }
  return logs;
}

// ─── Map thumbnail ───────────────────────────────────────────
function renderMapThumb(r) {
  const lat    = r.latitude  || r.lat || null;
  const lng    = r.longitude || r.lng || null;
  const mapImg = r.mapUrl    || r.mapImageUrl || '';

  if (mapImg) {
    return `<div class="map-thumb">
      <img src="${mapImg}" alt="Peta Lokasi" />
      <span class="map-coords">${lat ? lat + '° S' : ''}, ${lng ? lng + '° E' : ''}</span>
    </div>`;
  }

  if (lat && lng) {
    return renderLeafletMapTilerThumb(lat, lng);
  }

  return `<div class="map-placeholder">
    ${iconPin(24)}
    <span>Koordinat tidak tersedia</span>
  </div>`;
}

// ─── Utility helpers ─────────────────────────────────────────
function renderLeafletMapTilerThumb(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return `<div class="map-placeholder">
      ${iconPin(24)}
      <span>Koordinat tidak valid</span>
    </div>`;
  }

  return `<div class="map-thumb map-leaflet-wrap">
    <div
      id="detailMapThumb"
      class="detail-map-canvas"
      data-lat="${latitude}"
      data-lng="${longitude}"
      aria-label="Peta lokasi laporan"></div>
    <span class="map-coords">${latitude.toFixed(4)}Ã‚Â° S, ${longitude.toFixed(4)}Ã‚Â° E</span>
  </div>`;
}

function initDetailMapThumb() {
  const mapEl = document.getElementById('detailMapThumb');
  if (!mapEl) return;

  const latitude = parseFloat(mapEl.dataset.lat);
  const longitude = parseFloat(mapEl.dataset.lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return;

  if (!window.L) {
    mapEl.innerHTML = `<div class="map-placeholder">${iconPin(24)}<span>Peta tidak dapat dimuat</span></div>`;
    return;
  }

  const Leaflet = window.L;

  const detailMap = Leaflet.map(mapEl, {
    zoomControl: true,        
    attributionControl: true,
    dragging: true,          
    scrollWheelZoom: true,    
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    tap: true,
  }).setView([latitude, longitude], 16);

  Leaflet.tileLayer(
    `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    {
      attribution: '© MapTiler © OpenStreetMap',
      tileSize: 512,
      zoomOffset: -1,
    }
  ).addTo(detailMap);

  const greenIcon = Leaflet.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  Leaflet.marker([latitude, longitude], { icon: greenIcon }).addTo(detailMap);

  setTimeout(() => detailMap.invalidateSize(), 0);
}

function renderMapTilerThumb(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return `<div class="map-placeholder">
      ${iconPin(24)}
      <span>Koordinat tidak valid</span>
    </div>`;
  }

  const zoom = 16;
  const width = 600;
  const height = 380;
  const src = '';

  return `<div class="map-thumb">
    <img
      title="Peta lokasi laporan"
      alt="Peta lokasi laporan"
      src="${src}"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade" />
    <span class="map-coords">${latitude.toFixed(4)}Â° S, ${longitude.toFixed(4)}Â° E</span>
  </div>`;
}

function getReportPhotoUrl(report) {
  const directUrl = report.foto_url || report.fotoUrl || report.photoUrl || report.imageUrl;
  if (directUrl) return directUrl;

  const firstPhoto = Array.isArray(report.photos) ? report.photos[0] : null;
  if (!firstPhoto) return '';

  const photoUrl = firstPhoto.url || firstPhoto.public_url || firstPhoto.file_url;
  if (photoUrl) return photoUrl;

  const path = firstPhoto.file_path;
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  if (!SUPABASE_URL || !SUPABASE_BUCKET) return '';
  const cleanPath = String(path).replace(/^\/+/, '');
  const bucketPrefix = `${SUPABASE_BUCKET}/`;
  const objectPath = cleanPath.startsWith(bucketPrefix)
    ? cleanPath.slice(bucketPrefix.length)
    : cleanPath;

  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`;
}

function normalizeStatus(status) {
  if (!status) return 'tertunda';
  const s = status.toLowerCase().trim();
  if (s === 'menunggu_validasi' || s === 'pending' || s === 'tertunda') return 'tertunda';
  if (s === 'terverifikasi' || s === 'divalidasi' || s === 'diproses' || s === 'verified') return 'terverifikasi';
  if (s === 'selesai'       || s === 'done')        return 'selesai';
  if (s === 'ditolak'       || s === 'rejected')    return 'ditolak';
  return 'tertunda';
}

function statusLabel(status) {
  const map = {
    tertunda:      'Tertunda',
    terverifikasi: 'Terverifikasi',
    selesai:       'Selesai',
    ditolak:       'Ditolak',
  };
  return map[status] || status;
}

function getInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch { return iso; }
}

function formatTime(iso) {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function formatDateTime(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
           ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  } catch { return iso; }
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── SVG icon helpers ────────────────────────────────────────
function iconImage(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>`;
}

function iconDoc(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>`;
}

function iconPin(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="10" r="3"/>
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
  </svg>`;
}

function iconUser(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`;
}

// ─── Initial load ─────────────────────────────────────────────
async function bootReportPage() {
  const admin = await requireAdminAuth();
  if (!admin) return;

  loadAdminName();

  const params = new URLSearchParams(window.location.search);
  const reportId = params.get('id');

  await loadReports('semua');

  if (reportId) {
    await handleDetailClick(reportId);
  }
}

bootReportPage();