/**
 * login-admin.js
 * Login khusus admin via POST /api/admin/login.
 * Halaman terpisah dari login user biasa.
 */

import { adminAPI }         from './api.js'
import { saveSession, getToken, getRole } from './session.js'
import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles
} from './ui.js'
import { showToast } from './toast.js'

const REDIRECT_ADMIN = import.meta.env.VITE_REDIRECT_URL_ADMIN || '/admin/dashboard/dashboard-admin.html'

document.addEventListener('DOMContentLoaded', async () => {

  // Jika sudah login sebagai admin, redirect langsung
  const token = getToken()
  const role  = getRole()
  if (token && role === 'admin') {
    window.location.replace(REDIRECT_ADMIN)
    return
  }

  initPasswordToggles()

  const form = document.querySelector('#loginAdminForm')
  if (!form) return

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
      // POST /api/admin/login
      const res = await adminAPI.login(email, password)

      // Simpan token & role 'admin' ke localStorage
      saveSession(res.token, res.data?.role || 'admin')

      showToast(res.message || 'Login admin berhasil!', 'success')

      setTimeout(() => {
        window.location.replace(REDIRECT_ADMIN)
      }, 1000)

    } catch (err) {
      console.error('[login-admin]', err)
      showToast(err.message || 'Login gagal. Periksa kembali kredensial Anda.', 'error')
    } finally {
      setLoading(submitBtn, false)
    }
  })
})