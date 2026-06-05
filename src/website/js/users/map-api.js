const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : '/api'

/**
 * Ambil semua laporan terverifikasi untuk peta.
 * @returns {Promise<Array>}
 */
export async function getMapReports() {
  const res = await fetch(`${BASE_URL}/reports/map`, {
    method:  'GET',
    headers: { 'Accept': 'application/json' }
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data laporan.`)

  const body = await res.json()
  if (!body.success) throw new Error(body.message || 'Gagal memuat data laporan.')

  return Array.isArray(body.data) ? body.data : []
}