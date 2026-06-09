import { getMyReports, getMe, logout } from './api.js'

// ── Auth guard ────────────────────────────────────────────────────
const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || '/users/auth/login.html'
if (!localStorage.getItem('auth_token')) window.location.replace(LOGIN_PATH)

// ── Constants ─────────────────────────────────────────────────────
const STATUS_META = {
  menunggu_validasi: { label: 'Menunggu Validasi', cls: 'badge-tertunda' },
  tertunda:      { label: 'Tertunda',      cls: 'badge-tertunda' },
  terverifikasi: { label: 'Terverifikasi', cls: 'badge-terverifikasi' },
  selesai:       { label: 'Selesai',       cls: 'badge-selesai' },
  ditolak:       { label: 'Ditolak',       cls: 'badge-ditolak' },
}

const KAT_EMOJI = {
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

const MONTHS_ID    = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const DAYS_ID      = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']

// ── State ─────────────────────────────────────────────────────────
let allReports  = []
let activeTab   = 'semua'
let searchQuery = ''

// ── Boot ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  _loadUserInfo()
  initSidebar()
  renderDateBadge()
  initTabs()
  initSearch()
  await loadReports()
})

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

function setPageTitle(name) {
  const el = document.querySelector('.page-title')
  if (!el) return
  el.textContent = name ? `Riwayat` : 'Riwayat'
}

// ── Data loading ──────────────────────────────────────────────────
async function loadReports() {
  showSkeleton(true)
  clearError()
  try {
    allReports = await getMyReports()
    console.log('[history] laporan diterima:', allReports.length, allReports)
    renderTable()
  } catch (err) {
    showError(`Gagal memuat laporan: ${err.message}`)
  } finally {
    showSkeleton(false)
  }
}

// ── Tabs ──────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      activeTab = btn.dataset.tab
      renderTable()
    })
  })
}

// ── Search ────────────────────────────────────────────────────────
function initSearch() {
  document.getElementById('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim()
    renderTable()
  })
}

// ── Render table ──────────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('reportTableBody')
  const empty = document.getElementById('emptyState')
  if (!tbody) return

  const filtered = allReports.filter(r => {
    const status = (r.status || '').toLowerCase()
    const tabOk  = activeTab === 'semua' || status === activeTab
    const q      = searchQuery
    const srchOk = !q
      || (r.judul         || '').toLowerCase().includes(q)
      || (r.id_laporan    || String(r.id || '')).toLowerCase().includes(q)
      || (r.kategori      || '').toLowerCase().includes(q)
    return tabOk && srchOk
  })

  if (filtered.length === 0) {
    tbody.innerHTML = ''
    if (empty) empty.style.display = 'flex'
    return
  }
  if (empty) empty.style.display = 'none'

  tbody.innerHTML = filtered.map(r => {
    const status  = (r.status || 'tertunda').toLowerCase()
    const sMeta   = STATUS_META[status] || { label: status, cls: 'badge-tertunda' }
    const idLabel = r.id_laporan || genId(r.id, r.created_at)
    
    // Kategori text only (tanpa emoji)
    const kat     = (r.kategori || '').toLowerCase()
    const katName = kat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '—'
    
    const { dayName, dateStr, timeStr } = fmtDate(r.created_at)

    return `
      <tr class="table-row">
        <td>
          <div class="report-title-cell">
            <span class="row-judul">${esc(r.judul || '—')}</span>
            <div class="report-meta">
              <span class="report-id">${esc(idLabel)}</span>
              <span class="badge ${sMeta.cls}">${sMeta.label}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="kategori-badge">${esc(katName)}</span>
        </td>
        <td>
          <div class="waktu-cell">
            <span class="waktu-day">${dayName}, ${dateStr}</span>
            <span class="waktu-time">${timeStr} WIB</span>
          </div>
        </td>
        <td style="text-align:right">
          <button class="btn-detail" onclick="goDetail(${r.id})">Detail</button>
        </td>
      </tr>`
  }).join('')
}

// ── Navigation ────────────────────────────────────────────────────
window.goDetail = id => {
  window.location.href = `./detail.html?id=${id}`
}

// ── Sidebar & hamburger ───────────────────────────────────────────
function initSidebar() {
  const sidebar   = document.getElementById('sidebar')
  const overlay   = document.getElementById('sidebarOverlay')
  const hamburger = document.getElementById('hamburgerBtn')

  hamburger?.addEventListener('click', () => {
    sidebar?.classList.toggle('open')
    overlay?.classList.toggle('visible')
  })
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open')
    overlay?.classList.remove('visible')
  })

  document.getElementById('logoutBtn')?.addEventListener('click', () => logout())
}

// ── UI helpers ────────────────────────────────────────────────────
function showSkeleton(show) {
  const sk = document.getElementById('tableSkeleton')
  const tw = document.getElementById('tableWrapper')
  if (sk) sk.style.display = show ? 'block' : 'none'
  if (tw) tw.style.display = show ? 'none'  : 'block'
}

function showError(msg) {
  const el = document.getElementById('errorState')
  if (el) { el.textContent = msg; el.style.display = 'block' }
}

function clearError() {
  const el = document.getElementById('errorState')
  if (el) el.style.display = 'none'
}

function renderDateBadge() {
  const now = new Date()
  const el  = document.getElementById('dateBadge')
  if (el) el.textContent = `${MONTHS_ID[now.getMonth()]} ${now.getFullYear()}`
}

function setText(id, val) {
  const el = document.getElementById(id)
  if (el) el.textContent = val
}

// ── Formatters ────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return { dayName: '—', dateStr: '—', timeStr: '—' }
  const d = new Date(iso)
  return {
    dayName: DAYS_ID[d.getDay()],
    dateStr: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`,
    timeStr: `${pad(d.getHours())}.${pad(d.getMinutes())}`
  }
}

function genId(id, iso) {
  const d  = iso ? new Date(iso) : new Date()
  const dd = pad(d.getDate())
  const mm = pad(d.getMonth() + 1)
  const yy = d.getFullYear()
  return `LAP-${dd}${mm}${yy}-${String(id || 0).padStart(4, '0')}`
}

function pad(n) { return String(n).padStart(2, '0') }

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}