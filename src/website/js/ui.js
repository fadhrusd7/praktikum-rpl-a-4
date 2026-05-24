// ===== PASSWORD TOGGLE =====

export function initPasswordToggles() {

  const toggleButtons =
    document.querySelectorAll('.password-toggle')

  toggleButtons.forEach((btn) => {

    btn.addEventListener('click', () => {

      const input =
        btn.previousElementSibling
        || btn.parentElement.querySelector('input')

      if (!input) return

      const isVisible = input.type === 'text'

      // ===== TOGGLE TYPE =====
      input.type =
        isVisible
          ? 'password'
          : 'text'

      // ===== TOGGLE ICON =====
      btn.innerHTML = isVisible

        ? `
          <svg width="18" height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>

            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>

            <path d="M14.12 14.12a3 3 0 01-4.24-4.24"/>

            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        `

        : `
          <svg width="18" height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">

            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>

            <circle cx="12" cy="12" r="3"/>
          </svg>
        `
    })
  })
}

// ===== PASSWORD STRENGTH =====

export function initPasswordStrength() {

  const input =
    document.querySelector('#password')

  const bars =
    document.querySelectorAll('.strength-bar')

  const strengthText =
    document.querySelector('.strength-text')

  if (!input || !bars.length) return

  input.addEventListener('input', () => {

    const value = input.value

    let score = 0

    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[0-9]/.test(value)) score++
    if (/[^A-Za-z0-9]/.test(value)) score++

    const levels = [
      '',
      'weak',
      'medium',
      'strong',
      'strong'
    ]

    const labels = [
      '',
      'Lemah',
      'Sedang',
      'Kuat',
      'Sangat Kuat'
    ]

    // ===== RESET =====
    bars.forEach((bar) => {
      bar.className = 'strength-bar'
    })

    // ===== ACTIVATE =====
    bars.forEach((bar, index) => {

      if (index < score) {

        bar.classList.add(
          'active',
          levels[score]
        )
      }
    })

    // ===== TEXT =====
    if (strengthText) {

      strengthText.textContent =
        value
          ? `Kekuatan: ${labels[score]}`
          : ''
    }
  })
}

// ===== VALIDATE EMAIL =====

export function validateEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ===== SHOW ERROR =====

export function showError(inputEl, message) {

  if (!inputEl) return

  inputEl.classList.add('error')

  const errorEl =
    inputEl
      .closest('.form-group')
      ?.querySelector('.form-error')

  if (errorEl) {

    errorEl.textContent = message
    errorEl.classList.add('show')
  }
}

// ===== CLEAR ERROR =====

export function clearError(inputEl) {

  if (!inputEl) return

  inputEl.classList.remove('error')

  const errorEl =
    inputEl
      .closest('.form-group')
      ?.querySelector('.form-error')

  if (errorEl) {

    errorEl.textContent = ''
    errorEl.classList.remove('show')
  }
}

// ===== CLEAR ALL ERRORS =====

export function clearAllErrors() {

  document
    .querySelectorAll('.form-input.error')
    .forEach((input) => {

      clearError(input)
    })
}

// ===== BUTTON LOADING =====

export function setLoading(btn, loading = true) {

  if (!btn) return

  if (loading) {

    btn.dataset.originalText =
      btn.innerHTML

    btn.disabled = true

    btn.innerHTML = `
      <svg width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        class="spinner">

        <path
          d="M21 12a9 9 0 11-18 0
          9 9 0 0118 0"
          opacity="0.2"/>

        <path d="M21 12a9 9 0 00-9-9"/>
      </svg>
    `

    btn.classList.add('loading')

  } else {

    btn.innerHTML =
      btn.dataset.originalText || 'Submit'

    btn.disabled = false

    btn.classList.remove('loading')
  }
}

// ===== ADD SPINNER STYLE =====

function injectSpinnerStyle() {

  if (
    document.querySelector('#ui-spinner-style')
  ) return

  const style =
    document.createElement('style')

  style.id = 'ui-spinner-style'

  style.textContent = `
    .spinner{
      animation: spin .8s linear infinite;
      vertical-align: middle;
    }

    @keyframes spin{
      from{
        transform: rotate(0deg);
      }

      to{
        transform: rotate(360deg);
      }
    }
  `

  document.head.appendChild(style)
}

// ===== INIT =====

document.addEventListener(
  'DOMContentLoaded',
  () => {

    injectSpinnerStyle()

    initPasswordToggles()

    initPasswordStrength()

    // ===== CLEAR ERROR ON INPUT =====
    document
      .querySelectorAll('.form-input')
      .forEach((input) => {

        input.addEventListener(
          'input',
          () => clearError(input)
        )
      })
  }
)