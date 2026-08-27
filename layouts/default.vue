<template>
  <div class="site-shell">
    <AppHeader />
    <main id="main-content"><slot /></main>
    <AppFooter />
    <AppLoader :visible="showLoader" />
    <CookieConsent />
  </div>
</template>

<script setup lang="ts">
// ─── Meta SEO par défaut du site (les pages les écrasent via useSeoMeta) ───
useHead({
  title: 'GSA Store — Des assets premium, prêts à déployer.',
  meta: [
    { name: 'description', content: "GSA Store structure la distribution d'assets premium pour Garry's Mod et plus : mapping, particules, HUD, animations. Vérification humaine sur chaque produit." },
    { property: 'og:site_name', content: 'GSA Store' },
    { property: 'og:locale', content: 'fr_FR' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://gsa-store.fr' },
    { property: 'og:image', content: 'https://gsa-store.fr/logo.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})

// Loader stylé entre les pages : apparaît si la navigation dépasse ~250ms
const { isLoading } = useLoadingIndicator()
const showLoader = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(isLoading, (value) => {
  if (timer) clearTimeout(timer)
  if (value) {
    timer = setTimeout(() => { showLoader.value = true }, 250)
  } else {
    showLoader.value = false
  }
})
</script>

<style scoped>
.site-shell {
  display:flex; flex-direction:column; min-height:100vh;
  background: radial-gradient(ellipse at top right, rgba(47,125,246,0.06), transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(108,92,231,0.04), transparent 50%), var(--bg);
}
#main-content { flex:1; }
</style>
