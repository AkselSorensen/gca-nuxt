<template>
  <Transition name="loader-fade">
    <div v-if="visible" class="app-loader">
      <div class="loader-ring">
        <img src="/logo.png" alt="GSA" class="loader-logo" />
        <span class="loader-spinner"></span>
      </div>
      <div class="loader-text">
        Chargement<span class="loader-dots"><i></i><i></i><i></i></span>
      </div>
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
  background: rgba(10, 14, 20, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.loader-ring {
  position: relative; width: 96px; height: 96px;
  display: grid; place-items: center;
}
.loader-logo {
  width: 56px; height: 56px; border-radius: 14px;
  object-fit: contain;
  animation: loader-breathe 1.6s ease-in-out infinite;
}
.loader-spinner {
  position: absolute; inset: 0; border-radius: 50%;
  border: 3px solid rgba(47, 125, 246, 0.15);
  border-top-color: var(--primary);
  border-right-color: var(--accent);
  animation: loader-spin 0.9s linear infinite;
}
.loader-text {
  margin-top: 22px; font-size: 0.92rem; font-weight: 600;
  color: var(--text-secondary); letter-spacing: 0.02em;
  display: flex; align-items: center;
}
.loader-dots { display: inline-flex; gap: 3px; margin-left: 6px; }
.loader-dots i {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--primary);
  animation: loader-dot 1.2s ease-in-out infinite;
}
.loader-dots i:nth-child(2) { animation-delay: 0.15s; }
.loader-dots i:nth-child(3) { animation-delay: 0.3s; }

@keyframes loader-spin { to { transform: rotate(360deg); } }
@keyframes loader-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.92); opacity: 0.85; }
}
@keyframes loader-dot {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
}

.loader-fade-enter-active, .loader-fade-leave-active { transition: opacity 0.25s ease; }
.loader-fade-enter-from, .loader-fade-leave-to { opacity: 0; }
</style>
