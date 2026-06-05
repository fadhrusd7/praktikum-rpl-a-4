
import { getProfile, updateProfile, getUserStats, changePassword, deleteAccount, logout } from './profile-api.js';
import { showToast, showConfirmModal, closeModal, formatMonthYear, setActiveSidebar, updateNavbarTitle, showLoading, hideLoading, setSidebarUser, initTopbarDate, validateImageFile } from './profile-common.js';

let _selectedPhotoFile = null;

async function loadProfileForm() {
    try {
        const response = await getProfile();
        const user = response.data || response;

        // 1. Ambil Nama Depan & Belakang (cek properti nama_depan/nama_belakang dari Laravel)
        let firstName = user.nama_depan || user.first_name || "";
        let lastName  = user.nama_belakang || user.last_name || "";

        // Fallback kalau API cuma ngasih field 'name' atau 'username' jadi satu string
        if (!firstName && !lastName) {
            const fallbackName = user.username || user.name || "Pengguna";
            const parts = fallbackName.trim().split(/\s+/);
            firstName = parts[0] || "";
            lastName  = parts.slice(1).join(" ") || "";
        }

        const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

        // 2. Avatar: Pakai foto asli, kalau kosong otomatis bikin inisial dari fullName
        const previewImg = document.getElementById("photo-preview-img");
        if (previewImg) {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=E0FBD2&color=00AA13&bold=true`;
            previewImg.src = user.avatar || user.foto || user.foto_profil || fallbackAvatar;
        }

        // 3. Isi form input pakai data yang udah bener
        _setVal("input-first-name", firstName);
        _setVal("input-last-name",  lastName);
        // Tambahin fallback barangkali nama kolomnya no_telp atau kota di database lo
        _setVal("input-phone", user.phone || user.no_telp || "");
        _setVal("input-email", user.email || "");
        _setVal("input-city",  user.city  || user.kota || "");

        // 4. Update Sidebar pakai fullName
        setSidebarUser({ name: fullName, email: user.email || "-" });

    } catch (err) {
        console.error("[loadProfileForm] error:", err);

        if (err.status === 401) {
            const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_role");
            window.location.href = LOGIN_PATH;
            return;
        }

        showToast("Gagal memuat data profil.", "error");
    }
}

function _setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

/*Preview Foto*/
function previewProfilePhoto() {
    const inputPhoto   = document.getElementById("input-photo-upload");
    const previewImg   = document.getElementById("photo-preview-img");
    const editBadge    = document.getElementById("btn-photo-edit-badge");

    if (!inputPhoto) return;

    /** Buka file dialog saat badge diklik. */
    if (editBadge) {
        editBadge.addEventListener("click", () => inputPhoto.click());
    }

    inputPhoto.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            showToast(validation.message, "error");
            inputPhoto.value = "";
            _selectedPhotoFile = null;
            return;
        }

        _selectedPhotoFile = file;

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (previewImg) previewImg.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Validasi semua field form edit profil.
 * @returns {boolean} true jika semua valid
 */
function validateProfileForm() {
    let isValid = true;

    // Helper: tampilkan pesan error
    function setError(errorId, message) {
        const el = document.getElementById(errorId);
        if (el) el.textContent = message;
    }
    function clearError(errorId) {
        const el = document.getElementById(errorId);
        if (el) el.textContent = "";
    }

    // Reset semua error
    ["error-first-name", "error-last-name", "error-phone", "error-email", "error-city"].forEach(clearError);

    // Nama Depan
    const firstName = document.getElementById("input-first-name")?.value.trim();
    if (!firstName) {
        setError("error-first-name", "Nama depan wajib diisi.");
        isValid = false;
    }

    // Nama Belakang
    const lastName = document.getElementById("input-last-name")?.value.trim();
    if (!lastName) {
        setError("error-last-name", "Nama belakang wajib diisi.");
        isValid = false;
    }

    // Email
    const email = document.getElementById("input-email")?.value.trim();
    if (!email) {
        setError("error-email", "Email wajib diisi.");
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("error-email", "Format email tidak valid.");
        isValid = false;
    }

    // Nomor telepon (opsional, tapi validasi format jika diisi)
    const phone = document.getElementById("input-phone")?.value.trim();
    if (phone && !/^[+]?[\d\s\-()]{7,20}$/.test(phone)) {
        setError("error-phone", "Format nomor telepon tidak valid.");
        isValid = false;
    }

    return isValid;
}

/**
 * Submit form: validasi → kirim ke API via FormData.
 * @param {SubmitEvent} e
 */
async function handleUpdateProfile(e) {
    e.preventDefault();

    if (!validateProfileForm()) return;

    const btnSave = document.getElementById("btn-save-profile");
    showLoading(btnSave, "Menyimpan...");

    try {
        const formData = new FormData();
        formData.append("first_name", document.getElementById("input-first-name").value.trim());
        formData.append("last_name",  document.getElementById("input-last-name").value.trim());
        formData.append("email",      document.getElementById("input-email").value.trim());
        formData.append("phone",      document.getElementById("input-phone")?.value.trim() || "");
        formData.append("city",       document.getElementById("input-city")?.value.trim()  || "");

        if (_selectedPhotoFile) {
            formData.append("photo", _selectedPhotoFile);
        }

        await updateProfile(formData);

        showToast("Profil berhasil diperbarui", "success");

        // Reset state foto
        _selectedPhotoFile = null;

        // Kembali ke halaman profil setelah delay singkat
        setTimeout(() => {
            window.location.href = "profile-users.html";
        }, 1500);

    } catch (err) {
        console.error("[handleUpdateProfile] error:", err);

        if (err.status === 422 && err.data?.errors) {
            // Tampilkan error validasi dari Laravel
            const errors = err.data.errors;
            if (errors.first_name) document.getElementById("error-first-name").textContent = errors.first_name[0];
            if (errors.last_name)  document.getElementById("error-last-name").textContent  = errors.last_name[0];
            if (errors.email)      document.getElementById("error-email").textContent      = errors.email[0];
            if (errors.phone)      document.getElementById("error-phone").textContent      = errors.phone[0];
            if (errors.city)       document.getElementById("error-city").textContent       = errors.city[0];
            if (errors.photo)      showToast(errors.photo[0], "error");
        } else {
            showToast("Gagal menyimpan perubahan. Coba lagi.", "error");
        }

    } finally {
        hideLoading(btnSave);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
    if (!localStorage.getItem("auth_token")) {
        window.location.href = LOGIN_PATH;
        return;
    }

    // Muat data form
    await loadProfileForm();

    // Inisialisasi preview foto
    previewProfilePhoto();

    // Binding submit form
    const form = document.getElementById("edit-profile-form");
    if (form) {
        form.addEventListener("submit", handleUpdateProfile);
    }

    // Clear error saat user mulai mengetik
    ["input-first-name", "input-last-name", "input-email", "input-phone", "input-city"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const errorId = `error-${id.replace("input-", "")}`;
        el.addEventListener("input", () => {
            const errEl = document.getElementById(errorId);
            if (errEl) errEl.textContent = "";
        });
    });
});