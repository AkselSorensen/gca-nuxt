<template>
  <div class="home">
    <HeroSection :total-products="stats.totalProducts" :total-sales="stats.totalSales" :avg-rating="stats.avgRating" />

    <section class="section"><div class="container">
      <div class="section-header"><h2>Explorer par catégorie</h2><NuxtLink to="/catalogue" class="section-link">Tout voir →</NuxtLink></div>
      <div ref="categoryRef" class="categories-strip">
        <NuxtLink v-for="c in categories" :key="c.id" :to="'/catalogue?c='+c.slug" class="cat-card" :ref="el => catRefs.push(el)">
          <div class="cat-bg" :style="{ background: c.bg }"></div>
          <div class="cat-icon" v-html="c.icon"></div>
          <div class="cat-info">
            <span class="cat-name">{{ c.name }}</span>
            <span class="cat-count">{{ c.count }} {{ c.count > 1 ? 'ressources' : 'ressource' }}</span>
          </div>
        </NuxtLink>
        <NuxtLink to="/catalogue" class="cat-card cat-all">
          <div class="cat-bg" style="background:rgba(255,255,255,0.02)"></div>
          <div class="cat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/><path d="M4.6 15a1.65 1.65 0 0 0-.33 1.82l-.06.06a2 2 0 1 0 2.83 2.83l.06-.06a1.65 1.65 0 0 1 1.82-.33"/><path d="M14 2h-4v4a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2V2z"/></svg>
          </div>
          <div class="cat-info">
            <span class="cat-name">Tout voir</span>
            <span class="cat-count">Parcourir le catalogue</span>
          </div>
        </NuxtLink>
      </div>
    </div></section>

    <section class="section"><div class="container">
      <div class="section-header"><h2>Tendances</h2><NuxtLink to="/catalogue" class="section-link">Voir tout →</NuxtLink></div>
      <div v-if="loading" class="loading">Chargement…</div>
      <div v-else class="products-grid">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" class="animate-in" />
      </div>
    </div></section>

    <section v-if="discounts.length" class="section"><div class="container">
      <div class="section-header"><h2>Promotions</h2><NuxtLink to="/catalogue?sort=discount" class="section-link">Voir tout →</NuxtLink></div>
      <div class="products-grid">
        <ProductCard v-for="p in discounts" :key="p.id" :product="p" class="animate-in" />
      </div>
    </div></section>

    <!-- Collaborateurs -->
    <section v-if="collabItems.length" class="section collab-section"><div class="container">
      <div class="collab-header">
        <div class="collab-tag">PARTENAIRES</div>
        <h2>Ils nous font confiance</h2>
        <p>Des créateurs et studios qui misent sur GSA pour distribuer leurs assets.</p>
      </div>
      <div class="collab-grid">
        <div v-for="(item, i) in collabItems" :key="i" class="collab-card" :style="{ transitionDelay: i * 0.06 + 's' }">
          <div class="collab-ring">
            <div class="collab-avatar"><img :src="item.image" :alt="item.name" loading="lazy" /></div>
          </div>
          <div class="collab-label">
            <span class="collab-name">{{ item.name }}</span>
            <span class="collab-role">Collaborateur</span>
          </div>
        </div>
      </div>
    </div></section>

    <!-- Communauté -->
    <section v-if="commItems.length" class="section comm-section"><div class="container">
      <div class="collab-header">
        <div class="collab-tag" style="--tag-clr:var(--accent)">SERVEURS</div>
        <h2>Communautés partenaires</h2>
        <p>Des serveurs qui utilisent et recommandent nos assets.</p>
      </div>
      <div class="collab-grid">
        <div v-for="(item, i) in commItems" :key="i" class="collab-card" :style="{ transitionDelay: i * 0.06 + 's' }">
          <div class="collab-ring">
            <div class="collab-avatar"><img :src="item.image" :alt="item.name" loading="lazy" /></div>
          </div>
          <div class="collab-label">
            <span class="collab-name">{{ item.name }}</span>
            <span class="collab-role">Serveur</span>
          </div>
        </div>
      </div>
    </div></section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const api = config.public.apiOrigin
const { data: bootstrap } = await useFetch(api + '/api/bootstrap')
const state = computed(() => bootstrap.value || {})

const stats = computed(() => ({
  totalProducts: state.value.totalProducts || 51,
  totalSales: state.value.totalSales || 149,
  avgRating: (state.value.avgRating || 4.8).toFixed(1)
}))

const categories = [
  { id:1, name:'DarkRP', slug:'darkrp', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f7df6" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', color:'#2f7df6', bg:'rgba(47,125,246,0.08)', count:12 },
  { id:2, name:'HUDs', slug:'huds', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>', color:'#6c5ce7', bg:'rgba(108,92,231,0.08)', count:8 },
  { id:3, name:'Maps', slug:'maps', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>', color:'#6ee7b7', bg:'rgba(110,231,183,0.08)', count:6 },
  { id:4, name:'Scripts', slug:'scripts', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', color:'#fbbf24', bg:'rgba(251,191,36,0.08)', count:15 },
  { id:5, name:'Véhicules', slug:'vehicules', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="1.5"><path d="M5 17a2 2 0 0 1-2 2H2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1.5"/><path d="M19 17a2 2 0 0 0 2 2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1.5"/><path d="M3 14l1.5-5.5A2 2 0 0 1 6.5 7H10l2-3h3l-1 3h2.5a2 2 0 0 1 2 1.5L21 14"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>', color:'#f87171', bg:'rgba(248,113,113,0.08)', count:6 },
  { id:6, name:'Armes', slug:'armes', icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.5"><path d="M20 6L9 17l-5-5 3-3 8 8 3-3-5-5 2-2 5 5 3-3-3-3 2-2 5 5-3 3z"/></svg>', color:'#a78bfa', bg:'rgba(167,139,250,0.08)', count:6 }
]

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

// GSAP — Timeline with stagger, custom ease, utils
const categoryRef = ref(null)
const catRefs = ref([])
const collabStageRef = ref<HTMLElement | null>(null)
const collabTrackRef = ref<HTMLElement | null>(null)
const commStageRef = ref<HTMLElement | null>(null)
const commTrackRef = ref<HTMLElement | null>(null)

function startAutoCarousel(track: HTMLElement, speed: number) {
  const items = track.querySelectorAll('.people-card')
  if (items.length < 2) return
  const itemW = (items[0] as HTMLElement).offsetWidth + 16 // card + gap
  let x = 0
  const maxX = -(items.length / 2) * itemW // half is clones
  let animId: number

  function step() {
    x -= speed
    if (x <= maxX) x = 0
    track.style.transform = `translateX(${x}px)`
    animId = requestAnimationFrame(step)
  }

  collabAnims.push(() => cancelAnimationFrame(animId))
  step()
}

const collabAnims: (() => void)[] = []

onMounted(async () => {
  let gsap: any
  try {
    const mod = await import('gsap')
    gsap = mod.default
  } catch {}

  // Entrance animations
  if (gsap) {
    // Hero timeline (existing)
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.6 } })
    heroTl.fromTo('.hero-tag', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
      .fromTo('.title-line', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08 })
      .fromTo('.hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .fromTo('.hero-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.1')
      .fromTo('.hero-metrics', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 })
      .fromTo('.hero-visual > *', { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5 }, '-=0.3')

    // Categories
    gsap.fromTo('.cat-card',
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: { amount: 0.5, from: 'start' }, duration: 0.5, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.categories-strip', start: 'top 85%', toggleActions: 'play none none none' }
      }
    )

    // Products
    gsap.fromTo('.animate-in',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, stagger: { amount: 0.6, from: 'start' }, duration: 0.5, ease: 'power2.out',
        scrollTrigger: { trigger: '.animate-in', start: 'top 92%', toggleActions: 'play none none none' }
      }
    )

    // Section headers
    gsap.utils.toArray('.section-header').forEach((hdr: any) => {
      gsap.fromTo(hdr, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4,
        scrollTrigger: { trigger: hdr, start: 'top 92%', toggleActions: 'play none none none' }
      })
    })

    // People section entrance
    gsap.utils.toArray('.collab-section, .comm-section').forEach((section: any) => {
      gsap.fromTo(section, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' }
      })
      // Stagger cards inside grid
      const cards = section.querySelectorAll('.collab-card')
      gsap.fromTo(cards, { opacity: 0, scale: .85, y: 20 }, {
        opacity: 1, scale: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: section.querySelector('.collab-grid'), start: 'top 85%', toggleActions: 'play none none none' }
      })
    })
  }

  // Start auto carousels
  if (collabTrackRef.value) startAutoCarousel(collabTrackRef.value, 0.8)
  if (commTrackRef.value) startAutoCarousel(commTrackRef.value, 0.6)
})

watch(featured, () => {
  if (useNuxtApp().$gsap) setTimeout(() => useNuxtApp().$gsap.fromTo('.animate-in', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.5 }), 200)
})

onBeforeUnmount(() => {
  collabAnims.forEach(fn => fn())
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

/* ─── Collaborateurs premium ─── */
.collab-section, .comm-section { padding:48px 0;position:relative;overflow:hidden; }

.collab-header { text-align:center;margin-bottom:36px; }
.collab-tag { display:inline-block;padding:4px 14px;border-radius:999px;background:rgba(47,125,246,0.08);border:1px solid rgba(47,125,246,0.15);color:var(--tag-clr,var(--primary));font-size:.68rem;font-weight:700;letter-spacing:.08em;margin-bottom:10px;text-transform:uppercase; }
.collab-header h2 { font-size:1.6rem;font-weight:900;letter-spacing:-.03em; }
.collab-header p { color:var(--text-secondary);font-size:.92rem;margin-top:6px; }

.collab-grid { display:flex;flex-wrap:wrap;gap:32px;justify-content:center;padding:8px 0; }

.collab-card { display:grid;gap:14px;text-align:center;transition:all .3s;width:150px; }
.collab-card:hover { transform:translateY(-6px); }

.collab-ring { position:relative;width:120px;height:120px;margin:0 auto;border-radius:50%;padding:4px;background:conic-gradient(var(--primary),var(--accent),#a78bfa,var(--primary)); }
.comm-section .collab-ring { background:conic-gradient(var(--accent),#a78bfa,var(--primary),var(--accent)); }

.collab-avatar { width:100%;height:100%;border-radius:50%;overflow:hidden;background:var(--bg);display:grid;place-items:center; }
.collab-avatar img { width:100%;height:100%;object-fit:cover;transition:transform .35s; }
.collab-card:hover .collab-avatar img { transform:scale(1.08); }

.collab-label { display:grid;gap:2px; }
.collab-name { font-size:.9rem;font-weight:800;letter-spacing:-.01em; }
.collab-role { font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;font-weight:600; }
</style>
