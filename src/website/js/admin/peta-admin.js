import { requireAdminAuth } from '../shared/session.js';

/* ============================================================
   peta-admin.js — Lestari Admin Panel | Peta
   Kelompok 4 RPL Kelas A
   ============================================================ */

'use strict';

/* ── Config ─────────────────────────────────────────────────── */
const BASE_URL    = import.meta.env.VITE_API_BASE_URL || '/api';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'report-foto';

/* ── Helpers ─────────────────────────────────────────────────── */

/** Ambil token admin dari localStorage */
function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('admin_token') || '';
}

/** GET dengan Bearer token */
async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Accept':        'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

import { formatTanggal, formatBulan, buildSupabaseFotoUrl, mapAdminUsername, normalizeStatus } from '../shared/utils.js';
import { initLeafletMap, createSimpleMarkerIcon, geocodeSearch } from '../shared/map-core.js';

/* ── DOM refs ───────────────────────────────────────────────── */
const elHeaderDate   = document.getElementById('headerDate');
const elHamburger    = document.getElementById('hamburgerBtn');
const elSidebar      = document.getElementById('sidebar');
const elOverlay      = document.getElementById('sidebarOverlay');
const elFilterBar    = document.getElementById('mapFilterBar');
const elInspectCard  = document.getElementById('inspectCard');
const elInspectClose = document.getElementById('inspectClose');
const elSearchInput  = document.getElementById('mapSearchInput');
const elSidebarName  = document.getElementById('sidebarUserName');
const elSidebarEmail = document.getElementById('sidebarUserEmail');

/* ── State ──────────────────────────────────────────────────── */
let map         = null;
let markerLayer = null;   // L.LayerGroup
let activeFilter = 'semua';

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAdminAuth();
  if (!admin) return;

  initHeader();
  initSidebar();
  initMap();
  initFilterTabs();
  initSearchInput();
  initAdminProfile();
  loadMarkers('semua');
});

/* ── Header date ─────────────────────────────────────────────── */
function initHeader() {
  elHeaderDate.textContent = formatBulan();
}

/* ── Sidebar (mobile toggle) ─────────────────────────────────── */
function initSidebar() {
  elHamburger?.addEventListener('click', () => {
    elSidebar.classList.toggle('open');
    elOverlay.classList.toggle('visible');
  });
  elOverlay?.addEventListener('click', () => {
    elSidebar.classList.remove('open');
    elOverlay.classList.remove('visible');
  });
}

/* ── Admin profile ───────────────────────────────────────────── */
async function initAdminProfile() {
  if (elSidebarEmail) elSidebarEmail.textContent = 'Lestari Admin Panel';

  try {
    const res = await apiGet('/admin/me');
    if (res.success && res.data) {
      if (elSidebarName)  elSidebarName.textContent  = mapAdminUsername(res.data.username);
    }
  } catch (_) {
    // Fail silently — sidebar default text tetap tampil
  }
}

/* ── Map init ────────────────────────────────────────────────── */
function initMap() {
  map = initLeafletMap('map', [-7.5613, 110.8574], 17, MAPTILER_KEY, true);
  markerLayer = L.layerGroup().addTo(map);
}

/* ── Filter tabs ─────────────────────────────────────────────── */
function initFilterTabs() {
  const tabs = elFilterBar.querySelectorAll('.map-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      closeInspectCard();
      loadMarkers(activeFilter);
    });
  });
}

/* ── Search input (geocode dengan Nominatim) ─────────────────── */
function initSearchInput() {
  let debounce;
  elSearchInput?.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const result = await geocodeSearch(elSearchInput.value.trim());
      if (result) {
        map.flyTo([result.lat, result.lon], 16, { duration: 1.2 });
      }
    }, 0);
  });
}

/* ── Load markers ────────────────────────────────────────────── */
async function loadMarkers(filter) {
  let endpoint = '/admin/reports';
  if (filter === 'tertunda')       endpoint += '?status=menunggu_validasi';

  try {
    const res = await apiGet(endpoint);
    const reports = extractReports(res);
    renderMarkers(reports, filter);
  } catch (err) {
    console.error('[PetaAdmin] Gagal memuat laporan:', err);
  }
}

/** Normalisasi berbagai format response list */
function extractReports(res) {
  if (!res) return [];
  if (Array.isArray(res))           return res;
  if (Array.isArray(res.data))      return res.data;
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

/* ── Render markers ──────────────────────────────────────────── */
function renderMarkers(reports, filter) {
  markerLayer.clearLayers();
  const bounds = [];
  const visibleReports = reports.filter(report => {
    const status = normalizeStatus(report.status);
    if (filter === 'tertunda') return status === 'menunggu_validasi';
    if (filter === 'terverifikasi') return status === 'terverifikasi';
    return status === 'menunggu_validasi' || status === 'terverifikasi';
  });

  visibleReports.forEach(report => {
    const lat = parseFloat(report.latitude);
    const lng = parseFloat(report.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const status     = normalizeStatus(report.status);
    const isVerified = status === 'terverifikasi' || status === 'selesai';
    const color      = isVerified ? 'green' : 'yellow';

    const icon = createSimpleMarkerIcon(color);

    const marker = L.marker([lat, lng], { icon });
    marker.on('click', () => openInspectCard(report, color));
    markerLayer.addLayer(marker);
    bounds.push([lat, lng]);
  });

  if (bounds.length === 1) {
    map.setView(bounds[0], 16);
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
  }
}

/* ── Inspect card ────────────────────────────────────────────── */
function openInspectCard(report, color) {
  const status = normalizeStatus(report.status || 'menunggu_validasi');

  // Badge
  const badge = document.getElementById('inspectBadge');
  badge.className = 'inspect-badge';
  if (status === 'menunggu_validasi') {
    badge.textContent = 'Tertunda';
    badge.classList.add('badge-tertunda');
  } else if (status === 'terverifikasi') {
    badge.textContent = 'Terverifikasi';
    badge.classList.add('badge-terverifikasi');
  } else if (status === 'selesai') {
    badge.textContent = 'Selesai';
    badge.classList.add('badge-selesai');
  } else {
    badge.textContent = status;
  }

  // Title & ID
  document.getElementById('inspectTitle').textContent = report.judul || '—';
  document.getElementById('inspectId').textContent    = report.nomor_laporan || report.kode_laporan || `LAP-${String(report.id).padStart(10,'0')}`;

  // Location
  document.getElementById('inspectLocationText').textContent = report.lokasi || '—';

  // Category
  const catEl = document.getElementById('inspectCategory');
  catEl.textContent = report.kategori || '—';
  // Warna dinamis berdasarkan kategori
  const catColors = {
    'Sampah':      ['#fce7f3','#9d174d'],
    'Polusi':      ['#fef3c7','#92400e'],
    'Banjir':      ['#eff6ff','#1e40af'],
    'Isu Air':     ['#ecfeff','#0e7490'],
    'Penebangan':  ['#f0fdf4','#166534'],
    'Lainnya':     ['#f3f4f6','#374151'],
  };
  const [bg, fg] = catColors[report.kategori] || catColors['Lainnya'];
  catEl.style.background = bg;
  catEl.style.color      = fg;

  // Photo
  const photoEl        = document.getElementById('inspectPhoto');
  const photoHolder    = document.getElementById('inspectPhotoPlaceholder');
  const firstPhoto     = Array.isArray(report.photos) ? report.photos[0] : null;
  const fotoPath       = report.foto || report.foto_url || firstPhoto?.url || firstPhoto?.public_url || firstPhoto?.file_url || firstPhoto?.file_path || null;
  const fotoSrc        = buildSupabaseFotoUrl(fotoPath, SUPABASE_URL, SUPABASE_BUCKET);

  if (fotoSrc) {
    photoEl.src     = fotoSrc;
    photoEl.onerror = () => {
      photoEl.classList.add('hidden');
      photoHolder.classList.remove('hidden');
    };
    photoEl.classList.remove('hidden');
    photoHolder.classList.add('hidden');
  } else {
    photoEl.classList.add('hidden');
    photoHolder.classList.remove('hidden');
  }

  // Reporter
  const reporter = report.user?.nama_lengkap || report.user?.name || '—';
  document.getElementById('inspectReporter').textContent = reporter;

  // Date
  const dateRaw = report.created_at || report.tanggal || null;
  const dateStr = formatTanggal(dateRaw);
  const dateEl  = document.getElementById('inspectDate');
  dateEl.innerHTML = dateStr.replace('\n', '<br/>');

  // Detail button
  const reportId = report.id;
  const detailBtn = document.getElementById('inspectDetailBtn');
  detailBtn.href = `../laporan/report-admin.html?id=${reportId}`;

  // Show card
  elInspectCard.classList.remove('hidden');
}

function closeInspectCard() {
  elInspectCard.classList.add('hidden');
}

elInspectClose?.addEventListener('click', closeInspectCard);