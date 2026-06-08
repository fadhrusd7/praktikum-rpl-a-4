// ==================================================================
// 1. KONFIGURASI DASAR & HELPER UTILITY
// ==================================================================
const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const NOMINATIM_AGENT = import.meta.env.VITE_NOMINATIM_USER_AGENT || 'LestariApp/1.0';

function getToken() {
    return localStorage.getItem('auth_token');
}

function handleUnauthorized() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/users/auth/login.html';
}

// Helper fetch dari history-api.js
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

// Helper fetch dari report-api.js
async function handleResponse(res) {
    let body;
    try {
        body = await res.json();
    } catch {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }
    if (!res.ok) throw new Error(body?.message || `HTTP ${res.status}`);
    if (body.success === false) throw new Error(body.message || 'Terjadi kesalahan.');
    return body;
}


// ==================================================================
// 2. PROFILE API (dari profile-api.js)
// ==================================================================
export async function getProfile() {
    const response = await fetch(`${BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) throw await response.json();
    return response.json();
}

export async function updateProfile(formData) {
    const response = await fetch(`${BASE_URL}/user/profile`, {
        method: 'POST', 
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
        },
        body: formData
    });
    if (!response.ok) throw await response.json();
    return response.json();
}

export async function getUserStats() {
    const response = await fetch(`${BASE_URL}/user/stats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) throw await response.json();
    return response.json();
}

export async function submitFeedback(formData) {
    const response = await fetch(`${BASE_URL}/feedbacks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
        },
        body: formData
    });
    if (!response.ok) throw await response.json();
    return response.json();
}

export async function changePassword(data) {
    const response = await fetch(`${BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password_lama:              data.current_password,
            password_baru:              data.password,
            password_baru_confirmation: data.password_confirmation,
        }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw json;
    return json;
}

export async function deleteAccount(password) {
    const response = await fetch(`${BASE_URL}/user/account`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw json;
    return json;
}


// ==================================================================
// 3. HISTORY API (dari history-api.js)
// ==================================================================
export async function getMe() {
    try {
        const data = await apiFetch('/auth/me');
        return data?.data ?? data ?? null;
    } catch (e) {
        console.error('[getMe]', e);
        return null;
    }
}

export async function logout() {
    try {
        await apiFetch('/auth/logout', { method: 'POST' });
    } catch (_) { /* ignore */ }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/users/auth/login.html';
}

export async function getMyReports() {
    const data = await apiFetch('/reports/my');
    return data?.data ?? data ?? [];
}

export async function getReportById(id) {
    const data = await apiFetch(`/reports/${id}`);
    return data?.data ?? data ?? null;
}


// ==================================================================
// 4. MAP API (dari map-api.js)
// ==================================================================
export async function getMapReports() {
    const res = await fetch(`${BASE_URL}/reports/map`, {
        method:  'GET',
        cache:   'no-store',
        headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: Gagal memuat data laporan.`);

    const body = await res.json();
    if (!body.success) throw new Error(body.message || 'Gagal memuat data laporan.');

    return Array.isArray(body.data) ? body.data : [];
}


// ==================================================================
// 5. REPORT API (dari report-api.js)
// ==================================================================
export async function submitReport(formData) {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/reports`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
    });
    return handleResponse(res);
}

export async function fetchMapReports() {
    const res = await fetch(`${BASE_URL}/reports/map`, {
        headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
}

export async function geocodeSearch(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const res = await fetch(url, {
        headers: {
            'Accept-Language': 'id',
            'User-Agent': NOMINATIM_AGENT
        }
    });
    if (!res.ok) throw new Error('Gagal mencari lokasi.');
    return res.json();
}

export async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const res = await fetch(url, {
        headers: {
            'Accept-Language': 'id',
            'User-Agent': NOMINATIM_AGENT
        }
    });
    if (!res.ok) return `${lat.toFixed(4)}° S, ${Math.abs(lng).toFixed(4)}° E`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}