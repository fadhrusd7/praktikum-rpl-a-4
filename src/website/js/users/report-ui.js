import { initMiniMap } from './report-map.js'

const CATEGORY_LABELS = {
  sampah: 'Sampah',
  banjir: 'Banjir',
  polusi: 'Polusi',
  penebangan: 'Penebangan',
  isu_air: 'Isu Air',
  lainnya: 'Lainnya'
}

const CATEGORY_EMOJIS = {
  sampah: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5 2v8h1v-8h-1zm3 0v8h1v-8h-1zM8 4h8v2H8V4z"/>
  </svg>`,
  
  banjir: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 3L4 9v4.5c1.1-.3 2.3-.3 3.5.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8.4 0 .7-.1 1.1-.2V9l-8-6z"/>
    <path d="M2 16.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3v2.5c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z"/>
    <path d="M2 20.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3V23c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z" opacity=".6"/>
  </svg>`,
  
  polusi: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M2 21h20v-2H2v2zm2-2v-7l5 2.5V12l5 2.5V12l5 2.5V19H4z"/>
    <path d="M17 9.5a2.5 2.5 0 0 0-1.6-2.3 3.5 3.5 0 0 0-6.8-1A2.5 2.5 0 0 0 8 11h9a2.5 2.5 0 0 0 0-1.5z" opacity=".7"/>
  </svg>`,
  
  penebangan: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <rect x="10" y="3" width="4" height="19" rx="1"/>
    <path d="M14 6l5-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2l-5-2V6z"/>
    <path d="M10 6.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2v-3z" opacity=".6"/>
  </svg>`,
  
  isu_air: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/>
  </svg>`,
  
  lainnya: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <circle cx="5" cy="12" r="2.2"/>
    <circle cx="12" cy="12" r="2.2"/>
    <circle cx="19" cy="12" r="2.2"/>
  </svg>`
};

export function showStep(stepNumber, afterShow) {
  document.querySelectorAll('.step-view').forEach((step) => {
    step.classList.remove('active')
    step.style.display = 'none'
  })

  const step = document.getElementById(`step${stepNumber}`) || document.getElementById(`step ${stepNumber}`)
  if (step) {
    step.classList.add('active')
    step.style.display = stepNumber === 1 ? 'contents' : ''
  }

  if (typeof afterShow === 'function') {
    requestAnimationFrame(afterShow)
  }
}

export function initKategoriCards(onChange) {
  document.querySelectorAll('.kategori-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.kategori-card').forEach((item) => item.classList.remove('selected'))
      card.classList.add('selected')
      onChange?.(card.dataset.value)
    })
  })
}

export function initFotoUpload(onChange) {
  const input = document.getElementById('fotoInput')
  const preview = document.getElementById('fotoPreview')
  const remove = document.getElementById('fotoRemove')
  const dropZone = document.getElementById('dropZone')

  const setFile = (file) => {
    if (!file) return
    onChange?.(file)
    if (preview) {
      preview.src = URL.createObjectURL(file)
      preview.style.display = 'block'
    }
    dropZone?.classList.add('has-file')
    // Reset value agar event 'change' selalu terpicu,
    // bahkan jika user memilih file yang sama setelah error
    if (input) input.value = ''
  }

  input?.addEventListener('change', (e) => {
    const file = e.target.files?.[0]
    if (file) setFile(file)
  })
  remove?.addEventListener('click', (event) => {
    event.stopPropagation()
    if (input) input.value = ''
    if (preview) {
      preview.src = ''
      preview.style.display = 'none'
    }
    dropZone?.classList.remove('has-file')
    onChange?.(null)
  })
}

export function initCharCounter(inputId, counterId, max) {
  const input = document.getElementById(inputId)
  const counter = document.getElementById(counterId)
  const update = () => {
    if (counter && input) counter.textContent = `${input.value.length}/${max}`
  }
  input?.addEventListener('input', update)
  update()
}

export function renderReview(data) {
  const category = data.kategori || 'lainnya'
  setText('reviewDeskripsi', data.deskripsi || '—')
  setText('reviewKategoriName', CATEGORY_LABELS[category] || category)

  const emojiEl = document.getElementById('reviewKategoriEmoji')
  if (emojiEl) {
    emojiEl.innerHTML = CATEGORY_EMOJIS[category] || '📋'
  }
  
  const now = new Date()
  setText('reviewDate', new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(now))
  setText('reviewTime', new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta'
  }).format(now).replace('.', ':'))

  setText('miniMapCoords', data.latitude && data.longitude
    ? `${Number(data.latitude).toFixed(6)}, ${Number(data.longitude).toFixed(6)}`
    : '')

  const reviewFoto = document.getElementById('reviewFoto')
  const placeholder = document.getElementById('reviewFotoPlaceholder')
  if (reviewFoto && data.foto) {
    reviewFoto.src = URL.createObjectURL(data.foto)
    reviewFoto.style.display = 'block'
    if (placeholder) placeholder.style.display = 'none'
  }

  if (data.latitude != null && data.longitude != null) {
    requestAnimationFrame(() => initMiniMap(Number(data.latitude), Number(data.longitude)))
  }
}

export function renderDateBadge() {
  const badge = document.getElementById('dateBadge')
  if (!badge) return
  badge.textContent = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(new Date())
}

export function renderSidebarUser(user = {}) {
  const displayName = user.nama_lengkap || user.username || 'Pengguna'

  setText('sidebarUserName', displayName)
  setText('userEmailDisplay', user.email || 'email@gmail.com')
}

function setText(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}
