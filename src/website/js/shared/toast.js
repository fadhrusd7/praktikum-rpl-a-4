export function showToast(message, type = 'success', duration = 4000) {
  const container = document.querySelector('.toast-container') || createToastContainer()

  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/></svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  }

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    ${icons[type] || icons.success}
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `

  container.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))

  const removeToast = () => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }

  const autoRemove = setTimeout(removeToast, duration)
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(autoRemove)
    removeToast()
  })
}

function createToastContainer() {
  const container = document.createElement('div')
  container.className = 'toast-container'
  document.body.appendChild(container)
  return container
}