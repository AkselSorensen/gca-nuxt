<template>
  <div class="auth-shell">
    <slot />
  </div>
</template>
<style scoped>
.auth-shell { min-height:100vh; background: radial-gradient(ellipse at top right, rgba(47,125,246,0.08), transparent 50%), radial-gradient(ellipse at bottom left, rgba(108,92,231,0.06), transparent 50%), var(--bg); }
</style>
