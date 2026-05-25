// ===== REGISTER =====
import { supabase } from './supabase.js'

import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles,
  initPasswordStrength
} from './ui.js'

import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', () => {

  const form = document.querySelector('#registerForm')
  if (!form) return

  // ===== PASSWORD TOGGLE =====
  const toggleButtons = document.querySelectorAll('.password-toggle')

  toggleButtons.forEach((btn) => {

    btn.addEventListener('click', () => {

      const input = btn.previousElementSibling

      if (!input) return

      const type =
        input.getAttribute('type') === 'password'
          ? 'text'
          : 'password'

      input.setAttribute('type', type)
    })
  })

  // ===== SUBMIT REGISTER =====
  form.addEventListener('submit', async (e) => {

    e.preventDefault()

    clearAllErrors()

    const nameEl = form.querySelector('#name')
    const emailEl = form.querySelector('#email')
    const passwordEl = form.querySelector('#password')
    const confirmPasswordEl =
      form.querySelector('#confirmPassword')

    const submitBtn = form.querySelector('.btn-auth')

    const name = nameEl.value.trim()
    const email = emailEl.value.trim()
    const password = passwordEl.value
    const confirmPassword = confirmPasswordEl.value

    let valid = true

    // ===== VALIDASI NAMA =====
    if (!name) {

      showError(nameEl, 'Nama tidak boleh kosong')
      valid = false

    } else if (name.length < 2) {

      showError(nameEl, 'Nama minimal 2 karakter')
      valid = false
    }

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

    } else if (password.length < 8) {

      showError(passwordEl, 'Password minimal 8 karakter')
      valid = false
    }

    // ===== VALIDASI CONFIRM PASSWORD =====
    if (!confirmPassword) {

      showError(
        confirmPasswordEl,
        'Konfirmasi password tidak boleh kosong'
      )

      valid = false

    } else if (password !== confirmPassword) {

      showError(
        confirmPasswordEl,
        'Password tidak cocok'
      )

      valid = false
    }

    if (!valid) return

    // ===== BUTTON LOADING =====
    setLoading(submitBtn, true)

    try {

      // ===== REGISTER SUPABASE =====
      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        })

      if (error) throw error

      // ===== INSERT PROFILE =====
      if (data.user) {

        const { error: profileError } =
          await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: name,
                email: email,
                role: 'user'
              }
            ])

        if (profileError) {
          console.error(profileError)
        }
      }

      // ===== SUCCESS =====
      showToast(
        'Akun berhasil dibuat! Silakan login.',
        'success'
      )

      setTimeout(() => {
        window.location.href = 'login.html'
      }, 1500)

    } catch (err) {

      console.error(err)

      showToast(
        err.message || 'Register gagal',
        'error'
      )

    } finally {

      setLoading(submitBtn, false)
    }
  })
  // ===== LOGIN WITH GOOGLE =====
  const googleBtn = document.querySelector('.btn-google')
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            // Mengarahkan user kembali ke halaman utama setelah sukses register
            redirectTo: window.location.origin + '/src/website/index.html' 
          }
        })

        if (error) throw error

      } catch (err) {
        console.error(err)
        showToast(
          err.message || 'Gagal terhubung ke Google',
          'error'
        )
      }
    })
  }
})