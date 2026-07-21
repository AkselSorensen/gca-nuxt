<template>
  <div v-if="visible" ref="overlayRef" class="modal-overlay" @click.self="cancel">
    <div ref="cardRef" class="modal-card">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="cancel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="cancel">Annuler</button>
        <button class="btn-confirm" :class="{ danger: danger }" @click="confirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const visible = ref(false)
const title = ref('Confirmer')
const message = ref('')
const confirmText = ref('Confirmer')
const danger = ref(false)
const overlayRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
let resolvePromise: ((v: boolean) => void) | null = null

function ask(opts: { title?: string; message: string; confirmText?: string; danger?: boolean }): Promise<boolean> {
  title.value = opts.title || 'Confirmer'
  message.value = opts.message
  confirmText.value = opts.confirmText || 'Confirmer'
  danger.value = opts.danger || false
  visible.value = true
  nextTick(() => animateIn())
  return new Promise(resolve => { resolvePromise = resolve })
}

async function animateIn() {
  if (!overlayRef.value || !cardRef.value) return
  let gsap: any
  try {
    const mod = await import('gsap')
    gsap = mod.default
  } catch { return }

  gsap.set(overlayRef.value, { opacity: 0 })
  gsap.set(cardRef.value, { opacity: 0, scale: .9, y: 20 })

  gsap.to(overlayRef.value, { opacity: 1, duration: .25, ease: 'power2.out' })
  gsap.to(cardRef.value, {
    opacity: 1, scale: 1, y: 0, duration: .35, ease: 'back.out(1.7)',
    delay: .05
  })
}

async function animateOut(cb: () => void) {
  if (!overlayRef.value || !cardRef.value) { cb(); return }
  let gsap: any
  try {
    const mod = await import('gsap')
    gsap = mod.default
  } catch { cb(); return }

  gsap.to(cardRef.value, { opacity: 0, scale: .9, y: 10, duration: .15, ease: 'power2.in' })
  gsap.to(overlayRef.value, { opacity: 0, duration: .15, ease: 'power2.in', delay: .05, onComplete: cb })
}

function confirm() {
  animateOut(() => { visible.value = false; resolvePromise?.(true) })
}
function cancel() {
  animateOut(() => { visible.value = false; resolvePromise?.(false) })
}

defineExpose({ ask })
</script>

<style scoped>
.modal-overlay { position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.6);display:grid;place-items:center;padding:20px;backdrop-filter:blur(4px); }
.modal-card { width:100%;max-width:380px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;overflow:hidden; }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0; }
.modal-header h3 { font-size:1.05rem;font-weight:700; }
.modal-close { width:28px;height:28px;border-radius:6px;border:none;background:rgba(255,255,255,0.04);color:var(--text-muted);cursor:pointer;display:grid;place-items:center; }
.modal-close:hover { background:rgba(255,255,255,0.08);color:var(--text); }
.modal-body { padding:14px 20px 20px; }
.modal-body p { font-size:.88rem;color:var(--text-secondary);line-height:1.5;margin:0; }
.modal-actions { display:flex;gap:8px;padding:0 20px 18px;justify-content:flex-end; }
.btn-cancel,.btn-confirm { padding:9px 18px;border-radius:8px;font-size:.83rem;font-weight:600;cursor:pointer;border:none;transition:all .15s;font-family:inherit; }
.btn-cancel { background:rgba(255,255,255,0.04);color:var(--text-secondary); }
.btn-cancel:hover { background:rgba(255,255,255,0.08);color:var(--text); }
.btn-confirm { background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff; }
.btn-confirm:hover { opacity:.9; }
.btn-confirm.danger { background:linear-gradient(135deg,#dc2626,#7c3aed); }
</style>
