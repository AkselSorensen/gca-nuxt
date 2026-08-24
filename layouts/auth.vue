<template>
  <div class="auth-shell">
    <slot />
    <AppLoader :visible="showLoader" />
  </div>
</template>

<script setup lang="ts">
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
.auth-shell { min-height:100vh; background: radial-gradient(ellipse at top right, rgba(47,125,246,0.08), transparent 50%), radial-gradient(ellipse at bottom left, rgba(108,92,231,0.06), transparent 50%), var(--bg); }
</style>
