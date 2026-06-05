import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // Muat semua env vars dengan prefix VITE_ untuk mode saat ini
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Dev server + Proxy dinamis ngikutin .env
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },

    // Pengaturan output build & routing banyak HTML
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),

          // Users - Auth
          userLogin:          resolve(__dirname, 'users/auth/login.html'),
          userRegister:       resolve(__dirname, 'users/auth/register.html'),
          userForgotPass:     resolve(__dirname, 'users/auth/forgot-password.html'),
          userVerifyOtp:      resolve(__dirname, 'users/auth/verify-otp.html'),
          userNewPassword:    resolve(__dirname, 'users/auth/new-password.html'),
          userGoogleCallback: resolve(__dirname, 'users/auth/google-callback.html'),

          // Users - Pages
          userDashboard: resolve(__dirname, 'users/dashboard/map-users.html'),
          userLaporan:   resolve(__dirname, 'users/laporan/report-users.html'),
          userProfil:    resolve(__dirname, 'users/profil/profile-users.html'),
          userRiwayat:   resolve(__dirname, 'users/riwayat/history-users.html'),

          // Admin
          adminLogin:     resolve(__dirname, 'admin/login/login-admin.html'),
          adminDashboard: resolve(__dirname, 'admin/dashboard/dashboard-admin.html'),
          adminLaporan:   resolve(__dirname, 'admin/laporan/report-admin.html'),
          adminPeta:      resolve(__dirname, 'admin/peta/peta-admin.html'),
          adminProfil:    resolve(__dirname, 'admin/profil/profile-admin.html'),
          adminRiwayat:   resolve(__dirname, 'admin/riwayat/history-admin.html'),
        }
      }
    },

    // Variabel env tersedia di client via import.meta.env.VITE_*
    envPrefix: 'VITE_'
  }
})
