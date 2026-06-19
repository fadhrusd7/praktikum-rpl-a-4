import { getProfile, updateProfile, getUserStats, changePassword, deleteAccount, logout } from './api.js';
import { showToast, showConfirmModal, closeModal, formatMonthYear, setActiveSidebar, updateNavbarTitle, showLoading, hideLoading, setSidebarUser, initTopbarDate, validateImageFile } from './profile-common.js';

/* ================================================================== */
/* LOAD PROFILE                                                        */
/* ================================================================== */

async function loadProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;

        const fullName = user.nama_lengkap || user.username || "Pengguna";

        const avatarImg = document.getElementById("profile-avatar-img");
        
        // Ambil URL beneran dari backend Laravel lu
        const photoUrl = user.foto_profil_url || user.foto_profil;

        if (avatarImg) {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=E0FBD2&color=00AA13&bold=true`;
            avatarImg.src = photoUrl || fallbackAvatar;
            avatarImg.alt = `Foto Profil ${fullName}`;
        }

        const nameEl  = document.getElementById("profile-name");
        const emailEl = document.getElementById("profile-email");
        if (nameEl)  nameEl.textContent  = fullName;
        if (emailEl) emailEl.textContent = user.email || "-";

        // Update Sidebar pakai data yang udah bener (TERMASUK AVATAR)
        setSidebarUser({ 
            name: fullName, 
            email: user.email,
            avatar: photoUrl
        });

        // Simpan ke local storage biar pas buka peta fotonya langsung muncul
        if (photoUrl) {
            localStorage.setItem('user_avatar', photoUrl);
        }

    } catch (err) {
        console.error("[loadProfile] error:", err);

        if (err.status === 401) {
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
/* LOAD STATS                                                          */
/* ================================================================== */

async function loadStats() {
    try {
        const response = await getUserStats();
        const stats = response.data || response;

        const totalEl    = document.getElementById("stat-total-count");
        const verifiedEl = document.getElementById("stat-verified-count");
        const pendingEl  = document.getElementById("stat-pending-count");

        if (totalEl)    totalEl.textContent    = stats.total             ?? "0";
        if (verifiedEl) verifiedEl.textContent = stats.terverifikasi     ?? "0";
        if (pendingEl)  pendingEl.textContent  = stats.menunggu_validasi ?? "0";

    } catch (err) {
        console.error("[loadStats] error:", err);
    }
}

/* ================================================================== */
/* LOGOUT                                                              */
/* ================================================================== */

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
        console.warn("[handleLogout] API error (ignored):", err);
    } finally {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_avatar");
        // Pakai origin + path absolut agar tidak terjadi loop redirect
        const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
        window.location.href = window.location.origin + LOGIN_PATH;
    }
}

/* ================================================================== */
/* CHANGE PHOTO (profile-users.html shortcut)                         */
/* ================================================================== */

function initChangePhoto() {
    const btnChange  = document.getElementById("btn-change-photo");
    const inputPhoto = document.getElementById("input-change-photo");
    const avatarImg  = document.getElementById("profile-avatar-img");
    const sidebarImg = document.getElementById("sidebar-avatar-img"); // Tangkep sidebar

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

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (avatarImg) avatarImg.src = ev.target.result;
            if (sidebarImg) sidebarImg.src = ev.target.result; // Preview lokal di sidebar
        };
        reader.readAsDataURL(file);

        showLoading(btnChange, "Mengunggah...");
        try {
            const formData = new FormData();
            
            // INI YANG BENER BRO, JANGAN PAKE "photo" LAGI
            formData.append("foto_profil", file); 
            
            const response = await updateProfile(formData);
            const user = response.data || response;
            
            const newPhotoUrl = user.foto_profil_url || user.foto_profil;

            // Update UI & Cache
            if (newPhotoUrl) {
                if (avatarImg) avatarImg.src = newPhotoUrl;
                if (sidebarImg) sidebarImg.src = newPhotoUrl;
                localStorage.setItem('user_avatar', newPhotoUrl);
            }
            
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
/* INIT                                                                */
/* ================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
    if (!localStorage.getItem("auth_token")) {
        window.location.href = LOGIN_PATH;
        return;
    }

    await Promise.all([loadProfile(), loadStats()]);

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", handleLogout);
    }

    initChangePhoto();

    // ── Sidebar & hamburger (mobile) ────────────────────────────────────
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('sidebarOverlay')
    const hamburger = document.getElementById('hamburgerBtn')

    hamburger?.addEventListener('click', () => {
        sidebar?.classList.toggle('open')
        overlay?.classList.toggle('visible')
    })

    overlay?.addEventListener('click', () => {
        sidebar?.classList.remove('open')
        overlay?.classList.remove('visible')
    })
});