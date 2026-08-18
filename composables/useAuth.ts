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
      const res = await $fetch(api + '/api/me', {
        credentials: 'include'
      })
      // res = { authenticated, user, cart } — ne PAS affecter l'objet entier
      // (res.user null => user.value = null, pas l'objet {authenticated:false})
      user.value = res?.user || null
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
    // Rechargement complet : garantit que le cookie supprimé est bien pris en
    // compte et que checkAuth repart de zéro (navigateTo gardait l'état fantôme)
    window.location.href = '/'
  }

  return { user, loading, checkAuth, login, register, logout }
}
