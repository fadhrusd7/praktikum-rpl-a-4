const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Wrapper fetch utama.
 * Otomatis menyisipkan Bearer Token jika tersedia di localStorage.
 */
export async function apiFetch(endpoint, opts = {}) {
  const token = localStorage.getItem('auth_token')

  const headers = {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(opts.headers || {})
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...opts,
    headers
  })

  let body
  try {
    body = await res.json()
  } catch {
    throw new Error(`Server error: ${res.status} ${res.statusText}`)
  }

  // Tangani HTTP error (4xx, 5xx)
  if (!res.ok) {
    throw new Error(body?.error || body?.message || `HTTP ${res.status}`)
  }

  // Tangani success:false dari Laravel (status 200 tapi gagal logis)
  if (body.success === false) {
    throw new Error(body.error || body.message || 'Terjadi kesalahan.')
  }

  return body
}

function unwrapData(body) {
  return body?.data ?? body
}

function unwrapList(body) {
  const data = unwrapData(body)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return []
}

// ─── Auth User ────────────────────────────────────────────────

export const authAPI = {
  /** POST /api/auth/register */
  register: (payload) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body:   JSON.stringify(payload)
    }),

  /** POST /api/auth/register/verify-otp */
  verifyRegisterOtp: (email, otp) =>
    apiFetch('/auth/register/verify-otp', {
      method: 'POST',
      body:   JSON.stringify({ email, otp })
    }),

  /** POST /api/auth/register/resend-otp */
  resendRegisterOtp: (email) =>
    apiFetch('/auth/register/resend-otp', {
      method: 'POST',
      body:   JSON.stringify({ email })
    }),

  /** POST /api/auth/login */
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password })
    }),

  /**
   * GET /api/auth/google
   * Mengembalikan { success, url } — frontend redirect ke url tersebut.
   */
  googleRedirectUrl: () =>
    apiFetch('/auth/google'),

  /** POST /api/auth/logout — butuh Bearer Token */
  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  /** GET /api/auth/me — butuh Bearer Token */
  me: () =>
    apiFetch('/auth/me'),

  /** POST /api/auth/forgot-password */
  forgotPassword: (email) =>
    apiFetch('/auth/forgot-password', {
      method: 'POST',
      body:   JSON.stringify({ email })
    }),

  /** POST /api/auth/verify-otp */
  verifyOtp: (email, otp) =>
    apiFetch('/auth/verify-otp', {
      method: 'POST',
      body:   JSON.stringify({ email, otp })
    }),

  /** POST /api/auth/reset-password */
  resetPassword: (payload) =>
    apiFetch('/auth/reset-password', {
      method: 'POST',
      body:   JSON.stringify(payload)
    })
}

// ─── Auth Admin ───────────────────────────────────────────────

export const adminAPI = {
  /** POST /api/admin/login */
  login: (email, password) =>
    apiFetch('/admin/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password })
    }),

  /** POST /api/admin/logout — butuh Bearer Token Admin */
  logout: () =>
    apiFetch('/admin/logout', { method: 'POST' }),

  /** GET /api/admin/me — butuh Bearer Token Admin */
  me: () =>
    apiFetch('/admin/me'),

  // ─── Dashboard ──────────────────────────────────────────────

  /** GET /api/admin/stats */
  getStats: () =>
    apiFetch('/admin/stats'),

  /** GET /api/admin/profile-stats */
  getProfileStats: () =>
    apiFetch('/admin/profile-stats'),

  // ─── Laporan ────────────────────────────────────────────────

  /**
   * GET /api/admin/reports
   * @param {string|null} status  — null = semua, atau salah satu:
   *   'menunggu_validasi' | 'terverifikasi' | 'selesai' | 'ditolak'
   * @param {Object} opts         — filter tambahan: { kategori, search, page }
   */
  getReports: (status = null, { kategori, search, page } = {}) => {
    const params = new URLSearchParams()
    if (status)   params.set('status',   status)
    if (kategori) params.set('kategori', kategori)
    if (search)   params.set('search',   search)
    if (page)     params.set('page',     page)
    const qs = params.toString()
    return apiFetch(`/admin/reports${qs ? `?${qs}` : ''}`)
      .then(body => ({
        data:     Array.isArray(body?.data) ? body.data : [],
        lastPage: body?.meta?.last_page     ?? 1,
        total:    body?.meta?.total         ?? 0,
      }))
  },

  /**
   * GET /api/admin/reports/{id}
   * Mengembalikan detail laporan beserta data user, verifikator, foto, dan log aktivitas.
   */
  getReport: (id) =>
    apiFetch(`/admin/reports/${id}`)
      .then(unwrapData),

  /**
   * PATCH /api/admin/reports/{id}/validate
   * Digunakan untuk: terverifikasi | ditolak
   * Syarat: status laporan harus menunggu_validasi
   *
   * @param {string|number} id
   * @param {{ status: 'terverifikasi'|'ditolak', alasan_penolakan?: string }} payload
   */
  validateReport: (id, payload) =>
    apiFetch(`/admin/reports/${id}/validate`, {
      method: 'PATCH',
      body:   JSON.stringify(payload)
    }),

  /**
   * PATCH /api/admin/reports/{id}/status
   * Digunakan untuk: selesai | menunggu_validasi (rollback)
   *
   * @param {string|number} id
   * @param {{ status: 'selesai'|'menunggu_validasi' }} payload
   */
  updateReportStatus: (id, payload) =>
    apiFetch(`/admin/reports/${id}/status`, {
      method: 'PATCH',
      body:   JSON.stringify(payload)
    }),

  /**
   * DELETE /api/admin/reports/{id}
   */
  deleteReport: (id) =>
    apiFetch(`/admin/reports/${id}`, { method: 'DELETE' }),
}

// ─── User API ───────────────────────────────────────────────
export const userAPI = {
  /** GET /api/user/profile */
  getProfile: () => apiFetch('/user/profile'),

  /** POST /api/user/profile (Form Data for File Upload) */
  updateProfile: (formData) => apiFetch('/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': undefined }, // Let browser set Content-Type for FormData
    body: formData
  }),

  /** GET /api/user/stats */
  getStats: () => apiFetch('/user/stats'),

  /** POST /api/feedbacks */
  submitFeedback: (formData) => apiFetch('/feedbacks', {
    method: 'POST',
    headers: { 'Content-Type': undefined },
    body: formData
  }),

  /** PUT /api/user/change-password */
  changePassword: (payload) => apiFetch('/user/change-password', {
    method: 'PUT',
    body: JSON.stringify({
      password_lama: payload.current_password,
      password_baru: payload.password,
      password_baru_confirmation: payload.password_confirmation,
    })
  }),

  /** DELETE /api/user/account */
  deleteAccount: (password) => apiFetch('/user/account', {
    method: 'DELETE',
    body: JSON.stringify({ password })
  })
}

// ─── Report API ───────────────────────────────────────────────
export const reportAPI = {
  /** GET /api/reports/map */
  getMapReports: async () => {
    const res = await apiFetch('/reports/map')
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
  },

  /** GET /api/reports/my */
  getMyReports: async () => {
    const res = await apiFetch('/reports/my')
    return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
  },

  /** GET /api/reports/{id} */
  getReportById: async (id) => {
    const res = await apiFetch(`/reports/${id}`)
    return res?.data ?? res ?? null
  },

  /** POST /api/reports (Form Data) */
  submitReport: (formData) => apiFetch('/reports', {
    method: 'POST',
    headers: { 'Content-Type': undefined },
    body: formData
  })
}
