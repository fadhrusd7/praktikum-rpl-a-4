// ===== LOGIN =====
import { supabase } from './supabase.js'

import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles
} from './ui.js'

import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', () => {

  const form = document.querySelector('#loginForm')
  if (!form) return

  // ===== PASSWORD TOGGLE =====
  const passwordInput = document.querySelector('#password')
  const toggleBtn = document.querySelector('.password-toggle')

  if (passwordInput && toggleBtn) {
    toggleBtn.addEventListener('click', () => {

      const type =
        passwordInput.getAttribute('type') === 'password'
          ? 'text'
          : 'password'

      passwordInput.setAttribute('type', type)
    })
  }

  // ===== SUBMIT LOGIN =====
  form.addEventListener('submit', async (e) => {

    e.preventDefault()

    clearAllErrors()

    const emailEl = form.querySelector('#email')
    const passwordEl = form.querySelector('#password')
    const submitBtn = form.querySelector('.btn-auth')

    const email = emailEl.value.trim()
    const password = passwordEl.value

    let valid = true

    // ===== VALIDASI EMAIL =====
    if (!email) {
      showError(emailEl, 'Email tidak boleh kosong')
      valid = false

    } else if (!validateEmail(email)) {
      showError(emailEl, 'Format email tidak valid')
      valid = false
    }

    // ===== VALIDASI PASSWORD =====
    if (!password) {
      showError(passwordEl, 'Password tidak boleh kosong')
      valid = false
    }

    if (!valid) return

    // ===== BUTTON LOADING =====
    setLoading(submitBtn, true)

    try {

      // ===== LOGIN SUPABASE =====
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password
        })

      if (error) throw error

      // ===== SUCCESS =====
      showToast(
        'Login berhasil! Selamat datang kembali.',
        'success'
      )

      setTimeout(() => {
        window.location.href = 'index.html'
      }, 1500)

    } catch (err) {

      console.error(err)

      showToast(
        err.message || 'Login gagal',
        'error'
      )

    } finally {

      setLoading(submitBtn, false)
    }
  })
})