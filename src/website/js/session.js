import { supabase } from './supabase.js'

// Redirect ke login jika belum login
export async function requireAuth(redirectTo = '/pages/login.html') {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    window.location.replace(redirectTo)
  }
  return session
}

// Redirect ke dashboard jika sudah login
export async function redirectIfLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role === 'admin') {
    window.location.replace('/admin/dashboard/dashboard-admin.html')
  } else {
    window.location.replace('/users/dashboard/dashboard.html')
  }
}