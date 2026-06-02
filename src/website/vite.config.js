// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // Root folder tempat file HTML berada
  root: 'src',

  build: {
    outDir: '../dist',
    emptyOutDir: true,

    rollupOptions: {
      // Daftarkan semua entry point HTML di sini
      input: {
        login:          'src/website/users/login.html',
        register:       'src/website/users/register.html',
        forgotPassword: 'src/website/users/forgot-password.html',
        verifyOtp:      'src/website/users/verify-otp.html',
        newPassword:    'src/website/users/new-password.html',
      }
    }
  },

  server: {
    port: 5173,
    open: '/pages/login.html'
  }
})