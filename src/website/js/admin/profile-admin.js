/**
 * profile-admin.js
 * Halaman Profil & Pengaturan – Lestari Admin Panel
 *
 * Imports dari shared:
 *   - requireAdminAuth()   → session.js  (proteksi login admin)
 *   - initSidebarNavigation() → ui.js    (klik navigasi sidebar)
 *   - adminAPI             → api.js      (fungsi API admin)
 *   - showToast()          → toast.js    (notifikasi)
 */

import { logoutAdmin, requireAdminAuth } from '../shared/session.js';
import { initSidebarNavigation } from '../shared/ui.js';
import { adminAPI } from '../shared/api.js';
import { showToast } from '../shared/toast.js';

// ─── Proteksi halaman ────────────────────────────────────────
requireAdminAuth();

// ─── Init sidebar ────────────────────────────────────────────
initSidebarNavigation('profil');

// ─── DOM References ──────────────────────────────────────────
const adminDisplayNameEl = document.getElementById('admin-display-name');
const sidebarAdminNameEl  = document.getElementById('sidebar-admin-name');
const sidebarAdminEmailEl = document.getElementById('sidebarUserEmail');
const statVerifiedEl      = document.getElementById('stat-verified');
const statActiveYearsEl   = document.getElementById('stat-active-years');
const btnLogout           = document.getElementById('btn-logout');

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Hitung lama aktif dalam tahun berdasarkan created_at.
 * Referensi tahun saat ini: 2026.
 * @param {string} createdAt - ISO date string, contoh: "2026-05-30T18:03:40.000000Z"
 * @returns {string} - mis. "2 tahun", "1 tahun", "< 1 tahun"
 */
function hitungTahunAktif(createdAt) {
  const CURRENT_YEAR = 2026;

  if (!createdAt) return '—';

  const tahunDaftar = new Date(createdAt).getFullYear();
  const selisih = CURRENT_YEAR - tahunDaftar;

  if (selisih <= 0) {
    return '< 1 tahun';
  } else if (selisih === 1) {
    return '1 tahun';
  } else {
    return `${selisih} tahun`;
  }
}

/**
 * Mapping username DB → label display admin.
 * "admin"  → "Administrator - 1"
 * "admin2" → "Administrator - 2"
 * lainnya  → kapitalisasi huruf pertama
 * @param {string} username
 * @returns {string}
 */
function mapAdminUsername(username) {
  if (!username) return 'Administrator';
  const match = String(username).match(/^admin(\d*)$/i);
  if (match) {
    const num = match[1] ? parseInt(match[1], 10) : 1;
    return `Administrator - ${num}`;
  }
  return username.charAt(0).toUpperCase() + username.slice(1);
}

/**
 * Render nama admin ke elemen-elemen yang membutuhkannya.
 * @param {string} username
 */
function renderAdminName(username) {
  const name = mapAdminUsername(username);
  if (adminDisplayNameEl) adminDisplayNameEl.textContent = name;
  if (sidebarAdminNameEl)  sidebarAdminNameEl.textContent  = name;
  if (sidebarAdminEmailEl) sidebarAdminEmailEl.textContent = 'Lestari Admin Panel';
}

// ─── Fetch: Data Diri Admin (Endpoint 8: GET /api/admin/me) ──
async function fetchAdminProfile() {
  try {
    const response = await adminAPI.me();
    const data = response?.data;

    if (data) {
      // Render nama
      renderAdminName(data.username);

      // Hitung & render tahun aktif
      if (statActiveYearsEl) {
        statActiveYearsEl.textContent = hitungTahunAktif(data.created_at);
      }
    }
  } catch (error) {
    console.error('[ProfileAdmin] Gagal mengambil data profil admin:', error);
    if (adminDisplayNameEl) adminDisplayNameEl.textContent = 'Administrator';
    if (statActiveYearsEl)  statActiveYearsEl.textContent  = '—';
  }
}

// ─── Fetch: Statistik Profil (Endpoint 14: GET /api/admin/profile-stats) ──
async function fetchProfileStats() {
  try {
    const response = await adminAPI.getProfileStats();
    const data = response?.data;

    if (data && statVerifiedEl) {
      // Ambil jumlah laporan terverifikasi; sesuaikan key dengan response aktual API
      const count =
        data.laporan_diverifikasi ??
        data.verified_reports ??
        data.total_verified ??
        0;

      statVerifiedEl.textContent = count;
    }
  } catch (error) {
    console.error('[ProfileAdmin] Gagal mengambil statistik profil:', error);
    if (statVerifiedEl) statVerifiedEl.textContent = '—';
  }
}


// ─── Event Listeners ─────────────────────────────────────────
async function handleLogout() {
  btnLogout.disabled = true;
  btnLogout.textContent = 'Keluar...';

  try {
    await logoutAdmin();
  } catch (error) {
    console.warn('[ProfileAdmin] Logout gagal:', error);
    showToast('Logout gagal. Coba lagi.', 'error');
    btnLogout.disabled = false;
    btnLogout.textContent = 'Keluar Sesi';
  }
}

if (btnLogout) {
  btnLogout.addEventListener('click', handleLogout);
}

// ─── Init on DOMContentLoaded ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (sidebarAdminEmailEl) sidebarAdminEmailEl.textContent = 'Lestari Admin Panel';

  // ── Sidebar & hamburger (mobile) ────────────────────────────────────
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const hamburger= document.getElementById('hamburgerBtn');

  hamburger?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('visible');
  });

  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('visible');
  });

  // Jalankan kedua fetch secara paralel
  Promise.all([
    fetchAdminProfile(),
    fetchProfileStats(),
  ]);
});