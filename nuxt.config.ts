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
      title: 'GSA Store - Des assets premium, prêts à déployer.',
      meta: [
        { name: 'description', content: 'Mapping, particules, HUD, animations et UI : des assets premium vérifiés par l\'équipe GSA, prêts à déployer.' },
        { property: 'og:title', content: 'Des assets premium, prêts à déployer' },
        { property: 'og:description', content: 'Mapping, particules, HUD, animations et UI : des assets premium vérifiés par l\'équipe GSA, prêts à déployer.' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:site_name', content: 'GSA Store' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://gsa-store.fr/og-share-v2.png' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'GSA Store : pas une boutique, un standard. Assets premium prêts à déployer' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://gsa-store.fr/og-share-v2.png' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
        { name: 'theme-color', content: '#2f7df6' }
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
  // régénérées en arrière-plan - plus de cold start Vercel pour les visiteurs.
  routeRules: {
    // Pas de SWR sur les pages dynamiques : le HTML est une coquille (données fetchées
    // côté client via /api/*) et le SWR gardait l'ancienne version 60 s - l'utilisateur
    // devait refresh pour voir un prix changé côté admin.
    '/': { swr: false },
    '/catalogue': { swr: false },
    '/product/**': { swr: false },
    '/about': { swr: false },
    '/prestation': { swr: false }
  }
})
