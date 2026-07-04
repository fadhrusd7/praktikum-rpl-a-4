// ==================================================================
// utils.js — Shared Utilities untuk Lestari Website
// ==================================================================

/**
 * Format tanggal dari string ISO ke format ramah baca.
 * @param {string} isoString - Contoh: "2026-05-08T08:47:00Z"
 * @param {boolean} withTime - Tampilkan jam atau tidak
 * @returns {string} Contoh: "Senin, 8 Mei 2026\n8.47 WIB"
 */
export function formatTanggal(isoString, withTime = true) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const mons = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    
    const day = days[d.getDay()];
    const date = d.getDate();
    const mon = mons[d.getMonth()];
    const year = d.getFullYear();
    
    let res = `${day}, ${date} ${mon} ${year}`;
    
    if (withTime) {
      const hh = String(d.getHours()).padStart(2,'0');
      const mm = String(d.getMinutes()).padStart(2,'0');
      res += `\n${hh}.${mm} WIB`;
    }
    
    return res;
  } catch (e) {
    return '—';
  }
}

/**
 * Format bulan header
 * @param {Date} d - Objek Date
 * @returns {string} Contoh: "Mei 2026"
 */
export function formatBulan(d = new Date()) {
  const mons = ['Januari','Februari','Maret','April','Mei','Juni',
                'Juli','Agustus','September','Oktober','November','Desember'];
  return `${mons[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Escape string untuk mencegah XSS saat render HTML
 * @param {string} s 
 * @returns {string}
 */
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/**
 * Bangun URL public foto Supabase dengan path/URL fleksibel
 * @param {string} path - URL utuh, path relatif, atau identifier
 * @param {string} supabaseUrl - Base URL Supabase (dari env)
 * @param {string} bucketName - Nama bucket
 * @returns {string|null}
 */
export function buildSupabaseFotoUrl(path, supabaseUrl, bucketName = 'report-foto') {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (!supabaseUrl || !bucketName) return null;

  const cleanPath = String(path).replace(/^\/+/, '');
  const bucketPrefix = `${bucketName}/`;
  const objectPath = cleanPath.startsWith(bucketPrefix)
    ? cleanPath.slice(bucketPrefix.length)
    : cleanPath;

  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucketName}/${objectPath}`;
}

/**
 * Normalisasi tipe status (dari backend)
 * @param {string} status 
 * @returns {string}
 */
export function normalizeStatus(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'menunggu_validasi' || s === 'tertunda' || s === 'pending') return 'menunggu_validasi';
  if (s === 'terverifikasi' || s === 'divalidasi' || s === 'diproses' || s === 'verified') return 'terverifikasi';
  if (s === 'selesai' || s === 'done') return 'selesai';
  if (s === 'ditolak' || s === 'rejected') return 'ditolak';
  return s;
}

/**
 * Generate nomor laporan frontend format (LAP-DDMMYYYY-ID)
 * @param {string} createdAt 
 * @param {number|string} id 
 * @returns {string}
 */
export function generateLapNum(createdAt, id) {
  try {
    const d = new Date(createdAt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `LAP-${dd}${mm}${yyyy}-${String(id).padStart(4, '0')}`;
  } catch {
    return `LAP-000000-${String(id).padStart(4, '0')}`;
  }
}

/**
 * Format nama pelapor
 * @param {Object} user 
 * @returns {string}
 */
export function getReporterName(user) {
  if (!user) return '—';
  const fullName = user.nama_lengkap || user.username || 'Pengguna';
  return String(user.nama || fullName || user.username || user.email || '—').trim() || '—';
}

/**
 * Mapping username admin DB -> Label Display
 * @param {string} username 
 * @returns {string}
 */
export function mapAdminUsername(username) {
  if (!username) return 'Administrator';
  const match = String(username).match(/^admin(\d*)$/i);
  if (match) {
    const num = match[1] ? parseInt(match[1], 10) : 1;
    return `Administrator - ${num}`;
  }
  return username.charAt(0).toUpperCase() + username.slice(1);
}
