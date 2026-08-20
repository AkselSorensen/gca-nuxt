<template>
  <div class="home">
    <HeroSection :total-products="stats.totalProducts" :total-sales="stats.totalSales" :avg-rating="stats.avgRating" :total-creators="stats.totalCreators" />

    <section class="section"><div class="container">
      <div class="section-header"><h2>{{ t('home.categories') }}</h2><NuxtLink to="/catalogue" class="section-link">{{ t('home.see_all') }} →</NuxtLink></div>
      <div ref="categoryRef" class="categories-strip">
        <NuxtLink v-for="c in categories" :key="c.slug" :to="'/catalogue?c='+c.slug" class="cat-card" :ref="el => catRefs.push(el)">
          <div class="cat-bg" :style="{ background: c.bg }"></div>
          <div class="cat-icon" v-html="c.icon"></div>
          <div class="cat-info">
            <span class="cat-name">{{ c.name }}</span>
            <span class="cat-count">{{ c.count }} {{ c.count > 1 ? t('home.resources') : t('home.resource') }}</span>
          </div>
        </NuxtLink>
        <NuxtLink to="/catalogue" class="cat-card cat-all">
          <div class="cat-bg" style="background:rgba(255,255,255,0.02)"></div>
          <div class="cat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/><path d="M4.6 15a1.65 1.65 0 0 0-.33 1.82l-.06.06a2 2 0 1 0 2.83 2.83l.06-.06a1.65 1.65 0 0 1 1.82-.33"/><path d="M14 2h-4v4a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2V2z"/></svg>
          </div>
          <div class="cat-info">
            <span class="cat-name">Tout voir</span>
            <span class="cat-count">{{ t('home.browse_catalog') }}</span>
          </div>
        </NuxtLink>
      </div>
    </div></section>

    <section class="section"><div class="container">
      <div class="section-header"><h2>{{ t('home.trending') }}</h2><NuxtLink to="/catalogue?sort=trending" class="section-link">Voir tout →</NuxtLink></div>
      <div v-if="loading" class="loading">{{ t('home.loading') }}</div>
      <div v-else class="prod-carousel-wrap">
        <button class="prod-arrow prod-arrow-left" @click="slideProd('trending',-1)" :disabled="prodPage.trending === 0" :aria-label="t('home.prev')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="prod-carousel" ref="trendingStageRef">
          <div class="prod-track" ref="trendingTrackRef">
            <ProductCard v-for="p in featured" :key="p.id" :product="p" class="prod-slide" />
          </div>
        </div>
        <button class="prod-arrow prod-arrow-right" @click="slideProd('trending',1)" :disabled="prodPage.trending >= prodPages('trending') - 1" :aria-label="t('home.next')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      <div class="prod-dots">
        <button v-for="(_, i) in prodPages('trending')" :key="i" class="prod-dot" :class="{ active: prodPage['trending'] === i }" @click="goProdPage('trending', i)"></button>
      </div>
    </div></section>

    <!-- Projets -->
    <section v-if="commItems.length" class="section comm-section"><div class="container">
      <div class="collab-header">
        <h2>{{ t('home.servers_title') }}</h2>
        <p>{{ t('home.servers_desc') }}</p>
      </div>
      <div ref="commStageRef" class="carousel-stage" @mouseenter="pauseCarousel('comm')" @mouseleave="resumeCarousel('comm')">
        <div ref="commTrackRef" class="carousel-track" @mousedown="dragStart($event,'comm')" @mousemove="dragMove($event,'comm')" @mouseup="dragEnd('comm')" @mouseleave="dragEnd('comm')" @touchstart="dragStart($event,'comm')" @touchmove="dragMove($event,'comm')" @touchend="dragEnd('comm')">
          <div v-for="(item, i) in commItems" :key="'comm-'+i" class="collab-card">
            <div class="collab-ring">
              <div class="collab-avatar"><img :src="item.image" :alt="item.name" loading="lazy" /></div>
            </div>
            <div class="collab-label">
              <span class="collab-name">{{ item.name }}</span>
              <span class="collab-role">{{ t('home.servers_role') }}</span>
            </div>
          </div>
        </div>
        <button class="carousel-arrow carousel-arrow-left" @click="slideCarousel('comm',1)" aria-label="Précédent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button class="carousel-arrow carousel-arrow-right" @click="slideCarousel('comm',-1)" aria-label="Suivant"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    </div></section>

    <section v-if="discounts.length" class="section"><div class="container">
      <div class="section-header"><h2>{{ t('home.promotions') }}</h2><NuxtLink to="/catalogue?sort=discount" class="section-link">Voir tout →</NuxtLink></div>
      <div class="prod-carousel-wrap">
        <button class="prod-arrow prod-arrow-left" @click="slideProd('discount',-1)" :disabled="prodPage.discount === 0" :aria-label="t('home.prev')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="prod-carousel" ref="discountStageRef">
          <div class="prod-track" ref="discountTrackRef">
            <ProductCard v-for="p in discounts" :key="p.id" :product="p" class="prod-slide" />
          </div>
        </div>
        <button class="prod-arrow prod-arrow-right" @click="slideProd('discount',1)" :disabled="prodPage.discount >= prodPages('discount') - 1" :aria-label="t('home.next')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      <div class="prod-dots">
        <button v-for="(_, i) in prodPages('discount')" :key="i" class="prod-dot" :class="{ active: prodPage['discount'] === i }" @click="goProdPage('discount', i)"></button>
      </div>
    </div></section>

    <!-- Collaborateurs -->
    <section v-if="collabItems.length" class="section collab-section"><div class="container">
      <div class="collab-header">
        <div class="collab-tag">{{ t('home.collab_tag') }}</div>
        <h2>{{ t('home.collab_title') }}</h2>
        <p>{{ t('home.collab_desc') }}</p>
      </div>
      <div ref="collabStageRef" class="carousel-stage" @mouseenter="pauseCarousel('collab')" @mouseleave="resumeCarousel('collab')">
        <div ref="collabTrackRef" class="carousel-track" @mousedown="dragStart($event,'collab')" @mousemove="dragMove($event,'collab')" @mouseup="dragEnd('collab')" @mouseleave="dragEnd('collab')" @touchstart="dragStart($event,'collab')" @touchmove="dragMove($event,'collab')" @touchend="dragEnd('collab')">
          <div v-for="(item, i) in collabItems" :key="'collab-'+i" class="collab-card">
            <div class="collab-ring">
              <div class="collab-avatar"><img :src="item.image" :alt="item.name" loading="lazy" /></div>
            </div>
            <div class="collab-label">
              <span class="collab-name">{{ item.name }}</span>
              <span class="collab-role">{{ t('home.collab_role') }}</span>
            </div>
          </div>
        </div>
        <button class="carousel-arrow carousel-arrow-left" @click="slideCarousel('collab',1)" aria-label="Précédent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button class="carousel-arrow carousel-arrow-right" @click="slideCarousel('collab',-1)" aria-label="Suivant"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    </div></section>

  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const api = config.public.apiOrigin
const { t } = useLang()
const { data: bootstrap } = await useFetch(api + '/api/bootstrap')
const state = computed(() => bootstrap.value || {})

const stats = computed(() => ({
  totalProducts: state.value.totalProducts ?? 51,
  totalSales: state.value.totalSales ?? 149,
  avgRating: (state.value.avgRating ?? 4.8).toFixed(1),
  totalCreators: state.value.totalCreators ?? state.value.totalSellers ?? 25
}))

const categoryIcons: Record<string, { icon: string; color: string; bg: string }> = {
  map: { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>', color: '#6ee7b7', bg: 'rgba(110,231,183,0.08)' },
  '3d-model': { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f7df6" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', color: '#2f7df6', bg: 'rgba(47,125,246,0.08)' },
  particle: { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
  animation: { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  ui: { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>', color: '#6c5ce7', bg: 'rgba(108,92,231,0.08)' },
  '3d-import': { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
}

const categoryFallback = { icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f7df6" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>', color: '#2f7df6', bg: 'rgba(47,125,246,0.08)' }

const categories = computed(() => {
  return (state.value.categories || []).map((c: any) => ({
    slug: c.slug,
    name: c.name,
    count: Number(c.productCount ?? c.product_count ?? c._count?.products ?? 0),
    ...(categoryIcons[c.slug] || categoryFallback),
  }))
})

const featured = computed(() => (state.value.trending || []).slice(0, 8))
const discounts = computed(() => (state.value.discounts || []).slice(0, 8))
const loading = computed(() => !bootstrap.value)

const landingConfig = computed(() => state.value.landingConfig || [])
const collabItems = computed(() => {
  const c = landingConfig.value.find((x: any) => x.section_key === 'featured_collab')
  return c?.metadata?.items || []
})
const commItems = computed(() => {
  const c = landingConfig.value.find((x: any) => x.section_key === 'featured_comm')
  return c?.metadata?.items || []
})

// ─── GSAP entrance ───
const categoryRef = ref(null)
const catRefs = ref([])

// ─── Carrousels ───
const collabStageRef = ref<HTMLElement | null>(null)
const collabTrackRef = ref<HTMLElement | null>(null)
const commStageRef = ref<HTMLElement | null>(null)
const commTrackRef = ref<HTMLElement | null>(null)

// ─── Product carousels (trending + discounts) ───
const trendingStageRef = ref<HTMLElement | null>(null)
const trendingTrackRef = ref<HTMLElement | null>(null)
const discountStageRef = ref<HTMLElement | null>(null)
const discountTrackRef = ref<HTMLElement | null>(null)
const VISIBLE = 3
const prodPage = reactive<Record<string, number>>({ trending: 0, discount: 0 })

function prodPages(key: string) {
  const count = key === 'trending' ? featured.value.length : discounts.value.length
  return Math.max(1, Math.ceil(count / VISIBLE))
}

function slideProd(key: string, dir: number) {
  const newPage = prodPage[key] + dir
  if (newPage >= 0 && newPage < prodPages(key)) {
    prodPage[key] = newPage
    updateProdTrack(key)
  }
}

function goProdPage(key: string, page: number) {
  prodPage[key] = page
  updateProdTrack(key)
}

function updateProdTrack(key: string) {
  const track = key === 'trending' ? trendingTrackRef.value : discountTrackRef.value
  if (!track) return
  const slideW = track.querySelector('.prod-slide') as HTMLElement | null
  if (!slideW) return
  const gap = 16
  const offset = -(prodPage[key] * VISIBLE * (slideW.offsetWidth + gap))
  track.style.transform = `translateX(${offset}px)`
}

interface CarouselState { x: number; speed: number; paused: boolean; animId: number; dragging: boolean; dragStartX: number; dragStartPos: number; itemW: number; track: HTMLElement | null; origCount: number }
const carousels: Record<string, CarouselState> = {
  collab: { x: 0, speed: 0.15, paused: false, animId: 0, dragging: false, dragStartX: 0, dragStartPos: 0, itemW: 0, track: null, origCount: 0 },
  comm:  { x: 0, speed: 0.12, paused: false, animId: 0, dragging: false, dragStartX: 0, dragStartPos: 0, itemW: 0, track: null, origCount: 0 }
}

function cloneItems(track: HTMLElement) {
  const cards = track.querySelectorAll('.collab-card')
  if (cards.length === 0) return
  const fragment = document.createDocumentFragment()
  for (let clone = 0; clone < 3; clone++) {
    cards.forEach(card => fragment.appendChild(card.cloneNode(true)))
  }
  track.appendChild(fragment)
}

function initCarousel(key: string) {
  const state = carousels[key]
  if (!state.track) return
  state.x = 0
  state.paused = false
  state.dragging = false

  // Store original count BEFORE cloning
  const origCards = state.track.querySelectorAll('.collab-card')
  state.origCount = origCards.length

  cloneItems(state.track)

  const cards = state.track.querySelectorAll('.collab-card')
  if (cards.length < 2) return
  const first = cards[0] as HTMLElement
  state.itemW = first.offsetWidth + getGap(state.track)

  // Animate
  requestAnimationFrame(() => step(key))
}

function getGap(el: HTMLElement): number {
  const style = getComputedStyle(el)
  const gap = parseFloat(style.columnGap || style.gap || '0')
  return isNaN(gap) ? 32 : gap
}

function step(key: string) {
  const state = carousels[key]
  if (!state.track || state.paused) return
  state.x -= state.speed
  if (state.x <= -state.itemW * state.origCount) state.x = 0
  state.track.style.transform = `translateX(${state.x}px)`
  state.animId = requestAnimationFrame(() => step(key))
}

function pauseCarousel(key: string) {
  const state = carousels[key]
  state.paused = true
  // Annule la boucle en cours : sans ça, chaque interaction relançait step()
  // SANS tuer la boucle précédente → boucles parallèles → vitesse ×2, ×3…
  cancelAnimationFrame(state.animId)
}

function resumeCarousel(key: string) {
  const state = carousels[key]
  if (!state.track || !state.paused) return // ne relance que si réellement arrêté
  state.paused = false
  requestAnimationFrame(() => step(key))
}

function slideCarousel(key: string, dir: number) {
  const state = carousels[key]
  if (!state.track) return
  state.x += dir * state.itemW * 2
  if (state.x > 0) state.x = 0
  state.track.style.transform = `translateX(${state.x}px)`
}

// ─── Drag ───
function dragStart(e: MouseEvent | TouchEvent, key: string) {
  const state = carousels[key]
  state.dragging = true
  state.paused = true
  cancelAnimationFrame(state.animId)
  const evt = 'touches' in e ? e.touches[0] : e
  state.dragStartX = evt.clientX
  state.dragStartPos = state.x
}
function dragMove(e: MouseEvent | TouchEvent, key: string) {
  const state = carousels[key]
  if (!state.dragging || !state.track) return
  const evt = 'touches' in e ? e.touches[0] : e
  const dx = evt.clientX - state.dragStartX
  state.x = state.dragStartPos + dx
  state.track.style.transform = `translateX(${state.x}px)`
}
function dragEnd(key: string) {
  const state = carousels[key]
  state.dragging = false
  // dragEnd est lié à @mouseup ET @mouseleave → appelé 2× de suite.
  // Le 1er relance la boucle ; le 2e ne doit RIEN faire (elle tourne déjà),
  // sinon boucles parallèles → vitesse qui augmente après chaque interaction.
  if (!state.paused) return
  state.paused = false
  requestAnimationFrame(() => step(key))
}

onMounted(async () => {
  let gsap: any
  try {
    const mod = await import('gsap')
    gsap = mod.default
  } catch {}

  if (gsap) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } })
    heroTl.fromTo('.hero-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
      .fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
      .fromTo('.hero-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.2')
      .fromTo('.hero-pills', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.1')
      .fromTo('.hero-stats', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.1')

    gsap.fromTo('.cat-card',
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: { amount: 0.5, from: 'start' }, duration: 0.5, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.categories-strip', start: 'top 85%', toggleActions: 'play none none none' }
      }
    )

    gsap.fromTo('.prod-slide',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: { amount: 0.6, from: 'start' }, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: '.prod-carousel', start: 'top 92%', toggleActions: 'play none none none' }
      }
    )

    gsap.utils.toArray('.section-header').forEach((hdr: any) => {
      gsap.fromTo(hdr, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4,
        scrollTrigger: { trigger: hdr, start: 'top 92%', toggleActions: 'play none none none' }
      })
    })

    // Carrousel entrance
    gsap.utils.toArray('.collab-section, .comm-section').forEach((section: any) => {
      gsap.fromTo(section, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' }
      })
    })
  }

  // Init carousels
  await nextTick()
  carousels.collab.track = collabTrackRef.value
  carousels.comm.track = commTrackRef.value
  if (collabTrackRef.value) initCarousel('collab')
  if (commTrackRef.value) initCarousel('comm')
})

watch(featured, () => {
  if (useNuxtApp().$gsap) setTimeout(() => useNuxtApp().$gsap.fromTo('.prod-slide', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5 }), 200)
})

onBeforeUnmount(() => {
  Object.values(carousels).forEach(s => s.animId && cancelAnimationFrame(s.animId))
})
</script>
<style scoped>
.section { padding: 40px 0; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
.section-header h2 { font-size:1.3rem; font-weight:800; letter-spacing:-.02em; }
.section-link { font-size:.88rem; color:var(--primary); font-weight:600; transition:opacity .2s; }
.section-link:hover { opacity:.8; }

/* Categories strip */
.categories-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 0 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.categories-strip::-webkit-scrollbar { display: none; }

.cat-card {
  flex: 0 0 170px;
  position: relative;
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  border: 1px solid var(--border);
  transition: border-color .25s, transform .25s;
  will-change: transform;
}
.cat-card:hover { border-color: var(--border-hover); transform: translateY(-3px); }
.cat-card:hover .cat-bg { opacity: 1; }

.cat-bg {
  position: absolute;
  inset: 0;
  opacity: 0.6;
  transition: opacity .3s;
  pointer-events: none;
}
.cat-icon {
  position: relative;
  z-index: 1;
  width: 42px; height: 42px;
  display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
}
.cat-info { position: relative; z-index: 1; display: grid; gap: 2px; }
.cat-name { font-size: .92rem; font-weight: 700; color: var(--text); }
.cat-count { font-size: .75rem; color: var(--text-muted); font-weight: 500; }

.cat-all { border-style: dashed; border-color: rgba(255,255,255,0.06); }
.cat-all .cat-icon { background: transparent; }

.loading { text-align:center; padding:60px; color:var(--text-muted); }
.products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }

/* ─── Product carousels ─── */
.prod-carousel-wrap {
  display: flex;
  align-items: center;
  gap: 0;
}
.prod-carousel {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}
.prod-track {
  display: flex;
  gap: 16px;
  transition: transform 0.4s ease;
}
.prod-slide {
  flex: 0 0 calc((100% - 32px) / 3);
  min-width: 0;
}

.prod-arrow {
  flex-shrink: 0;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  display: grid; place-items: center;
  cursor: pointer;
  transition: all 0.2s;
}
.prod-arrow:hover:not(:disabled) { background: var(--border); color: #fff; }
.prod-arrow:disabled { opacity: 0.3; cursor: default; }
.prod-arrow-left { margin-right: 12px; }
.prod-arrow-right { margin-left: 12px; }

.prod-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.prod-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: none;
  background: var(--border);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.prod-dot.active { background: var(--primary); }

@media (max-width: 768px) {
  .prod-slide { flex: 0 0 calc((100% - 16px) / 2); }
}
@media (max-width: 480px) {
  .prod-slide { flex: 0 0 100%; }
  .prod-arrow { display: none; }
}

/* ─── Sections ─── */
.collab-section, .comm-section { padding:48px 0; }

.collab-header { text-align:center; margin-bottom:36px; }
.collab-tag { display:inline-block; padding:4px 14px; border-radius:999px; background:rgba(47,125,246,0.08); border:1px solid rgba(47,125,246,0.15); color:var(--tag-clr,var(--primary)); font-size:.68rem; font-weight:700; letter-spacing:.08em; margin-bottom:10px; text-transform:uppercase; }
.collab-header h2 { font-size:1.6rem; font-weight:900; letter-spacing:-.03em; }
.collab-header p { color:var(--text-secondary); font-size:.92rem; margin-top:6px; }

/* ─── Carrousel ─── */
.carousel-stage {
  position: relative;
  overflow: hidden;
  padding: 8px 0;
  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  display: grid; place-items: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity .25s, background .2s;
}
.carousel-stage:hover .carousel-arrow { opacity: 1; }
.carousel-arrow:hover { background: var(--border); }
.carousel-arrow-left { left: 4px; }
.carousel-arrow-right { right: 4px; }

.carousel-track {
  display: flex;
  gap: 32px;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}
.carousel-track:active { cursor: grabbing; }

.collab-card {
  flex: 0 0 150px;
  display: grid;
  gap: 14px;
  text-align: center;
  transition: transform .3s;
}
.collab-card:hover { transform: translateY(-6px); }

.collab-ring {
  position: relative;
  width: 120px; height: 120px;
  margin: 0 auto;
  border-radius: 50%;
  padding: 4px;
  background: conic-gradient(var(--primary),var(--accent),#a78bfa,var(--primary));
}
.comm-section .collab-ring { background: conic-gradient(var(--accent),#a78bfa,var(--primary),var(--accent)); }

.collab-avatar {
  width: 100%; height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg);
  display: grid; place-items: center;
}
.collab-avatar img { width:100%; height:100%; object-fit:cover; transition:transform .35s; }
.collab-card:hover .collab-avatar img { transform:scale(1.08); }

.collab-label { display:grid; gap:2px; }
.collab-name { font-size:.9rem; font-weight:800; letter-spacing:-.01em; }
.collab-role { font-size:.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:.05em; font-weight:600; }
</style>
