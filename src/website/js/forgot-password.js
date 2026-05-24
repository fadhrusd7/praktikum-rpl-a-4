import {
  validateEmail,
  showError,
  clearAllErrors,
  setLoading
} from './ui.js'

import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', () => {

  const form = document.querySelector('#forgotForm')

  if (!form) return

  form.addEventListener('submit', async (e) => {

    e.preventDefault()

    clearAllErrors()

    const emailEl = form.querySelector('#email')
    const btn = form.querySelector('.btn-auth')

    let valid = true

    if (
      !emailEl.value.trim() ||
      !validateEmail(emailEl.value)
    ) {

      showError(
        emailEl,
        'Masukkan email yang valid'
      )

      valid = false
    }

    if (!valid) return

    setLoading(btn, true)

    await new Promise(r => setTimeout(r, 1500))

    setLoading(btn, false)

    showToast(
      'Kode OTP telah dikirim ke email Anda',
      'success'
    )

    setTimeout(() => {

      window.location.href =
        'verify-otp.html'

    }, 1200)

  })

})