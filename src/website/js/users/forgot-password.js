import { authAPI }                              from '../shared/api.js'
import { validateEmail, showError, clearAllErrors, setLoading } from '../shared/ui.js'
import { showToast }                            from '../shared/toast.js'

document.addEventListener('DOMContentLoaded', () => {

  const form = document.querySelector('#forgotForm')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearAllErrors()

    const emailEl = form.querySelector('#email')
    const btn     = form.querySelector('.btn-auth')
    const email   = emailEl.value.trim()
    let valid = true

    if (!email || !validateEmail(email)) {
      showError(emailEl, 'Masukkan email yang valid')
      valid = false
    }

    if (!valid) return

    setLoading(btn, true)

    try {
      // POST /api/auth/forgot-password
      const res = await authAPI.forgotPassword(email)

      // Simpan email agar bisa dibaca di halaman verify-otp
      sessionStorage.setItem('resetEmail', email)

      showToast(
        res.message || 'Jika email terdaftar, kode OTP telah dikirim.',
        'success'
      )

      setTimeout(() => {
        window.location.href = 'verify-otp.html'
      }, 1200)

    } catch (err) {
      console.error('[auth/forgot-password]', err)
      showToast(err.message || 'Gagal mengirim kode OTP', 'error')
    } finally {
      setLoading(btn, false)
    }
  })
})