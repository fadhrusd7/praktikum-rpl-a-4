/**
 * profile-api.js
 * Lestari — API layer untuk halaman Profile
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";

/**
 * Helper fetch dengan Authorization header.
 * @param {string} endpoint  - path, e.g. "/user/profile"
 * @param {RequestInit} options
 * @returns {Promise<any>}   - parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("auth_token");

    const defaultHeaders = {
        Accept: "application/json",
    };

    // Jangan set Content-Type manual jika body adalah FormData
    // (browser akan otomatis mengisi boundary)
    if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Coba parse JSON
    let data;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = { message: await response.text() };
    }

    if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

/* ------------------------------------------------------------------ */
/*  Profile                                                             */
/* ------------------------------------------------------------------ */

/**
 * GET /api/user/profile
 * @returns {Promise<Object>} data profil pengguna
 */
async function getProfile() {
    return apiFetch("/user/profile", { method: "GET" });
}

/**
 * PUT /api/user/profile
 * @param {FormData} formData - termasuk foto jika ada
 * @returns {Promise<Object>}
 */
async function updateProfile(formData) {
    // Laravel membutuhkan _method=PUT saat kirim FormData via POST
    formData.append("_method", "PUT");
    return apiFetch("/user/profile", {
        method: "POST",
        body: formData,
    });
}

/* ------------------------------------------------------------------ */
/*  Statistics                                                          */
/* ------------------------------------------------------------------ */

/**
 * GET /api/user/stats
 * @returns {Promise<Object>} { total, verified, pending }
 */
async function getUserStats() {
    return apiFetch("/user/stats", { method: "GET" });
}

/* ------------------------------------------------------------------ */
/*  Password                                                            */
/* ------------------------------------------------------------------ */

/**
 * PUT /api/user/change-password
 * @param {{ current_password: string, password: string, password_confirmation: string }} data
 * @returns {Promise<Object>}
 */
async function changePassword(data) {
    return apiFetch("/user/change-password", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

/* ------------------------------------------------------------------ */
/*  Account                                                             */
/* ------------------------------------------------------------------ */

/**
 * DELETE /api/user/account
 * @returns {Promise<Object>}
 */
async function deleteAccount() {
    return apiFetch("/user/account", { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  Auth                                                                */
/* ------------------------------------------------------------------ */

/**
 * POST /api/auth/logout
 * @returns {Promise<Object>}
 */
async function logout() {
    return apiFetch("/auth/logout", { method: "POST" });
}

export { getProfile, updateProfile, getUserStats, changePassword, deleteAccount, logout };