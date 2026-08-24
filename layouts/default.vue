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
