<template>
  <div class="site-shell">
    <AppHeader />
    <main id="main-content"><slot /></main>
    <AppFooter />
  </div>
</template>
<style scoped>
.site-shell {
  display:flex; flex-direction:column; min-height:100vh;
  background: radial-gradient(ellipse at top right, rgba(47,125,246,0.06), transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(108,92,231,0.04), transparent 50%), var(--bg);
}
#main-content { flex:1; }
</style>
