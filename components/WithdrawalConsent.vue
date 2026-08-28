<template>
  <Teleport to="body">
    <Transition name="drop">
      <div v-if="open" class="wa-overlay" @click.self="cancel">
        <div class="wa-card anim-scale">
          <div class="wa-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
          </div>
          <h3>{{ t('wa.title') }}</h3>
          <p class="wa-text" v-html="t('wa.desc1')"></p>
          <p class="wa-text" v-html="t('wa.desc2')"></p>
          <label class="wa-check" :class="{ checked: ack }">
            <input type="checkbox" v-model="ack" />
            <span class="wa-box"><svg v-if="ack" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>
            {{ t('wa.ack') }}
          </label>
          <div class="wa-actions">
            <button class="btn-cancel" @click="cancel">{{ t('wa.cancel') }}</button>
            <button class="btn-confirm" :disabled="!ack" @click="confirm">{{ t('wa.confirm') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
const ack = ref(false)
const { t } = useLang()

watch(() => props.open, (v) => { if (v) ack.value = false })

function confirm() { if (ack.value) emit('confirm') }
function cancel() { emit('cancel') }
</script>

<style scoped>
.wa-overlay { position: fixed; inset: 0; z-index: 350; display: grid; place-items: center; background: rgba(10,14,20,0.7); backdrop-filter: blur(6px); }
.wa-card { width: min(520px, 92vw); padding: 30px 28px; border-radius: 18px; border: 1px solid var(--border); background: var(--bg-card); box-shadow: 0 24px 64px rgba(0,0,0,0.4); display: grid; gap: 14px; }
.wa-icon { width: 54px; height: 54px; border-radius: 14px; background: rgba(47,125,246,0.08); border: 1px solid rgba(47,125,246,0.15); display: grid; place-items: center; }
.wa-card h3 { margin: 0; font-size: 1.1rem; font-weight: 800; line-height: 1.3; }
.wa-text { margin: 0; color: var(--text-secondary); font-size: .9rem; line-height: 1.7; }
.wa-check { display: flex; align-items: flex-start; gap: 10px; padding: 14px; border-radius: 10px; background: rgba(47,125,246,0.06); border: 1px solid rgba(47,125,246,0.15); cursor: pointer; font-size: .85rem; line-height: 1.6; color: var(--text-secondary); }
.wa-check.checked { border-color: var(--primary); color: var(--text); }
.wa-box { width: 18px; height: 18px; min-width: 18px; border-radius: 5px; border: 1px solid var(--border); background: var(--bg-surface); display: grid; place-items: center; margin-top: 1px; transition: all .2s; }
.wa-check.checked .wa-box { background: var(--primary); border-color: var(--primary); }
.wa-check input { display: none; }
.wa-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-cancel { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-weight: 600; font-size: .88rem; cursor: pointer; transition: background .2s; }
.btn-cancel:hover { background: rgba(255,255,255,0.04); }
.btn-confirm { flex: 2; padding: 12px; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-weight: 700; font-size: .88rem; cursor: pointer; transition: all .2s; }
.btn-confirm:hover:not(:disabled) { filter: brightness(1.1); }
.btn-confirm:disabled { opacity: .4; cursor: not-allowed; }
</style>
