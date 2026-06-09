// riwayat-detail.js — Halaman Detail Riwayat Laporan
import { getMe, logout, getReportById } from './api.js';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_KEY ?? '';

// ── DOM refs ───────────────────────────────────────────────────
const logoutBtn    = document.getElementById('logoutBtn');
const userNameEl   = document.getElementById('userNameEl');
const userEmailEl  = document.getElementById('userEmailEl');
const dateBadgeEl  = document.getElementById('dateBadgeEl');
const breadcrumbId = document.getElementById('breadcrumbId');
const detailTitle  = document.getElementById('detailTitle');
const detailId     = document.getElementById('detailId');
const statusBadge  = document.getElementById('statusBadge');
const leftCol      = document.getElementById('leftCol');
const logTimeline  = document.getElementById('logTimeline');
const mapCoordsEl  = document.getElementById('mapCoords');

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setDateBadge();
 _loadUserInfo(); // Ganti ini
  bindLogout();

  const id = getIdFromUrl();
  if (!id) {
    showPageError('ID laporan tidak ditemukan di URL.');
    return;
  }

  showSkeleton();

  try {
    const report = await getReportById(id);
    if (!report) { showPageError('Data laporan tidak ditemukan.'); return; }
    renderDetail(report);
  } catch (err) {
    console.error('[detail]', err);
    showPageError('Gagal memuat detail laporan.');
  }
}

// ── Date Badge ─────────────────────────────────────────────────
function setDateBadge() {
  const now = new Date();
  const label = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  if (dateBadgeEl) dateBadgeEl.textContent = label;
}

// ── User Info ──────────────────────────────────────────────
function _loadUserInfo() {
  const token = localStorage.getItem('auth_token')
  const cachedName  = localStorage.getItem('user_name')  || 'Nama Pengguna'
  const cachedEmail = localStorage.getItem('user_email') || 'email@gmail.com'
  const cachedAvatar = localStorage.getItem('user_avatar') || null

  _setUserDOM(cachedName, cachedEmail, cachedAvatar)

  if (!token) return

  fetch('/api/user/profile', {
    headers: {
      'Accept':        'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(r => r.json())
  .then(body => {
    if (!body.success) return
    
    const u = body.data
    const displayName = u.nama_lengkap || u.username || 'Pengguna'
    
    const email = u.email || cachedEmail
    const avatar = u.foto_profil_url || u.foto_profil || null

    _setUserDOM(displayName, email, avatar)
    localStorage.setItem('user_name',  displayName)
    localStorage.setItem('user_email', email)
    if (avatar) localStorage.setItem('user_avatar', avatar)
  })
  .catch(() => {/* tetap pakai cache */})
}

function _setUserDOM(name, email, avatar) {
  const n = document.querySelector('#sidebarUserName')
  const e = document.querySelector('#sidebarUserEmail') 
  const img = document.querySelector('#sidebar-avatar-img') 
  
  if (n) n.textContent = name || 'Nama Pengguna'
  if (e) e.textContent = email || 'email@gmail.com'
  
  if (img) {
    if (avatar) {
      img.src = avatar
      img.onerror = () => {
        img.onerror = null
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Pengguna')}&background=E0FBD2&color=00AA13&bold=true`
      }
    } else {
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Pengguna')}&background=E0FBD2&color=00AA13&bold=true`
    }
  }
}
// ── Logout ─────────────────────────────────────────────────────
function bindLogout() {
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    await logout();
  });
}

// ── URL param ──────────────────────────────────────────────────
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// ── Render Detail ──────────────────────────────────────────────
function renderDetail(report) {
  const status   = normalizeStatus(report.status);
  const reportId = report.nomor_laporan ?? report.id;

  // Breadcrumb & Title
  if (breadcrumbId) breadcrumbId.textContent = String(reportId);
  if (detailTitle)  detailTitle.textContent  = report.judul ?? '—';
  if (detailId)     detailId.textContent     = String(reportId);

  // Status badge
  if (statusBadge) {
    statusBadge.textContent = getStatusLabel(status);
    statusBadge.className   = `status-badge status-${status}`;
  }

  // Left column content
  buildLeftCol(report, status);

  // Timeline
  buildTimeline(report, status);

  // Map
  initMap(report);

  // Coords
  if (mapCoordsEl && report.latitude && report.longitude) {
    mapCoordsEl.textContent = `${formatCoord(report.latitude)}° S, ${formatCoord(report.longitude)}° E`;
  }
}

// ── Left Column ────────────────────────────────────────────────
function buildLeftCol(report, status) {
  if (!leftCol) return;

  const rejectionBox = status === 'ditolak' ? buildRejectionBox(report) : '';
  
  let imgSrc = '';
  if (report.photos && report.photos.length > 0) {
      imgSrc = report.photos[0].url ?? '';
  }
  
  if (!imgSrc) {
    imgSrc = report.image_url ?? report.photo_url ?? report.image ?? '';
  }

  leftCol.innerHTML = `
    ${rejectionBox}
    <div class="card">
      <div class="card-title">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 5-5 4 4 4-4 5 5"/>
        </svg>
        Bukti Visual
      </div>
      ${imgSrc
        ? `<img class="bukti-img" src="${escHtml(imgSrc)}" alt="Bukti visual laporan" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E">`
        : `<div class="bukti-placeholder">
             <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
               <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 19.5h19.5M3.75 3.75h16.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"/>
             </svg>
             <span>Foto tidak tersedia</span>
           </div>`
      }
    </div>
    <div class="card">
      <div class="card-title">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
        </svg>
        Deskripsi Laporan
      </div>
      <p class="desc-text">${escHtml(report.deskripsi ?? '—')}</p>
    </div>
  `;
}

function buildRejectionBox(report) {
  const reason = report.rejection_reason ?? report.catatan ?? report.notes ?? 'Tidak ada keterangan.';
  return `
    <div class="rejection-box">
      <div class="rejection-header">
        <svg width="18" height="18" fill="none" stroke="#b91c1c" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <span class="rejection-title">Alasan Penolakan</span>
      </div>
      <p class="rejection-text">${escHtml(reason)}</p>
    </div>
  `;
}

// ── Timeline ───────────────────────────────────────────────────
function buildTimeline(report, status) {
  if (!logTimeline) return;

  const sentAt     = pickTime(report, ['created_at']);
  const reviewAt   = pickLogTime(report, ['menunggu_validasi', 'tertunda'], ['diterima', 'ditinjau'])
                  || pickTime(report, ['reviewed_at', 'created_at']);
  const verifiedAt = pickLogTime(report, ['terverifikasi'], ['verifikasi', 'terverifikasi'])
                  || pickTime(report, ['verified_at', 'validated_at', 'updated_at']);
  const rejectedAt = pickLogTime(report, ['ditolak'], ['ditolak'])
                  || pickTime(report, ['rejected_at', 'validated_at', 'updated_at']);
  const resolvedAt = pickLogTime(report, ['selesai'], ['selesai'])
                  || pickTime(report, ['resolved_at', 'completed_at', 'updated_at']);

  const createdAt   = fmtDate(sentAt);
  const reviewedAt  = fmtDate(reviewAt);
  const verifiedTime = fmtDate(verifiedAt);
  const rejectedTime = fmtDate(rejectedAt);
  const resolvedTime = fmtDate(resolvedAt);

  let items = [];

  if (status === 'tertunda') {
    items = [
      { label: 'Sedang ditinjau',  time: reviewedAt, dotClass: 'dot-yellow' },
      { label: 'Laporan dikirim',  time: createdAt,  dotClass: 'dot-green'  },
    ];
  } else if (status === 'terverifikasi') {
    items = [
      { label: 'Laporan diverifikasi', time: verifiedTime, dotClass: 'dot-green-light' },
      { label: 'Sedang ditinjau',      time: reviewedAt, dotClass: 'dot-yellow' },
      { label: 'Laporan dikirim',      time: createdAt,  dotClass: 'dot-green' },
    ];
  } else if (status === 'selesai') {
    items = [
      { label: 'Laporan selesai',      time: resolvedTime, dotClass: 'dot-gray'   },
      { label: 'Laporan diverifikasi', time: verifiedTime, dotClass: 'dot-green-light' },
      { label: 'Sedang ditinjau',      time: reviewedAt, dotClass: 'dot-yellow' },
      { label: 'Laporan dikirim',      time: createdAt,  dotClass: 'dot-green'  },
    ];
  } else if (status === 'ditolak') {
    items = [
      { label: 'Laporan ditolak', time: rejectedTime, dotClass: 'dot-red'    },
      { label: 'Sedang ditinjau', time: reviewedAt, dotClass: 'dot-yellow' },
      { label: 'Laporan dikirim', time: createdAt,  dotClass: 'dot-green'  },
    ];
  }

  renderTimelineItems(items);
}

function renderTimelineItems(items) {
  logTimeline.innerHTML = items.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot ${item.dotClass}"></div>
      <div class="timeline-body">
        <div class="timeline-label">${escHtml(item.label)}</div>
        <div class="timeline-time">${item.time}</div>
      </div>
    </div>
  `).join('');
}

function pickTime(report, keys) {
  for (const key of keys) {
    if (report?.[key]) return report[key];
  }
  return null;
}

function pickLogTime(report, statuses = [], actionKeywords = []) {
  const logs = Array.isArray(report?.logs) ? report.logs : [];
  const normalizedStatuses = statuses.map(normalizeStatus);
  const keywords = actionKeywords.map(keyword => keyword.toLowerCase());

  const match = logs
    .slice()
    .reverse()
    .find(log => {
      const status = normalizeStatus(log.status);
      const action = String(log.aksi || '').toLowerCase();
      return normalizedStatuses.includes(status)
        || keywords.some(keyword => action.includes(keyword));
    });

  return match?.created_at || null;
}

// ── Map ────────────────────────────────────────────────────────
function initMap(report) {
  const lat = parseFloat(report.latitude);
  const lng = parseFloat(report.longitude);

  if (isNaN(lat) || isNaN(lng)) return;

  const map = L.map('detail-map', { zoomControl: false, dragging: false });

  L.tileLayer(
    `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
    { attribution: '© MapTiler © OpenStreetMap contributors', maxZoom: 20 }
  ).addTo(map);

  map.setView([lat, lng], 16);

  // Custom red SVG marker
  const redIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#ef4444"/>
      <circle cx="14" cy="14" r="5" fill="#fff"/>
    </svg>`,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });

  L.marker([lat, lng], { icon: redIcon }).addTo(map);
}

// ── Helpers ────────────────────────────────────────────────────
function normalizeStatus(s) {
  const map = {
    pending: 'tertunda', tertunda: 'tertunda',
    verified: 'terverifikasi', terverifikasi: 'terverifikasi',
    completed: 'selesai', selesai: 'selesai',
    rejected: 'ditolak', ditolak: 'ditolak',
  };
  return map[(s ?? '').toLowerCase()] ?? 'tertunda';
}

function getStatusLabel(s) {
  const labels = { tertunda: 'Tertunda', terverifikasi: 'Terverifikasi', selesai: 'Selesai', ditolak: 'Ditolak' };
  return labels[s] ?? s;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  const tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${tgl}, ${jam} WIB`;
}

function formatCoord(val) {
  return parseFloat(val).toFixed(4);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showSkeleton() {
  if (detailTitle) detailTitle.innerHTML = `<div class="sk-block sk-title skeleton"></div>`;
  if (detailId)    detailId.innerHTML    = `<div class="sk-block sk-id skeleton"></div>`;
  if (leftCol) leftCol.innerHTML = `
    <div class="card">
      <div class="sk-block sk-img skeleton"></div>
    </div>
    <div class="card">
      <div class="sk-block sk-text skeleton"></div>
      <div class="sk-block sk-text skeleton" style="width:90%"></div>
      <div class="sk-block sk-text skeleton short"></div>
    </div>
  `;
  if (logTimeline) logTimeline.innerHTML = `
    <div class="sk-block skeleton" style="height:50px;border-radius:8px;margin-bottom:12px"></div>
    <div class="sk-block skeleton" style="height:50px;border-radius:8px;margin-bottom:12px"></div>
  `;
}

function showPageError(msg) {
  if (leftCol) leftCol.innerHTML = `
    <div class="card" style="text-align:center;color:var(--gray-400);padding:40px">
      <p>${escHtml(msg)}</p>
    </div>
  `;
}