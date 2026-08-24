<template>
  <Transition name="loader-fade">
    <div v-if="visible" class="app-loader">
      <div class="loader-glow"></div>
      <img src="/logo.png" alt="GSA" class="loader-logo" />
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{ visible: boolean }>()
</script>

<style scoped>
.app-loader {
  position: fixed; inset: 0; z-index: 200;
  display: grid; place-items: center;
  background: rgba(10, 14, 20, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.loader-glow {
  position: absolute;
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(47,125,246,0.22) 0%, rgba(108,92,231,0.08) 55%, transparent 75%);
  animation: loader-glow 2.4s ease-in-out infinite;
}
.loader-logo {
  position: relative;
  width: 64px; height: 64px; border-radius: 16px;
  object-fit: contain;
  animation: loader-pulse 2.4s ease-in-out infinite;
}

@keyframes loader-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.9); opacity: 0.8; }
}
@keyframes loader-glow {
  0%, 100% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}

.loader-fade-enter-active, .loader-fade-leave-active { transition: opacity 0.3s ease; }
.loader-fade-enter-from, .loader-fade-leave-to { opacity: 0; }
</style>
