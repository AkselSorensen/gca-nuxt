<template>
  <div v-if="visible" ref="toastRef" class="toast-wrap" :class="type">
    <div class="toast-icon">
      <svg v-if="type === 'success'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <svg v-else-if="type === 'error'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <div class="toast-body">
      <strong>{{ title }}</strong>
      <p v-if="message">{{ message }}</p>
    </div>
    <button class="toast-close" @click="close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  </div>
</template>

<script setup lang="ts">
const visible = ref(false)
const type = ref<'success' | 'error' | 'info'>('info')
const title = ref('')
const message = ref('')
const toastRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

function show(t: string, msg: string, duration = 3000) {
  type.value = (t === 'success' || t === 'error') ? t : 'info'
  title.value = t === 'success' ? 'Succès' : t === 'error' ? 'Erreur' : 'Information'
  message.value = msg
  visible.value = true
  if (timer) clearTimeout(timer)
  if (duration > 0) timer = setTimeout(() => { visible.value = false }, duration)
}

async function animateIn() {
  if (!toastRef.value) return
  let gsap: any
  try { const mod = await import('gsap'); gsap = mod.default } catch { return }
  gsap.set(toastRef.value, { opacity: 0, x: 40, scale: .95 })
  gsap.to(toastRef.value, { opacity: 1, x: 0, scale: 1, duration: .35, ease: 'back.out(1.7)' })
}

async function animateOut(cb: () => void) {
  if (!toastRef.value) { cb(); return }
  let gsap: any
  try { const mod = await import('gsap'); gsap = mod.default } catch { cb(); return }
  gsap.to(toastRef.value, { opacity: 0, x: 40, scale: .95, duration: .2, ease: 'power2.in', onComplete: cb })
}

function close() { animateOut(() => { visible.value = false }) }

defineExpose({ show, close })
</script>

<style scoped>
.toast-wrap { position:fixed;top:20px;right:20px;z-index:99999;display:flex;align-items:flex-start;gap:14px;padding:16px 20px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;min-width:320px;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,0.3);pointer-events:auto; }
.toast-wrap.error { border-color:rgba(248,113,113,0.2); }
.toast-wrap.success { border-color:rgba(110,231,183,0.2); }
.toast-icon { flex-shrink:0;margin-top:1px; }
.toast-body { flex:1; }
.toast-body strong { display:block;font-size:.9rem;font-weight:700; }
.toast-body p { margin:4px 0 0;font-size:.82rem;color:var(--text-secondary);line-height:1.4; }
.toast-close { flex-shrink:0;width:28px;height:28px;border-radius:6px;border:none;background:rgba(255,255,255,0.04);color:var(--text-muted);cursor:pointer;display:grid;place-items:center; }
.toast-close:hover { background:rgba(255,255,255,0.08);color:var(--text); }
</style>
