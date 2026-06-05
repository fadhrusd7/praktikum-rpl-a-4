/**
 * laporan-api.js
 * API calls untuk modul laporan.
 *
 * KEAMANAN:
 *  - BASE_URL dibaca dari import.meta.env.VITE_API_BASE_URL (Vite)
 *  - Tidak ada URL atau key yang di-hardcode di sini
 *  - VITE_NOMINATIM_USER_AGENT mencegah request anonim ke Nominatim
 */

// Vite mengganti import.meta.env.VITE_* saat build.
// Fallback '/api' hanya untuk kasus edge (dev tanpa Vite).
const BASE_URL        = import.meta.env.VITE_API_BASE_URL        || '/api'
const NOMINATIM_AGENT = import.meta.env.VITE_NOMINATIM_USER_AGENT || 'LestariApp/1.0'
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

function getToken() {
  return localStorage.getItem('auth_token')
}

// ─────────────────────────────────────────────────────────────────
// Internal helper
// ─────────────────────────────────────────────────────────────────

async function handleResponse(res) {
  let body
  try {
    body = await res.json()
  } catch {
    throw new Error(`Server error: ${res.status} ${res.statusText}`)
  }
  if (!res.ok)              throw new Error(body?.message || `HTTP ${res.status}`)
  if (body.success === false) throw new Error(body.message || 'Terjadi kesalahan.')
  return body
}

// ─────────────────────────────────────────────────────────────────
// Report endpoints
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/reports — multipart/form-data, butuh Bearer Token.
 * @param {FormData} formData
 */
export async function submitReport(formData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      // Jangan set Content-Type untuk FormData; browser mengisi boundary otomatis
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData
  })
  return handleResponse(res)
}

/**
 * GET /api/reports/map — Public, tidak butuh auth.
 * Mengembalikan laporan terverifikasi untuk ditampilkan di peta dashboard.
 *
 * CATATAN: Endpoint ini BUKAN untuk halaman laporan (report.html).
 * Digunakan oleh dashboard/map.html untuk merender marker publik.
 */
export async function fetchMapReports() {
  const res = await fetch(`${BASE_URL}/reports/map`, {
    headers: { 'Accept': 'application/json' }
  })
  return handleResponse(res)
}

// ─────────────────────────────────────────────────────────────────
// Geocoding (Nominatim — OpenStreetMap)
// ─────────────────────────────────────────────────────────────────

/**
 * Forward geocoding: teks → daftar lokasi.
 * Nominatim adalah layanan publik gratis; User-Agent wajib diisi.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function geocodeSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'id',
      'User-Agent': NOMINATIM_AGENT
    }
  })
  if (!res.ok) throw new Error('Gagal mencari lokasi.')
  return res.json()
}

/**
 * Reverse geocoding: koordinat → nama alamat.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'id',
      'User-Agent': NOMINATIM_AGENT
    }
  })
  if (!res.ok) return `${lat.toFixed(4)}° S, ${Math.abs(lng).toFixed(4)}° E`
  const data = await res.json()
  return data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
}
