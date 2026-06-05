/**
 * laporan-validation.js
 * Step 1 form validation helpers
 */

/**
 * Validate Step 1 fields
 * @param {object} reportData
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateStep1(reportData) {
  const errors = {}

  if (!reportData.judul || reportData.judul.trim().length < 5) {
    errors.judul = 'Judul wajib diisi, minimal 5 karakter.'
  } else if (reportData.judul.trim().length > 100) {
    errors.judul = 'Judul maksimal 100 karakter.'
  }

  if (!reportData.kategori) {
    errors.kategori = 'Pilih salah satu kategori.'
  }

  if (!reportData.deskripsi || reportData.deskripsi.trim().length < 20) {
    errors.deskripsi = 'Deskripsi wajib diisi, minimal 20 karakter.'
  } else if (reportData.deskripsi.trim().length > 1000) {
    errors.deskripsi = 'Deskripsi maksimal 1000 karakter.'
  }

  // Foto is optional; validate only if present
  if (reportData.foto) {
    const maxSize = 512 * 1024 // 512 KB
    if (reportData.foto.size > maxSize) {
      errors.foto = 'Ukuran foto maksimal 512 KB.'
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowed.includes(reportData.foto.type)) {
      errors.foto = 'Format foto harus JPG atau PNG.'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate Step 2 location
 * @param {object} reportData
 */
export function validateStep2(reportData) {
  if (reportData.latitude === null || reportData.longitude === null || !reportData.lokasi) {
    return { valid: false, message: 'Silakan pilih lokasi terlebih dahulu.' }
  }
  return { valid: true }
}


export function showFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId)
  const err   = document.getElementById(errorId)
  if (field) field.classList.add('error')
  if (err) {
    err.textContent = message
    err.classList.add('visible')
  }
}

export function clearAllErrors() {
  document.querySelectorAll('.input-field, .textarea-field').forEach(el => el.classList.remove('error'))
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = ''
    el.classList.remove('visible')
  })
}
