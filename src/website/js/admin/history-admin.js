/**
 * history-admin.js — Lestari Admin Panel | Riwayat Laporan
 * Menampilkan laporan yang sudah diproses (terverifikasi, selesai, ditolak).
 * Klik tombol Detail → redirect ke report-admin.html?id={id}
 */

import { requireAdminAuth }      from '../shared/session.js';
import { initSidebarNavigation } from '../shared/ui.js';
import { adminAPI }              from '../shared/api.js';
import { showToast }             from '../shared/toast.js';

/* ── Guard ────────────────────────────────────────────────── */
requireAdminAuth();

/* ── Init Sidebar ─────────────────────────────────────────── */
initSidebarNavigation('riwayat');

/* ── DOM Refs ─────────────────────────────────────────────── */
const tableBody   = document.getElementById('table-body');
const tabGroup    = document.getElementById('tab-group');
const searchInput = document.getElementById('search-input');

/* ── State ────────────────────────────────────────────────── */
let activeStatus = 'semua';
let searchQuery  = '';
let currentPage  = 1;
let totalRecords = 0;
let lastPage     = 1;

/* ── Status badge map ─────────────────────────────────────── */
const BADGE = {
  divalidasi:    { cls: 'badge-terverifikasi', label: 'Terverifikasi' },
  terverifikasi: { cls: 'badge-terverifikasi', label: 'Terverifikasi' },
  selesai:       { cls: 'badge-selesai',       label: 'Selesai'       },
  ditolak:       { cls: 'badge-ditolak',       label: 'Ditolak'       },
};

function normalizeStatus(s) {
  if (!s) return 'tertunda';
  const ls = s.toLowerCase();
  if (['menunggu_validasi', 'tertunda'].includes(ls)) return 'tertunda';
  if (['terverifikasi', 'divalidasi', 'diproses'].includes(ls)) return 'terverifikasi';
  return ls;
}

function badgeHTML(status) {
  const norm = normalizeStatus(status);
  const b = BADGE[norm];
  if (!b) return `<span class="badge badge-tertunda">Tertunda</span>`;
  return `<span class="badge ${b.cls}">${b.label}</span>`;
}

/* ── Avatar initials ──────────────────────────────────────── */
function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase();
}

/* ── Format date ──────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return { main: '–', sub: '' };
  const d = new Date(iso);
  const main = d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const sub = d.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  }) + ' WIB';
  return { main, sub };
}

/* ── Render table ─────────────────────────────────────────── */
function renderTable(reports) {
  const visibleReports = reports || [];
  if (!visibleReports.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M9 12h6M9 16h6M7 3H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-2"/>
              <path d="M9 3a1 1 0 001 1h4a1 1 0 001-1V2a1 1 0 00-1-1h-4a1 1 0 00-1 1v1z"/>
            </svg>
            <div class="empty-state-title">Tidak ada riwayat laporan</div>
            <div class="empty-state-sub">Belum ada laporan yang sesuai dengan filter ini.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = visibleReports.map(r => {
    const { main: wMain, sub: wSub } = formatDate(r.created_at ?? r.tanggal);
    const username = r.user?.nama_lengkap ?? r.pelapor ?? '–';
    const reportId = r.nomor_laporan ?? r.laporan_id ?? r.id ?? '-';
    const detailId = r.id;

    return `
      <tr>
        <td>
          <div class="report-title-cell">
            <span class="report-title-main">${escapeHtml(r.judul ?? '–')}</span>
            <div class="report-meta-row">
              <span class="report-id">${escapeHtml(String(reportId))}</span>
              ${badgeHTML(r.status)}
            </div>
          </div>
        </td>
        <td>
          <span class="category-chip">${escapeHtml(r.kategori ?? '–')}</span>
        </td>
        <td>
          <div class="reporter-cell">
            <div class="reporter-avatar">${initials(username)}</div>
            <span class="reporter-name">${escapeHtml(username)}</span>
          </div>
        </td>
        <td>
          <div class="waktu-cell">
            <span class="waktu-main">${wMain}</span>
            <span class="waktu-sub">${wSub}</span>
          </div>
        </td>
        <td>
          <button class="btn-detail" data-id="${escapeHtml(String(detailId ?? ''))}">Detail</button>
        </td>
      </tr>`;
  }).join('');

  /* Bind detail buttons */
  tableBody.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      window.location.href = `../laporan/report-admin.html?id=${id}`;
    });
  });
}

/* ── Filter helper ────────────────────────────────────────── */
function applyFilter() {
  currentPage = 1;
  loadReports(activeStatus, 1);
}

function renderPagination(count, maxPage) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= maxPage;

  let pagesHtml = '';
  for (let i = 1; i <= maxPage; i++) {
    pagesHtml += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  pagination.innerHTML = `
    <button class="page-btn" id="prevPage" ${isPrevDisabled ? 'disabled' : ''}>←</button>
    ${pagesHtml}
    <button class="page-btn" id="nextPage" ${isNextDisabled ? 'disabled' : ''}>→</button>`;

  document.getElementById('prevPage')?.addEventListener('click', () => {
    if (currentPage > 1) loadReports(activeStatus, currentPage - 1);
  });

  document.getElementById('nextPage')?.addEventListener('click', () => {
    if (currentPage < maxPage) loadReports(activeStatus, currentPage + 1);
  });

  pagination.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = Number(btn.dataset.page);
      if (target !== currentPage) loadReports(activeStatus, target);
    });
  });
}

/* ── Fetch data ───────────────────────────────────────────── */
async function loadReports(status, page = 1) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5">
        <div class="state-row">
          <div class="spinner"></div>
          <span>Memuat riwayat…</span>
        </div>
      </td>
    </tr>`;

  try {
    const apiStatus = status === 'semua' ? 'riwayat' : status;
    const res = await adminAPI.getReports(apiStatus, { page, search: searchQuery });

    let reports = res.data || [];
    totalRecords = res.total || 0;
    lastPage = res.lastPage || 1;

    currentPage = Number(page) || 1;
    renderTable(reports);
    renderPagination(totalRecords, lastPage);
  } catch (err) {
    console.error('[history-admin] loadReports error:', err);
    showToast('Gagal memuat riwayat laporan.', 'error');
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="state-row">
            <span>Gagal memuat data. Silakan coba lagi.</span>
          </div>
        </td>
      </tr>`;
  }
}

/* ── Tab clicks ───────────────────────────────────────────── */
tabGroup.addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;

  tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  activeStatus = btn.dataset.status;
  searchInput.value = '';
  searchQuery = '';

  loadReports(activeStatus, 1);
});

/* ── Search ───────────────────────────────────────────────── */
let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    searchQuery = searchInput.value.trim();
    applyFilter();
  }, 280);
});

/* ── Sidebar (mobile) ─────────────────────────────────────── */
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('visible');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
}

hamburgerBtn?.addEventListener('click', openSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

/* ── Admin profile in sidebar ─────────────────────────────── */
async function loadAdminProfile() {
  try {
    // Endpoint 8: GET /api/admin/me — adminAPI.me() sesuai api.js
    const res = await adminAPI.me();
    if (!res) return;
    const admin = res.data ?? res;
    const nameEl  = document.getElementById('sidebarUserName');
    const emailEl = document.getElementById('sidebarUserEmail');
    if (nameEl  && admin.username) nameEl.textContent  = mapAdminUsername(admin.username);
    if (emailEl) emailEl.textContent = 'Lestari Admin Panel';
  } catch { /* silent */ }
}

/* ── XSS helper ───────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Username display mapping ─────────────────────────────── */
function mapAdminUsername(username) {
  if (!username) return 'Administrator';
  const match = String(username).match(/^admin(\d*)$/i);
  if (match) {
    const num = match[1] ? parseInt(match[1], 10) : 1;
    return `Administrator - ${num}`;
  }
  return username.charAt(0).toUpperCase() + username.slice(1);
}

/* ── Boot ─────────────────────────────────────────────────── */
loadAdminProfile();
loadReports('semua', 1);