export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  nitro: {
    experimental: {
      bodyParser: { maxBodySize: 50 * 1024 * 1024 }
    }
  },
  app: {
    head: {
      title: 'GCA - Marketplace Garry\'s Mod',
      meta: [
        { name: 'description', content: 'GCA structure la distribution d\'assets Garry\'s Mod.' }
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
      apiBase: '/api',
      apiOrigin: 'https://gsa-tresingo.vercel.app'
    }
  }
})
