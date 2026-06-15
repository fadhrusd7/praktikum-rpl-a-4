import { reportAPI } from '../shared/api.js'
import { geocodeSearch, reverseGeocode } from '../shared/map-core.js'
import { initReportMap, flyToLocation, invalidateReportMap } from './report-map.js'
import { validateStep1, validateStep2, showFieldError, clearAllErrors } from './report-validation.js'
import { showStep, initKategoriCards, initFotoUpload, initCharCounter, renderReview, renderDateBadge, renderSidebarUser } from './report-ui.js'

const REDIRECT_LOGIN   = import.meta.env.VITE_REDIRECT_LOGIN       || '/users/auth/login.html'
const API_BASE         = import.meta.env.VITE_API_BASE_URL         || '/api'
const REDIRECT_USER    = import.meta.env.VITE_REDIRECT_URL_USER    || '/users/dashboard/map-users.html'
const REDIRECT_HISTORY = import.meta.env.VITE_REDIRECT_URL_HISTORY || '/users/riwayat/history-users.html'
const REDIRECT_PROFILE = import.meta.env.VITE_REDIRECT_URL_PROFILE || '/users/profil/profile-users.html'
const MAPTILER_KEY     = import.meta.env.VITE_MAPTILER_KEY


;(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    window.location.replace(REDIRECT_LOGIN)
    return
  }

  _loadUserInfo()
})()

// ── User Info ──────────────────────────────────────────────
function _loadUserInfo() {
  const token = localStorage.getItem('auth_token')
  const cachedName  = localStorage.getItem('user_name')  || 'Nama Pengguna'
  const cachedEmail = localStorage.getItem('user_email') || 'email@gmail.com'
  const cachedAvatar = localStorage.getItem('user_avatar') || null

  _setUserDOM(cachedName, cachedEmail, cachedAvatar)

  if (!token) return

  fetch('/api/user/profile', {
    headers: {
      'Accept':        'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(r => r.json())
  .then(body => {
    if (!body.success) return
    
    const u = body.data
    const displayName = u.nama_lengkap || u.username || 'Pengguna'
    
    const email = u.email || cachedEmail
    const avatar = u.foto_profil_url || u.foto_profil || null

    _setUserDOM(displayName, email, avatar)
    localStorage.setItem('user_name',  displayName)
    localStorage.setItem('user_email', email)
    if (avatar) localStorage.setItem('user_avatar', avatar)
  })
  .catch(() => {/* tetap pakai cache */})
}

function _setUserDOM(name, email, avatar) {
  const n = document.querySelector('#sidebarUserName')
  const e = document.querySelector('#sidebarUserEmail') 
  const img = document.querySelector('#sidebar-avatar-img') 
  
  if (n) n.textContent = name || 'Nama Pengguna'
  if (e) e.textContent = email || 'email@gmail.com'
  
  if (img) {
    if (avatar) {
      img.src = avatar
      img.onerror = () => {
        img.onerror = null
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Pengguna')}&background=E0FBD2&color=00AA13&bold=true`
      }
    } else {
      img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Pengguna')}&background=E0FBD2&color=00AA13&bold=true`
    }
  }
}

// ── Global state ──────────────────────────────────────────────────
const CATEGORY_API_VALUES = {
  sampah:     'Sampah',
  banjir:     'Banjir',
  polusi:     'Polusi',
  penebangan: 'Penebangan',
  isu_air:    'Isu Air',
  lainnya:    'Lainnya'
}

const reportData = {
  judul:     '',
  kategori:  '',
  deskripsi: '',
  lokasi:    '',
  latitude:  null,
  longitude: null,
  foto:      null,
  is_anonymous: false
}

// ── Init UI ───────────────────────────────────────────────────────
renderDateBadge()

initKategoriCards((val) => {
  reportData.kategori = val
  const err = document.getElementById('kategoriError')
  if (err) { err.textContent = ''; err.classList.remove('visible') }
})

initFotoUpload((file) => {
  reportData.foto = file
  const err = document.getElementById('fotoError')
  if (err) { err.textContent = ''; err.classList.remove('visible') }
})

initCharCounter('deskripsiInput', 'deskripsiCount', 1000)

// Bind judul input
document.getElementById('judulInput')?.addEventListener('input', (e) => {
  reportData.judul = e.target.value
})

// Bind deskripsi input
document.getElementById('deskripsiInput')?.addEventListener('input', (e) => {
  reportData.deskripsi = e.target.value
})

// Bind anonymous input
document.getElementById('isAnonymousInput')?.addEventListener('change', (e) => {
  reportData.is_anonymous = e.target.checked
})

// ── Step 1 → Step 2 ───────────────────────────────────────────────
document.getElementById('btnToStep2')?.addEventListener('click', () => {
  clearAllErrors()
  const { valid, errors } = validateStep1(reportData)

  if (!valid) {
    if (errors.judul)     showFieldError('judulInput',    'judulError',    errors.judul)
    if (errors.kategori)  showFieldError(null,            'kategoriError', errors.kategori)
    if (errors.deskripsi) showFieldError('deskripsiInput','deskripsiError',errors.deskripsi)
    if (errors.foto)      showFieldError(null,            'fotoError',     errors.foto)
    showToast(Object.values(errors)[0], 'error')
    return
  }

  showStep(2, () => {
    initReportMap((lat, lng, address) => {
      reportData.latitude  = lat
      reportData.longitude = lng
      reportData.lokasi    = address
      highlightActiveResult(null) // clear
      showSelectedLocation(address)
    })
    invalidateReportMap()
  })
})

// ── Step 2: Search ─────────────────────────────────────────────────
let searchDebounce = null
let searchResults  = []
let selectedResultIndex = -1

document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const q = e.target.value.trim()
  clearTimeout(searchDebounce)

  if (q.length < 3) {
    renderSearchEmpty()
    return
  }

  searchDebounce = setTimeout(async () => {
    renderSearchLoading()
    try {
      const results = await geocodeSearch(q)
      searchResults = results
      renderSearchResults(results)
    } catch {
      showToast('Gagal mencari lokasi.', 'error')
      renderSearchEmpty()
    }
  }, 500)
})

function renderSearchLoading() {
  const list = document.getElementById('searchResultsList')
  const ph   = document.getElementById('searchPlaceholder')
  if (ph)   ph.style.display = 'none'
  if (list) list.innerHTML = `
    <div class="search-placeholder">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-500)" stroke-width="2.5" stroke-linecap="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span>Mencari lokasi...</span>
    </div>`
}

function renderSearchEmpty() {
  const list = document.getElementById('searchResultsList')
  const ph   = document.getElementById('searchPlaceholder')
  if (list) list.innerHTML = ''
  if (ph)   ph.style.display = 'flex'
}

function renderSearchResults(results) {
  const list = document.getElementById('searchResultsList')
  const ph   = document.getElementById('searchPlaceholder')
  if (ph) ph.style.display = 'none'

  if (!results || results.length === 0) {
    list.innerHTML = `<div class="search-placeholder"><span>Lokasi tidak ditemukan.<br/>Coba kata kunci lain.</span></div>`
    return
  }

  list.innerHTML = results.map((r, i) => {
    const name = r.name || r.display_name.split(',')[0]
    const addr = r.display_name
    return `
      <div class="search-result-item" data-index="${i}" data-lat="${r.lat}" data-lon="${r.lon}" data-addr="${encodeURIComponent(addr)}">
        <div class="result-pin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"/>
          </svg>
        </div>
        <div class="result-info">
          <div class="result-name">${name}</div>
          <div class="result-addr">${addr}</div>
        </div>
      </div>`
  }).join('')

  // Bind clicks
  list.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const lat  = parseFloat(item.dataset.lat)
      const lon  = parseFloat(item.dataset.lon)
      const addr = decodeURIComponent(item.dataset.addr)

      reportData.latitude  = lat
      reportData.longitude = lon
      reportData.lokasi    = addr

      flyToLocation(lat, lon)
      highlightActiveResult(item)
    })
  })
}

function highlightActiveResult(activeItem) {
  document.querySelectorAll('.search-result-item').forEach(el => el.classList.remove('active'))
  if (activeItem) activeItem.classList.add('active')
}

function showSelectedLocation(address) {
  // When picked from map click, briefly highlight none but keep results visible
}

// ── Step 2 → Step 3 ───────────────────────────────────────────────
document.getElementById('btnToStep3')?.addEventListener('click', () => {
  const { valid, message } = validateStep2(reportData)
  if (!valid) {
    showToast(message, 'error')
    return
  }

  renderReview(reportData)
  showStep(3)
})

// ── Step 3: Edit → Step 1 ─────────────────────────────────────────
document.getElementById('btnEditDetail')?.addEventListener('click', () => {
  showStep(1)
  // Restore values
  const judulEl = document.getElementById('judulInput')
  const deskEl  = document.getElementById('deskripsiInput')
  if (judulEl) judulEl.value = reportData.judul
  if (deskEl)  deskEl.value  = reportData.deskripsi

  // Re-select kategori
  document.querySelectorAll('.kategori-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.value === reportData.kategori)
  })

  // Update char counter
  const counter = document.getElementById('deskripsiCount')
  if (counter && deskEl) counter.textContent = `${deskEl.value.length}/1000`
})

// ── Step 3: Submit ────────────────────────────────────────────────
document.getElementById('btnKirimLaporan')?.addEventListener('click', async () => {
  const btn = document.getElementById('btnKirimLaporan')
  btn.disabled = true
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:spin .7s linear infinite">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    Mengirim laporan...`

  const formData = new FormData()
  formData.append('judul',     reportData.judul)
  formData.append('kategori',  CATEGORY_API_VALUES[reportData.kategori] || reportData.kategori)
  formData.append('deskripsi', reportData.deskripsi)
  formData.append('lokasi',    reportData.lokasi)
  formData.append('latitude',  reportData.latitude)
  formData.append('longitude', reportData.longitude)
  formData.append('is_anonymous', reportData.is_anonymous ? '1' : '0')
  if (reportData.foto) formData.append('foto', reportData.foto)

  try {
    await reportAPI.submitReport(formData)
    showStep(4)
    startSuccessCountdown()
  } catch (err) {
    if (err.status === 409) {
      // Laporan duplikat — kembalikan ke Step 2 agar user pilih lokasi berbeda
      // Jangan enable tombol lagi supaya tidak bisa submit ulang di lokasi yang sama
      showToast(err.message, 'warning', 6000)
      setTimeout(() => {
        showStep(2, () => {
          invalidateReportMap()
        })
        showToast('Silakan pilih lokasi yang berbeda.', 'info', 4000)
      }, 800)
    } else {
      showToast(err.message || 'Gagal mengirim laporan. Silakan coba kembali.', 'error')
      btn.disabled = false
      btn.innerHTML = `Kirim Laporan`
    }
  }
})

// ── Step 4: Countdown ─────────────────────────────────────────────
function startSuccessCountdown() {
  let secs = 5
  const el = document.getElementById('successCountdown')
  const tick = () => {
    if (!el) return
    el.textContent = `Mengalihkan dalam ${secs} detik...`
    if (secs === 0) {
      window.location.href = REDIRECT_USER
      return
    }
    secs--
    setTimeout(tick, 1000)
  }
  tick()
}

document.getElementById('btnSeeHistory')?.addEventListener('click', () => {
  window.location.href = REDIRECT_HISTORY
})

document.getElementById('btnSeeProfile')?.addEventListener('click', () => {
  window.location.href = REDIRECT_PROFILE
})

// ── Sidebar hamburger (mobile) ────────────────────────────────────
const sidebar  = document.getElementById('sidebar')
const overlay  = document.getElementById('sidebarOverlay')
const hamburger= document.getElementById('hamburgerBtn')

hamburger?.addEventListener('click', () => {
  sidebar?.classList.toggle('open')
  overlay?.classList.toggle('visible')
})

overlay?.addEventListener('click', () => {
  sidebar?.classList.remove('open')
  overlay?.classList.remove('visible')
})

// ── Toast utility ──────────────────────────────────────────────────
function showToast(message, type = 'success', duration = 4000) {
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }

  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="9,12 11,14 15,10"/></svg>`,
    error:   `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  }

  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.innerHTML = `${icons[type] || icons.info}<span class="toast-message">${message}</span><button class="toast-close">&times;</button>`
  container.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))

  const remove = () => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 300)
  }
  const timer = setTimeout(remove, duration)
  toast.querySelector('.toast-close').addEventListener('click', () => { clearTimeout(timer); remove() })
}

// Expose for spinner keyframe
const style = document.createElement('style')
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
document.head.appendChild(style)