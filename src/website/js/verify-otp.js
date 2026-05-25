import { setLoading } from './ui.js'
import { showToast } from './toast.js'

document.addEventListener('DOMContentLoaded', () => {

  const inputs =
    document.querySelectorAll('.otp-input')

  // ===== OTP INPUT =====

  inputs.forEach((input, index) => {

    input.addEventListener('input', (e) => {

      const value =
        e.target.value.replace(/\D/g, '')

      e.target.value = value

      if (value) {

        e.target.classList.add('filled')

        if (index < inputs.length - 1) {

          inputs[index + 1].focus()
        }

      } else {

        e.target.classList.remove('filled')
      }
    })

    // ===== BACKSPACE =====

    input.addEventListener('keydown', (e) => {

      if (
        e.key === 'Backspace' &&
        !input.value &&
        index > 0
      ) {

        inputs[index - 1].focus()

        inputs[index - 1].value = ''

        inputs[index - 1]
          .classList.remove('filled')
      }
    })

    // ===== PASTE OTP =====

    input.addEventListener('paste', (e) => {

      e.preventDefault()

      const pasted =
        e.clipboardData
          .getData('text')
          .replace(/\D/g, '')
          .slice(0, 6)

      ;[...pasted].forEach((char, i) => {

        if (inputs[i]) {

          inputs[i].value = char

          inputs[i]
            .classList.add('filled')
        }
      })

      if (inputs[pasted.length]) {

        inputs[pasted.length].focus()
      }
    })
  })

  // ===== COUNTDOWN =====

  let seconds = 60

  const resendbtn =
    document.querySelector('#resendbtn')

  const countdown =
    document.querySelector('.countdown')

  const startTimer = () => {

    resendbtn.disabled = true

    const timer = setInterval(() => {

      seconds--

      countdown.textContent =
        `(${seconds}s)`

      if (seconds <= 0) {

        clearInterval(timer)

        resendbtn.disabled = false

        countdown.textContent = ''
      }

    }, 1000)
  }

  startTimer()

  // ===== RESEND OTP =====

  resendbtn.addEventListener('click', () => {

    showToast(
      'Kode OTP baru telah dikirim',
      'success'
    )

    seconds = 60

    countdown.textContent =
      `(${seconds}s)`

    startTimer()
  })

  // ===== SUBMIT =====

  const form =
    document.querySelector('#otpForm')

  form.addEventListener('submit', async (e) => {

    e.preventDefault()

    const otp =
      [...inputs]
        .map(input => input.value)
        .join('')

    if (otp.length < 6) {

      showToast(
        'Masukkan 6 digit kode OTP',
        'error'
      )

      return
    }

    const btn =
      form.querySelector('.btn-auth')

    setLoading(btn, true)

    await new Promise(
      r => setTimeout(r, 1500)
    )

    setLoading(btn, false)

    showToast(
      'Verifikasi berhasil!',
      'success'
    )

    setTimeout(() => {
      window.location.href =
        'new-password.html'
    }, 1000)

  })

})