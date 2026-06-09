import { apiFetch } from './api.js';

function initNotifications() {
    // Inject the notification bell into the page-header-right or topbar-right
    const headerRight = document.querySelector('.page-header-right') || document.querySelector('.topbar-right');
    if (!headerRight) return;

    const notifHTML = `
        <div class="notif-wrapper" style="position: relative;">
            <button id="btnNotif" class="btn-notif" style="background:none;border:none;cursor:pointer;position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;color:var(--gray-500);">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span id="notifBadge" class="notif-badge hidden" style="position:absolute;top:6px;right:6px;background:var(--green-500);color:white;font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;">0</span>
            </button>
            <div id="notifDropdown" class="notif-dropdown hidden" style="position:absolute;top:calc(100% + 10px);right:0;width:320px;max-height:420px;background:#fff;border:1px solid var(--gray-200);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,0.13);z-index:10000;overflow:hidden;display:none;flex-direction:column;">
                <div class="notif-header" style="padding:16px;border-bottom:1px solid var(--gray-200);display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="font-size:14px;font-weight:600;margin:0;">Notifikasi</h3>
                    <button id="btnMarkAllRead" style="background:none;border:none;color:var(--green-500);font-size:12px;font-weight:500;cursor:pointer;">Tandai dibaca</button>
                </div>
                <div id="notifList" class="notif-list" style="flex:1;overflow-y:auto;padding:8px 0;max-height:300px;">
                    <!-- List notifikasi -->
                </div>
                <div id="notifEmpty" class="notif-empty hidden" style="padding:32px 16px;text-align:center;color:var(--gray-400);font-size:13px;display:none;">
                    Belum ada notifikasi
                </div>
            </div>
        </div>
    `;

    // Insert before the user profile element if it exists
    const userProfile = headerRight.querySelector('.user-profile-top') || headerRight.lastElementChild;
    headerRight.insertAdjacentHTML('beforeend', notifHTML);

    const btnNotif = document.getElementById('btnNotif');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');
    const notifEmpty = document.getElementById('notifEmpty');
    const btnMarkAllRead = document.getElementById('btnMarkAllRead');

    let dropdownOpen = false;

    btnNotif.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownOpen = !dropdownOpen;
        if (dropdownOpen) {
            notifDropdown.style.display = 'flex';
            fetchNotifications();
        } else {
            notifDropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (dropdownOpen && !e.target.closest('.notif-wrapper')) {
            dropdownOpen = false;
            notifDropdown.style.display = 'none';
        }
    });

    btnMarkAllRead.addEventListener('click', async () => {
        try {
            const res = await apiFetch('/notifications/mark-read', { method: 'POST' });
            if (res.success) {
                notifBadge.classList.add('hidden');
                notifBadge.style.display = 'none';
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    });

    async function fetchUnreadCount() {
        try {
            const res = await apiFetch('/notifications/unread-count');
            if (res && res.success) {
                if (res.count > 0) {
                    notifBadge.textContent = res.count > 99 ? '99+' : res.count;
                    notifBadge.classList.remove('hidden');
                    notifBadge.style.display = 'flex';
                } else {
                    notifBadge.classList.add('hidden');
                    notifBadge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    }

    async function fetchNotifications() {
        try {
            const res = await apiFetch('/notifications');
            if (res && res.success) {
                const data = res.data;
                if (data.length === 0) {
                    notifList.style.display = 'none';
                    notifEmpty.style.display = 'block';
                } else {
                    notifList.style.display = 'block';
                    notifEmpty.style.display = 'none';
                    renderNotifications(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }

    function renderNotifications(data) {
        notifList.innerHTML = '';
        data.forEach(n => {
            const isReadStyle = n.is_read ? 'opacity: 0.7; background: transparent;' : 'background: var(--green-50);';
            const item = document.createElement('div');
            item.style.cssText = `padding: 12px 16px; border-bottom: 1px solid var(--gray-100); font-size: 13px; color: var(--gray-700); cursor: default; ${isReadStyle}`;
            
            const time = new Date(n.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
            
            item.innerHTML = `
                <div style="margin-bottom: 4px;">${n.pesan}</div>
                <div style="font-size: 11px; color: var(--gray-400);">${time}</div>
            `;
            notifList.appendChild(item);
        });
    }

    // Polling every 30 seconds
    fetchUnreadCount();
    setInterval(fetchUnreadCount, 30000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}
