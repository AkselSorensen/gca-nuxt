export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server side
  if (process.server) return

  const { user, checkAuth } = useAuth()

  // Ensure auth is checked before guarding routes
  if (!user.value) {
    await checkAuth()
  }

  // Admin routes - admin only
  if (to.path.startsWith('/admin')) {
    if (!user.value) return navigateTo('/login')
    if (user.value.role !== 'admin') return navigateTo('/')
  }

  // Seller account (private) - seller or admin
  if (to.path.startsWith('/seller/account')) {
    if (!user.value) return navigateTo('/login')
    if (user.value.role !== 'seller' && user.value.role !== 'admin') return navigateTo('/')
  }
})
