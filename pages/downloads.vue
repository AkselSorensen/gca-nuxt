<template>
  <div ref="pageRef" class="downloads-page">
    <div class="container">
      <div class="page-header anim-up">
        <h1>Mes téléchargements</h1>
        <p>Retrouvez tous vos achats et téléchargez vos fichiers.</p>
      </div>

      <div v-if="loading" class="loading-state anim-up">
        <div class="loader"></div>
        <span>Chargement de vos achats…</span>
      </div>

      <div v-else-if="error" class="error-state anim-up">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>Erreur</h2>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="fetchPurchases">Réessayer</button>
      </div>

      <div v-else-if="!purchases.length" class="empty-state anim-up">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <h2>Aucun téléchargement</h2>
        <p>Vous n'avez encore rien acheté sur la marketplace.</p>
        <NuxtLink to="/catalogue" class="btn-browse">Parcourir le catalogue</NuxtLink>
      </div>

      <div v-else class="purchases-list anim-up">
        <div v-for="item in purchases" :key="item.order_item_id" class="dl-card">
          <div class="dl-card-top">
            <div class="dl-thumb">
              <img :src="item.thumbnail || '/placeholder.svg'" :alt="item.title" />
            </div>
            <div class="dl-info">
              <h3 class="dl-title">{{ item.title }}</h3>
              <div class="dl-meta">
                <span class="dl-cat">{{ item.category_name }}</span>
                <span class="dl-date">Acheté le {{ formatDate(item.purchase_date) }}</span>
              </div>
              <div class="dl-price">{{ Number(item.price).toFixed(2) }}€</div>
            </div>
          </div>
          <div v-if="item.files?.length" class="dl-files">
            <div v-for="f in item.files" :key="f.id" class="dl-file">
              <div class="dl-file-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="dl-filename">{{ f.filename }}</span>
                <span class="dl-filesize">{{ formatSize(f.file_size) }}</span>
              </div>
              <button class="dl-btn" @click="download(item.order_item_id)" :disabled="downloading === item.order_item_id">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span v-if="downloading !== item.order_item_id">Télécharger</span>
                <span v-else>Chargement…</span>
              </button>
            </div>
          </div>
          <div v-else class="dl-nofiles">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Aucun fichier disponible</span>
          </div>
        </div>
      </div>
    </div>
    <ToastNotif ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const api = config.public.apiOrigin
const pageRef = ref<HTMLElement | null>(null)
const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)

const purchases = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const downloading = ref<number | null>(null)

async function fetchPurchases() {
  loading.value = true; error.value = ''
  try {
    const data = await $fetch(api + '/api/user/purchases', { credentials: 'include' })
    purchases.value = data.items || []
  } catch (e: any) {
    if (e?.statusCode === 401) {
      error.value = 'Vous devez être connecté pour voir vos achats.'
    } else {
      error.value = 'Impossible de charger vos achats. Réessayez plus tard.'
    }
  } finally {
    loading.value = false
  }
}

async function download(orderItemId: number) {
  downloading.value = orderItemId
  try {
    const data = await $fetch(api + '/api/download/' + orderItemId, { credentials: 'include' })
    
    if (data.files?.length === 1) {
      // Un seul fichier → redirect direct
      window.location.href = data.files[0].url
    } else if (data.files?.length > 1) {
      // Multiples fichiers → ouvrir dans des nouveaux onglets
      data.files.forEach((f: any) => window.open(f.url, '_blank'))
    }
    toastRef.value?.show('success', 'Téléchargement démarré ✓')
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Erreur de téléchargement'
    toastRef.value?.show('error', msg)
  } finally {
    downloading.value = null
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function formatSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' o'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)

  fetchPurchases()
})
</script>

<style scoped>
.downloads-page { padding: 32px 0 80px; min-height: 60vh; }

.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 1.6rem; font-weight: 900; letter-spacing: -.03em; margin: 0 0 6px; }
.page-header p { color: var(--text-secondary); font-size: .95rem; margin: 0; }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; color: var(--text-muted); }
.loader { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; text-align: center; }
.error-state h2 { margin: 0; font-size: 1.2rem; }
.error-state p { color: var(--text-secondary); margin: 0; }
.btn-retry { padding: 10px 24px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text); font-size: .85rem; font-weight: 600; cursor: pointer; font-family: inherit; }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; text-align: center; }
.empty-state h2 { margin: 0; font-size: 1.2rem; }
.empty-state p { color: var(--text-secondary); margin: 0; }
.btn-browse { margin-top: 8px; padding: 12px 28px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .9rem; font-weight: 700; text-decoration: none; }

.purchases-list { display: grid; gap: 16px; }

.purchase-card { display: flex; gap: 20px; padding: 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card); }
@media (max-width: 640px) { .purchase-card { flex-direction: column; } }

.purchase-thumb { width: 120px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg-surface); }
.purchase-thumb img { width: 100%; height: 100%; object-fit: cover; }

.purchase-info { flex: 1; min-width: 0; display: grid; gap: 8px; }
.purchase-info h3 { margin: 0; font-size: 1rem; font-weight: 700; }

.purchase-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: .78rem; color: var(--text-muted); }
.meta-cat { padding: 2px 8px; border-radius: 4px; background: rgba(47,125,246,0.06); border: 1px solid rgba(47,125,246,0.12); color: var(--primary); font-weight: 600; }
.meta-date { color: var(--text-secondary); }
.meta-price { font-weight: 700; color: var(--text); }

.purchase-files { display: grid; gap: 6px; margin-top: 4px; }
.file-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border); font-size: .82rem; }
.file-row svg { color: var(--primary); flex-shrink: 0; }
.file-name { flex: 1; font-weight: 600; color: var(--text); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { color: var(--text-muted); font-size: .75rem; flex-shrink: 0; }

.btn-dl { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 6px; border: none; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; flex-shrink: 0; }
.dl-btn:hover:not(:disabled) { opacity:.9; }
.dl-btn:disabled { opacity:.5;cursor:not-allowed; }

