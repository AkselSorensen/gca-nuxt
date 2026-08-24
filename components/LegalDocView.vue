<template>
  <div ref="pageRef" class="page-static">
    <div class="container legal-wrap">
      <div class="page-header anim-up">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="legal-content anim-card">
        <div v-for="(block, i) in blocks" :key="i" class="legal-block">
          <h2 v-if="block.type === 'h1'">{{ block.text }}</h2>
          <h3 v-else-if="block.type === 'h2'">{{ block.text }}</h3>
          <h4 v-else-if="block.type === 'h3'">{{ block.text }}</h4>
          <ul v-else-if="block.type === 'ul'">
            <li v-for="(li, j) in block.items" :key="j"><span v-html="renderInline(li)"></span></li>
          </ul>
          <p v-else-if="block.type === 'p'"><span v-html="renderInline(block.text)"></span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ title: string; subtitle?: string; content: string }>()
const pageRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})

// Parse le markdown extrait des PDFs : # / ## / ###, listes -, paragraphes
const blocks = computed(() => {
  const out: any[] = []
  let list: string[] | null = null
  for (const raw of props.content.split('\n')) {
    const line = raw.trim()
    if (!line) {
      if (list) { out.push({ type: 'ul', items: list }); list = null }
      continue
    }
    if (line.startsWith('### ')) { if (list) { out.push({ type: 'ul', items: list }); list = null } out.push({ type: 'h3', text: line.slice(4) }); continue }
    if (line.startsWith('## ')) { if (list) { out.push({ type: 'ul', items: list }); list = null } out.push({ type: 'h2', text: line.slice(3) }); continue }
    if (line.startsWith('# ')) { if (list) { out.push({ type: 'ul', items: list }); list = null } out.push({ type: 'h1', text: line.slice(2) }); continue }
    if (line.startsWith('- ') || line.startsWith('•') || line.startsWith('◦')) {
      const item = line.replace(/^[-•◦]\s*/, '')
      if (!list) list = []
      list.push(item)
      continue
    }
    if (list) { out.push({ type: 'ul', items: list }); list = null }
    out.push({ type: 'p', text: line })
  }
  if (list) out.push({ type: 'ul', items: list })
  return out
})

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
}
</script>

<style scoped>
.page-static { padding:40px 0 64px; }
.legal-wrap { max-width:860px; }
.page-header { margin-bottom:40px; }
.page-header h1 { font-size:2rem;font-weight:900;letter-spacing:-.03em; }
.page-header p { color:var(--text-secondary);margin-top:8px;font-size:.9rem; }
.legal-content { display:grid;gap:16px; }
.legal-block { padding:26px 30px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:10px; }
.legal-block h2 { margin:0;font-size:1.25rem;font-weight:800;letter-spacing:-.02em;color:var(--primary); }
.legal-block h3 { margin:0;font-size:1.05rem;font-weight:700; }
.legal-block h4 { margin:0;font-size:.95rem;font-weight:700;color:var(--text-secondary); }
.legal-block p { margin:0;color:var(--text-secondary);font-size:.93rem;line-height:1.75; }
.legal-block ul { margin:0;padding-left:20px;display:grid;gap:5px; }
.legal-block li { color:var(--text-secondary);font-size:.92rem;line-height:1.65; }
.legal-block strong { color:var(--text); }
.legal-block code { font-size:.8rem;background:rgba(47,125,246,0.08);padding:1px 6px;border-radius:5px;color:var(--primary); }
</style>
