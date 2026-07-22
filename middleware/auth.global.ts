export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  // If not client-side yet, skip middleware
  if (process.server) return

  // Admin routes
  if (to.path.startsWith('/admin')) {
    if (!user.value) return navigateTo('/login')
    if (user.value.role !== 'admin') return navigateTo('/')
  }

  // Seller account (private)
  if (to.path.startsWith('/seller/account')) {
    if (!user.value) return navigateTo('/login')
    if (user.value.role !== 'seller' && user.value.role !== 'admin') return navigateTo('/')
  }
})
