import { getProfile, updateProfile } from './api.js';
import { showToast, showLoading, hideLoading, setSidebarUser, validateImageFile } from './profile-common.js';

let _selectedPhotoFile = null;

async function loadProfileForm() {
    try {
        const response = await getProfile();
        const user = response.data || response;

        let firstName = user.nama_depan || "";
        let lastName  = user.nama_belakang || "";

        if (!firstName && !lastName) {
            const fallbackName = user.username || "Pengguna";
            const parts = fallbackName.trim().split(/\s+/);
            firstName = parts[0] || "";
            lastName  = parts.slice(1).join(" ") || "";
        }

        const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

        const previewImg = document.getElementById("photo-preview-img");
        if (previewImg) {
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=E0FBD2&color=00AA13&bold=true`;
            previewImg.src = user.foto_profil_url || user.foto_profil || fallbackAvatar;
        }

        _setVal("input-first-name", firstName);
        _setVal("input-last-name",  lastName);
        _setVal("input-phone", user.no_telepon || "");
        _setVal("input-email", user.email || "");
        _setVal("input-city",  user.kota || "");

        // Update sidebar pake avatar juga
        setSidebarUser({ 
            name: fullName, 
            email: user.email || "-",
            avatar: user.foto_profil_url || user.foto_profil
        });

    } catch (err) {
        console.error("[loadProfileForm] error:", err);
        if (err.status === 401) {
            const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
            localStorage.removeItem("auth_token");
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

function previewProfilePhoto() {
    const inputPhoto   = document.getElementById("input-photo-upload");
    const previewImg   = document.getElementById("photo-preview-img");
    const editBadge    = document.getElementById("btn-photo-edit-badge");

    if (!inputPhoto) return;

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

function validateProfileForm() {
    let isValid = true;

    function setError(errorId, message) {
        const el = document.getElementById(errorId);
        if (el) el.textContent = message;
    }
    function clearError(errorId) {
        const el = document.getElementById(errorId);
        if (el) el.textContent = "";
    }

    ["error-first-name", "error-last-name", "error-phone", "error-email", "error-city"].forEach(clearError);

    const firstName = document.getElementById("input-first-name")?.value.trim();
    if (!firstName) {
        setError("error-first-name", "Nama depan wajib diisi.");
        isValid = false;
    }

    const lastName = document.getElementById("input-last-name")?.value.trim();
    if (!lastName) {
        setError("error-last-name", "Nama belakang wajib diisi.");
        isValid = false;
    }

    const email = document.getElementById("input-email")?.value.trim();
    if (!email) {
        setError("error-email", "Email wajib diisi.");
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("error-email", "Format email tidak valid.");
        isValid = false;
    }

    const phone = document.getElementById("input-phone")?.value.trim();
    if (phone && !/^[+]?[\d\s\-()]{7,20}$/.test(phone)) {
        setError("error-phone", "Format nomor telepon tidak valid.");
        isValid = false;
    }

    return isValid;
}

async function handleUpdateProfile(e) {
    e.preventDefault();

    if (!validateProfileForm()) return;

    const btnSave = document.getElementById("btn-save-profile");
    showLoading(btnSave, "Menyimpan...");

    try {
        const formData = new FormData();
        
        formData.append("nama_depan", document.getElementById("input-first-name").value.trim());
        formData.append("nama_belakang",  document.getElementById("input-last-name").value.trim());
        formData.append("email", document.getElementById("input-email").value.trim());
        formData.append("no_telepon", document.getElementById("input-phone")?.value.trim() || "");
        formData.append("kota", document.getElementById("input-city")?.value.trim()  || "");

        if (_selectedPhotoFile) {
            formData.append("foto_profil", _selectedPhotoFile);
        }

        await updateProfile(formData);

        showToast("Profil berhasil diperbarui", "success");
        _selectedPhotoFile = null;

        setTimeout(() => {
            window.location.href = "profile-users.html";
        }, 1500);

    } catch (err) {
        console.error("[handleUpdateProfile] error:", err);
        const errors = err.data?.errors || err.errors; 
        
        if (errors) {
            if (errors.nama_depan) document.getElementById("error-first-name").textContent = errors.nama_depan[0];
            if (errors.nama_belakang)  document.getElementById("error-last-name").textContent  = errors.nama_belakang[0];
            if (errors.email)      document.getElementById("error-email").textContent      = errors.email[0];
            if (errors.no_telepon) document.getElementById("error-phone").textContent      = errors.no_telepon[0];
            if (errors.kota)       document.getElementById("error-city").textContent       = errors.kota[0];
            if (errors.foto_profil) showToast(errors.foto_profil[0], "error");
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

    await loadProfileForm();
    previewProfilePhoto();

    const form = document.getElementById("edit-profile-form");
    if (form) form.addEventListener("submit", handleUpdateProfile);

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