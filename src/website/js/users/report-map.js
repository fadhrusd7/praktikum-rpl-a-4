// Baca API key dari environment — TIDAK pernah hardcode di sini
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY 

if (!MAPTILER_KEY) {
  console.warn('[laporan-map] VITE_MAPTILER_KEY tidak ditemukan. Peta mungkin tidak tampil.')
}

const MAPTILER_URL  = `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`
const ATTRIBUTION   = '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const DEFAULT_CENTER = [-7.5613, 110.8574]
const DEFAULT_ZOOM   = 17  // disesuaikan dengan index.html referensi

let reportMap    = null
let reportMarker = null
let miniMap      = null
let miniMarker   = null

// ─────────────────────────────────────────────────────────────────
// Shared marker icon factory
// ─────────────────────────────────────────────────────────────────

function makeMarkerIcon(size = [32, 42]) {
  return L.divIcon({
    className: '',
    html: `<svg width="${size[0]}" height="${size[1]}" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26S32 26.5 32 16C32 7.163 24.837 0 16 0z" fill="#16a34a"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>`,
    iconSize:   size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor:[0, -size[1]]
  })
}

// ─────────────────────────────────────────────────────────────────
// Step 2 — Location picker map
// ─────────────────────────────────────────────────────────────────

/**
 * Inisialisasi peta pemilih lokasi (Step 2).
 * @param {function} onLocationPicked — callback(lat, lng, address)
 */
export function initReportMap(onLocationPicked) {
  if (reportMap) { reportMap.remove(); reportMap = null; reportMarker = null }

  reportMap = L.map('reportMap', {
    center: DEFAULT_CENTER,
    zoom:   DEFAULT_ZOOM,
    zoomControl: false,
    attributionControl: true
  })

  L.tileLayer(MAPTILER_URL, {
    attribution: ATTRIBUTION,
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 20,
    crossOrigin: true
  }).addTo(reportMap)

  L.control.zoom({ position: 'bottomright' }).addTo(reportMap)

  // Klik peta → reverse geocode
  reportMap.on('click', async (e) => {
    const { lat, lng } = e.latlng
    placeOrMoveMarker(lat, lng)

    try {
      const { reverseGeocode } = await import('./report-api.js')
      const address = await reverseGeocode(lat, lng)
      onLocationPicked(lat, lng, address)
    } catch {
      onLocationPicked(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  })

  function placeOrMoveMarker(lat, lng) {
    if (reportMarker) {
      reportMarker.setLatLng([lat, lng])
    } else {
      reportMarker = L.marker([lat, lng], { icon: makeMarkerIcon() }).addTo(reportMap)
    }
  }

  return { map: reportMap }
}

/**
 * Terbang ke koordinat dan letakkan marker (dipanggil dari hasil pencarian).
 */
export function flyToLocation(lat, lng) {
  if (!reportMap) return

  if (reportMarker) {
    reportMarker.setLatLng([lat, lng])
  } else {
    reportMarker = L.marker([lat, lng], { icon: makeMarkerIcon() }).addTo(reportMap)
  }

  reportMap.flyTo([lat, lng], 18, { duration: 1.2 })
}

/**
 * Paksa recalculate ukuran peta (panggil setelah step 2 menjadi visible).
 */
export function invalidateReportMap() {
  if (reportMap) setTimeout(() => reportMap.invalidateSize(), 150)
}

// ─────────────────────────────────────────────────────────────────
// Step 3 — Mini map (read-only)
// ─────────────────────────────────────────────────────────────────

/**
 * Inisialisasi mini map read-only untuk review (Step 3).
 */
export function initMiniMap(lat, lng) {
  if (miniMap) { miniMap.remove(); miniMap = null; miniMarker = null }

  miniMap = L.map('miniMap', {
    center: [lat, lng],
    zoom: 16,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    attributionControl: false
  })

  L.tileLayer(MAPTILER_URL, {
    tileSize: 512,
    zoomOffset: -1,
    maxZoom: 20,
    crossOrigin: true
  }).addTo(miniMap)

  miniMarker = L.marker([lat, lng], { icon: makeMarkerIcon([24, 32]) }).addTo(miniMap)

  setTimeout(() => miniMap.invalidateSize(), 100)
}
