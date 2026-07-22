export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  // If not client-side yet, skip middleware
  if (process.server) return

  if (to.path.startsWith('/seller/account') || to.path.startsWith('/admin')) {
    if (!user.value) return navigateTo('/login')
    if (user.value.role !== 'admin') return navigateTo('/')
  }

  if (to.path.startsWith('/seller')) {
    if (!user.value) return navigateTo('/login')
    if (user.value.role !== 'seller' && user.value.role !== 'admin') return navigateTo('/')
  }
})
