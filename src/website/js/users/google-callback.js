/**
 * google-callback.js
 * Menangani redirect balik dari Google OAuth setelah login berhasil.
 *
 * Dipasang di halaman: /pages/google-callback.html
 * URL callback yang didaftarkan ke backend: GET /api/auth/google/callback
 *
 * Backend akan redirect ke halaman ini dengan membawa token di query string
 * atau hash fragment. Sesuaikan pengambilan token dengan implementasi backend.
 *
 * Contoh URL redirect dari backend:
 *   /pages/google-callback.html?token=15|xxxxx&role=user
 */

import { saveSession } from './session.js'
import { showToast }   from './toast.js'

const REDIRECT_USER  = import.meta.env.VITE_REDIRECT_URL_USER  || '/users/dashboard/map.html'
const REDIRECT_ADMIN = import.meta.env.VITE_REDIRECT_URL_ADMIN || '/admin/dashboard/dashboard-admin.html'
const REDIRECT_LOGIN = '/pages/login.html'

document.addEventListener('DOMContentLoaded', () => {

  // Ambil token & role dari query string URL
  // Contoh: ?token=15|xxxxx&role=user
  const params = new URLSearchParams(window.location.search)
  const token  = params.get('token')
  const role   = params.get('role') || 'user'

  if (!token) {
    // Tidak ada token — login Google gagal atau URL tidak valid
    showToast('Login Google gagal. Silakan coba lagi.', 'error')
    setTimeout(() => {
      window.location.replace(REDIRECT_LOGIN)
    }, 2000)
    return
  }

  // Simpan token & role ke localStorage
  saveSession(token, role)

  showToast('Login Google berhasil!', 'success')

  // Redirect ke dashboard sesuai role
  setTimeout(() => {
    window.location.replace(
      role === 'admin' ? REDIRECT_ADMIN : REDIRECT_USER
    )
  }, 1000)
})