const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken() {
  return localStorage.getItem('auth_token');
}

function handleUnauthorized() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/users/auth/login.html';
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    handleUnauthorized();
    return null;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    return null;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan.' }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * GET /api/auth/me
 * @returns {Promise<{name: string, email: string}|null>}
 */
export async function getMe() {
  try {
    const data = await apiFetch('/auth/me');
    return data?.data ?? data ?? null;
  } catch (e) {
    console.error('[getMe]', e);
    return null;
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (_) { /* ignore */ }
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/users/auth/login.html';
}

/**
 * GET /api/reports/my
 * @returns {Promise<Array>}
 */
export async function getMyReports() {
  const data = await apiFetch('/reports/my');
  return data?.data ?? data ?? [];
}

/**
 * GET /api/reports/{id}
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function getReportById(id) {
  const data = await apiFetch(`/reports/${id}`);
  return data?.data ?? data ?? null;
}