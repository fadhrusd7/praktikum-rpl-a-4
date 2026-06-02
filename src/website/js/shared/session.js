import { authAPI, adminAPI } from './api.js'

const REDIRECT_LOGIN       = '/src/website/auth/login.html'
const REDIRECT_ADMIN_LOGIN = '/src/website/admin/login.html'
const REDIRECT_USER        = import.meta.env.VITE_REDIRECT_URL_USER  || '/src/website/users/dashboard/map.html'
const REDIRECT_ADMIN       = import.meta.env.VITE_REDIRECT_URL_ADMIN || '/src/website/admin/dashboard/dashboard-admin.html'

// ─── Token helpers ────────────────────────────────────────────

/** Simpan token + role setelah login berhasil */
export function saveSession(token, role) {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_role',  role)
}

/** Hapus semua data sesi */
export function clearSession() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
}

/** Ambil token yang tersimpan (null jika belum login) */
export function getToken() {
  return localStorage.getItem('auth_token')
}

/** Ambil role yang tersimpan */
export function getRole() {
  return localStorage.getItem('auth_role')
}

// ─── Guard halaman yang butuh login ──────────────────────────

/**
 * Wajib login sebagai user biasa.
 * Tidak ada token → redirect ke login.
 * Ada token → validasi ke GET /api/auth/me.
 * @returns {object|null} data user dari server
 */
export async function requireAuth() {
  const token = getToken()
  if (!token) {
    window.location.replace(REDIRECT_LOGIN)
    return null
  }

  try {
    const res = await authAPI.me()
    return res.data
  } catch {
    clearSession()
    window.location.replace(REDIRECT_LOGIN)
    return null
  }
}

/**
 * Wajib login sebagai admin.
 * Validasi via GET /api/admin/me.
 * @returns {object|null} data admin dari server
 */
export async function requireAdminAuth() {
  const token = getToken()
  if (!token) {
    window.location.replace(REDIRECT_ADMIN_LOGIN)
    return null
  }

  try {
    const res = await adminAPI.me()
    return res.data
  } catch {
    clearSession()
    window.location.replace(REDIRECT_ADMIN_LOGIN)
    return null
  }
}

// ─── Guard halaman login / register ──────────────────────────

/**
 * Jika sudah login, langsung redirect ke dashboard yang sesuai.
 * Dipanggil di awal halaman login & register.
 */
export async function redirectIfLoggedIn() {
  const token = getToken()
  if (!token) return

  try {
    const res  = await authAPI.me()
    const role = res.data?.role || getRole() || 'user'
    window.location.replace(
      role === 'admin' ? REDIRECT_ADMIN : REDIRECT_USER
    )
  } catch {
    clearSession()
  }
}

// ─── Logout ───────────────────────────────────────────────────

/** Logout user → POST /api/auth/logout → redirect login */
export async function logoutUser() {
  try {
    await authAPI.logout()
  } catch {
    // Tetap bersihkan lokal meski server error
  } finally {
    clearSession()
    window.location.replace(REDIRECT_LOGIN)
  }
}

/** Logout admin → POST /api/admin/logout → redirect login admin */
export async function logoutAdmin() {
  try {
    await adminAPI.logout()
  } catch {
    // Tetap bersihkan lokal meski server error
  } finally {
    clearSession()
    window.location.replace(REDIRECT_ADMIN_LOGIN)
  }
}