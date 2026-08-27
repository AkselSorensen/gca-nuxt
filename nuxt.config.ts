export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  typescript: { shim: false, typeCheck: false },
  nitro: {
    externals: {
      inline: ['stripe']
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'GSA Store — Des assets premium, prêts à déployer.',
      meta: [
        { name: 'description', content: 'GSA Store — Des assets premium, prêts à déployer.' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:site_name', content: 'GSA Store' },
        { property: 'og:image', content: 'https://gsa-store.fr/og-banner.png' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      // Backend Express désormais intégré dans le même déploiement Nuxt
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN || ''
    }
  },
  // Cache CDN (ISR) : les pages publiques sont servies depuis le CDN et
  // régénérées en arrière-plan — plus de cold start Vercel pour les visiteurs.
  routeRules: {
    '/': { swr: 60 },
    '/catalogue': { swr: 60 },
    '/product/**': { swr: 60 },
    '/about': { swr: 3600 },
    '/prestation': { swr: 3600 }
  }
})
