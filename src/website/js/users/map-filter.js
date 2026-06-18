import { CATEGORY_CONFIG, normalizeKey } from '../shared/map-core.js'

let _activeFilter = 'semua'
let _allMarkers   = []   // [{ marker: L.Marker, report }]
let _layer        = null
let _map          = null
let _dropdown     = null
let _filterBtn    = null

/**
 * Inisialisasi sistem filter.
 * @param {L.Map} leafletMap
 * @param {L.LayerGroup|L.MarkerClusterGroup} layer
 */
export function initFilter(leafletMap, layer) {
  _map   = leafletMap
  _layer = layer
  _filterBtn = document.querySelector('#filterBtn')
  _buildDropdown()
  _bindBtn()
}

/** Daftarkan satu marker ke sistem filter */
export function registerMarker(marker, report) {
  _allMarkers.push({ marker, report })
}

/** Bersihkan semua marker yang terdaftar (sebelum reload) */
export function clearMarkers() {
  _allMarkers = []
}

/** Terapkan filter aktif saat ini */
export function applyCurrentFilter() {
  _apply(_activeFilter)
}

// ─── Private ──────────────────────────────────────────────────

function _buildDropdown() {
  if (document.querySelector('#filterDropdown')) {
    _dropdown = document.querySelector('#filterDropdown')
    return
  }

  const items = [
    { key: 'semua', label: 'Semua Kategori', color: null },
    ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ key: k, label: v.label, color: v.color }))
  ]

  _dropdown = document.createElement('div')
  _dropdown.id        = 'filterDropdown'
  _dropdown.className = 'filter-dropdown hidden'
  _dropdown.setAttribute('role', 'listbox')

  _dropdown.innerHTML = `
    <div class="filter-dropdown-header">Filter Kategori</div>
    <ul class="filter-list">
      ${items.map(it => `
        <li class="filter-item${it.key === _activeFilter ? ' active' : ''}" data-key="${it.key}" role="option">
          <span class="filter-dot${it.color ? '' : ' filter-dot-all'}"
            ${it.color ? `style="background:${it.color}"` : ''}></span>
          <span>${it.label}</span>
        </li>`).join('')}
    </ul>`

  document.body.appendChild(_dropdown)

  _dropdown.querySelectorAll('.filter-item').forEach(el => {
    el.addEventListener('click', () => {
      _dropdown.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'))
      el.classList.add('active')
      _activeFilter = el.dataset.key
      _apply(_activeFilter)
      _updateBtnLabel(_activeFilter)
      _close()
    })
  })

  // Tutup saat klik luar
  document.addEventListener('click', (e) => {
    if (_dropdown && !_dropdown.classList.contains('hidden') &&
        !_dropdown.contains(e.target) &&
        _filterBtn && !_filterBtn.contains(e.target)) {
      _close()
    }
  })
}

function _bindBtn() {
  if (!_filterBtn) return
  if (_filterBtn.hasAttribute('data-bound')) return;
  _filterBtn.setAttribute('data-bound', 'true');
  _filterBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (_dropdown.classList.contains('hidden')) _open()
    else _close()
  })
}

function _open() {
  if (!_filterBtn || !_dropdown) return
  const rect = _filterBtn.getBoundingClientRect()
  _dropdown.style.left  = 'auto' 
  _dropdown.style.right = `${window.innerWidth - rect.right}px`
  _dropdown.classList.remove('hidden')
}

function _close() {
  _dropdown?.classList.add('hidden')
}

function _apply(key) {
  if (!_layer) return
  _layer.clearLayers()
  const list = key === 'semua'
    ? _allMarkers
    : _allMarkers.filter(({ report }) => normalizeKey(report.kategori) === key)
  list.forEach(({ marker }) => _layer.addLayer(marker))
}

function _updateBtnLabel(key) {
  if (!_filterBtn) return
  const labelEl = _filterBtn.querySelector('.filter-label')
  if (!labelEl) return
  const cfg = CATEGORY_CONFIG[key]
  labelEl.textContent = cfg ? cfg.label : 'Filter'
}