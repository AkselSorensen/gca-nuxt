<template>
  <Teleport to="body" :disabled="!expanded">
    <div class="rte-wrap" :class="{ 'rte-overlay': expanded }" @keydown.esc.stop="expanded = false">
      <div class="rte-panel" :class="{ 'rte-panel-open': expanded }">
        <div class="rte-toolbar" role="toolbar" aria-label="Mise en forme du texte">
          <button type="button" class="rte-btn" title="Gras (Ctrl+B)" aria-label="Gras" @mousedown.prevent @click="cmd('bold')"><b>G</b></button>
          <button type="button" class="rte-btn" title="Italique (Ctrl+I)" aria-label="Italique" @mousedown.prevent @click="cmd('italic')"><i>I</i></button>
          <button type="button" class="rte-btn" title="Souligné (Ctrl+U)" aria-label="Souligné" @mousedown.prevent @click="cmd('underline')"><u>S</u></button>
          <button type="button" class="rte-btn" title="Barré" aria-label="Barré" @mousedown.prevent @click="cmd('strikeThrough')"><s>B</s></button>
          <span class="rte-sep"></span>
          <button type="button" class="rte-btn rte-wide" title="Titre" aria-label="Titre" @mousedown.prevent @click="cmd('formatBlock', 'h2')">Titre</button>
          <button type="button" class="rte-btn rte-wide" title="Sous-titre" aria-label="Sous-titre" @mousedown.prevent @click="cmd('formatBlock', 'h3')">Sous-titre</button>
          <button type="button" class="rte-btn rte-wide" title="Paragraphe" aria-label="Paragraphe normal" @mousedown.prevent @click="cmd('formatBlock', 'p')">Texte</button>
          <span class="rte-sep"></span>
          <button type="button" class="rte-btn" title="Liste à puces" aria-label="Liste à puces" @mousedown.prevent @click="cmd('insertUnorderedList')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>
          </button>
          <button type="button" class="rte-btn" title="Liste numérotée" aria-label="Liste numérotée" @mousedown.prevent @click="cmd('insertOrderedList')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><path d="M4 5l1-1v4M4 12h2l-2 2.5h2M4 17h2v1.5H4.5V20H6" stroke-width="1.4"/></svg>
          </button>
          <button type="button" class="rte-btn" title="Citation" aria-label="Citation" @mousedown.prevent @click="cmd('formatBlock', 'blockquote')">“ ”</button>
          <span class="rte-sep"></span>
          <button type="button" class="rte-btn" title="Insérer un lien" aria-label="Insérer un lien" @mousedown.prevent @click="addLink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
          </button>
          <button type="button" class="rte-btn rte-wide" title="Effacer la mise en forme" aria-label="Effacer la mise en forme" @mousedown.prevent @click="cmd('removeFormat')">Effacer</button>
          <span class="rte-grow"></span>
          <button type="button" class="rte-btn rte-wide rte-expand" :aria-label="expanded ? 'Réduire l\'éditeur' : 'Agrandir l\'éditeur'" @mousedown.prevent @click="toggleExpand">
            {{ expanded ? 'Terminer' : 'Agrandir' }}
          </button>
        </div>
        <div
          ref="area"
          class="rte-area"
          :class="{ 'is-empty': isEmpty }"
          :style="{ minHeight: expanded ? '' : minHeight + 'px' }"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          :aria-label="label || placeholder"
          :data-placeholder="placeholder"
          @input="onInput"
          @blur="onInput"
          @paste="onPaste"
        ></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  label?: string
  minHeight?: number
}>(), { modelValue: '', placeholder: '', label: '', minHeight: 140 })
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const area = ref<HTMLElement | null>(null)
const expanded = ref(false)
const isEmpty = ref(true)
let lastEmitted = props.modelValue || ''

function refreshEmpty() {
  const el = area.value
  isEmpty.value = !el || (el.textContent || '').trim() === '' && !el.querySelector('img,hr')
}

function load(value: string) {
  if (!area.value) return
  area.value.innerHTML = toEditorHtml(value)
  refreshEmpty()
}

onMounted(() => load(props.modelValue))

// Valeur modifiée depuis l'extérieur (ouverture d'un autre article, réinitialisation du formulaire)
watch(() => props.modelValue, (v) => {
  if ((v || '') !== lastEmitted) {
    lastEmitted = v || ''
    load(v || '')
  }
})

function onInput() {
  const el = area.value
  if (!el) return
  refreshEmpty()
  const html = isEmpty.value ? '' : sanitizeHtml(el.innerHTML)
  if (html !== lastEmitted) {
    lastEmitted = html
    emit('update:modelValue', html)
  }
}

function cmd(name: string, value?: string) {
  area.value?.focus()
  // formatBlock exige les chevrons sur certains navigateurs
  document.execCommand(name, false, name === 'formatBlock' && value ? `<${value}>` : value)
  onInput()
}

function addLink() {
  const url = window.prompt('Adresse du lien (https://...)', 'https://')
  if (!url || !/^(https?:\/\/|mailto:)/i.test(url.trim())) return
  cmd('createLink', url.trim())
}

// Collage en texte brut : pas de mise en forme venue d'ailleurs
function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
  onInput()
}

function toggleExpand() {
  expanded.value = !expanded.value
  nextTick(() => area.value?.focus())
}

watch(expanded, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.rte-wrap { --rte-bg:#151618; --rte-bar:#1b1c1f; --rte-line:rgba(255,255,255,.1); --rte-text:#ececee; --rte-muted:#7e8189; --rte-accent:#8ea8ff; width:100%; font-family:'IBM Plex Sans','Inter',system-ui,sans-serif; }
.rte-panel { display:flex; flex-direction:column; border:1px solid var(--rte-line); border-radius:10px; background:var(--rte-bg); overflow:hidden; }
.rte-panel:focus-within { border-color:var(--rte-accent); }
.rte-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:2px; padding:6px; border-bottom:1px solid var(--rte-line); background:var(--rte-bar); }
.rte-btn { min-width:32px; height:32px; padding:0 8px; display:inline-grid; place-items:center; border:0; border-radius:6px; background:transparent; color:#c5c8ce; font:500 14px inherit; cursor:pointer; transition:background-color .15s,color .15s; }
.rte-btn:hover { background:rgba(255,255,255,.08); color:#fff; }
.rte-btn:focus-visible { outline:2px solid var(--rte-accent); outline-offset:1px; }
.rte-wide { font-size:13px; font-weight:400; }
.rte-sep { width:1px; height:20px; margin:0 6px; background:var(--rte-line); }
.rte-grow { flex:1; }
.rte-expand { background:rgba(255,255,255,.06); }
.rte-area { position:relative; padding:14px 16px; color:var(--rte-text); font-size:15px; line-height:1.7; outline:none; overflow-y:auto; max-height:420px; overflow-wrap:anywhere; }
.rte-area.is-empty::before { content:attr(data-placeholder); color:var(--rte-muted); pointer-events:none; position:absolute; top:14px; left:16px; }
.rte-area :deep(p), .rte-area :deep(div) { margin:0 0 10px; }
.rte-area :deep(h2) { font-size:1.35em; font-weight:600; margin:16px 0 8px; }
.rte-area :deep(h3) { font-size:1.15em; font-weight:600; margin:14px 0 6px; }
.rte-area :deep(ul), .rte-area :deep(ol) { padding-left:24px; margin:0 0 10px; }
.rte-area :deep(blockquote) { margin:0 0 10px; padding:4px 14px; border-left:3px solid var(--rte-line); color:#a3a6ad; }
.rte-area :deep(a) { color:var(--rte-accent); text-decoration:underline; }
.rte-area :deep(code) { padding:1px 5px; border-radius:4px; background:rgba(255,255,255,.08); font-size:.9em; }

/* Grande page d'écriture */
.rte-overlay { position:fixed; inset:0; z-index:100001; display:grid; place-items:center; padding:24px; background:rgba(0,0,0,.72); }
.rte-panel-open { width:min(1000px,100%); height:min(86vh,100%); box-shadow:0 20px 60px rgba(0,0,0,.5); }
.rte-panel-open .rte-area { flex:1; max-height:none; padding:28px 36px; font-size:16px; }
.rte-panel-open .rte-area.is-empty::before { top:28px; left:36px; }
</style>
