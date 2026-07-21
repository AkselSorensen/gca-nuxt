<template>
  <div ref="pageRef" class="seller-page">
    <div class="container">
      <div v-if="loading" class="loading">Chargement…</div>
      <template v-else-if="seller">
        <div class="seller-header anim-scale">
          <div class="seller-avatar">{{ seller.username?.charAt(0).toUpperCase() || '?' }}</div>
          <div>
            <h1>{{ seller.username || 'Vendeur' }}</h1>
            <p class="seller-meta anim-fade">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="#f5b342" style="vertical-align:-2px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {{ avgRating }}</span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> {{ products.length }} produits</span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> {{ totalSales }} ventes</span>
            </p>
          </div>
        </div>
        <section class="section anim-scroll">
          <h2 class="anim-up">Produits</h2>
          <div v-if="!products.length" class="empty">Aucun produit.</div>
          <div v-else class="products-grid">
            <ProductCard v-for="p in products" :key="p.id" :product="p" class="anim-card" />
          </div>
        </section>
      </template>
      <div v-else class="empty">Vendeur introuvable.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()
const sellerId = route.params.id || (route.query.id as string)
const apiOrigin = config.public.apiOrigin

const { data: seller } = await useFetch(() => apiOrigin + '/api/seller/' + sellerId)
const { data: prodData } = await useFetch(() => apiOrigin + '/api/products?seller=' + sellerId)
const pageRef = ref<HTMLElement | null>(null)

const avgRating = computed(() => Number(seller.value?.avg_rating || 0).toFixed(1))
const totalSales = computed(() => seller.value?.total_sales || 0)
const products = computed(() => prodData.value?.items || prodData.value?.products || [])
const loading = computed(() => !seller.value && !sellerId)

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.seller-page { padding:40px 0 64px; }
.seller-header { display:flex;align-items:center;gap:20px;margin-bottom:32px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px; }
.seller-avatar { width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));display:grid;place-items:center;color:#fff;font-size:2rem;font-weight:800;flex-shrink:0; }
.seller-header h1 { font-size:1.5rem;font-weight:800; }
.seller-meta { display:flex;gap:20px;margin-top:6px;color:var(--text-secondary);font-size:.9rem; }
.section { margin-top:32px; }
.section h2 { font-size:1.2rem;font-weight:700;margin-bottom:20px; }
.loading,.empty { text-align:center;padding:60px;color:var(--text-muted); }
.products-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }
</style>
