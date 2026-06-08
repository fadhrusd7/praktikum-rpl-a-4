// ── Config ────────────────────────────────────────────────────
const BASE_URL         = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';
const MAPTILER_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAPTILER_KEY) || '';

// ── DOM refs ──────────────────────────────────────────────────
const breadcrumbId = document.getElementById('breadcrumbId');
const detailId     = document.getElementById('detailId');
const detailTitle  = document.getElementById('detailTitle');
const statusBadge  = document.getElementById('statusBadge');
const leftCol      = document.getElementById('leftCol');
const logTimeline  = document.getElementById('logTimeline');
const mapCoordsEl  = document.getElementById('mapCoords');
const dateBadgeEl  = document.getElementById('dateBadgeEl');

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setDateBadge();
  loadUserInfo();
  bindHamburger();

  const id = getIdFromUrl();
  if (!id) {
    showPageError('ID laporan tidak ditemukan di URL.');
    return;
  }

  showSkeleton();

  try {
    const report = await fetchReport(id);
    if (!report) {
      showPageError('Data laporan tidak ditemukan.');
      return;
    }
    renderDetail(report);
  } catch (err) {
    console.error('[map-detail] fetchReport error:', err);
    showPageError(`Gagal memuat laporan: ${err.message}`);
  }
}

// ── Date badge ────────────────────────────────────────────────
function setDateBadge() {
  if (!dateBadgeEl) return;
  const now   = new Date();
  const label = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  dateBadgeEl.textContent = label;
}

// ── Auth helpers ──────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('auth_token');
}

function handleUnauthorized() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/users/auth/login.html';
}

// ── API: GET /api/reports/{id} ────────────────────────────────
async function fetchReport(id) {
  const token = getToken();

  if (!token) {
    handleUnauthorized();
    return null;
  }

  const res = await fetch(`${BASE_URL}/reports/${id}`, {
    headers: {
      'Accept':        'application/json',
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    return null;
  }

  if (res.status === 403) {
    throw new Error('Anda tidak memiliki akses ke laporan ini.');
  }

  if (res.status === 404) {
    throw new Error('Laporan tidak ditemukan.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Server error (HTTP ${res.status})`);
  }

  const json = await res.json();
  return json?.data ?? json ?? null;
}

// ── User info (dari cache + refresh background) ───────────────
function loadUserInfo() {
  const token       = getToken();
  const cachedName  = localStorage.getItem('user_name')  || 'Nama Pengguna';
  const cachedEmail = localStorage.getItem('user_email') || 'Email@email.com';
  const cachedAvatar = localStorage.getItem('user_avatar') || null; // Tambahan ambil dari cache

  setUserDOM(cachedName, cachedEmail, cachedAvatar);
  if (!token) return;

  fetch(`${BASE_URL}/user/profile`, {
    headers: {
      'Accept':        'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(r => r.json())
    .then(body => {
      if (!body.success) return;
      const u    = body.data;
      const name  = [u.nama_depan, u.nama_belakang].filter(Boolean).join(' ').trim()
                    || u.name || u.username || cachedName;
      const email = u.email || cachedEmail;
      const avatar = u.foto_profil_url || u.foto_profil || null; // Tambahan ambil dari API

      setUserDOM(name, email, avatar);
      localStorage.setItem('user_name',  name);
      localStorage.setItem('user_email', email);
      if (avatar) localStorage.setItem('user_avatar', avatar); // Simpan ke cache
    })
    .catch(() => { /* tetap pakai cache */ });
}

function setUserDOM(name, email, avatar) {
  const nameEl  = document.getElementById('sidebarUserName');
  const emailEl = document.getElementById('sidebarUserEmail') || document.getElementById('userEmailDisplay');
  const img     = document.getElementById('sidebar-avatar-img'); // Tangkep img sidebar

  if (nameEl)  nameEl.textContent  = name  || 'Nama Pengguna';
  if (emailEl) emailEl.textContent = email || 'Email@email.com';

  // Logic buat nampilin avatar benerannya
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

// ── Hamburger (mobile) ────────────────────────────────────────
function bindHamburger() {
  const btn     = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!btn) return;

  const close = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  };
  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
  overlay.addEventListener('click', close);
}

// ── URL param ─────────────────────────────────────────────────
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

// ─────────────────────────────────────────────────────────────
//  RENDER DETAIL
// ─────────────────────────────────────────────────────────────
function renderDetail(report) {
  const status   = normalizeStatus(report.status);
  const reportId = report.nomor_laporan ?? report.laporan_id ?? report.id ?? '—';
  const judul    = report.judul ?? report.title ?? '—';

  if (breadcrumbId) breadcrumbId.textContent = String(reportId);

  if (detailId)    detailId.textContent    = String(reportId);
  if (detailTitle) detailTitle.textContent = judul;

  if (statusBadge) {
    statusBadge.textContent = getStatusLabel(status);
    statusBadge.className   = `status-badge status-${status}`;
  }

  buildLeftCol(report, status);
  buildTimeline(report, status);
  initMap(report);
}

// ─────────────────────────────────────────────────────────────
//  LEFT COLUMN
// ─────────────────────────────────────────────────────────────
function buildLeftCol(report, status) {
  if (!leftCol) return;

  const desc     = escHtml(report.deskripsi ?? report.description ?? '—');
  const kategori = escHtml(report.kategori  ?? report.category    ?? '—');
  const waktuStr = fmtDateTime(report.created_at ?? report.waktu ?? null);
  const fotoUrl  = getPhotoUrl(report);

  const namaUser = escHtml(
    report.user?.nama
    ?? report.nama_pelapor
    ?? report.pelapor
    ?? '—'
  );

  const namaAdminRaw =
    report.diverifikasi_oleh           
    ?? report.admin?.name               
    ?? report.admin?.username
    ?? report.validator?.name           
    ?? report.validator?.username
    ?? report.verified_by
    ?? pickFromLogs(report.logs, ['terverifikasi', 'divalidasi'], 'admin')  
    ?? null;
  const namaAdmin = escHtml(namaAdminRaw ?? '—');

  const waktuVerifRaw =
    report.validated_at
    ?? report.waktu_verifikasi             
    ?? report.verified_at
    ?? pickFromLogs(report.logs, ['terverifikasi', 'divalidasi'], 'created_at');  
  const waktuVerif = fmtDateTime(waktuVerifRaw);

  const alasanPenolakan = escHtml(
    report.alasan_penolakan
    ?? report.rejection_reason
    ?? report.catatan
    ?? report.notes
    ?? pickFromLogs(report.logs, ['ditolak'], 'catatan')
    ?? 'Tidak ada keterangan.'
  );

  const rejectionHtml = status === 'ditolak'
    ? `<div class="rejection-box">
        <div class="rejection-header">
          <svg width="18" height="18" fill="none" stroke="#b91c1c" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
                 c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
          <span class="rejection-title">Alasan Penolakan</span>
        </div>
        <p class="rejection-text">${alasanPenolakan}</p>
       </div>`
    : '';

  const verifiedHtml = (status === 'terverifikasi' || status === 'selesai')
    ? `<div class="info-box verified-box">
        <div class="info-box-header">
          <svg width="16" height="16" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span class="info-box-title">Laporan Terverifikasi</span>
        </div>
        <p class="info-box-date">Terverifikasi pada ${waktuVerif}</p>
        <div class="info-box-verifier">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Diverifikasi oleh ${namaAdmin}
        </div>
       </div>`
    : '';

  leftCol.innerHTML = `
    ${rejectionHtml}

    <div class="card">
      <div class="card-title">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0
               0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5
               3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504
               1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0
               00-9-9z"/>
        </svg>
        Detail Laporan
      </div>

      <p class="detail-card-label">Deskripsi</p>
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
      ${fotoUrl
        ? `<img class="bukti-foto-img" src="${escHtml(fotoUrl)}" alt="Bukti foto laporan"
              onerror="this.style.display='none'">`
        : `<div class="foto-placeholder">
             <svg width="36" height="36" fill="none" stroke="currentColor"
               stroke-width="1.5" viewBox="0 0 24 24">
               <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159
                 m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25
                 19.5h19.5M3.75 3.75h16.5a1.5 1.5 0 011.5 1.5v13.5a1.5 1.5 0
                 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.25a1.5 1.5 0 011.5-1.5z"/>
             </svg>
             <span>Foto tidak tersedia</span>
           </div>`
      }
    </div>

    <div class="bottom-boxes">
      ${verifiedHtml}
      <div class="info-box">
        <p class="reporter-box-title">Dilaporkan oleh:</p>
        <div class="reporter-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${namaUser}
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
//  TIMELINE
// ─────────────────────────────────────────────────────────────
function buildTimeline(report, status) {
  if (!logTimeline) return;

  const rawLogs = report.logs ?? report.log_aktivitas ?? report.logAktivitas ?? null;

  const items = (Array.isArray(rawLogs) && rawLogs.length > 0)
    ? mapApiLogs(rawLogs)
    : buildDefaultTimeline(report, status);

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

function mapApiLogs(logs) {
  const labelMap = {
    menunggu_validasi: { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow'      },
    tertunda:          { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow'      },
    terverifikasi:     { label: 'Laporan terverifikasi',   dotClass: 'dot-green-light' },
    divalidasi:        { label: 'Laporan terverifikasi',   dotClass: 'dot-green-light' },
    selesai:           { label: 'Laporan selesai',         dotClass: 'dot-gray'        },
    ditolak:           { label: 'Laporan ditolak',         dotClass: 'dot-red'         },
    created:           { label: 'Laporan diterima sistem', dotClass: 'dot-green'       },
  };

  return logs.map(log => {
    const key    = (log.status ?? log.aksi ?? '').toLowerCase();
    const mapped = labelMap[key] ?? { label: key || '—', dotClass: 'dot-green' };
    return {
      label:    mapped.label,
      dotClass: mapped.dotClass,
      time:     fmtDateTime(log.created_at ?? log.timestamp ?? null),
    };
  });
}

function buildDefaultTimeline(report, status) {
  const sentAt     = report.created_at ?? report.waktu ?? null;
  const updatedAt  = report.updated_at ?? sentAt;

  const verifiedAt =
    report.waktu_verifikasi
    ?? report.validated_at
    ?? report.verified_at
    ?? pickFromLogs(report.logs, ['terverifikasi', 'divalidasi'], 'created_at')
    ?? updatedAt;

  const rejectedAt =
    report.rejected_at
    ?? pickFromLogs(report.logs, ['ditolak'], 'created_at')
    ?? updatedAt;

  const resolvedAt =
    report.resolved_at
    ?? report.completed_at
    ?? pickFromLogs(report.logs, ['selesai'], 'created_at')
    ?? updatedAt;

  const sentTime = fmtDateTime(sentAt);

  switch (status) {
    case 'tertunda':
      return [
        { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow', time: fmtDateTime(updatedAt) },
        { label: 'Laporan diterima sistem', dotClass: 'dot-green',  time: sentTime               },
      ];

    case 'terverifikasi':
      return [
        { label: 'Laporan terverifikasi',   dotClass: 'dot-green-light', time: fmtDateTime(verifiedAt) },
        { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow',      time: sentTime                 },
        { label: 'Laporan diterima sistem', dotClass: 'dot-green',       time: sentTime                 },
      ];

    case 'selesai':
      return [
        { label: 'Laporan selesai',         dotClass: 'dot-gray',        time: fmtDateTime(resolvedAt) },
        { label: 'Laporan terverifikasi',   dotClass: 'dot-green-light', time: fmtDateTime(verifiedAt) },
        { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow',      time: sentTime                },
        { label: 'Laporan diterima sistem', dotClass: 'dot-green',       time: sentTime                },
      ];

    case 'ditolak':
      return [
        { label: 'Laporan ditolak',         dotClass: 'dot-red',    time: fmtDateTime(rejectedAt) },
        { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow', time: sentTime                 },
        { label: 'Laporan diterima sistem', dotClass: 'dot-green',  time: sentTime                 },
      ];

    default:
      return [
        { label: 'Menunggu Verifikasi',     dotClass: 'dot-yellow', time: fmtDateTime(updatedAt) },
        { label: 'Laporan diterima sistem', dotClass: 'dot-green',  time: sentTime               },
      ];
  }
}

// ─────────────────────────────────────────────────────────────
//  MAP (Leaflet + MapTiler / OSM fallback)
// ─────────────────────────────────────────────────────────────
function initMap(report) {
  const lat = parseFloat(report.latitude);
  const lng = parseFloat(report.longitude);

  const mapEl = document.getElementById('detail-map');
  if (!mapEl) return;

  if (isNaN(lat) || isNaN(lng)) {
    mapEl.style.cssText = 'display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;';
    mapEl.textContent   = 'Koordinat tidak tersedia';
    return;
  }

  const map = L.map('detail-map', {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  });

  if (MAPTILER_API_KEY) {
    L.tileLayer(
      `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
      { attribution: '© MapTiler © OpenStreetMap', maxZoom: 20 }
    ).addTo(map);
  } else {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
  }

  map.setView([lat, lng], 16);

  const redIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z"
        fill="#ef4444"/>
      <circle cx="14" cy="14" r="5" fill="#fff"/>
    </svg>`,
    className:   '',
    iconSize:    [28, 36],
    iconAnchor:  [14, 36],
    popupAnchor: [0, -36],
  });

  L.marker([lat, lng], { icon: redIcon }).addTo(map);

  if (mapCoordsEl) {
    mapCoordsEl.textContent = `${fmtCoord(lat)}° S, ${fmtCoord(lng)}° E`;
  }
}

// ─────────────────────────────────────────────────────────────
//  SKELETON / ERROR
// ─────────────────────────────────────────────────────────────
function showSkeleton() {
  if (detailTitle) detailTitle.innerHTML = '<div class="sk-block sk-title skeleton"></div>';
  if (detailId)    detailId.innerHTML    = '<div class="sk-block sk-id skeleton"></div>';
  if (statusBadge) statusBadge.className = 'status-badge';

  if (leftCol) leftCol.innerHTML = `
    <div class="card">
      <div class="sk-block sk-img skeleton"></div>
      <div class="sk-block sk-text skeleton" style="margin-top:16px"></div>
      <div class="sk-block sk-text skeleton"></div>
      <div class="sk-block sk-text short skeleton"></div>
    </div>
    <div class="bottom-boxes">
      <div class="sk-block sk-box skeleton"></div>
      <div class="sk-block sk-box skeleton"></div>
    </div>
  `;

  if (logTimeline) logTimeline.innerHTML = `
    <div class="sk-block skeleton" style="height:46px;border-radius:8px;margin-bottom:14px"></div>
    <div class="sk-block skeleton" style="height:46px;border-radius:8px;margin-bottom:14px"></div>
    <div class="sk-block skeleton" style="height:46px;border-radius:8px"></div>
  `;
}

function showPageError(msg) {
  if (leftCol) leftCol.innerHTML = `
    <div class="card" style="text-align:center;color:var(--gray-400);padding:48px 20px">
      <p style="font-size:14px;line-height:1.6">${escHtml(msg)}</p>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

function pickFromLogs(logs, statuses, field) {
  if (!Array.isArray(logs)) return null;
  const norm = statuses.map(s => s.toLowerCase());

  const entry = logs.find(log => {
    const s = (log.status ?? log.aksi ?? '').toLowerCase();
    return norm.includes(s);
  });
  if (!entry) return null;

  if (field === 'user') {
    return entry.user?.name ?? entry.user?.username ?? entry.admin?.name ?? entry.admin?.username ?? null;
  }
  if (field === 'admin') {
    return entry.admin?.name ?? entry.admin?.username ?? entry.user?.name ?? entry.user?.username ?? null;
  }
  return entry[field] ?? null;
}

function normalizeStatus(s) {
  const map = {
    menunggu_validasi: 'tertunda',
    pending:           'tertunda',
    tertunda:          'tertunda',
    terverifikasi:     'terverifikasi',
    divalidasi:        'terverifikasi',
    diproses:          'terverifikasi',
    verified:          'terverifikasi',
    selesai:           'selesai',
    done:              'selesai',
    completed:         'selesai',
    ditolak:           'ditolak',
    rejected:          'ditolak',
  };
  return map[(s ?? '').toLowerCase()] ?? 'tertunda';
}

function getStatusLabel(s) {
  return { tertunda: 'Tertunda', terverifikasi: 'Terverifikasi', selesai: 'Selesai', ditolak: 'Ditolak' }[s] ?? s;
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  const tgl = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${tgl}, ${jam} WIB`;
}

function fmtCoord(val) { return parseFloat(val).toFixed(4); }

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function getPhotoUrl(report) {
  if (report.foto_url)  return report.foto_url;
  if (report.photo_url) return report.photo_url;
  if (report.image_url) return report.image_url;

  if (Array.isArray(report.photos) && report.photos.length > 0) {
    const p = report.photos[0];
    if (p.url)        return p.url;
    if (p.public_url) return p.public_url;
    if (p.file_url)   return p.file_url;
    if (p.file_path)  return p.file_path; 
  }

  return '';
}