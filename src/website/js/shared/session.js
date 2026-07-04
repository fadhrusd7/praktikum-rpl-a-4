import { authAPI, adminAPI } from './api.js'

const REDIRECT_LOGIN       = import.meta.env.VITE_REDIRECT_LOGIN || ''
const REDIRECT_ADMIN_LOGIN = import.meta.env.VITE_REDIRECT_ADMIN_LOGIN || ''
const REDIRECT_USER        = import.meta.env.VITE_REDIRECT_URL_USER || ''
const REDIRECT_ADMIN       = import.meta.env.VITE_REDIRECT_URL_ADMIN || ''

// ─── Token helpers ────────────────────────────────────────────

/** * Simpan token + role setelah login berhasil.
 * Aman untuk User (simpan nama/email) & Admin (mencegah bentrok).
 */
export function saveSession(token, role, user = {}) {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('auth_role',  role)
  
  // Fitur User: Simpan nama sementara dari response login/register
  const displayName = user.nama_lengkap || user.username || ''
  if (displayName)  localStorage.setItem('user_name',  displayName)
  if (user.email)   localStorage.setItem('user_email', user.email)

  // Fitur Admin: Jika yang login admin, bersihkan sisa token admin lama di storage agar tidak conflict
  if (role === 'admin') {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_user')
  }
}

/** Hapus semua data sesi (Sapu bersih data User & Admin saat logout) */
export function clearSession() {
  // Hapus data utama
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
  
  // Hapus data profile milik User
  localStorage.removeItem('user_name')
  localStorage.removeItem('user_email')
  
  // Hapus data session milik Admin
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  sessionStorage.removeItem('admin_token')
  sessionStorage.removeItem('admin_user')
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