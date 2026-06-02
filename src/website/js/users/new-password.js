/**
 * new-password.js
 * Simpan password baru via POST /api/auth/reset-password.
 * Membaca email dari sessionStorage dan token reset (jika ada).
 */

import { authAPI }    from '.../shared/api.js'
import { clearSession } from '.../shared/session.js'
import {
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles
} from '.../shared/ui.js'
import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', () => {

  initPasswordToggles()

  // Pastikan ada email reset di session
  const resetEmail = sessionStorage.getItem('resetEmail')
  const resetToken = sessionStorage.getItem('resetToken') // opsional, tergantung flow backend

  if (!resetEmail) {
    showToast('Sesi tidak valid. Silakan ulangi dari awal.', 'error')
    setTimeout(() => {
      window.location.href = 'forgot-password.html'
    }, 1800)
    return
  }

  const form = document.querySelector('#passwordForm')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearAllErrors()

    const passEl    = form.querySelector('#password')
    const confirmEl = form.querySelector('#confirmPassword')
    const btn       = form.querySelector('.btn-auth')
    let valid = true

    if (!passEl.value || passEl.value.length < 8) {
      showError(passEl, 'Password minimal 8 karakter')
      valid = false
    }

    if (!confirmEl.value) {
      showError(confirmEl, 'Konfirmasi password tidak boleh kosong')
      valid = false
    } else if (passEl.value !== confirmEl.value) {
      showError(confirmEl, 'Password tidak cocok')
      valid = false
    }

    if (!valid) return

    setLoading(btn, true)

    try {
      // POST /api/auth/reset-password
      // Payload disesuaikan dengan kontrak API backend Anda.
      // Jika backend butuh token (dari verify-otp response), sertakan.
      const payload = {
        email:                 resetEmail,
        password:              passEl.value,
        password_confirmation: confirmEl.value,
        ...(resetToken ? { token: resetToken } : {})
      }

      const res = await authAPI.resetPassword(payload)

      showToast(res.message || 'Password berhasil diperbarui', 'success')

      // Bersihkan data reset dari session
      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetToken')

      // Bersihkan auth token yang mungkin masih ada (keamanan)
      clearSession()

      // Tampilkan success state
      const formSection   = document.querySelector('#newPasswordForm')
      const successState  = document.querySelector('#successState')
      const backLink      = document.querySelector('#backLink')

      if (formSection)  formSection.style.display = 'none'
      if (backLink)     backLink.style.display = 'none'
      if (successState) {
        successState.style.display        = 'flex'
        successState.style.flexDirection  = 'column'
      }

      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 3000)

    } catch (err) {
      console.error('[new-password]', err)
      showToast(
        err.message || 'Gagal memperbarui password. Coba ulangi dari awal.',
        'error'
      )
    } finally {
      setLoading(btn, false)
    }
  })
})