/**
 * login.js — Login User
 * Endpoint: POST /api/auth/login
 *
 * Response Laravel (AuthController):
 * {
 *   success: true,
 *   message: "Login berhasil.",
 *   data: { id, username, email, role: "user" },
 *   token: "plainTextToken"
 * }
 */

import { authAPI }                        from '../shared/api.js'
import { redirectIfLoggedIn, saveSession } from '../shared/session.js'
import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading
} from '../shared/ui.js'
import { showToast } from '../shared/toast.js'

const REDIRECT_USER  = import.meta.env.VITE_REDIRECT_URL_USER  || ''
const REDIRECT_ADMIN = import.meta.env.VITE_REDIRECT_URL_ADMIN || ''

document.addEventListener('DOMContentLoaded', async () => {

  // Jika sudah login → redirect ke dashboard sesuai role
  await redirectIfLoggedIn()

  const form = document.querySelector('#loginForm')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearAllErrors()

    const emailEl   = form.querySelector('#email')
    const passEl    = form.querySelector('#password')
    const submitBtn = form.querySelector('.btn-auth')

    const email    = emailEl.value.trim()
    const password = passEl.value
    let valid = true

    if (!email) {
      showError(emailEl, 'Email tidak boleh kosong')
      valid = false
    } else if (!validateEmail(email)) {
      showError(emailEl, 'Format email tidak valid')
      valid = false
    }

    if (!password) {
      showError(passEl, 'Password tidak boleh kosong')
      valid = false
    }

    if (!valid) return

    setLoading(submitBtn, true)

    try {
      // POST /api/auth/login
      const res = await authAPI.login(email, password)

      // Token ada di res.token (top-level) sesuai AuthController
      const token = res.token
      if (!token) throw new Error('Token login tidak diterima dari server.')

      // Data user ada di res.data: { id, username, email, role }
      const user = res.data ?? {}
      const role = user.role || 'user'

      // Simpan token, role, username, email ke localStorage
      // saveSession sudah handle: user_name dari user.username, user_email dari user.email
      saveSession(token, role, user)

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

  // ── Google OAuth ────────────────────────────────────────────
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