<template>
  <div ref="pageRef" class="downloads-page">
    <div class="container">
      <div class="page-header anim-up">
        <h1>{{ t('downloads.title') }}</h1>
        <p>{{ t('downloads.subtitle') }}</p>
      </div>

      <div v-if="loading" class="loading-state anim-up">
        <div class="loader"></div>
        <span>{{ t('downloads.loading') }}</span>
        <small v-if="waitMsg" class="wait-msg">{{ waitMsg }}</small>
      </div>

      <div v-else-if="error" class="error-state anim-up">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>{{ t('generic.error') }}</h2>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="fetchPurchases">{{ t('downloads.retry') }}</button>
      </div>

      <!-- Manuel : coller l'ID de session Stripe -->
      <div v-if="!checkoutSessionId && !purchases.length" class="manual-confirm anim-up">
        <p>{{ t('downloads.manual_sub') }}</p>
        <div class="manual-row">
          <input v-model="manualSessionId" placeholder="cs_test_..." class="manual-input" />
          <button class="btn-confirm" @click="confirmManual">{{ t('downloads.verify') }}</button>
        </div>
      </div>

      <div v-else-if="!purchases.length" class="empty-state anim-up">
        <!-- Paiement en attente de confirmation -->
        <div v-if="checkoutSessionId" class="confirm-banner">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f5b342" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>{{ t('downloads.pay_received') }}</strong><span>{{ t('downloads.processing') }}</span></div>
          <button class="btn-confirm" @click="retryConfirm">{{ t('downloads.verify') }}</button>
          <button v-if="checkoutSessionId && !retrying" class="btn-force" @click="forceConfirm" style="background:#ef4444;padding:8px 14px;border-radius:6px;border:none;color:#fff;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit;">{{ t('downloads.force_confirm') }}</button>
        </div>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <h2>{{ t('downloads.none') }}</h2>
        <p>{{ t('downloads.none_sub') }}</p>
        <NuxtLink to="/catalogue" class="btn-browse">{{ t('home.browse_catalog') }}</NuxtLink>
      </div>

      <div v-else class="purchases-list anim-up">
        <article v-for="item in purchases" :key="item.order_item_id" class="purchase-card">
          <NuxtLink class="purchase-thumb" :to="'/product/' + item.slug">
            <img :src="item.thumbnail || '/placeholder.svg'" :alt="item.title" />
          </NuxtLink>
          <div class="purchase-info">
            <NuxtLink :to="'/product/' + item.slug" class="purchase-title-link">
              <h3>{{ item.title }}</h3>
            </NuxtLink>
            <div class="purchase-meta">
              <span class="meta-cat">{{ item.category_name }}</span>
              <span class="meta-date">{{ t('downloads.purchased') }} {{ formatDate(item.purchase_date) }}</span>
              <span class="meta-price">{{ Number(item.price).toFixed(2) }}€</span>
            </div>
            <div v-if="item.files?.length" class="purchase-files">
              <button class="btn-dl-main" @click="download(item.order_item_id)" :disabled="downloading === item.order_item_id">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {{ downloading === item.order_item_id ? t('downloads.downloading') : t('downloads.download') }}
              </button>
              <div v-for="f in item.files" :key="f.id" class="file-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="file-name">{{ f.filename }}</span>
                <span class="file-size">{{ formatSize(f.file_size) }}</span>
              </div>
            </div>
            <div v-else class="no-files">
              <span>{{ t('downloads.no_file') }}</span>
            </div>
            <div class="invoice-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <div class="invoice-info">
                <span class="invoice-label">{{ t('downloads.invoice') }}</span>
                <span class="invoice-sub">{{ t('downloads.invoice_sub') }}</span>
              </div>
              <button class="btn-invoice" @click="downloadInvoice(item.order_item_id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {{ t('downloads.invoice_pdf') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
    <ToastNotif ref="toastRef" />

    <!-- Loader génération facture -->
    <Transition name="fade">
      <div v-if="invoiceLoading" class="invoice-loader-overlay">
        <div class="invoice-loader-card">
          <div class="invoice-loader-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span class="loader-pulse"></span>
          </div>
          <h3 class="invoice-loader-title">{{ t('downloads.invoice_gen') }}</h3>
          <p class="invoice-loader-sub">{{ t('downloads.invoice_gen_sub') }}</p>
          <div class="invoice-progress-track">
            <div class="invoice-progress-bar" :style="{ width: invoiceProgress + '%' }"></div>
          </div>
          <span class="invoice-progress-pct">{{ Math.round(invoiceProgress) }}%</span>
        </div>
      </div>
    </Transition>

    <!-- Popup : laisser un avis après achat -->
    <div v-if="showReviewModal" class="review-modal-overlay" @click.self="closeReviewModal">
      <div class="review-modal">
        <button class="review-modal-close" @click="closeReviewModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="review-modal-head">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <h3>{{ t('downloads.review_modal_title') }}</h3>
        </div>
        <p class="review-modal-sub">{{ t('downloads.review_modal_sub') }}</p>
        <div class="review-modal-items">
          <div v-for="item in reviewableItems" :key="item.order_item_id" class="review-modal-item">
            <img :src="item.thumbnail || '/placeholder.svg'" :alt="item.title" />
            <div class="rm-info">
              <strong>{{ item.title }}</strong>
              <span class="rm-price">{{ Number(item.price).toFixed(2) }}€</span>
            </div>
            <button class="btn-review" @click="goReview(item.slug)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {{ t('downloads.review_modal_btn') }}
            </button>
          </div>
        </div>
        <button class="btn-later" @click="closeReviewModal">{{ t('downloads.review_modal_later') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useLang()

const config = useRuntimeConfig()
const api = config.public.apiOrigin
const pageRef = ref<HTMLElement | null>(null)
const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)

const purchases = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const waitMsg = ref('')
const downloading = ref<number | null>(null)
const invoiceLoading = ref(false)
const invoiceProgress = ref(0)
const invoiceTimer = ref<number | null>(null)
const checkoutSessionId = ref('')
const manualSessionId = ref('')
const showReviewModal = ref(false)
const reviewableItems = ref<any[]>([])

const REVIEW_ASKED_KEY = 'gsa-review-asked'

function askedReviewIds(): number[] {
  try { return JSON.parse(localStorage.getItem(REVIEW_ASKED_KEY) || '[]') } catch { return [] }
}
function markReviewsAsked() {
  const ids = [...askedReviewIds(), ...reviewableItems.value.map((p: any) => Number(p.order_item_id))]
  localStorage.setItem(REVIEW_ASKED_KEY, JSON.stringify([...new Set(ids)]))
}
function openReviewModal() {
  const asked = askedReviewIds()
  reviewableItems.value = purchases.value.filter((p: any) => !asked.includes(Number(p.order_item_id)))
  if (reviewableItems.value.length) showReviewModal.value = true
}
function closeReviewModal() {
  markReviewsAsked()
  showReviewModal.value = false
}
function goReview(slug: string) {
  markReviewsAsked()
  showReviewModal.value = false
  navigateTo('/product/' + slug + '?tab=reviews')
}

async function fetchPurchases() {
  loading.value = true; error.value = ''
  try {
    const data = await $fetch(api + '/api/user/purchases', { credentials: 'include' })
    purchases.value = data.items || []
  } catch (e: any) {
    const code = e?.statusCode || e?.status || 'NETWORK'
    const msg = e?.data?.message || e?.message || String(e)
    if (code === 401) {
      error.value = t('downloads.auth_error')
    } else if (code === 'NETWORK' || !code) {
      error.value = t('downloads.net_error') + ' (' + String(msg).slice(0, 80) + ')'
    } else {
      error.value = t('downloads.srv_error') + ' (' + code + ')'
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
    toastRef.value?.show('success', t('downloads.dl_started'))
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || t('downloads.dl_error')
    toastRef.value?.show('error', msg)
  } finally {
    downloading.value = null
  }
}

function downloadInvoice(orderItemId: number) {
  // Loader stylé ~5s pendant la génération, puis ouverture du PDF
  invoiceLoading.value = true
  invoiceProgress.value = 0
  // Ouvre l'onglet vierge DANS le geste utilisateur (sinon le navigateur
  // bloque le popup : window.open async = silencieusement bloqué).
  // Il sera redirigé vers le PDF une fois "généré".
  const win = window.open('', '_blank')
  clearInterval(invoiceTimer.value)
  invoiceTimer.value = window.setInterval(() => {
    invoiceProgress.value = Math.min(100, invoiceProgress.value + 100 / 50) // 50 ticks * 100ms = 5s
    if (invoiceProgress.value >= 100) {
      clearInterval(invoiceTimer.value)
      const base = api && api.startsWith('http') ? api : window.location.origin
      const url = base + '/api/invoice/' + orderItemId
      if (win) {
        // Navigation directe (cookies SameSite=None OK) → le PDF se télécharge
        win.location.href = url
      } else {
        // Fallback : popup bloqué → téléchargement dans l'onglet courant
        // (Content-Disposition: attachment → la page ne quitte pas)
        window.location.href = url
      }
      setTimeout(() => { invoiceLoading.value = false }, 400)
    }
  }, 100)
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

function clearCartStorage() {
  localStorage.removeItem('gsa-cart')
  window.dispatchEvent(new Event('cart-updated'))
}

async function retryConfirm() {
  if (!checkoutSessionId.value) return
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000))
    try {
      const res = await $fetch(api + '/api/checkout/confirm-session', {
        method: 'POST', credentials: 'include', body: { sessionId: checkoutSessionId.value }
      })
      toastRef.value?.show('success', t('downloads.pay_confirmed'))
      checkoutSessionId.value = ''
      localStorage.removeItem('gsa-pending-session')
      clearCartStorage()
      await fetchPurchases()
      openReviewModal()
      return
    } catch (e: any) {
      console.error('Confirm attempt', attempt + 1, 'failed:', e?.data?.message || e)
      if (attempt === 2) {
        toastRef.value?.show('error', t('downloads.confirm_hint'))
      }
    }
  }
}

async function forceConfirm() {
  if (!checkoutSessionId.value) return
  try {
    const res = await $fetch(api + '/api/checkout/confirm-session', {
      method: 'POST', credentials: 'include', body: { sessionId: checkoutSessionId.value }
    })
    toastRef.value?.show('success', t('downloads.order_confirmed'))
    checkoutSessionId.value = ''
    localStorage.removeItem('gsa-pending-session')
    clearCartStorage()
    await fetchPurchases()
    openReviewModal()
  } catch (e: any) {
    toastRef.value?.show('error', e?.data?.message || t('generic.error'))
  }
}

async function confirmManual() {
  const sid = manualSessionId.value.trim()
  if (!sid) return
  try {
    const res = await $fetch(api + '/api/checkout/confirm-session', {
      method: 'POST', credentials: 'include', body: { sessionId: sid }
    })
    toastRef.value?.show('success', t('downloads.order_confirmed'))
    manualSessionId.value = ''
    localStorage.removeItem('gsa-pending-session')
    clearCartStorage()
    await new Promise(r => setTimeout(r, 500))
    window.location.reload()
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Erreur'
    toastRef.value?.show('error', msg)
  }
}

onMounted(async () => {
  try {
    const { load, pageEntrance } = await import('~/composables/useAnimation')
    const { gsap } = await load()
    if (gsap) pageEntrance(gsap, pageRef.value)
  } catch (animErr) {
    // Animation non critique, on continue sans
  }

  try {
    // If redirected from Stripe after payment, confirm the session
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (params.get('confirmed') === '1' && sessionId) {
      checkoutSessionId.value = sessionId
      // Persist in localStorage as fallback (survives refreshes)
      localStorage.setItem('gsa-pending-session', sessionId)
      // Auto-confirm with a small delay for Stripe processing
      await new Promise(r => setTimeout(r, 1500))
      await retryConfirm()
    } else {
      // Check localStorage for a pending session that wasn't confirmed yet
      const pending = localStorage.getItem('gsa-pending-session')
      if (pending) {
        checkoutSessionId.value = pending
      }
    }
  } catch (confirmErr) {
    error.value = 'Erreur lors de la confirmation. Rafraîchissez la page.'
    loading.value = false
  }

  fetchPurchases()
})

// Fallback: si fetchPurchases n'a pas répondu après 8s, on force
if (process.client) {
  // Lance fetchPurchases immédiatement (ne dépend pas de onMounted)
  fetchPurchases()
  setTimeout(() => {
    if (loading.value) {
      fetchPurchases()
    }
  }, 8000)
}
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

.purchase-thumb { width: 120px; height: 80px; border-radius: 8px; overflow: hidden; flex-shrink: 0; background: var(--bg-surface); transition: border-color .2s; }
.purchase-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.purchase-thumb:hover img { transform: scale(1.06); }

.purchase-info { flex: 1; min-width: 0; display: grid; gap: 8px; }
.purchase-title-link { text-decoration: none; color: inherit; width: fit-content; }
.purchase-title-link h3 { margin: 0; font-size: 1rem; font-weight: 700; transition: color .15s; }
.purchase-title-link:hover h3 { color: var(--primary); }

.purchase-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: .78rem; color: var(--text-muted); }
.meta-cat { padding: 2px 8px; border-radius: 4px; background: rgba(47,125,246,0.06); border: 1px solid rgba(47,125,246,0.12); color: var(--primary); font-weight: 600; }
.meta-date { color: var(--text-secondary); }
.meta-price { font-weight: 700; color: var(--text); }

.purchase-files { display: grid; gap: 6px; margin-top: 4px; }
.btn-dl-main { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; border-radius: 10px; border: 1px solid rgba(110,231,183,0.3); background: rgba(110,231,183,0.1); color: var(--green); font-size: .85rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; width: fit-content; }
.btn-dl-main:hover:not(:disabled) { background: rgba(110,231,183,0.18); border-color: rgba(110,231,183,0.5); }
.btn-dl-main:disabled { opacity: .5; cursor: not-allowed; }
.file-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px solid var(--border); font-size: .82rem; }
.file-row svg { color: var(--primary); flex-shrink: 0; }
.file-name { flex: 1; font-weight: 600; color: var(--text); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { color: var(--text-muted); font-size: .75rem; flex-shrink: 0; }

.no-files { padding: 8px 0; font-size: .82rem; color: var(--text-muted); }

.invoice-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 6px; background: var(--bg-surface); border: 1px dashed rgba(47,125,246,0.25); margin-top: 4px; }
.invoice-row > svg { color: var(--primary); flex-shrink: 0; }
.invoice-info { display: grid; gap: 1px; flex: 1; min-width: 0; }
.invoice-label { font-size: .82rem; font-weight: 700; color: var(--text); }
.invoice-sub { font-size: .72rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-invoice { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(47,125,246,0.35); background: rgba(47,125,246,0.1); color: var(--primary); font-size: .78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; flex-shrink: 0; }
.btn-invoice:hover { background: rgba(47,125,246,0.18); border-color: var(--primary); }
.confirm-banner { display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:12px;border:1px solid rgba(245,179,66,0.2);background:rgba(245,179,66,0.04);width:100%;max-width:400px;margin-bottom:16px; }
.confirm-banner div { display:grid;gap:2px;text-align:left;flex:1; }
.confirm-banner strong { font-size:.85rem;font-weight:700; }
.confirm-banner span { font-size:.75rem;color:var(--text-muted); }
.btn-confirm { padding:8px 18px;border-radius:6px;border:none;background:linear-gradient(135deg,#f5b342,#f59e0b);color:#fff;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s; }
.manual-confirm { text-align:center;padding:32px 20px;max-width:480px;margin:0 auto; }
.manual-confirm p { font-size:.85rem;color:var(--text-secondary);margin-bottom:12px; }
.manual-row { display:flex;gap:8px; }
.manual-input { flex:1;padding:10px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.85rem;outline:none;font-family:monospace; }
.manual-input:focus { border-color: var(--primary); }

/* Popup avis post-achat */
.review-modal-overlay { position: fixed; inset: 0; z-index: 99997; background: rgba(0,0,0,0.65); display: grid; place-items: center; padding: 20px; backdrop-filter: blur(4px); }
.review-modal { width: 100%; max-width: 420px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 22px; position: relative; display: grid; gap: 12px; }
.review-modal-close { position: absolute; top: 12px; right: 12px; width: 30px; height: 30px; border-radius: 8px; border: none; background: rgba(255,255,255,0.04); color: var(--text-muted); cursor: pointer; display: grid; place-items: center; }
.review-modal-close:hover { background: rgba(255,255,255,0.08); color: var(--text); }
.review-modal-head { display: flex; align-items: center; gap: 10px; }
.review-modal-head h3 { margin: 0; font-size: 1.05rem; font-weight: 800; }
.review-modal-sub { margin: 0; font-size: .85rem; color: var(--text-secondary); line-height: 1.5; }
.review-modal-items { display: grid; gap: 8px; max-height: 260px; overflow-y: auto; }
.review-modal-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-surface); }
.review-modal-item img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: var(--bg-card); }
.rm-info { flex: 1; min-width: 0; display: grid; gap: 2px; }
.rm-info strong { font-size: .84rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rm-price { font-size: .78rem; color: var(--text-muted); }
.btn-review { display: flex; align-items: center; gap: 5px; padding: 8px 14px; border-radius: 8px; border: none; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; flex-shrink: 0; }
.btn-review:hover { opacity: .9; }
.btn-later { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: .82rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s; }
.btn-later:hover { background: rgba(255,255,255,0.04); color: var(--text); }

/* Loader génération facture */
.invoice-loader-overlay { position: fixed; inset: 0; z-index: 99999; background: rgba(4,8,14,0.72); display: grid; place-items: center; padding: 20px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.invoice-loader-card { width: 100%; max-width: 360px; background: linear-gradient(160deg, var(--bg-card), rgba(20,26,38,0.96)); border: 1px solid rgba(47,125,246,0.22); border-radius: 20px; padding: 34px 28px; display: grid; justify-items: center; gap: 10px; text-align: center; box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset; position: relative; overflow: hidden; }
.invoice-loader-card::before { content: ''; position: absolute; inset: -40% -20%; background: radial-gradient(circle at 30% 20%, rgba(47,125,246,0.12), transparent 50%), radial-gradient(circle at 70% 80%, rgba(124,92,231,0.10), transparent 50%); pointer-events: none; }
.invoice-loader-icon { position: relative; display: grid; place-items: center; width: 86px; height: 86px; border-radius: 24px; background: linear-gradient(135deg, rgba(47,125,246,0.16), rgba(124,92,231,0.16)); border: 1px solid rgba(47,125,246,0.3); color: var(--primary); margin-bottom: 6px; }
.invoice-loader-icon svg { animation: invoiceFloat 2.2s ease-in-out infinite; }
.loader-pulse { position: absolute; inset: -6px; border-radius: 28px; border: 2px solid rgba(47,125,246,0.35); animation: invoicePulse 1.6s ease-out infinite; }
@keyframes invoicePulse { 0% { transform: scale(0.92); opacity: 0.9; } 100% { transform: scale(1.18); opacity: 0; } }
@keyframes invoiceFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.invoice-loader-title { margin: 4px 0 0; font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }
.invoice-loader-sub { margin: 0; font-size: .82rem; color: var(--text-secondary); line-height: 1.5; }
.invoice-progress-track { width: 100%; height: 8px; border-radius: 99px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.04); margin-top: 12px; overflow: hidden; }
.invoice-progress-bar { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width .1s linear; box-shadow: 0 0 12px rgba(47,125,246,0.5); }
.invoice-progress-pct { font-size: .72rem; font-weight: 700; color: var(--text-muted); font-variant-numeric: tabular-nums; letter-spacing: .05em; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
