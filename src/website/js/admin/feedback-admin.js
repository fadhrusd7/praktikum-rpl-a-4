/**
 * feedback-admin.js
 * Lestari Admin Panel — Halaman "Lihat Feedback"
 *
 * Alur:
 *  1. Ambil token dari localStorage (key: 'auth_token')
 *  2. GET /api/admin/feedbacks  → { data: [...], meta: { total, avg_rating } }
 *  3. Render summary cards + tabel
 *
 * Format respons yang diharapkan dari backend:
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "user": { "name": "Fadhil Rusadi" },
 *       "rating": 4,
 *       "komentar": "Aplikasi ini sangat membantu ya ^_^",
 *       "created_at": "2026-05-06T10:00:00.000000Z"
 *     },
 *     ...
 *   ],
 *   "meta": {
 *     "total": 1248,
 *     "avg_rating": 4.8
 *   }
 * }
 *
 * Catatan: Jika backend mengembalikan format berbeda (mis. Laravel Resource),
 * sesuaikan fungsi normalizeResponse() di bawah.
 */

/* ─── CONFIG ──────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const REDIRECT_ADMIN_LOGIN = import.meta.env.VITE_REDIRECT_ADMIN_LOGIN || '/admin/login/login-admin.html';
const FEEDBACK_ENDPOINT = `${API_BASE}/admin/feedbacks`;
const FEEDBACK_STATS_ENDPOINT = `${API_BASE}/admin/feedbacks/stats`;

/* ─── DOM REFS ────────────────────────────────────────────── */
const statTotal     = document.getElementById('stat-total');
const statAvgRating = document.getElementById('stat-avg-rating');
const tbody         = document.getElementById('feedback-tbody');
const skeletonRow   = document.getElementById('skeleton-row');
const emptyState    = document.getElementById('empty-state');
const sidebarName   = document.getElementById('sidebar-admin-name');

/* ─── HELPERS ─────────────────────────────────────────────── */

/** Ambil token autentikasi yang tersimpan */
function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
}

/** Ambil nama admin yang tersimpan */
function getAdminName() {
  return localStorage.getItem('admin_name') || sessionStorage.getItem('admin_name') || 'Administrator – 1';
}

/** Format tanggal ke "06 Mei 2026" */
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('id-ID', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });
}

/** Buat SVG bintang (filled = hijau, empty = abu) */
function buildStars(rating) {
  const max = 5;
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const cls = i <= rating ? 'star filled' : 'star';
    stars.push(
      `<svg class="${cls}" viewBox="0 0 24 24" fill="${i <= rating ? 'currentColor' : 'none'}"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02
                          12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`
    );
  }
  return `<span class="stars" title="${rating}/5">${stars.join('')}</span>`;
}

/** Ambil 1-2 inisial dari nama lengkap */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Normalisasi respons dari backend.
 * Sesuaikan di sini jika struktur API berbeda.
 */
function normalizeResponse(json) {
  const pickAvgRating = (...sources) => {
    for (const source of sources) {
      const value =
        source?.avg_rating ??
        source?.average_rating ??
        source?.avgRating ??
        source?.rating_average;

      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return null;
  };

  const calculateAvgRating = items => {
    if (!items.length) return null;
    return items.reduce((s, f) => s + (Number(f.rating) || 0), 0) / items.length;
  };

  // Coba format standar { data, meta }
  if (json?.data && json?.meta) {
    const items = Array.isArray(json.data) ? json.data : (json.data.data ?? []);
    const avgRating = pickAvgRating(json.meta, json.data) ?? calculateAvgRating(items);
    return {
      items,
      total:     json.meta.total ?? json.data.total ?? items.length,
      avgRating,
    };
  }

  // Coba format Laravel Resource Collection { data: [...] }
  if (Array.isArray(json?.data)) {
    const items = json.data;
    const avg   = pickAvgRating(json, json.meta) ?? calculateAvgRating(items);
    return { items, total: items.length, avgRating: avg };
  }

  // Coba format statistik { data: { total_feedbacks, average_rating, ... } }
  if (json?.data && typeof json.data === 'object') {
    const items = Array.isArray(json.data.feedbacks) ? json.data.feedbacks : [];
    return {
      items,
      total: json.data.total_feedbacks ?? json.data.total ?? items.length,
      avgRating: pickAvgRating(json.data, json),
    };
  }

  // Coba format array langsung
  if (Array.isArray(json)) {
    const items = json;
    const avg   = calculateAvgRating(items);
    return { items, total: items.length, avgRating: avg };
  }

  return { items: [], total: 0, avgRating: null };
}

/* ─── RENDER ──────────────────────────────────────────────── */

/** Update summary cards */
function renderSummary(total, avgRating) {
  if (statTotal) {
    statTotal.textContent = total.toLocaleString('id-ID');
  }

  if (statAvgRating) {
    const avg = avgRating !== null ? Number(avgRating).toFixed(1) : '—';
    statAvgRating.innerHTML = `${avg}<span class="rating-scale">/5.0</span>`;
  }
}

/** Render satu baris tabel */
function buildRow(feedback) {
  const userName = feedback.user?.name ?? feedback.nama ?? 'Pengguna';
  const initials = getInitials(userName);
  const rating   = Number(feedback.rating) || 0;
  const comment  = feedback.komentar ?? feedback.comment ?? '—';
  const date     = formatDate(feedback.created_at);

  return `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-initials">${initials}</div>
          <span class="user-full-name">${escapeHtml(userName)}</span>
        </div>
      </td>
      <td>${buildStars(rating)}</td>
      <td class="comment-cell">${escapeHtml(comment)}</td>
      <td class="date-cell">${date}</td>
    </tr>
  `;
}

/** Render seluruh tabel */
function renderTable(items) {
  // Hapus skeleton
  if (skeletonRow) skeletonRow.remove();

  if (!items.length) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  tbody.innerHTML = items.map(buildRow).join('');
}

/** Tampilkan pesan error di tabel */
function renderError(message) {
  if (skeletonRow) skeletonRow.remove();
  tbody.innerHTML = `
    <tr>
      <td colspan="4">
        <div class="loading-state" style="color: #ef4444; gap: 8px;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>${escapeHtml(message)}</span>
        </div>
      </td>
    </tr>
  `;
}

/** Escape HTML untuk mencegah XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── FETCH DATA ──────────────────────────────────────────── */

async function loadFeedbacks() {
  const token = getAuthToken();
  const headers = {
    'Accept':        'application/json',
    'Content-Type':  'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(FEEDBACK_ENDPOINT, {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    });

    // Sesi habis / belum login
    if (res.status === 401) {
      window.location.href = REDIRECT_ADMIN_LOGIN;
      return;
    }

    // Forbidden
    if (res.status === 403) {
      renderError('Anda tidak memiliki akses untuk melihat feedback.');
      return;
    }

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message ?? `HTTP ${res.status}`);
    }

    const json = await res.json();
    const statsJson = await fetch(FEEDBACK_STATS_ENDPOINT, {
      method: 'GET',
      headers,
      credentials: 'same-origin',
    })
      .then(statsRes => (statsRes.ok ? statsRes.json() : null))
      .catch(() => null);

    const { items, total, avgRating } = normalizeResponse(json);
    const stats = normalizeResponse(statsJson);

    renderSummary(stats.total || total, stats.avgRating ?? avgRating);
    renderTable(items);

  } catch (err) {
    console.error('[feedback-admin] Gagal memuat data:', err);
    renderError('Gagal memuat feedback. Periksa koneksi atau coba lagi.');

    // Tetap tampilkan nilai kosong di summary
    if (statTotal)     statTotal.textContent = '—';
    if (statAvgRating) statAvgRating.innerHTML = '—<span class="rating-scale">/5.0</span>';
  }
}

/* ─── SIDEBAR MOBILE ──────────────────────────────────────── */

function initSidebar() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  if (!hamburger || !sidebar || !overlay) return;

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  });
}

/* ─── INIT ────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Tampilkan nama admin dari storage
  if (sidebarName) {
    sidebarName.textContent = getAdminName();
  }

  initSidebar();
  loadFeedbacks();
});
