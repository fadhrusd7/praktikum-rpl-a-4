import { getProfile, updateProfile, getUserStats, changePassword, deleteAccount, logout } from './profile-api.js';
import { showToast, showConfirmModal, closeModal, formatMonthYear, setActiveSidebar, updateNavbarTitle, showLoading, hideLoading, setSidebarUser, initTopbarDate, validateImageFile } from './profile-common.js';

/* ================================================================== */
/* LOAD PROFILE                                                        */
/* ================================================================== */

/**
 * Ambil data profil dari API dan isi elemen-elemen halaman.
 */
async function loadProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;

        // 1. Benerin pemanggilan nama (gabungin nama depan & belakang, atau pakai username)
        const fullName = [user.nama_depan, user.nama_belakang].filter(Boolean).join(" ").trim() 
                         || user.username 
                         || "Pengguna";

        // 2. Avatar: Pakai foto asli kalau ada, kalau kosong pakai inisial nama
        const avatarImg = document.getElementById("profile-avatar-img");
        if (avatarImg) {
            // Bikin URL fallback pakai inisial fullName (bold=true biar teksnya tebel)
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=E0FBD2&color=00AA13&bold=true`;
            
            // Cek user.avatar, user.foto, atau user.foto_profil (tergantung nama kolom di database lo)
            avatarImg.src = user.avatar || user.foto || user.foto_profil || fallbackAvatar;
            avatarImg.alt = `Foto Profil ${fullName}`;
        }

        // 3. Nama & Email (card utama)
        const nameEl  = document.getElementById("profile-name");
        const emailEl = document.getElementById("profile-email");
        if (nameEl)  nameEl.textContent  = fullName;
        if (emailEl) emailEl.textContent = user.email || "-";

        // 4. Update Sidebar pakai data yang udah bener
        setSidebarUser({ name: fullName, email: user.email });

    } catch (err) {
        console.error("[loadProfile] error:", err);

        if (err.status === 401) {
            // Token tidak valid → redirect ke login
            const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_role");
            window.location.href = LOGIN_PATH;
            return;
        }

        showToast("Gagal memuat profil. Coba lagi.", "error");
    }
}

/* ================================================================== */
/*  LOAD STATS                                                          */
/* ================================================================== */

/**
 * Ambil statistik laporan pengguna dari API.
 */
async function loadStats() {
    try {
        const response = await getUserStats();
        const stats = response.data || response;

        const totalEl    = document.getElementById("stat-total-count");
        const verifiedEl = document.getElementById("stat-verified-count");
        const pendingEl  = document.getElementById("stat-pending-count");

        if (totalEl)    totalEl.textContent    = stats.total    ?? "0";
        if (verifiedEl) verifiedEl.textContent = stats.verified ?? "0";
        if (pendingEl)  pendingEl.textContent  = stats.pending  ?? "0";

    } catch (err) {
        console.error("[loadStats] error:", err);
        // Tidak tampil toast agar tidak mengganggu; stats tetap tampil dengan nilai default HTML
    }
}

/* ================================================================== */
/*  LOGOUT                                                              */
/* ================================================================== */

/**
 * Proses logout: panggil API, bersihkan token, redirect.
 */
async function handleLogout() {
    const confirmed = await showConfirmModal({
        title: "Keluar",
        message: "Apakah Anda yakin ingin keluar dari akun?",
        confirmText: "Keluar",
        cancelText: "Batal",
        confirmType: "danger",
    });

    if (!confirmed) return;

    const btnLogout = document.getElementById("btn-logout");
    showLoading(btnLogout, "Keluar...");

    try {
        await logout();
    } catch (err) {
        // Tetap lanjutkan proses logout meski API gagal
        console.warn("[handleLogout] API error (ignored):", err.message);
    } finally {
        const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
        window.location.replace(LOGIN_PATH);
    }
}

/* ================================================================== */
/*  CHANGE PHOTO (profile-users.html shortcut)                         */
/* ================================================================== */

/**
 * Tangani klik tombol "Ganti Foto" di halaman profil.
 * Membuka file picker & mengupload langsung.
 */
function initChangePhoto() {
    const btnChange  = document.getElementById("btn-change-photo");
    const inputPhoto = document.getElementById("input-change-photo");
    const avatarImg  = document.getElementById("profile-avatar-img");

    if (!btnChange || !inputPhoto) return;

    btnChange.addEventListener("click", () => inputPhoto.click());

    inputPhoto.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            showToast(validation.message, "error");
            inputPhoto.value = "";
            return;
        }

        // Preview lokal sebelum upload
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (avatarImg) avatarImg.src = ev.target.result;
        };
        reader.readAsDataURL(file);

        // Upload
        showLoading(btnChange, "Mengunggah...");
        try {
            const formData = new FormData();
            formData.append("photo", file);
            const response = await updateProfile(formData);
            const user = response.data || response;
            if (avatarImg && user.avatar) avatarImg.src = user.avatar;
            showToast("Foto profil berhasil diperbarui", "success");
        } catch (err) {
            console.error("[initChangePhoto] error:", err);
            showToast("Gagal mengunggah foto. Coba lagi.", "error");
        } finally {
            hideLoading(btnChange);
            inputPhoto.value = "";
        }
    });
}

/* ================================================================== */
/*  INIT                                                                */
/* ================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    // Pastikan token tersedia
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
    if (!localStorage.getItem("auth_token")) {
        window.location.href = LOGIN_PATH;
        return;
    }

    // Muat data secara paralel
    await Promise.all([loadProfile(), loadStats()]);

    // Binding logout
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", handleLogout);
    }

    // Change photo shortcut
    initChangePhoto();
});