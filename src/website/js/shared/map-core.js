// ==================================================================
// map-core.js — Shared Map Utilities untuk Lestari Website
// ==================================================================

/**
 * Konfigurasi Warna dan Ikon Kategori Laporan
 */
export const CATEGORY_CONFIG = {
  sampah: {
    color: '#A40000',
    label: 'Sampah',
    legendSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#A40000">
      <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5 2v8h1v-8h-1zm3 0v8h1v-8h-1zM8 4h8v2H8V4z"/>
    </svg>`
  },
  banjir: {
    color: '#53B6FE',
    label: 'Banjir',
    legendSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#53B6FE">
      <path d="M12 3L4 9v4.5c1.1-.3 2.3-.3 3.5.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8.4 0 .7-.1 1.1-.2V9l-8-6z"/>
      <path d="M2 16.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3v2.5c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z"/>
      <path d="M2 20.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3V23c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z" opacity=".6"/>
    </svg>`
  },
  polusi: {
    color: '#7A7A79',
    label: 'Polusi',
    legendSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#7A7A79">
      <path d="M2 21h20v-2H2v2zm2-2v-7l5 2.5V12l5 2.5V12l5 2.5V19H4z"/>
      <path d="M17 9.5a2.5 2.5 0 0 0-1.6-2.3 3.5 3.5 0 0 0-6.8-1A2.5 2.5 0 0 0 8 11h9a2.5 2.5 0 0 0 0-1.5z" opacity=".7"/>
    </svg>`
  },
  penebangan: {
    color: '#884C08',
    label: 'Penebangan',
    legendSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#884C08">
      <rect x="10" y="3" width="4" height="19" rx="1"/>
      <path d="M14 6l5-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2l-5-2V6z"/>
      <path d="M10 6.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2v-3z" opacity=".6"/>
    </svg>`
  },
  'isu air': {
    color: '#1674DB',
    label: 'Isu Air',
    legendSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#1674DB">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/>
    </svg>`
  },
  lainnya: {
    color: '#3A3A3A',
    label: 'Lainnya',
    legendSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#3A3A3A">
      <circle cx="5"  cy="12" r="2.2"/>
      <circle cx="12" cy="12" r="2.2"/>
      <circle cx="19" cy="12" r="2.2"/>
    </svg>`
  }
};

export function normalizeKey(kategori) {
  return (kategori || '').toLowerCase().trim();
}

export function getCategoryConfig(kategori) {
  return CATEGORY_CONFIG[normalizeKey(kategori)] || CATEGORY_CONFIG.lainnya;
}

/**
 * Inisialisasi Peta Leaflet dengan layer MapTiler
 * @param {string} containerId - ID elemen HTML kontainer peta
 * @param {Array} center - [lat, lng] array
 * @param {number} zoom - level zoom
 * @param {string} maptilerKey - MapTiler API Key
 * @param {boolean} interactive - Apakah zoom scroll aktif
 * @returns {L.Map} Leaflet Map instance
 */
export function initLeafletMap(containerId, center = [-7.5613, 110.8574], zoom = 15, maptilerKey, interactive = true) {
  // Pastikan Leaflet (L) tersedia secara global
  if (typeof L === 'undefined') {
    throw new Error('Leaflet library is not loaded');
  }

  const map = L.map(containerId, { 
    zoomControl: false, 
    scrollWheelZoom: interactive 
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer(
    `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerKey}`,
    {
      attribution: '© <a href="https://www.maptiler.com" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20
    }
  ).addTo(map);

  map.setView(center, zoom);

  // Perbaikan aksesibilitas & UX
  setTimeout(() => { map.invalidateSize(); }, 200);

  if (interactive) {
    const mapContainer = map.getContainer();
    mapContainer.setAttribute('tabindex', '0');
    mapContainer.addEventListener('mouseenter', () => { mapContainer.focus(); });
    mapContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) map.zoomIn();
      else map.zoomOut();
    }, { passive: false });
  }

  return map;
}

/**
 * Buat Leaflet DivIcon berbentuk pin SVG dengan inner icon kategori
 * @param {string} kategori 
 * @returns {L.DivIcon}
 */
export function createCategoryMarkerIcon(kategori) {
  const key = normalizeKey(kategori);
  const cfg = getCategoryConfig(key);
  const c = cfg.color;

  const innerIcons = {
    sampah:    `<path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5 2v8h1v-8h-1zm3 0v8h1v-8h-1zM8 4h8v2H8V4z"/>`,
    banjir:    `<path d="M12 3L4 9v4.5c1.1-.3 2.3-.3 3.5.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8.4 0 .7-.1 1.1-.2V9l-8-6z"/>
                <path d="M2 16.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3v2.5c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z"/>
                <path d="M2 20.5c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c1.2-.4 2.4-.4 3.5-.1.9.3 1.8.8 2.8.8s1.9-.5 2.8-.8c.6-.2 1.2-.3 1.8-.3V23c-.6 0-1.2.1-1.8.3-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-1.2-.4-2.4-.4-3.5-.1-.9.3-1.8.8-2.8.8s-1.9-.5-2.8-.8c-.6-.2-1.2-.3-1.8-.3v-2.5c.6 0 1.2.1 1.8.3z" opacity=".6"/>`,
    polusi:    `<path d="M2 21h20v-2H2v2zm2-2v-7l5 2.5V12l5 2.5V12l5 2.5V19H4z"/>
                <path d="M17 9.5a2.5 2.5 0 0 0-1.6-2.3 3.5 3.5 0 0 0-6.8-1A2.5 2.5 0 0 0 8 11h9a2.5 2.5 0 0 0 0-1.5z" opacity=".7"/>`,
    penebangan:`<rect x="10" y="3" width="4" height="19" rx="1"/>
                <path d="M14 6l5-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2l-5-2V6z"/>
                <path d="M10 6.5h-2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2v-3z" opacity=".6"/>`,
    'isu air': `<path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z"/>`,
    lainnya:   `<circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/>`
  };

  const inner = innerIcons[key] || innerIcons.lainnya;

  const svgHtml = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
  <defs>
    <filter id="dropshadow" x="-40%" y="-20%" width="180%" height="180%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="rgba(0,0,0,0.30)"/>
    </filter>
  </defs>
  <path d="M20 2C12.27 2 6 8.27 6 16c0 10.5 14 30 14 30S34 26.5 34 16C34 8.27 27.73 2 20 2z"
    fill="${c}" filter="url(#dropshadow)"/>
  <circle cx="20" cy="16" r="9" fill="white" opacity="0.93"/>
  <g transform="translate(12.2, 8.2) scale(0.65)" fill="${c}">${inner}</g>
</svg>`;

  return L.divIcon({
    html: svgHtml,
    className: 'lestari-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
}

/**
 * Buat Leaflet DivIcon berbentuk pin simpel (Hijau/Kuning untuk Admin)
 * @param {string} color - 'green' atau 'yellow'
 * @returns {L.DivIcon}
 */
export function createSimpleMarkerIcon(color) {
  const fill = color === 'green' ? '#22c55e' : '#f59e0b';
  const stroke = color === 'green' ? '#15803d' : '#b45309';
  
  const svgHtml = `
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C9.37 2 4 7.37 4 14c0 9.33 12 24 12 24s12-14.67 12-24C28 7.37 22.63 2 16 2z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <circle cx="16" cy="14" r="5" fill="white" opacity="0.9"/>
    </svg>`;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

/**
 * Geocode Search menggunakan Nominatim OpenStreetMap
 * @param {string} query 
 * @returns {Promise<Object|null>} Berisi {lat, lon} atau null jika tidak ketemu
 */
export async function geocodeSearch(query) {
  if (!query) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'id' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.warn('[MapCore] Geocode failed', e);
  }
  return null;
}
