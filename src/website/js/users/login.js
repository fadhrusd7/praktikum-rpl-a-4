import { authAPI }                        from '../shared/api.js'
import { redirectIfLoggedIn, saveSession } from '../shared/session.js'
import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles
} from '../shared/ui.js'
import { showToast } from '../shared/toast.js'

const REDIRECT_USER  = import.meta.env.VITE_REDIRECT_URL_USER  || '/users/dashboard/map-users.html'
const REDIRECT_ADMIN = import.meta.env.VITE_REDIRECT_URL_ADMIN || '/admin/dashboard/dashboard-admin.html'


document.addEventListener('DOMContentLoaded', async () => {

  await redirectIfLoggedIn()

  initPasswordToggles()

  const form = document.querySelector('#loginForm')
  if (!form) return

  // ── Submit: email + password ──────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearAllErrors()

    const emailEl    = form.querySelector('#email')
    const passwordEl = form.querySelector('#password')
    const submitBtn  = form.querySelector('.btn-auth')

    const email    = emailEl.value.trim()
    const password = passwordEl.value
    let valid = true

    if (!email) {
      showError(emailEl, 'Email tidak boleh kosong')
      valid = false
    } else if (!validateEmail(email)) {
      showError(emailEl, 'Format email tidak valid')
      valid = false
    }

    if (!password) {
      showError(passwordEl, 'Password tidak boleh kosong')
      valid = false
    }

    if (!valid) return

    setLoading(submitBtn, true)

    try {
      // POST /api/auth/login
      const res   = await authAPI.login(email, password)
      const token = res.token || res.access_token || res.data?.token
      const user  = res.data?.user || res.data || {}
      const role  = user.role || res.data?.role || res.role || 'user'

      if (!token) {
        throw new Error('Token login tidak diterima dari server.')
      }

      // Simpan token & role ke localStorage
      saveSession(token, role, user)

      try {
        const me = await authAPI.me()
        const u  = me.data
        const displayName = [u.nama_depan, u.nama_belakang]
          .filter(Boolean).join(' ').trim() || u.username || ''
        if (displayName) localStorage.setItem('user_name',  displayName)
        if (u.email)     localStorage.setItem('user_email', u.email)
      } catch {
        // token sudah tersimpan, profil bisa di-fetch ulang di dashboard
      }

      showToast(res.message || 'Login berhasil!', 'success')

      setTimeout(() => {
        window.location.replace(
          role === 'admin' ? REDIRECT_ADMIN : REDIRECT_USER
        )
      }, 1000)

    } catch (err) {
      console.error('[auth/login]', err)
      showToast(err.message || 'Login gagal. Periksa kembali kredensial Anda.', 'error')
    } finally {
      setLoading(submitBtn, false)
    }
  })

  // ── Google OAuth ──────────────────────────────────────────
  const googleBtn = document.querySelector('.btn-google')
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      setLoading(googleBtn, true)
      try {
        // GET /api/auth/google → { success: true, url: "https://accounts.google.com/..." }
        const res = await authAPI.googleRedirectUrl()
        if (!res.url) throw new Error('URL redirect Google tidak diterima.')
        window.location.href = res.url
      } catch (err) {
        console.error('[auth/login/google]', err)
        showToast(err.message || 'Gagal terhubung ke Google', 'error')
        setLoading(googleBtn, false)
      }
    })
  }
})
