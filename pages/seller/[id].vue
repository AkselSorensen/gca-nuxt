<template>
  <div ref="pageRef" class="seller-profile-page">
    <!-- Hero / Header -->
    <div class="sp-hero">
      <div class="sp-hero-bg"></div>
      <div class="container">
        <div class="sp-hero-inner anim-scale">
          <div class="sp-avatar">
            <img v-if="seller.avatarUrl" :src="seller.avatarUrl" :alt="seller.displayName" />
            <span v-else>{{ seller.displayName?.charAt(0).toUpperCase() || '?' }}</span>
          </div>
          <div class="sp-head-info">
            <div class="sp-name-row">
              <h1>{{ seller.displayName }}</h1>
            </div>
            <p v-if="seller.bio" class="sp-bio">{{ seller.bio }}</p>
            <button v-if="isOwner && !editingBio" class="sp-btn sp-btn-ghost sp-bio-edit" @click="startEditBio">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier la description
            </button>
            <div class="sp-actions">
              <a v-if="seller.discordId" :href="'https://discord.com/users/' + seller.discordId" target="_blank" rel="noopener" class="sp-btn sp-btn-primary">
                <IconDiscord :size="16" />
                Contacter sur Discord
              </a>
              <button class="sp-btn sp-btn-ghost" @click="shareProfile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Partager
              </button>
            </div>
          </div>
          <div class="sp-stats-bar">
            <div class="sp-stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <div class="sp-stat-val">{{ products.length }}</div>
              <div class="sp-stat-lbl">{{ t('seller.products') }}</div>
            </div>
            <div class="sp-stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              <div class="sp-stat-val">{{ totalSales }}</div>
              <div class="sp-stat-lbl">Ventes</div>
            </div>
            <div class="sp-stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <div class="sp-stat-val">{{ avgRating }}</div>
              <div class="sp-stat-lbl">Note</div>
            </div>
            <div class="sp-stat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <div class="sp-stat-val">{{ totalReviews }}</div>
              <div class="sp-stat-lbl">Avis</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container sp-layout">
      <!-- Sidebar -->
      <aside class="sp-sidebar anim-left">
        <div class="sp-card">
          <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> À propos</h3>
          <template v-if="isOwner && editingBio">
            <textarea v-model="bioDraft" rows="5" class="bio-edit-area" placeholder="Décrivez votre boutique..."></textarea>
            <div class="bio-edit-actions">
              <button class="sp-btn sp-btn-primary" :disabled="bioSaving" @click="saveBio">{{ bioSaving ? 'Enregistrement…' : 'Enregistrer' }}</button>
              <button class="sp-btn sp-btn-ghost" @click="cancelEditBio">Annuler</button>
            </div>
          </template>
          <p v-else>{{ seller.bio || 'Aucune description fournie.' }}</p>
          <span v-if="bioMsg" class="bio-edit-msg">{{ bioMsg }}</span>
        </div>

        <div class="sp-card">
          <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> Détails</h3>
          <div class="sp-details">
            <div class="sp-detail"><span class="dl-label">{{ t('seller.member_since') }}</span><span>{{ formatDate(seller.joinedAt) }}</span></div>
            <div v-if="seller.discordTag || seller.displayName" class="sp-detail">
              <span class="dl-label">Contact Discord</span>
              <span class="discord-contact">
                <IconDiscord :size="14" />
                {{ seller.discordTag || seller.displayName }}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main: Products -->
      <main class="sp-main anim-right">
        <div class="sp-products-header">
          <h2>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            {{ products.length }} {{ products.length > 1 ? 'produits' : 'produit' }}
          </h2>
        </div>

        <div v-if="!products.length" class="sp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <p>{{ t('seller.no_products') }}</p>
        </div>

        <div v-else class="sp-products-grid">
          <article v-for="p in filteredProducts" :key="p.id" class="sp-product-card anim-card">
            <NuxtLink :to="'/product/' + p.slug" class="sp-pc-link">
              <div class="sp-pc-img">
                <img :src="p.thumbnail || '/placeholder.svg'" :alt="p.title" />
                <div v-if="p.discountPercent > 0" class="sp-pc-discount">−{{ p.discountPercent }}%</div>
                <div v-if="p.isTrending" class="sp-pc-trending">TENDANCE</div>
              </div>
              <div class="sp-pc-body">
                <h3>{{ p.title }}</h3>
                <p>{{ p.shortDescription }}</p>
                <div class="sp-pc-meta">
                  <span class="sp-pc-cat">{{ p.categoryName }}</span>
                  <div v-if="p.rating > 0" class="sp-pc-rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5b342"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {{ Number(p.rating).toFixed(1) }} ({{ p.reviewCount }})
                  </div>
                  <div class="sp-pc-price">
                    <strong>{{ Number(p.discountPercent > 0 ? p.price : (p.oldPrice || p.price)).toFixed(2) }}€</strong>
                    <span v-if="p.discountPercent > 0" class="sp-pc-old">{{ Number(p.oldPrice || p.price).toFixed(2) }}€</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Avis -->
        <div class="sp-reviews anim-card">
          <div class="sp-products-header">
            <h2>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Avis ({{ reviews.length }})
            </h2>
          </div>
          <div v-if="!reviews.length" class="sp-empty">
            <p>Aucun avis pour le moment.</p>
          </div>
          <div v-else class="sp-reviews-list">
            <div v-for="r in visibleReviews" :key="r.id" class="sp-review">
              <div class="sp-review-head">
                <div class="sp-review-avatar">
                  <img v-if="r.reviewerAvatar" :src="r.reviewerAvatar" :alt="r.reviewerName" />
                  <span v-else>{{ r.reviewerName?.[0]?.toUpperCase() || '?' }}</span>
                </div>
                <div class="sp-review-user">
                  <strong>{{ r.reviewerName }}</strong>
                  <span class="sp-review-product">sur {{ r.productTitle }}</span>
                </div>
                <div class="sp-review-stars">
                  <span v-for="n in 5" :key="n" :class="{ on: n <= r.rating }">★</span>
                  <span class="sp-review-date">{{ formatDate(r.createdAt) }}</span>
                </div>
              </div>
              <p v-if="r.comment" class="sp-review-comment">{{ r.comment }}</p>
            </div>
            <button v-if="visibleReviews.length < reviews.length" class="sp-more-btn" @click="reviewsPage++">
              Afficher plus d'avis ({{ reviews.length - visibleReviews.length }} restants)
            </button>
          </div>
        </div>
      </main>
    </div>
    <ToastNotif ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useLang()

const config = useRuntimeConfig()
const api = config.public.apiOrigin
const route = useRoute()
const pageRef = ref<HTMLElement | null>(null)
const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)

const sellerSlug = route.params.id as string

const { user } = useAuth()
// Seul le vendeur propriétaire de la boutique peut éditer sa description
const isOwner = computed(() => !!user.value?.slug && user.value.slug === sellerSlug)
const editingBio = ref(false)
const bioDraft = ref('')
const bioSaving = ref(false)
const bioMsg = ref('')

function startEditBio() {
  bioDraft.value = seller.value?.bio || ''
  editingBio.value = true
  bioMsg.value = ''
}
function cancelEditBio() {
  editingBio.value = false
  bioMsg.value = ''
}
async function saveBio() {
  bioSaving.value = true
  bioMsg.value = ''
  try {
    const res = await $fetch(api + '/api/seller/profile', {
      credentials: 'include',
      method: 'PATCH',
      body: { bio: bioDraft.value },
    })
    // Met à jour l'affichage local immédiatement
    if (raw.value?.seller) raw.value.seller.bio = res.sellerDescription || ''
    editingBio.value = false
    bioMsg.value = t('seller.saved')
    setTimeout(() => bioMsg.value = '', 3000)
  } catch (e: any) {
    bioMsg.value = e?.data?.statusMessage || e?.data?.message || 'Erreur lors de la sauvegarde'
  } finally {
    bioSaving.value = false
  }
}

const raw = ref<any>(null)
const fetchError = ref<any>(null)
// Fetch manuel dans onMounted : plus fiable que useFetch(lazy) qui restait vide côté client
async function loadSeller() {
  try {
    const res = await $fetch(api + '/api/sellers/' + sellerSlug, { credentials: 'include' })
    raw.value = res
  } catch (e: any) {
    fetchError.value = e
  }
}
onMounted(async () => {
  loadSeller()
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})

const seller = computed(() => raw.value?.seller || {})

// ===== SEO dynamique =====
const truncateText = (s: string, max: number) => {
  const clean = (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

const sellerName = computed(() => seller.value?.displayName || 'Vendeur')
const seoTitle = computed(() => sellerName.value + ' — Vendeur GSA Store')
const seoDescription = computed(() => truncateText(seller.value?.bio || 'Découvrez les créations de ' + sellerName.value + ' sur GSA Store.', 150))

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogType: 'profile',
  ogTitle: seoTitle,
  ogDescription: seoDescription,
})

useHead(() => ({
  link: [{ rel: 'canonical', href: 'https://gsa-store.fr/seller/' + sellerSlug }],
}))
const products = computed(() => raw.value?.products || [])
const reviews = computed(() => raw.value?.reviews || [])
// Pagination des avis : 10 affichés, "Afficher plus" en révèle 10 de plus
const reviewsPage = ref(1)
const REVIEWS_PER_PAGE = 10
const visibleReviews = computed(() => reviews.value.slice(0, reviewsPage.value * REVIEWS_PER_PAGE))
const loading = computed(() => !raw.value && !fetchError.value)
const hasError = computed(() => fetchError.value)

// Si erreur API, afficher le message
const errorMessage = computed(() => {
  if (!fetchError.value) return ''
  return fetchError.value?.data?.message || fetchError.value?.message || 'Erreur de chargement'
})

const avgRating = computed(() => {
  // Même source que la fiche produit (moyenne pondérée des avis, API) → cohérent
  const apiRating = seller.value?.avgRating
  if (apiRating) return Number(apiRating).toFixed(1)
  // Fallback : moyenne des produits notés (si l'API ne fournit pas la valeur)
  const p = products.value
  const rated = p.filter((x: any) => Number(x.rating) > 0)
  if (!rated.length) return '—'
  const avg = rated.reduce((s: number, x: any) => s + Number(x.rating), 0) / rated.length
  return avg.toFixed(1)
})

const totalSales = computed(() => raw.value?.seller?.totalUnitsSold || 0)
const totalReviews = computed(() => products.value.reduce((s: number, x: any) => s + Number(x.reviewCount || 0), 0))

const filteredProducts = computed(() => products.value)

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  } catch { return '—' }
}

function shareProfile() {
  navigator.clipboard.writeText(window.location.href)
  toastRef.value?.show('success', t('seller.link_copied'))
}
</script>

<style scoped>
.seller-profile-page { min-height: 100vh; background: var(--bg); }

/* Hero */
.sp-hero { position: relative; padding: 40px 0 0; }
.sp-hero-bg {
  position: absolute; inset: 0; height: 280px;
  background: linear-gradient(135deg, rgba(47,125,246,0.08), rgba(16,185,129,0.05));
  border-bottom: 1px solid var(--border);
}
.sp-hero-inner { position: relative; display: grid; gap: 28px; }
.sp-avatar {
  width: 80px; height: 80px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: grid; place-items: center;
  color: #fff; font-size: 1.6rem; font-weight: 900;
  border: 3px solid var(--bg-card); box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.sp-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sp-head-info { display: grid; gap: 10px; }
.sp-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.sp-name-row h1 { font-size: 1.5rem; font-weight: 900; letter-spacing: -.03em; margin: 0; }
.sp-badge.verified {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 20px;
  background: rgba(110,231,183,0.1); border: 1px solid rgba(110,231,183,0.2);
  color: #6ee7b7; font-size: .72rem; font-weight: 700;
}
.sp-badge.verified svg { width: 12px; height: 12px; }
.sp-bio { color: var(--text-secondary); font-size: .9rem; margin: 0; max-width: 500px; }
.sp-bio-edit { margin-top: 10px; font-size: .8rem; display: inline-flex; align-items: center; gap: 6px; }
.bio-edit-area { width: 100%; resize: vertical; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text); font-size: .88rem; line-height: 1.6; font-family: inherit; }
.bio-edit-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.bio-edit-msg { font-size: .82rem; color: var(--green); }
.sp-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.sp-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: .82rem; font-weight: 600;
  cursor: pointer; transition: all .15s; text-decoration: none; font-family: inherit;
}
.sp-btn-primary { background: var(--primary); color: #fff; border: none; }
.sp-btn-primary:hover { opacity: .9; }
.sp-btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }
.sp-btn-outline:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.03); }
.sp-btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid transparent; }
.sp-btn-ghost:hover { color: var(--text); background: rgba(255,255,255,0.03); }

/* Stats Bar */
.sp-stats-bar {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border); border-radius: 12px; overflow: hidden;
  border: 1px solid var(--border);
}
.sp-stat {
  background: var(--bg-card); padding: 18px 16px;
  display: grid; place-items: center; gap: 2px; text-align: center;
}
.sp-stat svg { color: var(--primary); opacity: .7; }
.sp-stat-val { font-size: 1.2rem; font-weight: 800; color: var(--text); }
.sp-stat-lbl { font-size: .7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; font-weight: 600; }

/* Layout */
.sp-layout { display: grid; grid-template-columns: 300px 1fr; gap: 28px; padding: 28px 0 64px; }
@media (max-width: 860px) { .sp-layout { grid-template-columns: 1fr; } }

/* Sidebar Cards */
.sp-sidebar { display: grid; gap: 16px; align-content: start; }
.sp-card {
  padding: 20px; border-radius: 12px; border: 1px solid var(--border);
  background: var(--bg-card); display: grid; gap: 12px;
}
.sp-card h3 {
  display: flex; align-items: center; gap: 8px;
  font-size: .82rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; color: var(--text-muted); margin: 0;
}
.sp-card h3 svg { color: var(--primary); }
.sp-card p { margin: 0; font-size: .85rem; color: var(--text-secondary); line-height: 1.6; }

/* Badges */
.sp-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.badge-pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: .75rem; font-weight: 600; }
.badge-pill.verified { background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.15); color: #6ee7b7; }
.badge-pill.verified svg { width: 10px; height: 10px; }

/* Links */
.sp-link, .sp-link-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 6px; font-size: .82rem;
  color: var(--text); text-decoration: none;
  transition: background .15s; cursor: pointer;
  border: none; background: transparent; width: 100%; text-align: left; font-family: inherit;
}
.sp-link:hover, .sp-link-btn:hover { background: rgba(255,255,255,0.03); }
.sp-link svg, .sp-link-btn svg { flex-shrink: 0; color: var(--text-muted); }
.link-ext { margin-left: auto; color: var(--text-muted) !important; }

/* Details */
.sp-details { display: grid; gap: 8px; }
.sp-detail { display: flex; justify-content: space-between; align-items: center; font-size: .82rem; }
.dl-label { color: var(--text-muted); }
.verified-text { color: #6ee7b7; font-weight: 600; }

/* Products Header */
.sp-products-header h2 {
  display: flex; align-items: center; gap: 8px;
  font-size: 1rem; font-weight: 800; margin: 0 0 16px;
}
.sp-products-header h2 svg { color: var(--primary); }

/* Product Grid */
.sp-products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.sp-product-card {
  border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
  background: var(--bg-card); transition: all .2s;
}
.sp-product-card:hover { border-color: var(--border-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.sp-pc-link { text-decoration: none; color: inherit; display: grid; }
.sp-pc-img { position: relative; aspect-ratio: 16/10; overflow: hidden; background: var(--bg-surface); }
.sp-pc-img img { width: 100%; height: 100%; object-fit: cover; }
.sp-pc-discount {
  position: absolute; top: 8px; left: 8px;
  padding: 4px 8px; border-radius: 4px;
  background: #8b1a1a; color: #fff; font-size: .7rem; font-weight: 800;
}
.sp-pc-trending {
  position: absolute; top: 8px; right: 8px;
  padding: 3px 8px; border-radius: 4px;
  background: rgba(245,179,66,0.9); color: #000; font-size: .65rem; font-weight: 800;
}
.sp-pc-body { padding: 14px; display: grid; gap: 8px; }
.sp-pc-body h3 { margin: 0; font-size: .9rem; font-weight: 700; }
.sp-pc-body p { margin: 0; font-size: .78rem; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Contact Discord */
.discord-contact { display: inline-flex; align-items: center; gap: 6px; color: #5865f2; font-weight: 700; }

/* Avis */
.sp-reviews { margin-top: 28px; }
.sp-reviews-list { display: grid; gap: 12px; }
.sp-review { padding: 16px 18px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border); display: grid; gap: 10px; }
.sp-review-head { display: flex; align-items: center; gap: 12px; }
.sp-review-avatar { width: 38px; height: 38px; min-width: 38px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, var(--primary), var(--accent)); display: grid; place-items: center; color: #fff; font-weight: 800; font-size: .85rem; }
.sp-review-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sp-review-user { flex: 1; min-width: 0; display: grid; gap: 2px; }
.sp-review-user strong { font-size: .88rem; }
.sp-review-product { font-size: .74rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-review-stars { display: flex; align-items: center; gap: 2px; color: rgba(255,255,255,0.12); font-size: .85rem; }
.sp-review-stars .on { color: #f5b342; }
.sp-review-date { margin-left: 8px; color: var(--text-muted); font-size: .72rem; }
.sp-review-comment { margin: 0; color: var(--text-secondary); font-size: .85rem; line-height: 1.65; }
.sp-more-btn { padding: 11px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-weight: 600; font-size: .82rem; cursor: pointer; transition: all .2s; font-family: inherit; }
.sp-more-btn:hover { background: rgba(255,255,255,0.04); color: var(--text); }
.sp-pc-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: .75rem; }
.sp-pc-cat { padding: 2px 8px; border-radius: 4px; background: rgba(47,125,246,0.06); border: 1px solid rgba(47,125,246,0.12); color: var(--primary); font-weight: 600; }
.sp-pc-rating { display: flex; align-items: center; gap: 3px; color: var(--text-muted); }
.sp-pc-rating svg { flex-shrink: 0; }
.sp-pc-price { margin-left: auto; display: flex; align-items: center; gap: 4px; }
.sp-pc-price strong { font-size: .88rem; font-weight: 800; color: var(--text); }
.sp-pc-old { font-size: .72rem; color: var(--text-muted); text-decoration: line-through; }

.sp-empty { grid-column: 1 / -1; display: grid; place-items: center; gap: 12px; padding: 60px 0; color: var(--text-muted); text-align: center; }
</style>
