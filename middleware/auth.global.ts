export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loading } = useAuth()

  // Wait for auth check to complete on client side
  if (process.client && loading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(loading, (val) => {
        if (!val) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Skip on server side
  if (process.server) return

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
