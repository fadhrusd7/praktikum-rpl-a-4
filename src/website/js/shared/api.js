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
    throw new Error(body?.message || `HTTP ${res.status}`)
  }

  // Tangani success:false dari Laravel (status 200 tapi gagal logis)
  if (body.success === false) {
    throw new Error(body.message || 'Terjadi kesalahan.')
  }

  return body
}

// ─── Auth User ────────────────────────────────────────────────

export const authAPI = {
  /** POST /api/auth/register */
  register: (payload) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body:   JSON.stringify(payload)
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
    apiFetch('/admin/me')
}