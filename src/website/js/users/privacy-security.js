/**
 * privacy-security.js
 * Lestari — Logic untuk privacy-security.html
 */

import { getProfile, changePassword, deleteAccount } from './api.js';
import { showToast, showConfirmModal, showLoading, hideLoading, setSidebarUser } from './profile-common.js';

// ── Load sidebar user info ────────────────────────────────────
async function _loadSidebarProfile() {
    try {
        const response = await getProfile();
        const user = response.data || response;
        const fullName = user.nama_lengkap || user.username || 'Pengguna';
        setSidebarUser({
            name: fullName,
            email: user.email,
            avatar: user.foto_profil_url || user.foto_profil
        });
    } catch (_) {
        // tetap pakai cache dari common.js
    }
}

// ── Ganti Password ────────────────────────────────────────────
async function handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('old-password')?.value || '';
    const newPassword     = document.getElementById('new-password')?.value || '';
    const confirmPassword = document.getElementById('confirm-password')?.value || '';

    if (!currentPassword.trim()) {
        showToast('Sandi lama wajib diisi.', 'error'); return;
    }
    if (!newPassword) {
        showToast('Sandi baru wajib diisi.', 'error'); return;
    }
    if (newPassword.length < 8) {
        showToast('Sandi baru minimal 8 karakter.', 'error'); return;
    }
    if (confirmPassword !== newPassword) {
        showToast('Konfirmasi sandi tidak cocok.', 'error'); return;
    }

    const btnSave = document.querySelector('#form-change-password .btn--primary');
    showLoading(btnSave, 'Menyimpan...');

    try {
        await changePassword({
            current_password:      currentPassword,
            password:              newPassword,
            password_confirmation: confirmPassword,
        });
        showToast('Sandi berhasil diperbarui!', 'success');
        document.getElementById('form-change-password')?.reset();
    } catch (err) {
        console.error('[handleChangePassword] error:', err);
        showToast('Gagal mengubah sandi. Periksa kembali sandi lama Anda.', 'error');
    } finally {
        hideLoading(btnSave);
    }
}

// ── Hapus Akun ────────────────────────────────────────────────
async function handleDeleteAccount() {
    const confirmed = await showConfirmModal({
        title:       'Hapus Akun',
        message:     'Tindakan ini tidak dapat dibatalkan. Seluruh data Anda akan dihapus secara permanen. Apakah Anda yakin ingin menghapus akun?',
        confirmText: 'Hapus Akun',
        cancelText:  'Batal',
        confirmType: 'danger',
    });
    if (!confirmed) return;

    const password = window.prompt('Masukkan password Anda untuk konfirmasi penghapusan akun:');
    if (!password) {
        showToast('Penghapusan akun dibatalkan.', 'info');
        return;
    }

    const btnDelete = document.getElementById('btn-delete-account');
    showLoading(btnDelete, 'Menghapus...');

    try {
        await deleteAccount(password);
        localStorage.clear();
        const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || '/users/auth/login.html';
        window.location.href = LOGIN_PATH;
    } catch (err) {
        console.error('[handleDeleteAccount] error:', err);
        showToast(err?.message || 'Gagal menghapus akun. Periksa password Anda.', 'error');
        hideLoading(btnDelete);
    }
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const LOGIN_PATH = import.meta.env.VITE_PATH_LOGIN || '/users/auth/login.html';
    if (!localStorage.getItem('auth_token')) {
        window.location.href = LOGIN_PATH;
        return;
    }

    await _loadSidebarProfile();

    // Binding form ganti sandi
    document.getElementById('form-change-password')
        ?.addEventListener('submit', handleChangePassword);

    // Binding tombol hapus akun
    document.getElementById('btn-delete-account')
        ?.addEventListener('click', handleDeleteAccount);

    // Show/hide password toggle (ikon mata)
    document.querySelectorAll('.form__password-toggle').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            this.classList.toggle('form__password-toggle--hide', isHidden);
        });
    });
});