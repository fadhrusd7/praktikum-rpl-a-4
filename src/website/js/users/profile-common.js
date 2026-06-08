/**
 * Tampilkan notifikasi toast.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration - ms sebelum toast hilang (default 3000)
 */
function showToast(message, type = "info", duration = 3000) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");
        container.style.cssText = [
            "position:fixed",
            "bottom:24px",
            "right:24px",
            "z-index:9999",
            "display:flex",
            "flex-direction:column",
            "gap:8px",
            "pointer-events:none",
        ].join(";");
        document.body.appendChild(container);
    }

    const colorMap = {
        success: { bg: "#00AA13", icon: "✓" },
        error:   { bg: "#DC2626", icon: "✕" },
        warning: { bg: "#D97706", icon: "⚠" },
        info:    { bg: "#2563EB", icon: "ℹ" },
    };
    const { bg, icon } = colorMap[type] || colorMap.info;

    const toast = document.createElement("div");
    toast.style.cssText = [
        `background:${bg}`,
        "color:#fff",
        "padding:12px 16px",
        "border-radius:8px",
        "font-size:14px",
        "font-weight:500",
        "display:flex",
        "align-items:center",
        "gap:8px",
        "box-shadow:0 4px 12px rgba(0,0,0,.15)",
        "opacity:0",
        "transform:translateY(8px)",
        "transition:opacity .25s ease,transform .25s ease",
        "pointer-events:auto",
        "max-width:320px",
        "word-break:break-word",
    ].join(";");
    toast.innerHTML = `<span style="font-size:16px;flex-shrink:0">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, duration);
}

/* ================================================================== */
/* CONFIRM MODAL                                                      */
/* ================================================================== */

function showConfirmModal({
    title = "Konfirmasi",
    message = "Apakah Anda yakin?",
    confirmText = "Ya",
    cancelText = "Batal",
    confirmType = "danger",
} = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.id = "confirm-modal-overlay";
        overlay.style.cssText = [
            "position:fixed",
            "inset:0",
            "background:rgba(0,0,0,.45)",
            "z-index:10000",
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "padding:16px",
        ].join(";");

        const confirmBg = confirmType === "danger" ? "#DC2626" : "#00AA13";

        overlay.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
           style="background:#fff;border-radius:12px;padding:28px 24px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.2)">
        <h3 id="modal-title" style="margin:0 0 10px;font-size:18px;font-weight:700;color:#111">${title}</h3>
        <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.5">${message}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button id="modal-cancel-btn"
            style="padding:9px 20px;border-radius:8px;border:1.5px solid #d1d5db;background:#fff;color:#374151;font-size:14px;font-weight:500;cursor:pointer">
            ${cancelText}
          </button>
          <button id="modal-confirm-btn"
            style="padding:9px 20px;border-radius:8px;border:none;background:${confirmBg};color:#fff;font-size:14px;font-weight:600;cursor:pointer">
            ${confirmText}
          </button>
        </div>
      </div>`;

        document.body.appendChild(overlay);

        function cleanup(result) {
            overlay.remove();
            resolve(result);
        }

        document.getElementById("modal-confirm-btn").addEventListener("click", () => cleanup(true));
        document.getElementById("modal-cancel-btn").addEventListener("click", () => cleanup(false));
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) cleanup(false);
        });
    });
}

function closeModal() {
    const overlay = document.getElementById("confirm-modal-overlay");
    if (overlay) overlay.remove();
}

function formatMonthYear(date = new Date()) {
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function setActiveSidebar(page) {
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === page);
    });
}

function updateNavbarTitle(title) {
    const el = document.querySelector(".topbar__title");
    if (el) el.textContent = title;
}

function showLoading(button, loadingText = "Memproses...") {
    if (!button) return;
    button.disabled = true;
    button._originalText = button.textContent;
    button.textContent = loadingText;
    button.style.opacity = "0.7";
    button.style.cursor = "not-allowed";
}

function hideLoading(button) {
    if (!button) return;
    button.disabled = false;
    button.textContent = button._originalText || button.textContent;
    button.style.opacity = "";
    button.style.cursor = "";
}

function setSidebarUser(user) {
    const nameEl = document.getElementById("sidebarUserName");
    const emailEl = document.getElementById("sidebarUserEmail");
    const avatarImg = document.getElementById("sidebar-avatar-img"); // Tangkep image sidebar

    if (nameEl && user.name) nameEl.textContent = user.name;
    if (emailEl && user.email) emailEl.textContent = user.email;

    // Handle foto sidebar
    if (avatarImg) {
        if (user.avatar) {
            avatarImg.src = user.avatar;
        } else {
            const fallbackName = user.name || "Pengguna";
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=E0FBD2&color=00AA13&bold=true`;
        }
    }
}

function loadUserInfo() {
    const token = localStorage.getItem('auth_token');
    const cachedName  = localStorage.getItem('user_name')  || 'Nama Pengguna';
    const cachedEmail = localStorage.getItem('user_email') || 'email@email.com';
    const cachedAvatar = localStorage.getItem('user_avatar') || null;

    // Langsung set pake data cache dulu biar UI gak kosong nunggu API
    setSidebarUser({ name: cachedName, email: cachedEmail, avatar: cachedAvatar });

    if (!token) return;

    fetch('/api/auth/me', {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(r => r.json())
    .then(body => {
        if (!body.success) return;
        
        const u = body.data;
        const displayName = [u.nama_depan, u.nama_belakang]
            .filter(Boolean).join(' ').trim() || u.username || cachedName;
        
        const email = u.email || cachedEmail;
        const avatar = u.foto_profil_url || u.foto_profil || null; // Ambil avatar dari API

        // Timpa tampilannya pake data yang paling fresh dari API
        setSidebarUser({ name: displayName, email: email, avatar: avatar });
        
        // Simpan update terbarunya ke cache
        localStorage.setItem('user_name', displayName);
        localStorage.setItem('user_email', email);
        if (avatar) {
            localStorage.setItem('user_avatar', avatar);
        }
    })
    .catch(() => {
        console.warn("Gagal fetch data user, tetap pakai cache.");
    });
}

function initTopbarDate() {
    const el = document.getElementById("topbar-date");
    if (el) el.textContent = formatMonthYear();
}

function validateImageFile(file) {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 1 * 1024 * 1024; // 1 MB

    if (!allowed.includes(file.type)) {
        return { valid: false, message: "Format file harus JPG atau PNG." };
    }
    if (file.size > maxSize) {
        return { valid: false, message: "Ukuran file maksimal 1 MB." };
    }
    return { valid: true };
}

document.addEventListener("DOMContentLoaded", () => {
    initTopbarDate();
    setActiveSidebar("profil");
    
    // Ini kuncinya Bro! Begitu halaman loading beres, fungsi get data jalan.
    loadUserInfo(); 
});

export { 
    showToast, 
    showConfirmModal, 
    closeModal, 
    formatMonthYear, 
    setActiveSidebar, 
    updateNavbarTitle, 
    showLoading, 
    hideLoading, 
    setSidebarUser, 
    loadUserInfo, 
    initTopbarDate, 
    validateImageFile 
};