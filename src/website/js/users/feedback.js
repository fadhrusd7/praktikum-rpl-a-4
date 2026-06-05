/**
 * feedback.js
 * Lestari — Logic untuk feedback.html
 *
 * Dependensi (load sebelum file ini via HTML):
 *   - profile-api.js      (untuk getProfile / setSidebarUser)
 *   - profile-common.js
 */

import { getProfile, updateProfile, getUserStats, changePassword, deleteAccount, logout } from './profile-api.js';
import { showToast, showConfirmModal, closeModal, formatMonthYear, setActiveSidebar, updateNavbarTitle, showLoading, hideLoading, setSidebarUser, initTopbarDate, validateImageFile } from './profile-common.js';

/* ================================================================== */
/*  STATE                                                               */
/* ================================================================== */

/** Rating yang sedang aktif (1–5). null = belum dipilih. */
let _activeRating = null;

/** File lampiran yang dipilih. null = belum dipilih. */
let _attachmentFile = null;

/* ================================================================== */
/*  RATING BINTANG                                                      */
/* ================================================================== */

/**
 * Inisialisasi interaksi bintang rating:
 * - Hover: highlight bintang 1..N
 * - Click: tetapkan rating aktif
 * - Mouseout: kembalikan ke state aktif atau kosong
 */
function initializeRating() {
    const labels = document.querySelectorAll(".star-rating__label");
    const inputs = document.querySelectorAll(".star-rating__input");

    if (!labels.length) return;

    /**
     * Highlight bintang 1..n (0 = reset semua ke default).
     * @param {number} n
     * @param {boolean} isActive - gunakan kelas active (kuning solid) vs hover (abu terang)
     */
    function highlightStars(n, isActive = false) {
        labels.forEach((label, idx) => {
            const icon = label.querySelector(".star-rating__icon");
            if (!icon) return;

            if (idx < n) {
                icon.style.color  = isActive ? "#F59E0B" : "#FCD34D";
                icon.textContent  = "★"; // bintang solid
            } else {
                icon.style.color  = "#D1D5DB";
                icon.textContent  = "☆"; // bintang kosong
            }
        });
    }

    // Render awal: semua kosong
    highlightStars(0);

    // Event per label
    labels.forEach((label, idx) => {
        const value = idx + 1;

        // Hover masuk
        label.addEventListener("mouseenter", () => {
            highlightStars(value, false);
        });

        // Hover keluar → kembali ke rating aktif atau reset
        label.addEventListener("mouseleave", () => {
            highlightStars(_activeRating || 0, true);
        });

        // Klik → tetapkan rating
        label.addEventListener("click", () => {
            _activeRating = value;
            highlightStars(value, true);

            // Sync dengan radio input agar form bisa dibaca
            inputs.forEach((input) => {
                input.checked = parseInt(input.value, 10) === value;
            });

            // Hapus pesan error rating
            const errEl = document.getElementById("error-rating");
            if (errEl) errEl.textContent = "";
        });
    });

    // Keyboard: support Enter/Space pada label
    labels.forEach((label, idx) => {
        label.setAttribute("tabindex", "0");
        label.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                label.click();
            }
        });
    });
}

/* ================================================================== */
/*  PREVIEW LAMPIRAN                                                    */
/* ================================================================== */

/**
 * Inisialisasi upload & preview foto lampiran.
 * Mendukung klik tombol dan drag-and-drop.
 */
function previewFeedbackImage() {
    const dropzone       = document.getElementById("attachment-dropzone");
    const inputFile      = document.getElementById("input-attachment");
    const placeholder    = document.getElementById("attachment-placeholder");
    const previewWrapper = document.getElementById("attachment-preview-wrapper");
    const previewImg     = document.getElementById("attachment-preview-img");
    const btnRemove      = document.getElementById("btn-remove-attachment");

    if (!dropzone || !inputFile) return;

    /** Proses & validasi file yang dipilih. */
    function processFile(file) {
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            showToast(validation.message, "error");
            inputFile.value = "";
            return;
        }

        _attachmentFile = file;

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (previewImg) previewImg.src = ev.target.result;
            if (placeholder)    placeholder.hidden    = true;
            if (previewWrapper) previewWrapper.hidden = false;

            // Hapus error lampiran
            const errEl = document.getElementById("error-attachment");
            if (errEl) errEl.textContent = "";
        };
        reader.readAsDataURL(file);
    }

    /** Reset ke kondisi awal. */
    function resetAttachment() {
        _attachmentFile = null;
        inputFile.value = "";
        if (previewImg)     previewImg.src    = "";
        if (placeholder)    placeholder.hidden    = false;
        if (previewWrapper) previewWrapper.hidden = true;
    }

    // Klik dropzone → buka file dialog
    dropzone.addEventListener("click", (e) => {
        // Hindari double-trigger jika klik pada label di dalam dropzone
        if (e.target.tagName === "LABEL" || e.target.closest("label")) return;
        if (e.target === btnRemove || e.target.closest("#btn-remove-attachment")) return;
        inputFile.click();
    });

    // Keyboard support pada dropzone
    dropzone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputFile.click();
        }
    });

    // Input file berubah
    inputFile.addEventListener("change", (e) => {
        processFile(e.target.files[0]);
    });

    // Hapus lampiran
    if (btnRemove) {
        btnRemove.addEventListener("click", (e) => {
            e.stopPropagation();
            resetAttachment();
        });
    }

    // Drag and drop
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("drag-over");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("drag-over");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        processFile(file);
    });
}

/* ================================================================== */
/*  SUBMIT FEEDBACK                                                     */
/* ================================================================== */

/**
 * Validasi form dan simulasikan submit feedback.
 * (Endpoint belum tersedia — simulasi delay 800 ms)
 * @param {SubmitEvent} e
 */
async function handleFeedbackSubmit(e) {
    e.preventDefault();

    let isValid = true;

    // Validasi rating
    const errRating = document.getElementById("error-rating");
    if (!_activeRating) {
        if (errRating) errRating.textContent = "Pilih rating bintang terlebih dahulu.";
        isValid = false;
    } else {
        if (errRating) errRating.textContent = "";
    }

    // Pesan (opsional, tapi jika ada batasi 2000 karakter — sudah di HTML)
    const message = document.getElementById("textarea-feedback")?.value.trim() || "";

    if (!isValid) return;

    const btnSubmit = document.getElementById("btn-submit-feedback");
    showLoading(btnSubmit, "Mengirim...");

    try {
        // Simulasi jaringan
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Jika ada endpoint di masa depan, ganti dengan:
        // const formData = new FormData();
        // formData.append("rating", _activeRating);
        // formData.append("message", message);
        // if (_attachmentFile) formData.append("attachment", _attachmentFile);
        // await apiFetch("/feedback", { method: "POST", body: formData });

        showToast("Terima kasih atas masukan Anda", "success");
        _resetFeedbackForm();

    } catch (err) {
        console.error("[handleFeedbackSubmit] error:", err);
        showToast("Gagal mengirim masukan. Coba lagi.", "error");

    } finally {
        hideLoading(btnSubmit);
    }
}

/* ================================================================== */
/*  RESET FORM                                                          */
/* ================================================================== */

/**
 * Reset seluruh elemen form feedback ke kondisi awal.
 */
function _resetFeedbackForm() {
    // Reset rating state
    _activeRating = null;
    document.querySelectorAll(".star-rating__input").forEach((i) => (i.checked = false));
    document.querySelectorAll(".star-rating__label .star-rating__icon").forEach((icon) => {
        icon.style.color = "#D1D5DB";
        icon.textContent = "☆";
    });

    // Reset textarea
    const textarea = document.getElementById("textarea-feedback");
    if (textarea) {
        textarea.value = "";
        // Trigger input event untuk update char counter
        textarea.dispatchEvent(new Event("input"));
    }

    // Reset lampiran
    _attachmentFile = null;
    const inputFile      = document.getElementById("input-attachment");
    const placeholder    = document.getElementById("attachment-placeholder");
    const previewWrapper = document.getElementById("attachment-preview-wrapper");
    const previewImg     = document.getElementById("attachment-preview-img");
    if (inputFile)      inputFile.value       = "";
    if (previewImg)     previewImg.src        = "";
    if (placeholder)    placeholder.hidden    = false;
    if (previewWrapper) previewWrapper.hidden = true;

    // Reset error messages
    ["error-rating", "error-feedback-message", "error-attachment"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

/* ================================================================== */
/*  CHARACTER COUNTER                                                   */
/* ================================================================== */

function initCharCounter() {
    const textarea = document.getElementById("textarea-feedback");
    const counter  = document.getElementById("feedback-char-count");
    if (!textarea || !counter) return;

    textarea.addEventListener("input", () => {
        counter.textContent = `${textarea.value.length} / 2000`;
    });
}

/* ================================================================== */
/*  SIDEBAR PROFILE                                                     */
/* ================================================================== */

async function _loadSidebarProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;
        setSidebarUser({ name: user.name, email: user.email });
    } catch (_) {
        // Biarkan placeholder tetap tampil
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

    // Komponen halaman
    initializeRating();
    previewFeedbackImage();
    initCharCounter();

    // Submit
    const form = document.getElementById("feedback-form");
    if (form) {
        form.addEventListener("submit", handleFeedbackSubmit);
    }
});