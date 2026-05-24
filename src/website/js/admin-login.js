// ===== ADMIN LOGIN - LESTARI =====
import { supabase } from '../../js/supabase.js'
import {
  showToast,
  showLoading,
  hideLoading,
  setFieldError,
  clearAllErrors,
  validateEmail,
  setupPasswordToggle
} from '../../js/ui.js'

import { redirectIfLoggedIn } from '../../js/session.js'

document.addEventListener('DOMContentLoaded', async () => {

  await redirectIfLoggedIn()

  // ===== PASSWORD TOGGLE =====
  const passwordInput = document.getElementById('password')
  const passwordBtn   = document.querySelector('.password-toggle')

  if (passwordInput && passwordBtn) {
    setupPasswordToggle(passwordInput, passwordBtn)
  }

  // ===== LOGIN FORM =====
  const form = document.getElementById('loginForm')

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()

    clearAllErrors(form)

    const emailInput    = document.getElementById('email')
    const passwordField = document.getElementById('password')

    const email    = emailInput.value.trim()
    const password = passwordField.value

    let valid = true

    // ===== VALIDASI EMAIL =====
    if (!validateEmail(email)) {
      setFieldError(emailInput, 'Format email tidak valid')
      valid = false
    }

    // ===== VALIDASI PASSWORD =====
    if (!password) {
      setFieldError(passwordField, 'Password wajib diisi')
      valid = false
    }

    if (!valid) return

    // ===== BUTTON LOGIN =====
    const submitBtn = form.querySelector('.btn-auth')

    submitBtn.disabled = true
    showLoading()

    try {

      // ===== LOGIN SUPABASE =====
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // ===== CEK ROLE ADMIN =====
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // ===== VALIDASI ADMIN =====
      if (profile?.role !== 'admin') {

        await supabase.auth.signOut()

        throw new Error('Akses ditolak. Akun ini bukan administrator.')
      }

      // ===== SUCCESS =====
      showToast('Login admin berhasil!', 'success')

      setTimeout(() => {
        window.location.replace('../../admin/dashboard/dashboard-admin.html')
      }, 1000)

    } catch (err) {

      console.error(err)

      showToast(
        err.message || 'Login gagal. Silakan coba lagi.',
        'error'
      )

    } finally {

      hideLoading()
      submitBtn.disabled = false

    }
  })
})