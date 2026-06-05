/**
 * privacy-security.js
 * Lestari — Logic untuk privacy-security.html
 *
 * Dependensi (load sebelum file ini via HTML):
 *   - profile-api.js
 *   - profile-common.js
 */

import { getProfile, updateProfile, getUserStats, changePassword, deleteAccount, logout } from './profile-api.js';
import { showToast, showConfirmModal, closeModal, formatMonthYear, setActiveSidebar, updateNavbarTitle, showLoading, hideLoading, setSidebarUser, initTopbarDate, validateImageFile } from './profile-common.js';

/* ================================================================== */
/*  KUNCI LOCALSTORAGE                                                  */
/* ================================================================== */

const PRIVACY_KEYS = {
    showPublicName: "privacy_showPublicName",
    shareLocation:  "privacy_shareLocation",
};

/* ================================================================== */
/*  LOAD PRIVACY SETTINGS                                               */
/* ================================================================== */

/**
 * Baca preferensi dari localStorage dan terapkan ke toggle.
 */
function loadPrivacySettings() {
    const showPublicName = localStorage.getItem(PRIVACY_KEYS.showPublicName);
    const shareLocation  = localStorage.getItem(PRIVACY_KEYS.shareLocation);

    // Default: aktif (true) jika belum pernah disimpan
    const publicNameVal = showPublicName === null ? true : showPublicName === "true";
    const locationVal   = shareLocation  === null ? true : shareLocation  === "true";

    _setToggle("toggle-show-public-name", publicNameVal);
    _setToggle("toggle-share-location",   locationVal);
}

/* ================================================================== */
/*  SAVE PRIVACY SETTINGS                                               */
/* ================================================================== */

/**
 * Simpan nilai toggle ke localStorage.
 */
function savePrivacySettings() {
    const publicName = _getToggle("toggle-show-public-name");
    const location   = _getToggle("toggle-share-location");

    localStorage.setItem(PRIVACY_KEYS.showPublicName, String(publicName));
    localStorage.setItem(PRIVACY_KEYS.shareLocation,  String(location));
}

/* ================================================================== */
/*  TOGGLE HELPERS                                                      */
/* ================================================================== */

/**
 * Set nilai checkbox/toggle berdasarkan ID.
 * @param {string} id
 * @param {boolean} value
 */
function _setToggle(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
}

/**
 * Baca nilai checkbox/toggle.
 * @param {string} id
 * @returns {boolean}
 */
function _getToggle(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

/* ================================================================== */
/*  GANTI SANDI                                                         */
/* ================================================================== */

/**
 * Validasi dan kirim permintaan ganti password.
 * @param {SubmitEvent} e
 */
async function handleChangePassword(e) {
    e.preventDefault();

    // Reset error
    _clearPasswordErrors();

    const currentPassword = document.getElementById("input-current-password")?.value || "";
    const newPassword     = document.getElementById("input-new-password")?.value     || "";
    const confirmPassword = document.getElementById("input-confirm-password")?.value || "";

    let isValid = true;

    // Validasi: sandi lama wajib
    if (!currentPassword.trim()) {
        _setFieldError("error-current-password", "Sandi lama wajib diisi.");
        isValid = false;
    }

    // Validasi: sandi baru minimal 8 karakter
    if (!newPassword) {
        _setFieldError("error-new-password", "Sandi baru wajib diisi.");
        isValid = false;
    } else if (newPassword.length < 8) {
        _setFieldError("error-new-password", "Sandi baru minimal 8 karakter.");
        isValid = false;
    }

    // Validasi: konfirmasi sandi harus sama
    if (!confirmPassword) {
        _setFieldError("error-confirm-password", "Konfirmasi sandi wajib diisi.");
        isValid = false;
    } else if (newPassword && confirmPassword !== newPassword) {
        _setFieldError("error-confirm-password", "Konfirmasi sandi tidak cocok.");
        isValid = false;
    }

    if (!isValid) return;

    const btnSave = document.getElementById("btn-save-password");
    showLoading(btnSave, "Menyimpan...");

    try {
        await changePassword({
            current_password:      currentPassword,
            password:              newPassword,
            password_confirmation: confirmPassword,
        });

        showToast("Sandi berhasil diperbarui", "success");

        // Reset form
        document.getElementById("form-change-password")?.reset();

    } catch (err) {
        console.error("[handleChangePassword] error:", err);

        if (err.status === 422 && err.data?.errors) {
            const errors = err.data.errors;
            if (errors.current_password) _setFieldError("error-current-password", errors.current_password[0]);
            if (errors.password)         _setFieldError("error-new-password",      errors.password[0]);
        } else if (err.status === 400) {
            _setFieldError("error-current-password", "Sandi lama tidak sesuai.");
        } else {
            showToast("Gagal mengubah sandi. Coba lagi.", "error");
        }

    } finally {
        hideLoading(btnSave);
    }
}

function _setFieldError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
}

function _clearPasswordErrors() {
    ["error-current-password", "error-new-password", "error-confirm-password"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

/* ================================================================== */
/*  HAPUS AKUN                                                          */
/* ================================================================== */

/**
 * Konfirmasi lalu hapus akun pengguna.
 */
async function handleDeleteAccount() {
    const confirmed = await showConfirmModal({
        title:       "Hapus Akun",
        message:     "Tindakan ini tidak dapat dibatalkan. Seluruh data Anda akan dihapus secara permanen. Apakah Anda yakin ingin menghapus akun?",
        confirmText: "Hapus Akun",
        cancelText:  "Batal",
        confirmType: "danger",
    });

    if (!confirmed) return;

    const btnDelete = document.getElementById("btn-delete-account");
    showLoading(btnDelete, "Menghapus...");

    try {
        await deleteAccount();
        localStorage.clear();
        const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
        window.location.href = LOGIN_PATH;

    } catch (err) {
        console.error("[handleDeleteAccount] error:", err);
        showToast("Gagal menghapus akun. Coba lagi.", "error");
        hideLoading(btnDelete);
    }
}

/* ================================================================== */
/*  INIT TOGGLE BINDINGS                                                */
/* ================================================================== */

/**
 * Pasang event listener pada setiap toggle agar langsung tersimpan.
 */
function initPrivacyToggles() {
    ["toggle-show-public-name", "toggle-share-location"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", () => {
            savePrivacySettings();
            showToast("Preferensi privasi disimpan", "success", 2000);
        });
    });
}

/* ================================================================== */
/*  LOAD PROFILE (sidebar)                                              */
/* ================================================================== */

async function _loadSidebarProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;
        setSidebarUser({ name: user.name, email: user.email });
    } catch (_) {
        // Sidebar tetap tampil dengan placeholder
    }
}

/* ================================================================== */
/*  INIT                                                                */
/* ================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
    if (!localStorage.getItem("auth_token")) {
        window.location.href = LOGIN_PATH;
        return;
    }

    // Sidebar
    await _loadSidebarProfile();

    // Preferensi privasi
    loadPrivacySettings();
    initPrivacyToggles();

    // Form ganti sandi
    const formPassword = document.getElementById("form-change-password");
    if (formPassword) {
        formPassword.addEventListener("submit", handleChangePassword);
    }

    // Clear error saat user mengetik
    [
        ["input-current-password", "error-current-password"],
        ["input-new-password",     "error-new-password"],
        ["input-confirm-password", "error-confirm-password"],
    ].forEach(([inputId, errorId]) => {
        const el = document.getElementById(inputId);
        if (!el) return;
        el.addEventListener("input", () => {
            const errEl = document.getElementById(errorId);
            if (errEl) errEl.textContent = "";
        });
    });

    // Hapus akun
    const btnDelete = document.getElementById("btn-delete-account");
    if (btnDelete) {
        btnDelete.addEventListener("click", handleDeleteAccount);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // 1. Logic Tampilkan/Sembunyikan Password
    const toggleButtons = document.querySelectorAll('.form__password-toggle');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Cari input terdekat (sandi lama, baru, atau konfirmasi)
            const inputField = this.previousElementSibling;
            
            if (inputField.type === 'password') {
                // Tampilkan sandi
                inputField.type = 'text';
                this.classList.add('form__password-toggle--hide');
            } else {
                // Sembunyikan sandi
                inputField.type = 'password';
                this.classList.remove('form__password-toggle--hide');
            }
        });
    });

    // 2. Logic Tombol Hapus Akun
    const btnDelete = document.getElementById('btn-delete-account');
    if (btnDelete) {
        btnDelete.addEventListener('click', () => {
            const isConfirmed = confirm("Apakah Anda yakin ingin menghapus akun permanen?");
            if (isConfirmed) {
                // Panggil fungsi API Hapus Akun lo di sini
                console.log("Mulai proses hapus akun...");
            }
        });
    }
});