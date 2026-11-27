<template>
  <div ref="pageRef" class="product-page" v-if="product">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb anim-up">
        <NuxtLink to="/">{{ t('product.home') }}</NuxtLink>
        <span class="sep">/</span>
        <NuxtLink to="/catalogue">{{ t('product.marketplace') }}</NuxtLink>
        <span class="sep">/</span>
        <NuxtLink :to="'/catalogue?c=' + (productCats[0]?.slug || product.categorySlug || '')" class="bc-cat">{{ productCats[0]?.name || categoryName }}</NuxtLink>
        <span class="sep">/</span>
        <span class="current">{{ product.title }}</span>
      </nav>

      <div class="product-layout">
        <!-- Left: Gallery -->
        <div class="product-gallery anim-left">
          <div class="gallery-main">
            <iframe v-if="showVideo && videoPlaying && videoEmbedUrl" :src="videoEmbedUrl + '?autoplay=1&rel=0&playsinline=1'" class="yt-iframe" :title="tr(`Vidéo du produit`, `Product video`)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <div v-if="videoPlaying && videoEmbedUrl" class="video-fallback">
              <span v-if="videoError">{{ t('product.video_error') }}</span>
              <a :href="'https://www.youtube.com/watch?v=' + videoWatchId" target="_blank" rel="noopener">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {{ tr(`Ouvrir sur YouTube`, `Open on YouTube`) }}
              </a>
            </div>
            <div v-else-if="showVideo && videoThumbUrl" class="video-preview" @click="showVideo = true; videoPlaying = true">
              <img :src="videoThumbUrl" :alt="tr('Vidéo', 'Video') + ' - ' + product.title" />
              <div class="video-play">
                <!-- Bouton lecture style YouTube : rectangle arrondi rouge + triangle blanc -->
                <span class="yt-play-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
                </span>
              </div>
            </div>
            <img v-if="currentImg && !(showVideo && videoThumbUrl)" :src="mediaSrc(currentImg, 1280)" :alt="product.title" decoding="async" fetchpriority="high" :class="{ 'has-video': product.videoUrl }" @click="product.videoUrl && videoEmbedUrl ? (showVideo = true, videoPlaying = true) : null" />
            <span v-if="currentImg && product.videoUrl && !(showVideo && videoThumbUrl)" class="video-cta" @click="showVideo = true; videoPlaying = true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              {{ tr(`Voir la vidéo`, `Watch the video`) }}
            </span>
            <img v-if="currentImg && !(showVideo && videoThumbUrl)" :src="mediaSrc(currentImg, 160)" alt="" class="gallery-blur" loading="lazy" aria-hidden="true" />
            <div v-else class="gallery-empty"><div class="loader"></div></div>
            <div v-if="product.discountPercent > 0" class="discount-badge">-{{ product.discountPercent }}%</div>
          </div>
          <div v-if="images.length > 1 || product.videoUrl" class="gallery-thumbs">
            <button v-if="product.videoUrl" class="thumb-btn thumb-video" :class="{ active: showVideo }" @click="showVideo = true; videoPlaying = false">
              <img v-if="videoThumbUrl" :src="videoThumbUrl" :alt="tr('Vidéo', 'Video')">
              <span v-if="videoThumbUrl" class="yt-badge yt-badge-sm"><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button v-for="(img, i) in images" :key="i" class="thumb-btn" :class="{ active: !showVideo && currentImg === img }" @click="showVideo = false; videoPlaying = false; currentImg = img">
              <img :src="mediaSrc(img, 160)" :alt="'Vue ' + (i+1)" width="160" height="100" loading="lazy" decoding="async" />
            </button>
          </div>
        </div>

        <!-- Right: Details -->
        <div class="product-info anim-right">
          <div class="info-header">
            <h1>{{ product.title }}</h1>
            <p v-if="product.shortDescription || product.short_description" class="info-subtitle">{{ product.shortDescription || product.short_description }}</p>
          </div>

          <!-- Rating & Stats -->
          <div class="info-stats">
            <div class="stars" v-if="product.reviewCount > 0">
              <svg v-for="s in 5" :key="s" width="16" height="16" viewBox="0 0 24 24" :fill="s <= Math.round(product.rating) ? '#f5b342' : 'none'" :stroke="s <= Math.round(product.rating) ? '#f5b342' : 'var(--border)'" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <strong>{{ Number(product.rating).toFixed(1) }}</strong>
              <span v-if="product.reviewCount">({{ product.reviewCount }})</span>
            </div>
            <div class="stat-chip" v-if="product.sales">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {{ product.sales }}+ {{ tr('ventes', 'sales') }}
            </div>
            <div class="stat-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ product.createdAt ? new Date(product.createdAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {month:'short',year:'numeric'}) : tr('Récent', 'New') }}
            </div>
          </div>

          <!-- Platform & Tags -->
          <div class="info-meta">
            <span class="platform-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> {{ product?.platform || 'Garry\'s Mod' }}</span>
            <NuxtLink v-for="c in productCats" :key="'cat-' + c.slug" :to="'/catalogue?c=' + c.slug" class="cat-pill">{{ t('category.' + c.slug) }}</NuxtLink>
            <span v-for="tag in productTags" :key="tag" class="tag-pill">{{ tag }}</span>
          </div>

          <!-- Price -->
          <div class="info-pricing">
            <div class="price-block">
              <strong class="price-current">{{ Number(product.discountPercent > 0 ? product.price : (product.oldPrice || product.price)).toFixed(2) }}€</strong>
              <span v-if="product.discountPercent > 0" class="price-old">{{ Number(product.oldPrice || product.price).toFixed(2) }}€</span>
              <span v-if="product.discountPercent > 0" class="price-badge">−{{ product.discountPercent }}%</span>
            </div>
            <div class="price-info">{{ t('product.one_time') }}</div>
          </div>

          <!-- Actions -->
          <div v-if="owned" class="owned-actions">
            <NuxtLink to="/downloads" class="btn-download">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {{ t('product.download') }}
            </NuxtLink>
          </div>
          <div v-else-if="isOwnProduct" class="own-product-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            {{ tr(`C'est votre produit - vous ne pouvez pas l'acheter.`, `This is your product - you cannot buy it.`) }}
          </div>
          <div v-else class="info-actions">
            <button class="btn-cart-add" @click="addToCart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/><path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {{ t('product.add_cart') }}
            </button>
            <button class="btn-buy" @click="buyNow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              {{ t('product.buy_now_label') }}
            </button>
          </div>
          <p v-if="buyError" class="buy-error">{{ buyError }}</p>

          <!-- Secure badges -->
          <div class="info-badges">
            <div class="badge-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> {{ t('product.secure_payment') }}</div>
            <div class="badge-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {{ t('product.instant_access') }}</div>
          </div>

          <!-- Seller card -->
          <NuxtLink :to="'/seller/' + (product.sellerSlug || product.seller)" class="seller-card" :aria-label="tr('Voir la boutique de ', 'View the shop of ') + sellerName">
            <div class="seller-avatar">
              <img v-if="product.sellerAvatar" :src="product.sellerAvatar" :alt="sellerName" />
              <span v-else>{{ (sellerName?.[0] || 'V').toUpperCase() }}</span>
            </div>
            <div class="seller-info">
              <div class="seller-line">
                <strong class="seller-name">{{ sellerName }}</strong>
                <svg v-if="product.verifiedSeller" class="seller-check" width="16" height="16" viewBox="0 0 24 24" fill="#2f7df6" role="img" :aria-label="t('product.verified')"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="seller-label">{{ t('product.verified') }}</span>
              </div>
              <div class="seller-line seller-rating">
                <span class="stars" role="img" :aria-label="product.sellerRating ? tr('Note de ', 'Rated ') + Number(product.sellerRating).toFixed(1) + tr(' sur 5', ' out of 5') : tr('Pas encore de note', 'No rating yet')">
                  <svg v-for="n in 5" :key="'b' + n" class="star" :style="{ left: (n - 1) * 18 + 'px' }" viewBox="0 0 24 24" fill="#2a3446"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/></svg>
                  <span v-if="product.sellerRating" class="stars-fill" :style="{ width: Math.round((Number(product.sellerRating) / 5) * 88) + 'px' }">
                    <svg v-for="n in 5" :key="'f' + n" class="star" :style="{ left: (n - 1) * 18 + 'px' }" viewBox="0 0 24 24" fill="#f5b342"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/></svg>
                  </span>
                </span>
                <template v-if="product.sellerRating">
                  <strong class="seller-score">{{ Number(product.sellerRating).toFixed(1).replace('.', ',') }}</strong>
                  <span class="seller-muted">({{ product.sellerReviewCount || 0 }} {{ (product.sellerReviewCount || 0) > 1 ? tr('avis', 'reviews') : tr('avis', 'review') }})</span>
                </template>
                <span v-else class="seller-muted">{{ tr("Pas encore d'avis", 'No reviews yet') }}</span>
                <span class="seller-dot">·</span>
                <span class="seller-count">{{ sellerProductCount }} {{ sellerProductCount > 1 ? tr('produits', 'products') : tr('produit', 'product') }}</span>
              </div>
            </div>
            <span class="seller-cta">{{ tr('Voir la boutique', 'View shop') }}
              <span class="seller-go"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Tabs -->
      <div class="product-tabs anim-up">
        <div class="tabs-header">
          <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
            {{ tab.label }}
          </button>
        </div>
        <div class="tab-content">
          <!-- Description -->
          <div v-if="activeTab === 'description'" class="tab-panel">
            <div class="desc-text" v-html="descriptionHtml"></div>
            <div class="features-grid">
              <div class="feature-card"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><strong>{{ t('product.gsa_protected') }}</strong><span>{{ t('product.stripe_secure') }}</span></div>
              <div class="feature-card"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><strong>{{ t('product.lifetime_access') }}</strong><span>{{ t('product.downloadable_updated') }}</span></div>
              <div class="feature-card"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>{{ t('product.documentation') }}</strong><span>{{ t('product.install_guide') }}</span></div>
            </div>
          </div>
          <!-- Installation -->
          <div v-if="activeTab === 'installation'" class="tab-panel">
            <div class="desc-text" v-html="installationHtml || '<p>Aucune instruction d\'installation fournie.</p>'"></div>
          </div>
          <!-- Vidéo supprimée de l'onglet - le carrousel intègre la vidéo -->
          <!-- Reviews -->
          <div v-if="activeTab === 'reviews'" class="tab-panel reviews-panel">
            <ProductReviews :product="product" :owned="owned" @updated="reloadProduct" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-page"><div class="loader"></div></div>
  <ToastNotif ref="toastRef" />
  <WithdrawalConsent :open="showWithdrawal" @confirm="onWithdrawalConfirm" @cancel="onWithdrawalCancel" />
</template>

<script setup lang="ts">
const { t, tr, locale } = useLang()

const config = useRuntimeConfig()
const api = config.public.apiOrigin
const route = useRoute()
const pageRef = ref<HTMLElement | null>(null)
const slug = route.params.slug as string

// Cache-busting : le SWR de useFetch sert l'ancienne réponse sur refresh() (avis supprimé
// ou ajouté qui "restait" visible). Un paramètre unique force une vraie requête réseau.
// (0 au départ : URL et clé identiques côté serveur et navigateur, sinon la page refaisait toute la requête après l'affichage)
const fetchStamp = ref(0)
async function reloadProduct() {
  fetchStamp.value = Date.now()
  await refresh()
}
const nuxtApp = useNuxtApp()
const fromCache = import.meta.client && !nuxtApp.isHydrating && !!getCachedProduct(slug)
const productUrl = computed(() => api + '/api/products/' + slug + (fetchStamp.value ? '?_t=' + fetchStamp.value : ''))
const { data: prodData, refresh } = await useFetch(productUrl, {
  key: 'product-' + slug,
  lazy: true,
  credentials: 'include',
  // Navigation depuis le catalogue : fiche affichée tout de suite avec les données préchargées
  getCachedData: (key, app) => app.isHydrating ? app.payload.data[key] : getCachedProduct(slug),
})
watch(prodData, (v) => { if (v) setCachedProduct(slug, v) }, { immediate: true })
const product = computed(() => prodData.value?.product || prodData.value || null)

// ===== SEO dynamique =====
const truncateText = (s: string, max: number) => {
  const clean = (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

const seoTitle = computed(() => (product.value?.title ? product.value.title + ' - GSA Store' : 'GSA Store'))
const seoDescription = computed(() => truncateText(htmlToText(product.value?.shortDescription || product.value?.description || ''), 150))
const seoImage = computed(() => {
  const url = product.value?.media?.[0]?.url || ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  if (url.startsWith('/api/media/')) return 'https://gsa-store.fr' + url
  return 'https://gsa-store.fr/logo.png'
})
const seoCanonical = computed(() => (product.value?.slug ? 'https://gsa-store.fr/product/' + product.value.slug : ''))

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogType: 'product',
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogUrl: seoCanonical,
  twitterCard: 'summary_large_image',
})

// Déclaré AVANT useHead : avec des données déjà en cache, useHead s'exécute tout de suite et le lit
const categoryName = computed(() => product.value?.categoryName || product.value?.categorySlug || product.value?.category || 'Produit')

useHead(() => {
  const p = product.value
  if (!p) return {}
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title || '',
    url: seoCanonical.value,
    sku: String(p.id || p.slug || ''),
    brand: { '@type': 'Brand', name: p.sellerName || 'GSA Store' },
    category: categoryName.value,
    image: seoImage.value,
    description: seoDescription.value,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: Number(p.price || 0),
      availability: 'https://schema.org/InStock',
      ...(p.sellerName ? { seller: { '@type': 'Person', name: p.sellerName } } : {}),
    },
    ...(Number(p.rating) > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(p.rating), reviewCount: Number(p.reviewCount) || 0 } }
      : {}),
  }
  return {
    link: seoCanonical.value ? [{ rel: 'canonical', href: seoCanonical.value }] : [],
    script: [
      { type: 'application/ld+json', children: JSON.stringify(ldJson) },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://gsa-store.fr/' },
            { '@type': 'ListItem', position: 2, name: 'Catalogue', item: 'https://gsa-store.fr/catalogue' },
            { '@type': 'ListItem', position: 3, name: p.title || 'Produit', item: seoCanonical.value },
          ],
        }),
      },
    ],
  }
})

// Un vendeur ne peut pas acheter ses propres produits (bloqué serveur + UI)
const { user } = useAuth()
const isOwnProduct = computed(() =>
  !!user.value?.id && !!product.value?.sellerId && Number(user.value.id) === Number(product.value.sellerId)
)

const currentImg = ref('')
const showVideo = ref(false)
const videoPlaying = ref(false)
// Détection d'échec du lecteur : si aucune requête vers googlevideo (le CDN du flux)
// après quelques secondes, YouTube n'a pas pu démarrer la lecture → fallback visible.
const videoError = ref(false)
const videoWatchId = computed(() => {
  const v = product.value?.videoUrl || ''
  const m = String(v).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? m[1] : ''
})
watch(videoPlaying, (playing) => {
  if (!playing) return
  videoError.value = false
  // Détection d'échec : si aucun flux vidéo (googlevideo) après 4 s → fallback visible
  setTimeout(() => {
    if (!videoPlaying.value) return
    const hasStream = performance.getEntriesByType('resource').some((r: any) => /googlevideo\.com/.test(r.name))
    if (!hasStream) videoError.value = true
  }, 4000)
})
const activeTab = ref('description')
// Ouverture directe de l'onglet Avis depuis le popup post-achat (?tab=reviews)
if (route.query.tab === 'reviews') activeTab.value = 'reviews'

const images = computed(() => {
  const p = product.value
  const imgs: string[] = []
  // Only image-type media
  const allMedia = p?.media || []
  const imgMedia = allMedia.filter((m: any) => m.type !== 'video')
  if (imgMedia.length) {
    imgMedia.forEach((m: any) => {
      // Prefer the full url for display, fallback to thumbnail
      const src = m.url || m.thumbnail
      if (src) imgs.push(src)
    })
  } else {
    // Fallback: any media (videos etc)
    allMedia.forEach((m: any) => {
      const src = m.thumbnail || m.url
      if (src) imgs.push(src)
    })
  }
  return imgs.length ? imgs : ['/placeholder.svg']
})

// Watcher : sert la 1re image dès qu'elle arrive (et même si la liste change)
watch(images, (imgs) => {
  if (imgs.length) {
    // Garde l'image courante si elle est toujours dans la liste, sinon reprend la 1re
    if (!currentImg.value || !imgs.includes(currentImg.value)) currentImg.value = imgs[0]
  }
}, { immediate: true })

const productCats = computed(() => {
  const list = product.value?.categories || []
  // Ajoute la catégorie principale si absente de la liste
  const slugs = list.map((c: any) => c.slug)
  if (product.value?.categorySlug && !slugs.includes(product.value.categorySlug)) {
    list.unshift({ name: categoryName.value, slug: product.value.categorySlug })
  }
  return list
})
const sellerName = computed(() => product.value?.sellerName || product.value?.seller || 'Vendeur')
const sellerProductCount = computed(() => product.value?.sellerProductCount || 0)
const owned = computed(() => Boolean(product.value?.owned))

const productTags = computed(() => {
  if (product.value?.tags) return product.value.tags
  if (product.value?.categorySlug) return [product.value.categorySlug]
  return []
})

const descriptionHtml = computed(() => sanitizeHtml(product.value?.description || product.value?.shortDescription || t('product.no_description')))
const installationHtml = computed(() => sanitizeHtml(product.value?.installation || ''))

const tabs = computed(() => {
  const t: { id: string; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'installation', label: 'Installation' },
  ]
  t.push({ id: 'reviews', label: 'Avis' })
  return t
})

// Convertit un lien YouTube en URL d'embed (iframe)
const videoEmbedUrl = computed(() => {
  const v = product.value?.videoUrl
  if (!v) return ''
  const m = String(v).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  // youtube-nocookie.com : mode confidentialité renforcée - se charge aussi avec les
  // bloqueurs de traqueurs (uBlock/Brave) qui font "charger à l'infini" sur youtube.com/embed
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : ''
})

// Miniature YouTube (preview de la vidéo sans la jouer)
const videoThumbUrl = computed(() => {
  const v = product.value?.videoUrl
  if (!v) return ''
  const m = String(v).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : ''
})

const buying = ref(false)
const buyError = ref('')
// Popup de renonciation à la rétractation
const showWithdrawal = ref(false)
const withdrawalAck = ref(false)
function onWithdrawalConfirm() {
  withdrawalAck.value = true
  showWithdrawal.value = false
  buyNow()
}
function onWithdrawalCancel() { showWithdrawal.value = false }
const toastRef = ref<InstanceType<typeof ToastNotif> | null>(null)

async function buyNow() {
  if (buying.value) return
  // Popup de renonciation au droit de rétractation (contenu numérique)
  if (!withdrawalAck.value) {
    showWithdrawal.value = true
    return
  }
  const { user } = useAuth()
  if (!user.value?.id) return navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
  buying.value = true; buyError.value = ''
  try {
    const res = await $fetch(api + '/api/checkout/buy-now', { method:'POST', credentials: 'include', body: { slug } })
    if (res.url) window.location.href = res.url
  } catch (e: any) {
    buyError.value = e?.data?.message || e?.message || 'Erreur de paiement'
  } finally { buying.value = false }
}
async function addToCart() {
  // Connexion requise pour ajouter au panier (comme pour l'achat)
  const { user } = useAuth()
  if (!user.value?.id) return navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
  // Un vendeur ne peut pas ajouter ses propres produits (défense en profondeur, le serveur bloque aussi)
  if (product.value?.sellerId && Number(user.value.id) === Number(product.value.sellerId)) {
    buyError.value = 'Vous ne pouvez pas acheter vos propres produits.'
    return
  }
  try {
    // localStorage corrompu (JSON invalide) ou saturé → on repart d'un panier vide
    let saved: any[] = []
    try {
      saved = JSON.parse(localStorage.getItem('gsa-cart') || '[]') || []
    } catch { saved = [] }
    if (!Array.isArray(saved)) saved = []
    const exists = saved.find((p: any) => p.slug === product.value?.slug)
    if (!exists && product.value) {
      // Panier LÉGER : ne PAS stocker les images base64 (elles saturent le quota
      // localStorage → tout le panier devient inutilisable). L'image est rechargée
      // depuis l'API au moment d'afficher le panier.
      saved.push({
        slug: product.value.slug,
        title: product.value.title,
        price: product.value.price,
        oldPrice: product.value.oldPrice,
        discountPercent: product.value.discountPercent,
        sellerName: product.value.sellerName,
      })
      try {
        localStorage.setItem('gsa-cart', JSON.stringify(saved))
        window.dispatchEvent(new Event('cart-updated'))
        toastRef.value?.show('success', t('product.added_cart'))
      } catch {
        // Quota toujours dépassé (ancien panier énorme) → on vide et on réessaie
        localStorage.removeItem('gsa-cart')
        localStorage.setItem('gsa-cart', JSON.stringify([saved[saved.length - 1]]))
        window.dispatchEvent(new Event('cart-updated'))
        toastRef.value?.show('success', t('product.added_cart'))
      }
    } else {
      toastRef.value?.show('info', t('product.already_cart'))
    }
  } catch { /* stockage indisponible */ }
}

onMounted(async () => {
  // Le fetch SSR part sans cookie → owned=false dans le payload et Nuxt ne re-fetch pas
  // côté client. On re-valide avec le cookie de session si l'utilisateur est connecté
  // pour afficher "Télécharger" au lieu des boutons d'achat.
  const { user, checkAuth } = useAuth()
  await checkAuth()
  if (user.value?.id || fromCache) await refresh()

  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.product-page { padding:24px 0 64px; }

/* Breadcrumb */
.breadcrumb { display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text-muted);margin-bottom:24px; }
.breadcrumb a { color:var(--text-muted);text-decoration:none; }
.breadcrumb a:hover { color:var(--text); }
.breadcrumb .sep { color:var(--border); }
.breadcrumb .current { color:var(--text-secondary);font-weight:600; }

/* Layout */
.product-layout { display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:40px; }
@media(max-width:900px){ .product-layout{grid-template-columns:1fr} }

/* Gallery */
.product-gallery { }
.gallery-main { position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--border);aspect-ratio:16/10;background:var(--bg-surface); }
/* Image principale : entière, jamais rognée (les visuels 4/3, verticaux ou ultra-larges
   étaient coupés par object-fit:cover). Fond flouté pour combler les bandes. */
.gallery-main img { width:100%;height:100%;object-fit:contain;position:relative;z-index:1; }
.gallery-main .gallery-blur { position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(22px) saturate(1.2);opacity:.4;transform:scale(1.12);z-index:0; }
.gallery-empty { position:absolute;inset:0;display:grid;place-items:center;background:var(--bg-surface);z-index:0; }
.gallery-main img.has-video { cursor:pointer; }
.video-cta { position:absolute; bottom:14px; left:50%; transform:translateX(-50%); z-index:4; display:inline-flex; align-items:center; gap:7px; padding:8px 16px; border-radius:999px; background:rgba(15,15,15,.8); color:#fff; font-size:.8rem; font-weight:700; cursor:pointer; transition:background .15s ease, transform .15s ease; }
.video-cta svg { color:#fff; flex-shrink:0; }
.video-cta:hover { background:rgba(255,0,0,.95); transform:translateX(-50%) scale(1.04); }
/* Lecteur vidéo : iframe DIRECTE dans le template (styles scoped appliqués normalement) */
.yt-iframe { position:absolute; inset:0; width:100% !important; height:100% !important; border:0; z-index:1; }
.video-fallback { display:flex; align-items:center; justify-content:center; gap:10px; padding:8px 10px; font-size:.8rem; color:var(--text-muted); flex-wrap:wrap; }
.video-fallback a { display:inline-flex; align-items:center; gap:6px; padding:7px 13px; border-radius:8px; background:rgba(255,0,0,.12); color:#ff4d4d; font-weight:700; text-decoration:none; transition:background .15s ease; }
.video-fallback a:hover { background:rgba(255,0,0,.22); }
.gallery-main iframe { width:100%;height:100%;border:0; }
.thumb-video { display:flex;align-items:center;gap:6px;color:var(--primary);font-weight:700;font-size:.8rem; overflow:hidden; position:relative; }
.thumb-video img { width:100%;height:100%;object-fit:cover; }
.yt-badge { background:#FF0000; border-radius:50%; width:62px; height:62px; display:grid; place-items:center; opacity:.88; box-shadow:0 8px 24px rgba(0,0,0,.5); transition:opacity .2s ease, transform .2s ease; }
.video-preview:hover .yt-badge { opacity:1; transform:scale(1.08); }
.yt-badge-sm { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); border-radius:50%; width:26px; height:26px; opacity:.9; box-shadow:0 2px 6px rgba(0,0,0,.4); }
.thumb-btn:hover .yt-badge-sm { opacity:1; }
/* Bouton lecture style YouTube par défaut */
.yt-play-btn { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:grid; place-items:center; width:42px; height:30px; padding-left:4px; border-radius:6px; background:rgba(15,15,15,.75); transition:background .15s ease; cursor:pointer; z-index:3; }
.video-preview:hover .yt-play-btn { background:rgba(255,0,0,.95); }
.video-preview:hover .yt-play-btn svg { animation: yt-bounce .4s ease; }
@keyframes yt-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.15); }
  70%  { transform: scale(.97); }
  100% { transform: scale(1.05); }
}
.thumb-video svg { flex-shrink:0; }
.video-preview { position:relative;width:100%;height:100%;cursor:pointer; }
.video-preview img { width:100%;height:100%;object-fit:cover; }
.video-preview .video-play { position:absolute;inset:0;pointer-events:none; }
.video-play svg { color:#fff;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5)); }
.discount-badge { position:absolute;top:12px;left:12px;padding:5px 12px;border-radius:6px;background:#8b1a1a;color:#fff;font-size:.8rem;font-weight:800;z-index:2; }
.gallery-thumbs { display:flex;gap:8px;margin-top:10px;flex-wrap:wrap; }
.thumb-btn { width:60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid var(--border);cursor:pointer;padding:0;background:var(--bg-surface);transition:border-color .2s; }
.thumb-btn.active { border-color:var(--primary); }
.thumb-btn img { width:100%;height:100%;object-fit:cover; }

/* Info */
.product-info { display:grid;gap:20px; }
.info-header h1 { font-size:1.6rem;font-weight:900;letter-spacing:-.03em;line-height:1.2; }
.info-subtitle { color:var(--text-secondary);font-size:.95rem;margin-top:4px; }

.info-stats { display:flex;align-items:center;gap:14px;flex-wrap:wrap; }
.stars { display:flex;align-items:center;gap:2px; }
.stars strong { margin-left:6px;font-size:.88rem;color:var(--text); }
.stars span { font-size:.82rem;color:var(--text-muted);margin-left:2px; }
.stat-chip { display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;background:var(--bg-surface);border:1px solid var(--border);font-size:.76rem;color:var(--text-secondary);font-weight:500; }
.stat-chip svg { color:var(--primary); }

.info-meta { display:flex;flex-wrap:wrap;gap:6px; }
.platform-badge { display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:rgba(47,125,246,0.06);border:1px solid rgba(47,125,246,0.12);font-size:.75rem;font-weight:600;color:var(--primary); }
.tag-pill { padding:4px 10px;border-radius:6px;background:var(--bg-surface);border:1px solid var(--border);font-size:.75rem;font-weight:500;color:var(--text-secondary); }
.cat-pill { padding:4px 10px;border-radius:6px;background:rgba(47,125,246,0.05);border:1px solid rgba(47,125,246,0.18);font-size:.75rem;font-weight:600;color:var(--primary);text-decoration:none;transition:background .15s ease; }
.cat-pill:hover { background:rgba(47,125,246,0.12); }
.breadcrumb .bc-cat { text-transform:capitalize; }

.info-pricing { padding:16px 20px;border-radius:12px;background:var(--bg-card);border:1px solid var(--border); }
.price-block { display:flex;align-items:baseline;gap:8px; }
.price-current { font-size:1.6rem;font-weight:900;color:var(--text); }
.price-old { font-size:1rem;font-weight:700;color:var(--text-muted);text-decoration:line-through; }
.price-badge { padding:4px 10px;border-radius:4px;background:rgba(139,26,26,0.12);color:#8b1a1a;font-size:.75rem;font-weight:800; }
.price-info { font-size:.78rem;color:var(--text-muted);margin-top:4px; }

/* Buttons */
.info-actions { display:flex;gap:10px; }
.btn-cart-add { flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s; }
.btn-cart-add:hover { border-color:var(--border-hover);background:rgba(255,255,255,0.04); }
.btn-buy { flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s; }
.btn-buy:hover { opacity:.9;transform:translateY(-1px); }
.buy-error { color:var(--red); font-size:.8rem; margin:0; }
.own-product-note { display:flex; align-items:center; justify-content:center; gap:8px; padding:13px 20px; border-radius:10px; border:1px dashed rgba(47,125,246,0.3); background:rgba(47,125,246,0.05); color:var(--text-secondary); font-size:.85rem; font-weight:600; }
.owned-actions { display:grid;gap:8px; }
.btn-download { display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:10px;border:1px solid rgba(110,231,183,0.3);background:rgba(110,231,183,0.1);color:var(--green);font-size:.88rem;font-weight:700;text-decoration:none;transition:all .2s; }
.btn-download:hover { background:rgba(110,231,183,0.18);border-color:rgba(110,231,183,0.5); }
.btn-download svg { flex-shrink:0; }

.info-badges { display:flex;gap:14px; }
.badge-item { display:flex;align-items:center;gap:6px;font-size:.76rem;color:var(--text-secondary); }
.badge-item svg { color:var(--green);flex-shrink:0; }

/* Seller card */

/* Tabs */
.product-tabs { margin-top:8px; }
.video-frame { position:relative; width:100%; aspect-ratio:16/9; border-radius:12px; overflow:hidden; border:1px solid var(--border); background:#000; }
.video-frame iframe { position:absolute; inset:0; width:100%; height:100%; }
.video-error { padding:40px; text-align:center; color:var(--text-muted); }
.tabs-header { display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:24px; }
.tabs-header .tab-btn { padding:10px 18px;border:none;background:transparent;color:var(--text-secondary);font-size:.88rem;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;font-family:inherit; }
.tabs-header .tab-btn:hover { color:var(--text); }
.tabs-header .tab-btn.active { color:var(--primary);border-bottom-color:var(--primary); }

.tab-content { min-height:200px; }
.tab-panel { max-width:800px; }
.desc-text { line-height:1.8;font-size:.92rem;color:var(--text-secondary);white-space:pre-line; }
.desc-text h1,.desc-text h2,.desc-text h3 { color:var(--text);margin:20px 0 10px; }
.desc-text p { margin-bottom:12px; }
.desc-text ul { padding-left:20px; }
.desc-text li { margin-bottom:6px; }
.desc-text strong { color:var(--text); }
.desc-text u { text-underline-offset:3px; }
.desc-text ol { padding-left:22px; }
.desc-text blockquote { margin:0 0 12px;padding:4px 14px;border-left:3px solid var(--border);color:var(--text-muted); }
.desc-text a { color:var(--primary);text-decoration:underline; }
.desc-text code { padding:2px 6px;border-radius:4px;background:var(--bg-surface);font-size:.85rem; }

.features-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-top:24px;padding-top:24px;border-top:1px solid var(--border); }
.feature-card { padding:14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card);display:grid;gap:4px; }
.feature-card svg { color:var(--primary); }
.feature-card strong { font-size:.82rem;font-weight:700; }
.feature-card span { font-size:.75rem;color:var(--text-muted); }

.tab-placeholder { text-align:center;padding:40px;color:var(--text-muted); }

.loading-page { display:grid;place-items:center;min-height:60vh; }
.loader { width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .6s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
.seller-card { display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:14px;border:1px solid var(--border);background:var(--bg-card);text-decoration:none;color:inherit;transition:border-color .15s,background-color .15s; }
.seller-card:hover { border-color:rgba(47,125,246,.55);background:rgba(47,125,246,.04); }
.seller-card:focus-visible { outline:2px solid var(--primary);outline-offset:2px; }
.seller-avatar { width:56px;height:56px;flex:none;border-radius:50%;background:var(--bg-surface);border:2px solid rgba(255,255,255,.1);display:grid;place-items:center;color:#fff;font-size:1.2rem;font-weight:700;overflow:hidden; }
.seller-avatar img { width:100%;height:100%;object-fit:cover; }
.seller-info { display:flex;flex-direction:column;gap:6px;min-width:0; }
.seller-line { display:flex;align-items:center;flex-wrap:wrap;gap:8px; }
.seller-name { font-size:1rem;font-weight:600; }
.seller-check { flex-shrink:0; }
.seller-label { font-size:.78rem;color:var(--text-muted); }
.stars { position:relative;display:inline-flex;width:88px;height:16px;flex:none; }
.stars .star { position:absolute;top:0;width:16px;height:16px; }
.stars-fill { position:absolute;left:0;top:0;height:16px;overflow:hidden; }
.stars-fill .star { position:absolute;top:0; }
.seller-score { font-size:.85rem;font-weight:600; }
.seller-muted { font-size:.8rem;color:var(--text-muted); }
.seller-dot { color:var(--text-muted); }
.seller-count { font-size:.8rem;color:var(--text-secondary); }
.seller-cta { display:flex;align-items:center;gap:10px;margin-left:auto;color:var(--text-secondary);font-size:.82rem;font-weight:500;white-space:nowrap;transition:color .15s; }
.seller-go { width:40px;height:40px;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(255,255,255,.14);color:var(--text);transition:background-color .15s,border-color .15s,transform .15s; }
.seller-card:hover .seller-cta { color:var(--text); }
.seller-card:hover .seller-go { background:var(--primary);border-color:var(--primary);color:#fff;transform:translateX(2px); }
@media (max-width:560px) { .seller-card { flex-wrap:wrap; } .seller-cta { margin-left:72px; } }
</style>
