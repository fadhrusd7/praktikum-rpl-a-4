/**
 * js/admin/api.js
 * Lestari Admin — Centralized API helper.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const REDIRECT_ADMIN_LOGIN = import.meta.env.VITE_REDIRECT_ADMIN_LOGIN || '/admin/login/login-admin.html'

function getToken() {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
}

export function clearSession() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  sessionStorage.removeItem('admin_token')
  sessionStorage.removeItem('admin_user')
}

export const adminAPI = {
  async get(path) {
    const token = getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })

    if (res.status === 401) {
      clearSession()
      window.location.href = REDIRECT_ADMIN_LOGIN
      throw new Error('Sesi berakhir.')
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const body = await res.json()
    if (!body.success) throw new Error(body.message || 'Gagal memuat data.')

    return body
  },

  async post(path, data = {}) {
    const token = getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    })

    if (res.status === 401) {
      clearSession()
      window.location.href = REDIRECT_ADMIN_LOGIN
      throw new Error('Sesi berakhir.')
    }

    const body = await res.json()
    return body
  },

  async getStats() {
    return this.get('/admin/stats')
  },

  /**
   * GET /api/admin/reports?status=...&page=N
   *
   * Mengembalikan { data, lastPage, total } agar frontend bisa
   * mengetahui total halaman backend secara akurat tanpa tebak-tebakan.
   *   data     → array item laporan halaman ini
   *   lastPage → meta.last_page dari Laravel paginator
   *   total    → meta.total jumlah seluruh record
   */
  async getReports(status = null, page = 1) {
    const params = new URLSearchParams()
    if (status && status !== 'semua') {
      params.append('status', status)
    }
    params.append('page', page)

    const res = await this.get(`/admin/reports?${params.toString()}`)

    return {
      data:     Array.isArray(res?.data) ? res.data : [],
      lastPage: res?.meta?.last_page    ?? 1,
      total:    res?.meta?.total        ?? 0,
    }
  },

  async me() {
    return this.get('/admin/me')
  }
}