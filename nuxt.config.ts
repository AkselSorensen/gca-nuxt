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
      title: 'GSA - Marketplace Garry\'s Mod',
      meta: [
        { name: 'description', content: 'GSA structure la distribution d\'assets Garry\'s Mod.' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN || 'https://gsa-tresingo.vercel.app'
    }
  }
})
