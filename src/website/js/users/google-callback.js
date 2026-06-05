import { saveSession } from '../shared/session.js'
import { showToast }   from '../shared/toast.js'

const REDIRECT_USER  = import.meta.env.VITE_REDIRECT_URL_USER  || '/users/dashboard/map-users.html'
const REDIRECT_ADMIN = import.meta.env.VITE_REDIRECT_URL_ADMIN || '/admin/dashboard/dashboard-admin.html'
const REDIRECT_LOGIN = import.meta.env.VITE_REDIRECT_LOGIN || '/users/auth/login.html'

document.addEventListener('DOMContentLoaded', () => {

  // Ambil token & role dari query string URL
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
