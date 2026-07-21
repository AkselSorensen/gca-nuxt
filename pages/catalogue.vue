<template>
  <div ref="pageRef" class="marketplace-page">
    <div class="container">
      <!-- Header -->
      <div class="mp-header anim-up">
        <div class="mp-title-block">
          <h1>MARKETPLACE</h1>
          <p>TOUT CE DONT TU AS BESOIN AU MÊME ENDROIT</p>
        </div>
        <div class="mp-search" @click="focusSearch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input ref="searchRef" v-model="filters.search" type="text" placeholder="Rechercher scripts, models, maps…" />
        </div>
      </div>

      <!-- Category pills -->
      <div class="cat-pills anim-up">
        <button class="pill" :class="{ active: !filters.category }" @click="filters.category = ''">Tout <span class="pill-count">{{ products.length }}</span></button>
        <button v-for="c in categories" :key="c.slug" class="pill" :class="{ active: filters.category === c.slug }" @click="filters.category = filters.category === c.slug ? '' : c.slug">{{ c.name }} <span class="pill-count">{{ countByCategory(c.slug) }}</span></button>
      </div>

      <div class="mp-layout">
        <!-- Sidebar filters -->
        <aside class="mp-sidebar anim-left">
          <div class="sidebar-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
            Filtres
            <button class="sidebar-close" @click="sidebarOpen = false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>

          <div class="filter-group">
            <h4 class="filter-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> Trier par</h4>
            <label v-for="opt in sortOptions" :key="opt.value" class="radio-row" :class="{ active: filters.sort === opt.value }">
              <input type="radio" v-model="filters.sort" :value="opt.value" />
              <span class="radio-icon" v-html="opt.icon"></span>
              {{ opt.label }}
            </label>
          </div>

          <div class="filter-group">
            <h4 class="filter-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg> Prix max.</h4>
            <div class="price-slider-wrap">
              <input type="range" min="0" max="1000" step="5" v-model.number="filters.priceMax" class="single-range" />
              <div class="price-labels">
                <span>0€</span>
                <span class="price-val">{{ filters.priceMax }}€</span>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <h4 class="filter-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> Options</h4>
            <label class="toggle-row"><input type="checkbox" v-model="filters.onSale" /><span class="check-box"></span> En soldes seulement</label>
            <label class="toggle-row"><input type="checkbox" v-model="filters.verified" /><span class="check-box"></span> Vendeurs vérifiés</label>
            <label class="toggle-row"><input type="checkbox" v-model="filters.trending" /><span class="check-box"></span> Tendance seulement</label>
          </div>

          <div class="filter-group">
            <h4 class="filter-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Note minimale</h4>
            <label v-for="r in ratingOptions" :key="r" class="radio-row" :class="{ active: filters.minRating === r }">
              <input type="radio" v-model="filters.minRating" :value="r" />
              <span class="stars">{{ '★'.repeat(r === 0 ? 0 : r) }}{{ r === 0 ? 'Toutes' : '' }}</span>
            </label>
          </div>

          <button class="btn-reset" @click="clearFilters">Réinitialiser</button>
          <button class="btn-apply" @click="sidebarOpen = false">Appliquer les filtres</button>
        </aside>

        <!-- Mobile filter toggle -->
        <button class="filter-toggle" @click="sidebarOpen = !sidebarOpen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
          Filtres
          <span v-if="activeFilterCount" class="filter-badge">{{ activeFilterCount }}</span>
        </button>

        <!-- Product grid -->
        <main class="mp-main">
          <div v-if="loading" class="mp-empty">Chargement…</div>
          <div v-else-if="!filteredProducts.length" class="mp-empty">Aucun résultat trouvé.</div>
          <div v-else class="mp-grid">
            <article v-for="(p, i) in filteredProducts" :key="p.id" class="mp-card" :style="{ animationDelay: (i % 12) * 0.04 + 's' }">
              <a :href="'/product/' + p.slug" class="card-img">
                <img :src="p.thumbnail || p.media?.[0]?.thumbnail || p.media?.[0]?.url || ''" :alt="p.title" loading="lazy" />
                <div v-if="p.discountPercent > 0" class="badge-sale">−{{ p.discountPercent }}%</div>
                <div v-if="p.isNew || p.is_new" class="badge-new">NOUVEAU</div>
              </a>
              <div class="card-info">
                <span class="card-cat">{{ p.category || p.categoryName || p.categorySlug || '' }}</span>
                <h3><a :href="'/product/' + p.slug">{{ p.title }}</a></h3>
                <div class="card-meta">
                  <span class="card-seller">{{ p.sellerName || p.seller || 'Vendeur' }}</span>
                  <span class="card-rating" v-if="p.rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5b342"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {{ Number(p.rating).toFixed(1) }}
                  </span>
                </div>
                <div class="card-pricing">
                  <strong v-if="p.discountPercent > 0" class="price-sale">{{ Number(p.price).toFixed(2) }}€</strong>
                  <span :class="{ 'price-old': p.discountPercent > 0 }">{{ Number(p.oldPrice || p.price).toFixed(2) }}€</span>
                </div>
              </div>
            </article>
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile sidebar overlay -->
    <Teleport to="body">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click.self="sidebarOpen = false">
        <div class="sidebar-mobile">
          <div class="sidebar-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
            Filtres
            <button class="sidebar-close" @click="sidebarOpen = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="sidebar-scroll">
            <div class="filter-group">
              <h4 class="filter-title">Trier par</h4>
              <label v-for="opt in sortOptions" :key="opt.value" class="radio-row" :class="{ active: filters.sort === opt.value }">
                <input type="radio" v-model="filters.sort" :value="opt.value" />
                <span class="radio-icon" v-html="opt.icon"></span>
                {{ opt.label }}
              </label>
            </div>
            <div class="filter-group">
              <h4 class="filter-title">Prix max.</h4>
              <div class="price-slider-wrap">
                <input type="range" min="0" max="1000" step="5" v-model.number="filters.priceMax" class="single-range" />
                <div class="price-labels"><span class="price-val">{{ filters.priceMax }}€</span><span>0€ — 1000€</span></div>
              </div>
            </div>
            <div class="filter-group">
              <h4 class="filter-title">Options</h4>
              <label class="toggle-row"><input type="checkbox" v-model="filters.onSale" /><span class="check-box"></span> En soldes</label>
              <label class="toggle-row"><input type="checkbox" v-model="filters.verified" /><span class="check-box"></span> Vendeurs vérifiés</label>
              <label class="toggle-row"><input type="checkbox" v-model="filters.trending" /><span class="check-box"></span> Tendance</label>
            </div>
            <div class="filter-group">
              <h4 class="filter-title">Note minimale</h4>
              <label v-for="r in ratingOptions" :key="r" class="radio-row" :class="{ active: filters.minRating === r }">
                <input type="radio" v-model="filters.minRating" :value="r" />
                <span>{{ r === 0 ? 'Toutes' : r + '+' }}</span>
              </label>
            </div>
            <div style="display:grid;gap:8px;padding:16px;">
              <button class="btn-apply" @click="sidebarOpen = false">Appliquer</button>
              <button class="btn-reset" @click="clearFilters">Réinitialiser</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const api = config.public.apiOrigin

const { data: prodData } = await useFetch(api + '/api/products?limit=100')
const { data: bootData } = await useFetch(api + '/api/bootstrap')
const pageRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const sidebarOpen = ref(false)

const products = computed(() => prodData.value?.items || prodData.value?.products || [])
const categories = computed(() => bootData.value?.categories || [])
const loading = computed(() => !prodData.value)

const sortOptions = [
  { value: 'popular', label: 'Les plus populaires', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
  { value: 'newest', label: 'Plus récents', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  { value: 'price-asc', label: 'Prix croissant', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 3 21 3 21 7"/><line x1="3" y1="21" x2="21" y2="3"/><line x1="21" y1="17" x2="21" y2="21"/><line x1="17" y1="21" x2="21" y2="21"/></svg>' },
  { value: 'price-desc', label: 'Prix décroissant', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 7 7 3 11 7"/><line x1="7" y1="3" x2="7" y2="21"/><line x1="21" y1="17" x2="21" y2="21"/><line x1="17" y1="21" x2="21" y2="21"/></svg>' },
  { value: 'rating', label: 'Mieux notés', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
]

const ratingOptions = [0, 3, 4, 4.5]

const filters = reactive({
  search: '', category: '', sort: 'popular',
  priceMax: 1000 as number | null,
  onSale: false, verified: false, trending: false, minRating: 0
})

const activeFilterCount = computed(() => {
  let n = 0
  if (filters.category) n++
  if (filters.priceMax) n++
  if (filters.onSale) n++
  if (filters.verified) n++
  if (filters.trending) n++
  if (filters.minRating) n++
  return n
})

function countByCategory(slug: string) {
  return products.value.filter((p: any) => (p.categorySlug || p.category || '') === slug).length
}

function focusSearch() { searchRef.value?.focus() }

function clearFilters() {
  filters.search = ''
  filters.category = ''
  filters.sort = 'popular'
  filters.priceMax = 1000
  filters.onSale = false
  filters.verified = false
  filters.trending = false
  filters.minRating = 0
}

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter((p: any) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.short_description || p.shortDescription || '').toLowerCase().includes(q) ||
      (p.tags || []).some((t: string) => t.toLowerCase().includes(q))
    )
  }
  if (filters.category)
    result = result.filter((p: any) => (p.categorySlug || p.category || '') === filters.category)
  if (filters.priceMax) result = result.filter((p: any) => Number(p.price) <= filters.priceMax!)
  if (filters.onSale) result = result.filter((p: any) => p.discountPercent > 0)
  if (filters.verified) result = result.filter((p: any) => p.verifiedSeller)
  if (filters.trending) result = result.filter((p: any) => p.isTrending || p.popularityScore > 80)
  if (filters.minRating > 0) result = result.filter((p: any) => Number(p.rating || 0) >= filters.minRating)

  switch (filters.sort) {
    case 'popular': result.sort((a: any, b: any) => (b.popularityScore || b.sales || 0) - (a.popularityScore || a.sales || 0)); break
    case 'newest': result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
    case 'price-asc': result.sort((a: any, b: any) => Number(a.price) - Number(b.price)); break
    case 'price-desc': result.sort((a: any, b: any) => Number(b.price) - Number(a.price)); break
    case 'rating': result.sort((a: any, b: any) => Number(b.rating || 0) - Number(a.rating || 0)); break
  }
  return result
})

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.marketplace-page { padding:24px 0 64px; }

/* Header */
.mp-header { display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:16px;flex-wrap:wrap; }
.mp-title-block h1 { font-size:1.4rem;font-weight:900;letter-spacing:-.02em;line-height:1.1; }
.mp-title-block p { font-size:.72rem;color:var(--text-muted);letter-spacing:.08em;font-weight:600;margin-top:2px; }
.mp-search { display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:10px;background:var(--bg-card);border:1px solid var(--border);min-width:280px;flex:1;max-width:400px;cursor:text;transition:border-color .2s; }
.mp-search:focus-within { border-color:var(--primary); }
.mp-search svg { flex-shrink:0;color:var(--text-muted); }
.mp-search input { border:none;background:transparent;color:var(--text);font-size:.85rem;outline:none;width:100%;font-family:inherit; }
.mp-search input::placeholder { color:var(--text-muted); }

/* Category pills */
.cat-pills { display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none; }
.cat-pills::-webkit-scrollbar { display:none; }
.pill { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:999px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-secondary);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:inherit; }
.pill:hover { border-color:var(--border-hover);color:var(--text); }
.pill.active { background:var(--primary);border-color:var(--primary);color:#fff; }
.pill-count { font-size:.7rem;font-weight:500;opacity:.6; }

/* Sub-tabs */
.sub-tabs { display:flex;gap:4px;margin-bottom:24px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none; }
.sub-tabs::-webkit-scrollbar { display:none; }
.sub-tab { padding:6px 14px;border-radius:6px;border:none;background:transparent;color:var(--text-secondary);font-size:.82rem;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;font-family:inherit; }
.sub-tab:hover { background:rgba(255,255,255,0.03);color:var(--text); }
.sub-tab.active { background:rgba(47,125,246,0.08);color:var(--primary); }
.sale-tab { color:var(--red) !important; }
.sale-tab.active { background:rgba(248,113,113,0.08) !important; }

/* Layout */
.mp-layout { display:grid;grid-template-columns:240px 1fr;gap:28px;align-items:start; }
@media(max-width:900px){ .mp-layout{grid-template-columns:1fr} }

/* Sidebar */
.mp-sidebar { display:grid;gap:4px;position:sticky;top:80px; }
.sidebar-header { display:flex;align-items:center;gap:8px;padding:14px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;font-size:.82rem;font-weight:700;color:var(--text);margin-bottom:2px; }
.sidebar-close { margin-left:auto;width:28px;height:28px;border-radius:6px;border:none;background:rgba(255,255,255,0.04);color:var(--text-muted);cursor:pointer;display:none;place-items:center; }

.filter-group { padding:12px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:10px;display:grid;gap:6px; }
.filter-title { display:flex;align-items:center;gap:6px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:0 0 4px;color:var(--text); }
.filter-title svg { color:var(--primary);flex-shrink:0; }

.radio-row { display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;font-size:.82rem;color:var(--text-secondary);cursor:pointer;transition:all .1s; }
.radio-row:hover { background:rgba(255,255,255,0.02);color:var(--text); }
.radio-row.active { background:rgba(47,125,246,0.06);color:var(--primary); }
.radio-row input[type=radio] { display:none; }
.radio-icon { display:flex; }
.radio-icon svg { width:14px;height:14px; }

.price-row { display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center; }
.price-field { padding:8px 10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.82rem;outline:none;text-align:center;width:100%;font-family:inherit; }
.price-field:focus { border-color:var(--primary); }
.price-dash { color:var(--text-muted);font-size:.8rem; }

/* Range slider */
.price-slider-wrap { display:grid;gap:6px; }
.single-range { width:100%;-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:var(--border);outline:none;transition:background .2s;cursor:pointer; }
.single-range::-webkit-slider-thumb { -webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:var(--primary);border:2px solid #fff;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.3); }
.single-range::-moz-range-thumb { width:18px;height:18px;border-radius:50%;background:var(--primary);border:2px solid #fff;cursor:pointer; }
.price-labels { display:flex;justify-content:space-between;font-size:.75rem;color:var(--text-muted);font-weight:600; }
.price-val { color:var(--primary);font-size:.85rem;font-weight:700; }

.toggle-row { display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.82rem;color:var(--text-secondary);cursor:pointer; }
.toggle-row input[type=checkbox] { display:none; }
.check-box { width:18px;height:18px;border-radius:4px;border:2px solid var(--border);flex-shrink:0;transition:all .15s;position:relative; }
.toggle-row input:checked + .check-box { background:var(--primary);border-color:var(--primary); }
.toggle-row input:checked + .check-box::after { content:'';position:absolute;top:2px;left:5px;width:5px;height:9px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg); }

.stars { color:#f5b342;font-size:.85rem;letter-spacing:1px; }

.btn-reset { padding:8px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-secondary);font-size:.8rem;font-weight:600;cursor:pointer;font-family:inherit; }
.btn-reset:hover { border-color:var(--border-hover);color:var(--text); }
.btn-apply { padding:10px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),#4f46e5);color:#fff;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit; }

/* Filter toggle (mobile) */
.filter-toggle { display:none;align-items:center;gap:8px;padding:10px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-size:.85rem;font-weight:600;cursor:pointer;margin-bottom:16px;font-family:inherit; }
.filter-toggle svg { color:var(--primary); }
.filter-badge { margin-left:auto;width:22px;height:22px;border-radius:50%;background:var(--primary);color:#fff;font-size:.7rem;display:grid;place-items:center; }
@media(max-width:900px){ .filter-toggle{display:flex}.mp-sidebar{display:none} }

/* Sidebar mobile overlay */
.sidebar-overlay { position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:grid;justify-items:end; }
.sidebar-mobile { width:300px;max-width:85vw;height:100%;background:var(--bg);border-left:1px solid var(--border);display:flex;flex-direction:column; }
.sidebar-mobile .sidebar-header { border-radius:0;border:none;border-bottom:1px solid var(--border); }
.sidebar-mobile .sidebar-close { display:grid; }
.sidebar-scroll { flex:1;overflow-y:auto;padding:8px;display:grid;gap:4px; }

/* Product grid */
.mp-main { min-width:0; }
.mp-empty { text-align:center;padding:60px;color:var(--text-muted);font-size:.95rem; }
.mp-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px; }

/* Product card */
.mp-card { border-radius:12px;overflow:hidden;border:1px solid var(--border);background:var(--bg-card);transition:all .25s;animation:cardIn .5s ease both; }
@keyframes cardIn { from { opacity:0;transform:translateY(12px); } to { opacity:1;transform:translateY(0); } }
.mp-card:hover { border-color:var(--border-hover);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.15); }

.card-img { position:relative;display:block;aspect-ratio:16/10;overflow:hidden; }
.card-img img { width:100%;height:100%;object-fit:cover;transition:transform .4s; }
.mp-card:hover .card-img img { transform:scale(1.05); }
.badge-sale { position:absolute;bottom:8px;left:8px;padding:4px 8px;border-radius:4px;background:#dc2626;color:#fff;font-size:.7rem;font-weight:700; }
.badge-new { position:absolute;top:8px;right:8px;padding:4px 8px;border-radius:4px;background:var(--primary);color:#fff;font-size:.65rem;font-weight:700;letter-spacing:.03em; }

.card-info { padding:12px 14px 14px;display:grid;gap:4px; }
.card-cat { font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;font-weight:600; }
.card-info h3 { margin:0;font-size:.88rem;font-weight:700;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.card-info h3 a { color:var(--text);text-decoration:none; }
.card-info h3 a:hover { color:var(--primary); }
.card-meta { display:flex;align-items:center;gap:10px;font-size:.75rem;color:var(--text-secondary);margin-top:2px; }
.card-seller { flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.card-rating { display:flex;align-items:center;gap:3px;font-weight:600;color:#f5b342; }
.card-pricing { display:flex;align-items:center;gap:6px;margin-top:4px; }
.card-pricing strong { font-size:.92rem;font-weight:800;color:var(--text); }
.price-sale { color:var(--green) !important; }
.price-old { font-size:.78rem;color:var(--text-muted);text-decoration:line-through; }
</style>
