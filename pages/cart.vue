<template>
  <div ref="pageRef" class="cart-page">
    <div class="container">
      <div class="page-header anim-up">
        <h1>Panier</h1>
        <p>Paiement sécurisé · Livraison instantanée</p>
      </div>

      <!-- Steps -->
      <div class="steps anim-up">
        <div class="step active"><span class="step-num">1</span> Panier</div>
        <div class="step-line"></div>
        <div class="step"><span class="step-num">2</span> Paiement</div>
        <div class="step-line"></div>
        <div class="step"><span class="step-num">3</span> Terminé</div>
      </div>

      <!-- Success state -->
      <div v-if="checkoutSuccess" class="success-banner anim-scale">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h2>Paiement réussi !</h2>
        <p>Votre commande a été confirmée. Vous pouvez dès maintenant télécharger vos produits.</p>
        <NuxtLink to="/downloads" class="btn-success">Mes téléchargements</NuxtLink>
      </div>

      <div class="cart-layout" v-if="items.length && !checkoutSuccess">
        <div class="cart-items anim-left">
          <h2>Votre panier ({{ items.length }})</h2>
          <div v-for="(item, i) in items" :key="item.id || i" class="cart-item">
            <NuxtLink :to="'/product/' + item.slug" class="cart-item-img">
              <img :src="item.thumbnail || item.media?.[0]?.thumbnail || item.media?.[0]?.url || '/placeholder.svg'" :alt="item.title" />
            </NuxtLink>
            <div class="cart-item-info">
              <NuxtLink :to="'/product/' + item.slug" class="cart-item-title">{{ item.title }}</NuxtLink>
              <span class="cart-item-seller">{{ item.sellerName || item.seller || 'Vendeur' }}</span>
            </div>
            <div class="cart-item-price">
              <strong>{{ Number(item.price).toFixed(2) }}€</strong>
              <span v-if="item.discountPercent > 0" class="price-old">{{ Number(item.oldPrice).toFixed(2) }}€</span>
            </div>
            <button class="cart-remove" @click="removeItem(i)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="cart-summary anim-right">
          <h3>Récapitulatif</h3>
          <div class="summary-row"><span>Sous-total</span><span>{{ subtotal.toFixed(2) }}€</span></div>
          <div v-if="promoDiscount > 0" class="summary-row promo-valid"><span>Réduction</span><span>-{{ promoDiscount.toFixed(2) }}€</span></div>
          <div class="summary-total"><span>Total</span><strong>{{ total.toFixed(2) }}€</strong></div>
          <div class="promo-row">
            <input v-model="promoCode" placeholder="Code promo" class="promo-input" :class="{ error: promoStatus === 'error', valid: promoStatus === 'valid' }" />
            <button class="promo-btn" :disabled="promoStatus === 'loading'" @click="applyPromo">{{ promoStatus === 'loading' ? '…' : 'Appliquer' }}</button>
          </div>
          <p v-if="promoMsg" class="promo-msg" :class="promoStatus">{{ promoMsg }}</p>
          <button class="btn-checkout" @click="checkout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.693 0 3.033.642 3.964 1.219l.295-1.812c-.789-.537-2.303-1.088-4.105-1.088-2.645 0-4.475 1.356-4.475 3.562 0 2.248 1.928 3.21 4.344 4.033 2.154.734 3.226 1.342 3.226 2.416 0 .86-.695 1.446-2.077 1.446-1.909 0-3.548-.791-4.399-1.454l-.325 1.845c.902.66 2.663 1.283 4.794 1.283 2.995 0 4.81-1.522 4.81-3.799 0-2.318-1.798-3.246-4.212-4.077zM3.575 16.138V7.828h-1.78v9.489h4.916v-1.179H3.575zM20.205 16.138c.627 0 1.196-.049 1.795-.182v-1.702c-.53.144-1.066.218-1.605.218-2.636 0-4.259-1.67-4.259-4.211 0-2.43 1.691-4.256 4.135-4.256.614 0 1.195.127 1.795.327V4.584c-.583-.17-1.17-.249-1.795-.249-3.523 0-6.124 2.518-6.124 6.072 0 3.538 2.527 5.731 6.058 5.731z"/></svg>
            Payer {{ subtotal }}€
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="cart-empty anim-fade">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <h2>Votre panier est vide</h2>
        <p>Découvrez nos produits et trouvez ce qu'il vous faut.</p>
        <NuxtLink to="/catalogue" class="btn-browse">Parcourir le catalogue</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pageRef = ref<HTMLElement | null>(null)
const items = ref<any[]>([])
const promoCode = ref('')
const promoStatus = ref<'idle'|'loading'|'valid'|'error'>('idle')
const promoMsg = ref('')
const promoDiscount = ref(0)
const checkoutSuccess = ref(false)
const checkoutSessionId = ref('')
const subtotal = computed(() => items.value.reduce((s, i) => s + Number(i.price), 0))
const total = computed(() => Math.max(0, subtotal.value - promoDiscount.value))

function removeItem(i: number) { items.value.splice(i, 1); promoStatus.value = 'idle'; promoDiscount.value = 0 }

async function applyPromo() {
  const code = promoCode.value.trim()
  if (!code) { promoStatus.value = 'error'; promoMsg.value = 'Entrez un code promo'; return }
  promoStatus.value = 'loading'
  try {
    const res = await $fetch('/api/promo/validate', { method: 'POST', body: { code, items: items.value.map(i => i.slug) } })
    if (res.valid) {
      promoStatus.value = 'valid'
      promoDiscount.value = res.discountAmount || 0
      promoMsg.value = `Code appliqué ! -${res.discountAmount.toFixed(2)}€`
    } else {
      promoStatus.value = 'error'
      promoDiscount.value = 0
      promoMsg.value = res.message || 'Code invalide ou expiré'
    }
  } catch (e: any) {
    promoStatus.value = 'error'
    promoDiscount.value = 0
    promoMsg.value = e?.data?.message || 'Code promo introuvable ou invalide'
  }
}

function checkout() { /* TODO */ }

function addToCart(slug: string, title: string, price: number, img?: string) {
  const exists = items.value.find(i => i.slug === slug)
  if (!exists) items.value.push({ slug, title, price, thumbnail: img || '' })
}

onMounted(async () => {
  try {
    const saved = localStorage.getItem('gsa-cart')
    if (saved) items.value = JSON.parse(saved)
  } catch {}
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)

  // Handle Stripe checkout success
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('session_id')
  if (params.get('checkout') === 'success' && sid) {
    checkoutSessionId.value = sid
    try {
      const config = useRuntimeConfig()
      const api = config.public.apiOrigin
      await $fetch(api + '/api/checkout/confirm-session', { method: 'POST', credentials: 'include', body: { sessionId: sid } })
      checkoutSuccess.value = true
      localStorage.removeItem('gsa-cart')
      items.value = []
    } catch (e: any) {
      console.error('Confirm error:', e)
    }
  }
})

watch(items, (val) => {
  localStorage.setItem('gsa-cart', JSON.stringify(val))
}, { deep: true })
</script>

<style scoped>
.cart-page { padding:24px 0 64px; }
.page-header h1 { font-size:1.6rem;font-weight:900;letter-spacing:-.03em; }
.page-header p { color:var(--text-secondary);margin-top:4px;font-size:.9rem; }

/* Steps */
.steps { display:flex;align-items:center;gap:12px;margin-bottom:32px;padding:16px 20px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px; }
.step { display:flex;align-items:center;gap:6px;font-size:.82rem;color:var(--text-muted);font-weight:600; }
.step.active { color:var(--text); }
.step-num { width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:800;background:var(--border);color:var(--text-muted); }
.step.active .step-num { background:var(--primary);color:#fff; }
.step-line { flex:1;height:1px;background:var(--border); }

/* Layout */
.cart-layout { display:grid;grid-template-columns:1fr 320px;gap:28px;align-items:start; }
@media(max-width:768px){ .cart-layout{grid-template-columns:1fr} }

/* Items */
.cart-items { display:grid;gap:12px; }
.cart-items h2 { font-size:1.1rem;font-weight:800;margin-bottom:4px; }
.cart-item { display:flex;align-items:center;gap:14px;padding:14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card); }
.cart-item-img { width:64px;height:64px;border-radius:8px;overflow:hidden;flex-shrink:0; }
.cart-item-img img { width:100%;height:100%;object-fit:cover; }
.cart-item-info { flex:1;min-width:0; }
.cart-item-title { font-size:.85rem;font-weight:700;color:var(--text);text-decoration:none;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.cart-item-title:hover { color:var(--primary); }
.cart-item-seller { font-size:.74rem;color:var(--text-muted); }
.cart-item-price { text-align:right; }
.cart-item-price strong { font-size:.92rem;font-weight:800; }
.price-old { display:block;font-size:.72rem;color:var(--text-muted);text-decoration:line-through; }
.cart-remove { width:32px;height:32px;border-radius:6px;border:none;background:rgba(248,113,113,0.06);color:var(--red);cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:background .15s; }
.cart-remove:hover { background:rgba(248,113,113,0.15); }

/* Summary */
.cart-summary { padding:20px;border-radius:12px;border:1px solid var(--border);background:var(--bg-card);display:grid;gap:10px;position:sticky;top:90px; }
.cart-summary h3 { font-size:.95rem;font-weight:800; }
.summary-row { display:flex;justify-content:space-between;font-size:.84rem;color:var(--text-secondary); }
.summary-total { display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border);font-size:1rem; }
.summary-total strong { font-weight:900;color:var(--text); }
.promo-row { display:flex;gap:6px;margin-top:4px; }
.promo-input { flex:1;padding:9px 12px;border-radius:6px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.8rem;outline:none;font-family:inherit; }
.promo-input:focus { border-color:var(--primary); }
.promo-btn { padding:9px 16px;border-radius:6px;border:none;background:var(--bg-surface);color:var(--text);font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s; }
.promo-btn:hover { background:var(--border); }
.promo-msg { font-size:.78rem;font-weight:600;margin:0; }
.promo-msg.error { color:var(--red); }
.promo-msg.valid { color:var(--green); }
.promo-input.error { border-color:var(--red) !important; }
.promo-input.valid { border-color:var(--green) !important; }
.promo-valid { color:var(--green);font-weight:600; }

.btn-checkout { width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;margin-top:8px; }
.btn-checkout:hover { opacity:.9;transform:translateY(-1px); }

/* Empty */
.cart-empty { text-align:center;padding:60px 20px;display:grid;gap:10px;justify-items:center; }
.cart-empty h2 { font-size:1.2rem;font-weight:800; }
.cart-empty p { color:var(--text-secondary); }
.btn-browse { padding:12px 24px;border-radius:10px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-weight:700;text-decoration:none;margin-top:8px;transition:opacity .2s; }
.btn-browse:hover { opacity:.9; }

/* Success */
.success-banner { text-align:center;padding:60px 20px;display:grid;gap:12px;justify-items:center;border-radius:16px;border:1px solid rgba(110,231,183,0.15);background:rgba(110,231,183,0.03); }
.success-banner h2 { font-size:1.3rem;font-weight:900;color:var(--green); }
.success-banner p { color:var(--text-secondary);max-width:400px; }
.btn-success { padding:14px 32px;border-radius:10px;background:linear-gradient(135deg,var(--green),#4ade80);color:#fff;font-weight:700;text-decoration:none;font-size:.9rem;transition:all .2s;margin-top:8px; }
.btn-success:hover { opacity:.9;transform:translateY(-1px); }
</style>
