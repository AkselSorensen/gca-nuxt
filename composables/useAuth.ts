export const useAuth = () => {
  const user = useState('auth-user', () => null)
  const loading = useState('auth-loading', () => true)
  const config = useRuntimeConfig()
  const api = config.public.apiOrigin

  // Auto-check auth on first call
  if (process.client && user.value === null) {
    checkAuth()
  }

  async function checkAuth() {
    try {
      const res = await $fetch(api + '/api/auth/me', {
      })
      user.value = res.user || res
    } catch { user.value = null }
    finally { loading.value = false }
  }

  async function login(email: string, password: string) {
    const res = await $fetch(api + '/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      body: { email, password }
    })
    user.value = res.user || res
    return res
  }

  async function register(data: { displayName: string; email: string; password: string; shopName?: string; discord?: string }) {
    const res = await $fetch(api + '/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      body: data
    })
    return res
  }

  async function logout() {
    try {
      await $fetch(api + '/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    user.value = null
    navigateTo('/')
  }

  return { user, loading, checkAuth, login, register, logout }
}
