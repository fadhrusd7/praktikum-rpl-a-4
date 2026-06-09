import { getProfile, submitFeedback } from './api.js';
import { showToast, showLoading, hideLoading, setSidebarUser } from './profile-common.js';

let _activeRating = null;
let _attachmentFile = null;

function initializeRating() {
    const labels = document.querySelectorAll(".star-rating__label");
    const inputs = document.querySelectorAll(".star-rating__input");

    if (!labels.length) return;

    function highlightStars(n, isActive = false) {
        labels.forEach((label, idx) => {
            const icon = label.querySelector(".star-rating__icon");
            if (!icon) return;

            if (idx < n) {
                icon.style.color  = isActive ? "#F59E0B" : "#FCD34D";
                icon.textContent  = "★";
            } else {
                icon.style.color  = "#D1D5DB";
                icon.textContent  = "☆";
            }
        });
    }

    highlightStars(0);

    labels.forEach((label, idx) => {
        const value = idx + 1;

        label.addEventListener("mouseenter", () => highlightStars(value, false));
        label.addEventListener("mouseleave", () => highlightStars(_activeRating || 0, true));

        label.addEventListener("click", () => {
            _activeRating = value;
            highlightStars(value, true);
            inputs.forEach((input) => input.checked = parseInt(input.value, 10) === value);

            const errEl = document.getElementById("error-rating");
            if (errEl) errEl.textContent = "";
        });

        label.setAttribute("tabindex", "0");
        label.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                label.click();
            }
        });
    });
}

async function handleFeedbackSubmit(e) {
    e.preventDefault();
    let isValid = true;

    const errRating = document.getElementById("error-rating");
    if (!_activeRating) {
        if (errRating) errRating.textContent = "Pilih rating bintang terlebih dahulu.";
        isValid = false;
    } else {
        if (errRating) errRating.textContent = "";
    }

    const message = document.getElementById("textarea-feedback")?.value.trim() || "";
    if (!isValid) return;

    const btnSubmit = document.getElementById("btn-submit-feedback");
    showLoading(btnSubmit, "Mengirim...");

    try {
        const formData = new FormData();
        formData.append("rating", _activeRating);
        formData.append("komentar", message);
        
        if (_attachmentFile) {
            formData.append("attachment", _attachmentFile);
        }

        await submitFeedback(formData);

        showToast("Terima kasih atas masukan Anda", "success");
        _resetFeedbackForm();

    } catch (err) {
        console.error("[handleFeedbackSubmit] error:", err);
        showToast("Gagal mengirim masukan. Coba lagi.", "error");
    } finally {
        hideLoading(btnSubmit);
    }
}

function _resetFeedbackForm() {
    _activeRating = null;
    document.querySelectorAll(".star-rating__input").forEach((i) => (i.checked = false));
    document.querySelectorAll(".star-rating__label .star-rating__icon").forEach((icon) => {
        icon.style.color = "#D1D5DB";
        icon.textContent = "☆";
    });

    const textarea = document.getElementById("textarea-feedback");
    if (textarea) {
        textarea.value = "";
        textarea.dispatchEvent(new Event("input"));
    }

    _attachmentFile = null;
    const inputFile      = document.getElementById("input-attachment");
    const placeholder    = document.getElementById("attachment-placeholder");
    const previewWrapper = document.getElementById("attachment-preview-wrapper");
    const previewImg     = document.getElementById("attachment-preview-img");
    
    if (inputFile)      inputFile.value       = "";
    if (previewImg)     previewImg.src        = "";
    if (placeholder)    placeholder.hidden    = false;
    if (previewWrapper) previewWrapper.hidden = true;

    ["error-rating", "error-feedback-message", "error-attachment"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

function initCharCounter() {
    const textarea = document.getElementById("textarea-feedback");
    const counter  = document.getElementById("feedback-char-count");
    if (!textarea || !counter) return;

    textarea.addEventListener("input", () => {
        counter.textContent = `${textarea.value.length} / 2000`;
    });
}

function previewFeedbackImage() {
    const inputFile = document.getElementById("input-attachment");
    if (!inputFile) return;

    inputFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        _attachmentFile = file;
    });
}

async function _loadSidebarProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;
        
        const fullName = user.nama_lengkap || user.username || "Pengguna";

        setSidebarUser({ 
            name: fullName, 
            email: user.email,
            avatar: user.foto_profil_url || user.foto_profil 
        });
    } catch (_) {}
}

document.addEventListener("DOMContentLoaded", async () => {
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || "/users/auth/login.html";
    if (!localStorage.getItem("auth_token")) {
        window.location.href = LOGIN_PATH;
        return;
    }

    await _loadSidebarProfile();
    initializeRating();
    previewFeedbackImage();
    initCharCounter();

    const form = document.getElementById("feedback-form");
    if (form) {
        form.addEventListener("submit", handleFeedbackSubmit);
    }
});