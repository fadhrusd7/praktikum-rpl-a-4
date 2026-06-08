/**
 * privacy-security.js
 * Lestari — Logic untuk privacy-security.html
 */

import { getProfile, updateProfile, changePassword, deleteAccount, logout } from './api.js';
import { showToast, showConfirmModal, showLoading, hideLoading, setSidebarUser } from './profile-common.js';

const PRIVACY_KEYS = {
    showPublicName: "privacy_showPublicName",
    shareLocation:  "privacy_shareLocation",
};

function loadPrivacySettings() {
    const showPublicName = localStorage.getItem(PRIVACY_KEYS.showPublicName);
    const shareLocation  = localStorage.getItem(PRIVACY_KEYS.shareLocation);

    const publicNameVal = showPublicName === null ? true : showPublicName === "true";
    const locationVal   = shareLocation  === null ? true : shareLocation  === "true";

    // Sesuaikan dengan ID di HTML
    _setToggle("toggle-public-name", publicNameVal);
    _setToggle("toggle-share-location", locationVal);
}

function savePrivacySettings() {
    const publicName = _getToggle("toggle-public-name");
    const location   = _getToggle("toggle-share-location");

    localStorage.setItem(PRIVACY_KEYS.showPublicName, String(publicName));
    localStorage.setItem(PRIVACY_KEYS.shareLocation,  String(location));
}

function _setToggle(id, value) {
    const el = document.getElementById(id);
    if (el) el.checked = value;
}

function _getToggle(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

async function handleChangePassword(e) {
    e.preventDefault();
    _clearPasswordErrors();

    // Sesuaikan ID dengan yang ada di HTML lo
    const currentPassword = document.getElementById("old-password")?.value || "";
    const newPassword     = document.getElementById("new-password")?.value || "";
    const confirmPassword = document.getElementById("confirm-password")?.value || "";

    let isValid = true;

    if (!currentPassword.trim()) {
        showToast("Sandi lama wajib diisi.", "error");
        isValid = false;
    } else if (!newPassword) {
        showToast("Sandi baru wajib diisi.", "error");
        isValid = false;
    } else if (newPassword.length < 8) {
        showToast("Sandi baru minimal 8 karakter.", "error");
        isValid = false;
    } else if (!confirmPassword || confirmPassword !== newPassword) {
        showToast("Konfirmasi sandi tidak cocok.", "error");
        isValid = false;
    }

    if (!isValid) return;

    // Cari tombol submit di dalam form
    const btnSave = document.querySelector("#form-change-password .btn--primary");
    showLoading(btnSave, "Menyimpan...");

    try {
        await changePassword({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
        });

        showToast("Sandi berhasil diperbarui", "success");
        document.getElementById("form-change-password")?.reset();

    } catch (err) {
        console.error("[handleChangePassword] error:", err);
        showToast("Gagal mengubah sandi. Periksa kembali sandi lama Anda.", "error");
    } finally {
        hideLoading(btnSave);
    }
}

function _clearPasswordErrors() {
    // Helper untuk hapus teks error jika lo tambahin tag <span class="error"> ke depannya
    ["error-old-password", "error-new-password", "error-confirm-password"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

async function handleDeleteAccount() {
    const confirmed = await showConfirmModal({
        title: "Hapus Akun",
        message: "Tindakan ini tidak dapat dibatalkan. Seluruh data Anda akan dihapus secara permanen. Apakah Anda yakin ingin menghapus akun?",
        confirmText: "Hapus Akun",
        cancelText: "Batal",
        confirmType: "danger",
    });

    if (!confirmed) return;

    // Minta password konfirmasi — wajib sesuai UserController.php
    const password = window.prompt("Masukkan password Anda untuk konfirmasi penghapusan akun:");
    if (!password) {
        showToast("Penghapusan akun dibatalkan.", "info");
        return;
    }

    const btnDelete = document.getElementById("btn-delete-account");
    showLoading(btnDelete, "Menghapus...");

    try {
        await deleteAccount(password); // kirim password ke API
        localStorage.clear();
        const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
        window.location.href = LOGIN_PATH;
    } catch (err) {
        console.error("[handleDeleteAccount] error:", err);
        const msg = err?.message || "Gagal menghapus akun. Periksa password Anda.";
        showToast(msg, "error");
        hideLoading(btnDelete);
    }
}

function initPrivacyToggles() {
    ["toggle-public-name", "toggle-share-location"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", () => {
            savePrivacySettings();
            showToast("Preferensi privasi disimpan", "success", 2000);
        });
    });
}

// INI KUNCI UTAMANYA BRO: Benerin cara ngambil foto dan nama!
async function _loadSidebarProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;
        
        // Ambil nama dari field yang bener
        const fullName = [user.nama_depan, user.nama_belakang].filter(Boolean).join(" ").trim() || user.username || "Pengguna";
        
        // Kirim datanya ke sidebar termasuk URL fotonya
        setSidebarUser({ 
            name: fullName, 
            email: user.email,
            avatar: user.foto_profil_url || user.foto_profil
        });
    } catch (_) {
        // Biarkan tetap tampil cache dari common.js kalau gagal
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
    if (!localStorage.getItem("auth_token")) {
        window.location.href = LOGIN_PATH;
        return;
    }

    // 1. Load Sidebar Profile
    await _loadSidebarProfile();

    // 2. Load Preferensi
    loadPrivacySettings();
    initPrivacyToggles();

    // 3. Binding Form Sandi
    const formPassword = document.getElementById("form-change-password");
    if (formPassword) {
        formPassword.addEventListener("submit", handleChangePassword);
    }

    // 4. Binding Tombol Hapus
    const btnDelete = document.getElementById("btn-delete-account");
    if (btnDelete) {
        btnDelete.addEventListener("click", handleDeleteAccount);
    }

    // 5. Logic Mata Password (Show/Hide)
    const toggleButtons = document.querySelectorAll('.form__password-toggle');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const inputField = this.previousElementSibling;
            if (inputField.type === 'password') {
                inputField.type = 'text';
                this.classList.add('form__password-toggle--hide');
            } else {
                inputField.type = 'password';
                this.classList.remove('form__password-toggle--hide');
            }
        });
    });
});