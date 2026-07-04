import { authAPI }            from '../shared/api.js'
import { redirectIfLoggedIn } from '../shared/session.js'
import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles,
  initPasswordStrength
} from '../shared/ui.js'
import { showToast } from '../shared/toast.js'

document.addEventListener('DOMContentLoaded', async () => {

  await redirectIfLoggedIn()

  initPasswordToggles()
  initPasswordStrength()

  const form = document.querySelector('#registerForm')
  if (!form) return

  // ── Submit: register ────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    clearAllErrors()

    const nameEl            = form.querySelector('#name')
    const emailEl           = form.querySelector('#email')
    const passwordEl        = form.querySelector('#password')
    const confirmPasswordEl = form.querySelector('#confirmPassword')
    const submitBtn         = form.querySelector('.btn-auth')

    const name            = nameEl.value.trim()
    const email           = emailEl.value.trim()
    const password        = passwordEl.value
    const confirmPassword = confirmPasswordEl.value
    let valid = true

    // Validasi nama
    if (!name) {
      showError(nameEl, 'Nama tidak boleh kosong')
      valid = false
    } else if (name.length < 3) {
      showError(nameEl, 'Nama minimal 3 karakter')
      valid = false
    }

    // Validasi email
    if (!email) {
      showError(emailEl, 'Email tidak boleh kosong')
      valid = false
    } else if (!validateEmail(email)) {
      showError(emailEl, 'Format email tidak valid')
      valid = false
    }

    // Validasi password
    if (!password) {
      showError(passwordEl, 'Password tidak boleh kosong')
      valid = false
    } else if (password.length < 8) {
      showError(passwordEl, 'Password minimal 8 karakter')
      valid = false
    } else if (!/\d/.test(password)) {
      showError(passwordEl, 'Password harus mengandung minimal satu angka')
      valid = false
    }

    // Validasi konfirmasi password
    if (!confirmPassword) {
      showError(confirmPasswordEl, 'Konfirmasi password tidak boleh kosong')
      valid = false
    } else if (password !== confirmPassword) {
      showError(confirmPasswordEl, 'Password tidak cocok')
      valid = false
    }


    if (!valid) return

    setLoading(submitBtn, true)

    try {
      // POST /api/auth/register
      const res = await authAPI.register({
        nama_lengkap: name,
        email,
        password,
        password_confirmation: confirmPassword
      })

      sessionStorage.setItem('otpPurpose', 'register')
      sessionStorage.setItem('registerEmail', email)

      showToast(res.message || 'Kode OTP telah dikirim ke email Anda.', 'success')

      setTimeout(() => {
        window.location.href = 'verify-otp.html'
      }, 1500)

    } catch (err) {
      console.error('[auth/register]', err)
      showToast(err.message || 'Register gagal. Silakan coba lagi.', 'error')
    } finally {
      setLoading(submitBtn, false)
    }
  })

  // ── Google OAuth ────────────────────────────────────────────────────
  const googleBtn = document.querySelector('.btn-google')
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      setLoading(googleBtn, true)
      try {
        const res = await authAPI.googleRedirectUrl()
        if (!res.url) throw new Error('URL redirect Google tidak diterima.')
        window.location.href = res.url
      } catch (err) {
        console.error('[auth/register/google]', err)
        showToast(err.message || 'Gagal terhubung ke Google', 'error')
        setLoading(googleBtn, false)
      }
    })
  }
})