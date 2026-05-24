import {
  showError,
  clearAllErrors,
  setLoading,
  initPasswordToggles
} from './ui.js'

import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', () => {

  initPasswordToggles()

  const form =
    document.querySelector('#passwordForm')

  if (!form) return

  form.addEventListener('submit', async (e) => {

    e.preventDefault()

    clearAllErrors()

    const passEl =
      form.querySelector('#password')

    const confirmEl =
      form.querySelector('#confirmPassword')

    const btn =
      form.querySelector('.btn-auth')

    let valid = true

    // ===== VALIDASI PASSWORD =====

    if (
      !passEl.value ||
      passEl.value.length < 8
    ) {

      showError(
        passEl,
        'Password minimal 8 karakter'
      )

      valid = false
    }

    // ===== VALIDASI KONFIRMASI =====

    if (!confirmEl.value) {

      showError(
        confirmEl,
        'Konfirmasi password tidak boleh kosong'
      )

      valid = false

    } else if (
      passEl.value !== confirmEl.value
    ) {

      showError(
        confirmEl,
        'Password tidak cocok'
      )

      valid = false
    }

    if (!valid) return

    // ===== LOADING =====

    setLoading(btn, true)

    await new Promise(
      r => setTimeout(r, 1500)
    )

    setLoading(btn, false)

    // ===== SUCCESS =====

    showToast(
      'Password berhasil diperbarui',
      'success'
    )

    document.querySelector(
      '#newPasswordForm'
    ).style.display = 'none'

    const successState =
      document.querySelector('#successState')

    successState.style.display = 'flex'
    successState.style.flexDirection = 'column'

    document.querySelector(
      '#backLink'
    ).style.display = 'none'

  })

})