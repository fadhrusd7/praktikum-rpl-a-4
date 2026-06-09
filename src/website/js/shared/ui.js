export function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle')

  toggleButtons.forEach((btn) => {
    // Cegah binding event berulang kali (terutama karena Vite HMR)
    if (btn.hasAttribute('data-toggle-bound')) return
    btn.setAttribute('data-toggle-bound', 'true')

    btn.addEventListener('click', () => {
      const input =
        btn.previousElementSibling ||
        btn.parentElement.querySelector('input')

      if (!input) return

      const isVisible = input.type === 'text'
      input.type = isVisible ? 'password' : 'text'

      btn.innerHTML = isVisible
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
            <path d="M14.12 14.12a3 3 0 01-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>`
    })
  })
}

export function initPasswordStrength() {
  const input = document.querySelector('#password')
  const bars = document.querySelectorAll('.strength-bar')
  const strengthText = document.querySelector('.strength-text')

  if (!input || !bars.length) return

  if (input.hasAttribute('data-strength-bound')) return
  input.setAttribute('data-strength-bound', 'true')

  input.addEventListener('input', () => {
    const value = input.value
    let score = 0

    if (value.length >= 8) score++
    if (/[A-Z]/.test(value)) score++
    if (/[0-9]/.test(value)) score++
    if (/[^A-Za-z0-9]/.test(value)) score++

    const levels = ['', 'weak', 'medium', 'strong', 'strong']
    const labels = ['', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat']

    bars.forEach(bar => { bar.className = 'strength-bar' })
    bars.forEach((bar, index) => {
      if (index < score) bar.classList.add('active', levels[score])
    })

    if (strengthText) {
      strengthText.textContent = value ? `Kekuatan: ${labels[score]}` : ''
    }
  })
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function showError(inputEl, message) {
  inputEl.classList.add('error')
  const errEl = inputEl.parentElement.parentElement.querySelector('.form-error')
  if (errEl) {
    errEl.textContent = message
    errEl.style.display = 'block'
  }
}

export function clearError(inputEl) {
  inputEl.classList.remove('error')
  const errEl = inputEl.parentElement.parentElement.querySelector('.form-error')
  if (errEl) {
    errEl.textContent = ''
    errEl.style.display = 'none'
  }
}

export function clearAllErrors() {
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'))
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = ''
    el.style.display = 'none'
  })
}

export function setLoading(btn, isLoading, loadingText = 'Memproses...') {
  if (isLoading) {
    btn.dataset.originalText = btn.innerHTML
    btn.innerHTML = `<span class="spinner" style="display:inline-block; margin-right:8px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; width:14px; height:14px;"></span> ${loadingText}`
    btn.disabled = true
    btn.style.opacity = '0.8'
    btn.style.cursor = 'not-allowed'
  } else {
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText
    }
    btn.disabled = false
    btn.style.opacity = '1'
    btn.style.cursor = 'pointer'
  }
}

export function initSidebarNavigation(activePage) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    const page = item.dataset.page
    const isActive = page === activePage

    item.classList.toggle('active', isActive)
    if (isActive) {
      item.setAttribute('aria-current', 'page')
    } else {
      item.removeAttribute('aria-current')
    }
  })
}

function injectSpinnerStyle() {
  if (document.querySelector('#ui-spinner-style')) return
  const style = document.createElement('style')
  style.id = 'ui-spinner-style'
  style.textContent = `
    .spinner { animation: spin .8s linear infinite; vertical-align: middle; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `
  document.head.appendChild(style)
}

function initUI() {
  injectSpinnerStyle()
  initPasswordToggles()
  initPasswordStrength()

  document.querySelectorAll('.form-input').forEach(input => {
    if (input.hasAttribute('data-error-bound')) return
    input.setAttribute('data-error-bound', 'true')
    input.addEventListener('input', () => clearError(input))
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI)
} else {
  initUI()
}