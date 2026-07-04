/**
 * js/admin/dashboard.js
 * Halaman Dashboard – Lestari Admin Panel
 *
 * Pagination Engine: Backend-Authoritative
 * ─────────────────────────────────────────────────────────────
 * Sumber kebenaran jumlah halaman = meta.last_page dari Laravel.
 * Tidak ada tebak-tebakan / tombol spekulatif.
 *
 * Strategi fetch:
 *   - Backend mengirim 10 item per page (BACKEND_PER_PAGE).
 *   - UI menampilkan 5 item per halaman (ITEMS_PER_PAGE).
 *   - 1 apiPage backend = 2 halaman UI.
 *   - Cache akumulatif: data yang sudah di-fetch disimpan di allReports,
 *     tidak di-fetch ulang saat user balik ke halaman sebelumnya.
 *
 * Contoh 11 data total (lastPage backend = 2):
 *   UI hal 1 (item 1–5)  → apiPage 1, slice [0:5]
 *   UI hal 2 (item 6–10) → apiPage 1 (cache hit), slice [5:10]
 *   UI hal 3 (item 11)   → apiPage 2, slice [10:15]
 *   maxWebPage = ceil(11 / 5) = 3  → tombol 1, 2, 3 saja.
 */

import { requireAdminAuth } from '../shared/session.js'
import { adminAPI }         from '../shared/api.js'

// ─── Konstanta ───────────────────────────────────────────────
const ITEMS_PER_PAGE   = 5   // Item per halaman UI
const BACKEND_PER_PAGE = 10  // Sesuai paginate(10) di Laravel

// ─── DOM References ──────────────────────────────────────────
const sidebarAdminNameEl = document.getElementById('sidebar-admin-name')
const cardTertunda       = document.getElementById('cardTertunda')
const cardTerverifikasi  = document.getElementById('cardTerverifikasi')
const cardSelesai        = document.getElementById('cardSelesai')
const cardDitolak        = document.getElementById('cardDitolak')
const kategoriList       = document.getElementById('kategoriList')
const reportsTbody       = document.getElementById('reportsTbody')

// ─── State ───────────────────────────────────────────────────
let chartInstance    = null
let currentTab       = 'semua'
let currentPage      = 1   // Halaman UI aktif (1-based)
let allReports       = []  // Cache akumulatif semua item yang sudah di-fetch
let fetchedApiPages  = new Set()
let backendLastPage  = 1   // meta.last_page dari backend — sumber kebenaran total halaman
let totalRecords     = 0   // meta.total dari backend

// ─── Bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const admin = await requireAdminAuth()
  if (!admin) return

  _bindSidebar()
  _loadAdminName()
  Promise.all([_loadStats(), _goToPage(1)])
  _bindTabs()
})

// ─── Sidebar ─────────────────────────────────────────────────
function _bindSidebar() {
  const hamburger = document.getElementById('hamburgerBtn')
  const sidebar   = document.getElementById('sidebar')
  const overlay   = document.getElementById('sidebarOverlay')
  if (!hamburger || !sidebar || !overlay) return

  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open')
    overlay.classList.toggle('visible')
  })
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open')
    overlay.classList.remove('visible')
  })
}

// ─── Admin Name ──────────────────────────────────────────────
function mapAdminUsername(username) {
  if (!username) return 'Administrator'
  const match = String(username).match(/^admin(\d*)$/i)
  if (match) {
    const num = match[1] ? parseInt(match[1], 10) : 1
    return `Administrator - ${num}`
  }
  return username.charAt(0).toUpperCase() + username.slice(1)
}

function _loadAdminName() {
  adminAPI.me()
    .then(res => {
      if (res?.data?.username) _setAdminName(mapAdminUsername(res.data.username))
    })
    .catch(() => {})
}

function _setAdminName(name) {
  if (sidebarAdminNameEl) sidebarAdminNameEl.textContent = name
}

// ─── Stats ───────────────────────────────────────────────────
async function _loadStats() {
  try {
    const res  = await adminAPI.getStats()
    const data = res?.data
    if (!data) return

    _setCard(cardTertunda,      data.menunggu_validasi ?? 0)
    _setCard(cardTerverifikasi, data.terverifikasi     ?? 0)
    _setCard(cardSelesai,       data.selesai           ?? 0)
    _setCard(cardDitolak,       data.ditolak           ?? 0)

    _renderChart(data.harian          || [])
    _renderKategori(data.per_kategori || [])
  } catch (err) {
    console.error('[Dashboard] Gagal memuat statistik:', err)
    ;[cardTertunda, cardTerverifikasi, cardSelesai, cardDitolak].forEach(el => {
      if (el) el.textContent = '!'
    })
  }
}

function _setCard(el, val) {
  if (el) el.textContent = val
}

// ─── Chart ───────────────────────────────────────────────────
function _renderChart(harian) {
  const canvas = document.getElementById('harianChart')
  if (!canvas) return

  const labels = harian.map(d =>
    new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(new Date(d.tanggal))
  )
  const values = harian.map(d => d.total)

  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: '#22c55e',
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#16a34a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111827',
          titleColor: '#fff',
          bodyColor: '#9ca3af',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            title: items => items[0].label,
            label: item  => ` ${item.raw} laporan`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#9ca3af', font: { size: 11, family: "'Poppins', sans-serif" } }
        },
        y: {
          grid: { color: '#f3f4f6' },
          border: { display: false, dash: [4, 4] },
          ticks: {
            color: '#9ca3af',
            font: { size: 11, family: "'Poppins', sans-serif" },
            maxTicksLimit: 5
          },
          beginAtZero: true
        }
      }
    }
  })
}

// ─── Kategori ────────────────────────────────────────────────
function _renderKategori(perKategori) {
  if (!kategoriList) return

  if (perKategori.length === 0) {
    kategoriList.innerHTML = '<div style="text-align:center;padding:24px 0;color:var(--gray-400);font-size:13px;">Tidak ada data.</div>'
    return
  }

  const total = perKategori.reduce((s, k) => s + k.total, 0) || 1

  kategoriList.innerHTML = perKategori.map(k => {
    const pct = Math.round((k.total / total) * 100)
    return `
      <div class="kategori-row">
        <div class="kategori-label-row">
          <span class="kategori-name">${_esc(k.kategori)}</span>
          <span class="kategori-count">${pct}% <span class="kategori-num">(${k.total})</span></span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`
  }).join('')
}

// ─── Tabs ────────────────────────────────────────────────────
function _bindTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentTab = btn.dataset.tab
      _resetCache()
      await _goToPage(1)
    })
  })
}

function _resetCache() {
  allReports      = []
  fetchedApiPages = new Set()
  backendLastPage = 1
  totalRecords    = 0
  currentPage     = 1
}

// ═══════════════════════════════════════════════════════════════
//  PAGINATION ENGINE — Backend-Authoritative
// ═══════════════════════════════════════════════════════════════

/**
 * Navigasi ke halaman UI tertentu.
 * Fetch backend hanya jika data yang dibutuhkan belum ada di cache.
 *
 * @param {number} targetPage - Nomor halaman UI (1-based)
 */
async function _goToPage(targetPage) {
  currentPage = targetPage

  // Halaman backend yang dibutuhkan untuk halaman UI ini
  // UI hal 1–2 → apiPage 1 | UI hal 3–4 → apiPage 2 | dst.
  const webPerApiPage = BACKEND_PER_PAGE / ITEMS_PER_PAGE  // = 2
  const requiredApiPage = Math.ceil(targetPage / webPerApiPage)

  if (!fetchedApiPages.has(requiredApiPage)) {
    _showTableSkeleton()
    try {
      const statusParam = (currentTab && currentTab !== 'semua') ? currentTab : null
      const result      = await adminAPI.getReports(statusParam, { page: requiredApiPage })

      // Akumulasi cache
      allReports = [...allReports, ...result.data]
      fetchedApiPages.add(requiredApiPage)

      // Simpan meta dari backend sebagai sumber kebenaran
      backendLastPage = result.lastPage
      totalRecords    = result.total
    } catch (err) {
      console.error('[Dashboard] Gagal memuat laporan:', err)
      _renderTableError()
      return
    }
  }

  _renderCurrentPage()
}

function _renderCurrentPage() {
  const start     = (currentPage - 1) * ITEMS_PER_PAGE
  const end       = start + ITEMS_PER_PAGE
  const pageSlice = allReports.slice(start, end)

  _renderTable(pageSlice)
  _renderPagination()
}

/**
 * Render tombol pagination.
 *
 * maxWebPage = ceil(total / ITEMS_PER_PAGE)
 *   Dihitung dari meta.total backend — angka ini PASTI benar,
 *   tidak perlu spekulasi sama sekali.
 *
 * Contoh: total = 11, ITEMS_PER_PAGE = 5
 *   → maxWebPage = ceil(11/5) = 3
 *   → tombol yang muncul: 1, 2, 3
 */
function _renderPagination() {
  const pagination = document.getElementById('pagination')
  if (!pagination) return

  const maxWebPage = totalRecords > 0
    ? Math.ceil(totalRecords / ITEMS_PER_PAGE)
    : Math.ceil(allReports.length / ITEMS_PER_PAGE) || 1

  const isPrevDisabled = currentPage <= 1
  const isNextDisabled = currentPage >= maxWebPage

  // Smart windowed page buttons — max 7 visible
  function buildPages(cur, max) {
    if (max <= 7) return Array.from({ length: max }, (_, i) => i + 1)
    const pages = new Set([1, max])
    for (let i = Math.max(2, cur - 2); i <= Math.min(max - 1, cur + 2); i++) pages.add(i)
    const sorted = [...pages].sort((a, b) => a - b)
    const result = []
    sorted.forEach((p, i) => {
      if (i > 0 && sorted[i - 1] < p - 1) result.push('...')
      result.push(p)
    })
    return result
  }

  let pagesHtml = ''
  buildPages(currentPage, maxWebPage).forEach(item => {
    if (item === '...') {
      pagesHtml += `<span class="page-ellipsis">&hellip;</span>`
    } else {
      pagesHtml += `<button class="page-btn ${item === currentPage ? 'active' : ''}" data-page="${item}">${item}</button>`
    }
  })

  pagination.innerHTML = `
    <button class="page-btn" id="prevPage" ${isPrevDisabled ? 'disabled' : ''}>←</button>
    ${pagesHtml}
    <button class="page-btn" id="nextPage" ${isNextDisabled ? 'disabled' : ''}>→</button>
  `

  document.getElementById('prevPage')?.addEventListener('click', async () => {
    if (currentPage > 1) await _goToPage(currentPage - 1)
  })

  document.getElementById('nextPage')?.addEventListener('click', async () => {
    if (currentPage < maxWebPage) await _goToPage(currentPage + 1)
  })

  pagination.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = Number(btn.dataset.page)
      if (target !== currentPage) await _goToPage(target)
    })
  })
}

// ═══════════════════════════════════════════════════════════════
//  RENDER HELPERS
// ═══════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  menunggu_validasi: { label: 'Tertunda',      cls: 'status-tertunda' },
  terverifikasi:     { label: 'Terverifikasi', cls: 'status-terverifikasi' },
  divalidasi:        { label: 'Terverifikasi', cls: 'status-terverifikasi' },
  selesai:           { label: 'Selesai',       cls: 'status-selesai' },
  ditolak:           { label: 'Ditolak',       cls: 'status-ditolak' },
}

function _renderTable(reports) {
  if (!reportsTbody) return

  if (reports.length === 0) {
    reportsTbody.innerHTML = `
      <tr><td colspan="5" class="table-empty">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="#d1d5db">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
        </svg>
        <p>Tidak ada laporan ditemukan.</p>
      </td></tr>`
    return
  }

  reportsTbody.innerHTML = reports.map(r => {
    const st       = STATUS_CONFIG[r.status] || { label: r.status || '—', cls: 'status-tertunda' }
    const { tgl, jam } = _formatDate(r.created_at)
    const lapNum   = _lapNum(r.created_at, r.id)
    const nama     = r.user?.nama_lengkap || r.user?.nama || '?';
    const initials = nama.split(' ').slice(0,2).map(w => w[0] || '').join('').toUpperCase()

    return `
      <tr class="report-row">
        <td class="td-judul">
          <div class="judul-main">${_esc(r.judul)}</div>
          <div class="judul-meta">
            <span class="judul-sub">${lapNum}</span>
            <span class="status-badge ${st.cls}">${st.label}</span>
          </div>
        </td>
        <td><span class="badge-kategori">${_esc(r.kategori || '—')}</span></td>
        <td>
          <div class="pelapor-cell">
            <div class="pelapor-avatar">${initials}</div>
            <span>${_esc(nama)}</span>
          </div>
        </td>
        <td>
          <div class="waktu-cell">
            <span class="waktu-tgl">${tgl}</span>
            <span class="waktu-jam">${jam} WIB</span>
          </div>
        </td>
        <td>
          <button class="btn-detail"
            onclick="window.location.href='../laporan/report-admin.html?id=${r.id}'">
            Detail
          </button>
        </td>
      </tr>`
  }).join('')
}

function _showTableSkeleton() {
  if (!reportsTbody) return
  reportsTbody.innerHTML = Array(3).fill(`
    <tr>${Array(5).fill('<td><div class="skeleton-row-cell"></div></td>').join('')}</tr>`
  ).join('')
}

function _renderTableError() {
  if (!reportsTbody) return
  reportsTbody.innerHTML = `
    <tr><td colspan="5" class="table-empty table-error">
      <p>Gagal memuat data. Periksa koneksi Anda.</p>
    </td></tr>`
}

function _lapNum(createdAt, id) {
  try {
    const d    = new Date(createdAt)
    const dd   = String(d.getDate()).padStart(2, '0')
    const mm   = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `LAP-${dd}${mm}${yyyy}-${String(id).padStart(4, '0')}`
  } catch {
    return `LAP-000000-${String(id).padStart(4, '0')}`
  }
}

function _formatDate(iso) {
  try {
    const d   = new Date(iso)
    const tgl = new Intl.DateTimeFormat('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(d)
    const jam = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(d).replace('.', ':')
    return { tgl, jam }
  } catch {
    return { tgl: '—', jam: '—' }
  }
}

function _esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}