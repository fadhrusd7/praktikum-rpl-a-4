import { reportAPI } from '../shared/api.js'
import { initLeafletMap, createCategoryMarkerIcon, CATEGORY_CONFIG, getCategoryConfig } from '../shared/map-core.js'
import { formatTanggal, generateLapNum, escapeHtml, getReporterName } from '../shared/utils.js'
import { initFilter, registerMarker,
         clearMarkers, applyCurrentFilter }           from './map-filter.js'

const DEFAULT_CENTER = [-7.5613, 110.8574]
const DEFAULT_ZOOM   = 15
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

// ── State ──────────────────────────────────────────────────
let map          = null
let markerLayer  = null
let allReports   = []

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  _loadUserInfo()
  _bindSidebar()
  _initMap()
  _buildLegend()
  await _loadReports()
})

// ── User Info ──────────────────────────────────────────────
function _loadUserInfo() {
  const token = localStorage.getItem('auth_token')
  const cachedName   = localStorage.getItem('user_name')   || 'Nama Pengguna'
  const cachedEmail  = localStorage.getItem('user_email')  || 'email@email.com'
  const cachedAvatar = localStorage.getItem('user_avatar') || null

  _setUserDOM(cachedName, cachedEmail, cachedAvatar)

  if (!token) return

  // Ganti ke /api/user/profile agar foto_profil_url pasti tersedia
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

    const email  = u.email  || cachedEmail
    const avatar = u.foto_profil_url || u.foto_profil || null

    _setUserDOM(displayName, email, avatar)

    localStorage.setItem('user_name',  displayName)
    localStorage.setItem('user_email', email)
    if (avatar) localStorage.setItem('user_avatar', avatar)
  })
  .catch(() => {/* tetap pakai cache */})
}

function _setUserDOM(name, email, avatar) {
  const n   = document.querySelector('#sidebarUserName')
  const e   = document.querySelector('#sidebarUserEmail') || document.querySelector('#userEmailDisplay')
  const img = document.querySelector('#sidebar-avatar-img')

  if (n) n.textContent = name  || 'Nama Pengguna'
  if (e) e.textContent = email || 'email@email.com'

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

// ── Init Leaflet Map ───────────────────────────────────────
function _initMap() {
  map = initLeafletMap('map', DEFAULT_CENTER, DEFAULT_ZOOM, MAPTILER_KEY, true)
  map.on('click', () => _closeDetail())
}

// ── Legend ─────────────────────────────────────────────────
function _buildLegend() {
  const list = document.querySelector('#legendList')
  if (!list) return
  list.innerHTML = Object.entries(CATEGORY_CONFIG).map(([, cfg]) => `
    <li class="legend-item">
      <span class="legend-icon">${cfg.legendSvg}</span>
      <span>${cfg.label}</span>
    </li>`).join('')
}

// ── Sidebar Binding (Stub) ──────────────────────────────────
function _bindSidebar() {
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
}

// ── Load Reports ───────────────────────────────────────────
async function _loadReports() {
  _showSkeleton(true)
  _hideEmpty()
  _closeDetail()

  try {
    allReports = await reportAPI.getMapReports()
    _renderMarkers(allReports)
    if (allReports.length === 0) _showEmpty()
  } catch (err) {
    console.error('[map]', err)
    _renderMarkers([])
    _showEmpty('Gagal memuat data. Periksa koneksi Anda.')
  } finally {
    _showSkeleton(false)
    if (map) setTimeout(() => { map.invalidateSize() }, 50)
  }
}

// ── Render Markers ─────────────────────────────────────────
function _renderMarkers(reports) {
  if (markerLayer) {
    markerLayer.clearLayers()
    map.removeLayer(markerLayer)
  }
  clearMarkers()

  const useCluster = reports.length > 50 && typeof L.markerClusterGroup === 'function'
  markerLayer = useCluster
    ? L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 60 })
    : L.layerGroup()

  const bounds = []

  reports.forEach(report => {
    if (report.latitude == null || report.longitude == null) return
    const latlng = [+report.latitude, +report.longitude]
    const icon   = createCategoryMarkerIcon(report.kategori)
    const marker = L.marker(latlng, { icon, title: report.judul })

    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e)
      map.flyTo(latlng, 18, { duration: 1.2 })
      _showDetail(report)
    })

    markerLayer.addLayer(marker)
    registerMarker(marker, report)
    bounds.push(latlng)
  })

  markerLayer.addTo(map)

  if (bounds.length > 1)        map.fitBounds(bounds, { padding: [50, 50] })
  else if (bounds.length === 1) map.setView(bounds[0], 17)

  initFilter(map, markerLayer)
  applyCurrentFilter()
}

// ── Detail Panel ───────────────────────────────────────────
function _showDetail(report) {
  const panel     = document.querySelector('#detailPanel')
  const body      = document.querySelector('#detailBody')
  const footerBtn = document.querySelector('#detailActionBtn')
  if (!panel || !body) return

  const cfg    = getCategoryConfig(report.kategori)
  const lapNum = generateLapNum(report.created_at, report.id)
  
  const dateStr = formatTanggal(report.created_at, true)
  const dateParts = dateStr.split('\n')
  const tgl = dateParts[0] || '—'
  const jam = dateParts[1] ? dateParts[1].replace(' WIB', '') : '—'

  const foto = (report.photos && report.photos.length > 0 && report.photos[0].url)
    ? escapeHtml(report.photos[0].url)
    : 'https://placehold.co/340x160/e8f5e9/16a34a?text=Foto+Tidak+Tersedia'
  if (report.user) report.user.nama = getReporterName(report.user)

  body.innerHTML = `
    <div class="detail-header">
      <div class="detail-title-wrap">
        <h2 class="detail-title">${escapeHtml(report.judul)}</h2>
        <span class="detail-lapnum">${lapNum}</span>
      </div>
      <button class="detail-close" id="detailClose" aria-label="Tutup panel">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="detail-lokasi">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="#22c55e">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>
      <span>${escapeHtml(report.lokasi || '—')}</span>
    </div>

    <span class="detail-badge"
      style="background:${cfg.color}1a;color:${cfg.color};border:1px solid ${cfg.color}40;">
      ${cfg.label}
    </span>

    <img class="detail-foto" src="${foto}" alt="Foto laporan ${escapeHtml(report.judul)}"
      onerror="this.src='https://placehold.co/340x160/e8f5e9/16a34a?text=Foto+Tidak+Tersedia'"/>

    <div class="detail-meta">
      <div class="detail-meta-row">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#9ca3af">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <div>
          <span class="detail-meta-label">Pelapor</span>
          <span class="detail-meta-value">
            ${escapeHtml(
              report.user?.nama ||
              '—'
            )}
          </span>
        </div>
      </div>
      <div class="detail-meta-row">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="#9ca3af">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        </svg>
        <div>
          <span class="detail-meta-label">Dilaporkan pada</span>
          <span class="detail-meta-value">${tgl}</span>
          <span class="detail-meta-sub">${jam} WIB</span>
        </div>
      </div>
    </div>

    <div class="detail-desc">${escapeHtml(report.deskripsi || '')}</div>
  `

  if (footerBtn) {
    footerBtn.onclick = () => {
      window.location.href = `../dashboard/detail.html?id=${report.id}`
    }
  }

  const overlay = document.querySelector('#detailOverlay')
  if (overlay) {
    overlay.classList.remove('hidden')
    overlay.addEventListener('click', _closeDetail, { once: true })
  }

  document.querySelector('#detailClose')?.addEventListener('click', (e) => {
    e.stopPropagation()
    _closeDetail()
  })

  panel.classList.remove('hidden')
  panel.offsetHeight
  panel.classList.add('slide-in')
}

function _closeDetail() {
  const panel   = document.querySelector('#detailPanel')
  const overlay = document.querySelector('#detailOverlay')
  if (overlay) overlay.classList.add('hidden')
  if (!panel)  return
  panel.classList.remove('slide-in')
  panel.classList.add('hidden')
}

// ── Helpers ────────────────────────────────────────────────
// Helper dihapus, pakai dari shared/utils.js

function _showSkeleton(show) {
  const el = document.querySelector('#mapSkeleton')
  if (el) el.classList.toggle('hidden', !show)
}

function _showEmpty(msg = 'Belum ada laporan terverifikasi.') {
  const el = document.querySelector('#mapEmptyState')
  if (el) {
    el.querySelector('p').textContent = msg
    el.classList.remove('hidden')
  }
}

function _hideEmpty() {
  const el = document.querySelector('#mapEmptyState')
  if (el) el.classList.add('hidden')
}
