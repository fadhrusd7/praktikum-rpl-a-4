import { authAPI }    from '../shared/api.js'
import { setLoading } from '../shared/ui.js'
import { showToast }  from '../shared/toast.js'

document.addEventListener('DOMContentLoaded', () => {

  // ── Tampilkan email asli dari sessionStorage ──────────────
  const email        = sessionStorage.getItem('resetEmail')
  const emailDisplay = document.querySelector('#emailDisplay')

  if (!email) {
    showToast('Sesi habis. Silakan ulangi dari halaman lupa password.', 'error')
    setTimeout(() => {
      window.location.href = 'forgot-password.html'
    }, 1800)
    return
  }

  if (emailDisplay) emailDisplay.textContent = email

  // ── OTP Input: auto-focus, paste, backspace ───────────────
  const inputs = document.querySelectorAll('.otp-input')

  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, '')
      e.target.value = value

      if (value) {
        e.target.classList.add('filled')
        if (index < inputs.length - 1) inputs[index + 1].focus()
      } else {
        e.target.classList.remove('filled')
      }
    })

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus()
        inputs[index - 1].value = ''
        inputs[index - 1].classList.remove('filled')
      }
    })

    input.addEventListener('paste', (e) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, 6)

      ;[...pasted].forEach((char, i) => {
        if (inputs[i]) {
          inputs[i].value = char
          inputs[i].classList.add('filled')
        }
      })

      const nextIdx = Math.min(pasted.length, inputs.length - 1)
      inputs[nextIdx].focus()
    })
  })

  // ── Countdown timer ───────────────────────────────────────
  let seconds     = 60
  const resendBtn = document.querySelector('#resendbtn')
  const countdown = document.querySelector('.countdown')

  function startTimer() {
    resendBtn.disabled = true
    const timer = setInterval(() => {
      seconds--
      if (countdown) countdown.textContent = `(${seconds}s)`
      if (seconds <= 0) {
        clearInterval(timer)
        resendBtn.disabled = false
        if (countdown) countdown.textContent = ''
      }
    }, 1000)
  }

  startTimer()

  // ── Resend OTP ────────────────────────────────────────────
  resendBtn.addEventListener('click', async () => {
    const currentEmail = sessionStorage.getItem('resetEmail')
    if (!currentEmail) {
      showToast('Sesi habis. Silakan ulangi dari halaman lupa password.', 'error')
      setTimeout(() => { window.location.href = 'forgot-password.html' }, 1500)
      return
    }

    setLoading(resendBtn, true)
    try {
      const res = await authAPI.forgotPassword(currentEmail)
      showToast(res.message || 'Kode OTP baru telah dikirim', 'success')
      seconds = 60
      if (countdown) countdown.textContent = `(${seconds}s)`
      startTimer()
    } catch (err) {
      console.error('[auth/verify-otp/resend]', err)
      showToast(err.message || 'Gagal mengirim ulang OTP', 'error')
    } finally {
      setLoading(resendBtn, false)
    }
  })

  // ── Submit: verifikasi OTP ────────────────────────────────
  const form = document.querySelector('#otpForm')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const otp = [...inputs].map(i => i.value).join('')

    if (otp.length < 6) {
      showToast('Masukkan 6 digit kode OTP', 'error')
      return
    }

    const currentEmail = sessionStorage.getItem('resetEmail')
    if (!currentEmail) {
      showToast('Sesi habis. Silakan ulangi dari halaman lupa password.', 'error')
      setTimeout(() => { window.location.href = 'forgot-password.html' }, 1500)
      return
    }

    const btn = form.querySelector('.btn-auth')
    setLoading(btn, true)

    try {
      // POST /api/auth/verify-otp — { email, otp }
      const res = await authAPI.verifyOtp(currentEmail, otp)

      showToast(res.message || 'Verifikasi berhasil!', 'success')

      // Simpan token reset sementara jika backend mengembalikannya
      if (res.token) sessionStorage.setItem('resetToken', res.token)

      setTimeout(() => {
        window.location.href = 'new-password.html'
      }, 1000)

    } catch (err) {
      console.error('[auth/verify-otp]', err)
      showToast(err.message || 'Kode OTP tidak valid atau sudah kedaluwarsa', 'error')
    } finally {
      setLoading(btn, false)
    }
  })
})