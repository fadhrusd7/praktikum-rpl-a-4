'use strict';

// ─── MapTiler Config ────────────────────────────────────────────────────────
const MAPTILER_KEY = 'roM71GFKfua5D23Vkj8P';

// ─── Data Kamus Penyesuaian Kategori ─────────────────────────────────────────
const kategoriConfig = {
  'sampah': { icon: '<i class="fa-solid fa-trash"></i>', color: '#EF4444', label: 'Sampah' },
  'banjir': { icon: '<i class="fa-solid fa-house-flood-water"></i>', color: '#3B82F6', label: 'Banjir' },
  'polusi': { icon: '<i class="fa-solid fa-smog"></i>', color: '#6B7280', label: 'Polusi' },
  'penebangan': { icon: '<i class="fa-solid fa-tree"></i>', color: '#F97316', label: 'Penebangan' },
  'air': { icon: '<i class="fa-solid fa-droplet"></i>', color: '#14B8A6', label: 'Air' },
  'lainnya': { icon: '<i class="fa-solid fa-circle-exclamation"></i>', color: '#1F2937', label: 'Lainnya' }
};

// ─── Database Laporan Aktif (Array Semacam Data Supabase) ────────────────────
const reports = [
  {
    id: 'LPR-0042',
    lat: -7.5613,
    lng: 110.8580,
    type: 'sampah',
    location: 'Jl. Kartika No. 12',
    reporter: 'Budi Santoso',
    time: '2 jam yang lalu',
    status: 'pending',
    statusLabel: 'Tertunda',
    desc: 'Terdapat tumpukan sampah yang tidak diangkut selama 3 hari di depan perumahan. Bau menyengat dan mengganggu warga sekitar.'
  },
  {
    id: 'LPR-0039',
    lat: -7.5645,
    lng: 110.8545,
    type: 'banjir',
    location: 'Sungai Buntu, RT 05',
    reporter: 'Siti Rahayu',
    time: '5 jam yang lalu',
    status: 'pending',
    statusLabel: 'Tertunda',
    desc: 'Air sungai meluap ke jalan raya karena hujan deras sejak semalam. Akses jalan terputus total.'
  },
  {
    id: 'LPR-0035',
    lat: -7.5580,
    lng: 110.8610,
    type: 'penebangan',
    location: 'Hutan Kota Blok C',
    reporter: 'Eko Prasetyo',
    time: '1 hari yang lalu',
    status: 'verified',
    statusLabel: 'Terverifikasi',
    desc: 'Terjadi penebangan 5 pohon trembesi secara ilegal di area barat hutan kota oleh oknum tak dikenal.'
  },
  {
    id: 'LPR-0031',
    lat: -7.5625,
    lng: 110.8620,
    type: 'air',
    location: 'Jl. Pahlawan Gang 3',
    reporter: 'Dewi Lestari',
    time: '2 hari yang lalu',
    status: 'pending',
    statusLabel: 'Tertunda',
    desc: 'Pipa saluran air bersih utama bocor parah sehingga warga satu gang tidak mendapat pasokan air.'
  },
  {
    id: 'LPR-0028',
    lat: -7.5595,
    lng: 110.8555,
    type: 'polusi',
    location: 'Kawasan Industri Km 4',
    reporter: 'Agus Wahyudi',
    time: '3 hari yang lalu',
    status: 'pending',
    statusLabel: 'Tertunda',
    desc: 'Cerobong pabrik mengeluarkan asap abu-abu hitam tebal berbau belerang menyengat setiap pagi hari.'
  }
];

// ─── DOM References (Sudah Bersih dari Element Overlay) ──────────────────────
const sidebar        = document.getElementById('sidebar');
const filterBtn      = document.getElementById('filterBtn');
const filterDropdown = document.getElementById('filterDropdown');
const addReportBtn   = document.getElementById('addReportBtn');
const detailPanel    = document.getElementById('detailPanel');
const detailClose    = document.getElementById('detailClose');
const pageTitle      = document.getElementById('pageTitle');
const navItems       = document.querySelectorAll('.nav-item');
const toast          = document.getElementById('toast');
const mapSection     = document.querySelector('.map-section');

// Field pengisian di dalam detail panel
const detailFields = {
  catIcon:     document.querySelector('.category-icon'),
  catLabel:    document.querySelector('.category-label'),
  loc:         document.querySelector('.detail-info-item:nth-child(1) .detail-info-value'),
  time:        document.querySelector('.detail-info-item:nth-child(2) .detail-info-value'),
  reporter:    document.querySelector('.detail-info-item:nth-child(3) .detail-info-value'),
  statusBadge: document.querySelector('.status-badge'),
  statusText:  document.querySelector('.detailTextStatus'),
  detailId:    document.querySelector('.detail-id'),
  descText:    document.querySelector('.detail-desc-text'),
};

// ─── Leaflet Map Init ────────────────────────────────────────────────────────
let map;

function initMap() {
  map = L.map('leafletMap', {
    center: [-7.5613, 110.8574],
    zoom: 15,
    zoomControl: false,
  });

  // Load MapTiler Satelit Hybrid Layer
  L.tileLayer(
    `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}` + MAPTILER_KEY,
    {
      attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20,
    }
  ).addTo(map);

  // Pasang control zoom di kanan bawah
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Loop bikin marker dinamis
  reports.forEach(r => addMarker(r));
}

// Bikin Pin Custom HTML memakai FontAwesome & Efek Pulse Sesuai Status
function makeIcon(report) {
  const config = kategoriConfig[report.type] || kategoriConfig['lainnya'];
  const isPulse = report.status === 'pending';
  
  const html = `
    <div class="lestari-pin" style="--pin-color: ${config.color}">
      <span class="pin-emoji" style="color: ${config.color}">${config.icon}</span>
      ${isPulse ? '<span class="pin-pulse" style="background: ${config.color}"></span>' : ''}
    </div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize: [42, 42],
    iconAnchor: [21, 42]
  });
}

function addMarker(report) {
  const marker = L.marker([report.lat, report.lng], { icon: makeIcon(report) }).addTo(map);
  marker.on('click', () => showDetail(report));
}

// ─── Detail Panel Inject Logic ───────────────────────────────────────────────
function showDetail(report) {
  const config = kategoriConfig[report.type] || kategoriConfig['lainnya'];

  // Inject element HTML secara dinamis
  if (detailFields.catIcon) detailFields.catIcon.innerHTML = config.icon;
  if (detailFields.catLabel) detailFields.catLabel.textContent = config.label;
  if (detailFields.loc) detailFields.loc.textContent = report.location;
  if (detailFields.time) detailFields.time.textContent = report.time;
  if (detailFields.reporter) detailFields.reporter.textContent = report.reporter;
  if (detailFields.detailId) detailFields.detailId.textContent = '#' + report.id;
  if (detailFields.descText) detailFields.descText.textContent = report.desc;
  if (detailFields.statusText) detailFields.statusText.textContent = report.statusLabel;

  // Setelan warna badge status
  if (detailFields.statusBadge) {
    const isVerified = report.status === 'verified';
    detailFields.statusBadge.className = 'status-badge ' + (isVerified ? 'status-verified' : 'status-pending');
  }

  // Set warna dekorasi border di kategori panel
  const catBar = document.querySelector('.detail-category');
  if (catBar) {
    catBar.style.borderLeftColor = config.color;
    catBar.style.background = config.color + '18'; // opacity warna 10%
  }

  // Buka panel + ubah grid layout peta
  detailPanel?.classList.add('open');
  mapSection?.classList.add('panel-open');

  // Set ulang aspect ratio peta biar kotaknya nyesuaiin layar sisa
  setTimeout(() => { if (map) map.invalidateSize(); }, 360);
}

function hideDetail() {
  detailPanel?.classList.remove('open');
  mapSection?.classList.remove('panel-open');
  setTimeout(() => { if (map) map.invalidateSize(); }, 360);
}

// ─── Sidebar Menu Click Handling ─────────────────────────────────────────────
navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    const page = item.dataset.page;
    const titles = { peta: 'Peta', laporan: 'Laporan', riwayat: 'Riwayat', profil: 'Profil' };
    if (pageTitle) pageTitle.textContent = titles[page] || page;

    showToast(`Halaman ${titles[page]} dibuka`);
  });
});

// ─── Pindah Halaman Tambah Laporan ───────────────────────────────────────────
addReportBtn?.addEventListener('click', () => {
  showToast('Membuka halaman form laporan...');
  setTimeout(() => {
    window.location.href = 'laporan.html';
  }, 400);
});

detailClose?.addEventListener('click', hideDetail);

// ─── Filter Dropdown Toggle ──────────────────────────────────────────────────
filterBtn?.addEventListener('click', e => {
  e.stopPropagation();
  if (!filterDropdown) return;
  const rect = filterBtn.getBoundingClientRect();
  filterDropdown.style.top  = (rect.bottom + window.scrollY + 8) + 'px';
  filterDropdown.style.left = (rect.left + window.scrollX) + 'px';
  filterDropdown.classList.toggle('active');
});

document.addEventListener('click', e => {
  if (filterDropdown && !filterDropdown.contains(e.target) && e.target !== filterBtn) {
    filterDropdown.classList.remove('active');
  }
});

document.querySelector('.btn-apply-filter')?.addEventListener('click', () => {
  filterDropdown?.classList.remove('active');
  showToast('Filter kriteria berhasil diterapkan');
});

// ─── Logout Simulation ───────────────────────────────────────────────────────
document.querySelector('.logout-btn')?.addEventListener('click', () => {
  showToast('Sampai jumpa! Mengalihkan sesi...');
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
});

// ─── Toast System ────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── Init on Loaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMap();
});