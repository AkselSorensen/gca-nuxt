<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <!-- Hero -->
      <div class="about-hero anim-up">
        <h1>{{ t('about.hero_h1') }}</h1>
        <p class="hero-intro">{{ t('about.hero_intro1') }}</p>
        <p class="hero-intro">{{ t('about.hero_intro2') }}</p>
      </div>

      <div class="about-content anim-card">
        <!-- Notre vision -->
        <section class="about-block">
          <span class="block-label">{{ t('about.label_vision') }}</span>
          <h2>{{ t('about.vision_h2') }}</h2>
          <p>{{ t('about.vision_p1') }}</p>
          <p>{{ t('about.vision_p2') }}</p>
          <p><strong>{{ t('about.vision_p3') }}</strong></p>
          <p>{{ t('about.vision_p4') }}</p>
        </section>

        <!-- Une marketplace différente -->
        <section class="about-block accent-block">
          <span class="block-label">{{ t('about.label_market') }}</span>
          <h2>{{ t('about.market_h2') }}</h2>
          <p>{{ t('about.market_p1') }}</p>
          <p>{{ t('about.market_p2') }}</p>
          <p>{{ t('about.market_p3') }}</p>
          <p>{{ t('about.market_p4') }}</p>
          <p>{{ t('about.market_p5') }}</p>
          <div class="block-quote">
            <strong>{{ t('about.market_quote1') }}</strong>
            {{ t('about.market_quote2') }}
          </div>
        </section>

        <!-- Des ressources pour créer -->
        <section class="about-block">
          <span class="block-label">{{ t('about.label_resources') }}</span>
          <h2>{{ t('about.resources_h2') }}</h2>
          <p>{{ t('about.resources_p1') }}</p>
          <p>{{ t('about.resources_p2') }}</p>
          <p>{{ t('about.resources_p3') }}</p>
        </section>

        <!-- Plus que des ressources -->
        <section class="about-block accent-block">
          <span class="block-label">{{ t('about.label_more') }}</span>
          <h2>{{ t('about.more_h2') }}</h2>
          <p>{{ t('about.more_p1') }}</p>
          <p>{{ t('about.more_p2') }}</p>
          <p>{{ t('about.more_p3') }}</p>
          <p><strong>{{ t('about.more_p4') }}</strong></p>
          <div class="block-cta">
            <NuxtLink to="/prestation" class="btn-outline">{{ t('about.more_cta') }}</NuxtLink>
          </div>
        </section>

        <!-- Un accompagnement humain -->
        <section class="about-block">
          <span class="block-label">{{ t('about.label_support') }}</span>
          <h2>{{ t('about.support_h2') }}</h2>
          <p>{{ t('about.support_p1') }}</p>
          <p>{{ t('about.support_p2') }}</p>
          <p>{{ t('about.support_p3') }}</p>
          <p>{{ t('about.support_p4') }}</p>
          <div class="block-quote">{{ t('about.support_quote') }}</div>
        </section>

        <!-- Des licences claires -->
        <section class="about-block accent-block">
          <span class="block-label">{{ t('about.label_licenses') }}</span>
          <h2>{{ t('about.licenses_h2') }}</h2>
          <p>{{ t('about.licenses_p1') }}</p>
          <p>{{ t('about.licenses_p2') }}</p>
          <p>{{ t('about.licenses_p3') }}</p>
          <p>{{ t('about.licenses_p4') }}</p>
          <div class="block-quote"><strong>{{ t('about.licenses_quote') }}</strong></div>
        </section>

        <!-- Pour les créateurs -->
        <section class="about-block">
          <span class="block-label">{{ t('about.label_creators') }}</span>
          <h2>{{ t('about.creators_h2') }}</h2>
          <p>{{ t('about.creators_p1') }}</p>
          <p>{{ t('about.creators_p2') }}</p>
          <p>{{ t('about.creators_p3') }}</p>
        </section>

        <!-- Notre objectif -->
        <section class="about-block accent-block">
          <span class="block-label">{{ t('about.label_objective') }}</span>
          <h2>{{ t('about.objective_h2') }}</h2>
          <p>{{ t('about.objective_p1') }}</p>
          <p>{{ t('about.objective_p2') }}</p>
          <p>{{ t('about.objective_p3') }}</p>
          <p>{{ t('about.objective_p4') }}</p>
        </section>
      </div>

      <!-- Bannière finale -->
      <div class="about-outro anim-card">
        <h2>GSA</h2>
        <p class="outro-tagline">{{ t('about.outro_tag') }}</p>
        <div class="outro-list">
          <span>{{ t('about.outro_1') }}</span>
          <span>{{ t('about.outro_2') }}</span>
          <span>{{ t('about.outro_3') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ link: [{ rel: 'canonical', href: 'https://gsa-store.fr/about' }] })
useSeoMeta({
  title: 'À propos — GSA Store',
  description: 'GSA, pas une boutique. Un standard. Découvrez notre vision de la marketplace.',
  ogType: 'website',
  
})

const pageRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.page-static { padding:40px 0 64px; }
.about-hero { text-align:center; max-width:780px; margin:0 auto 48px; display:grid; gap:14px; }
.about-hero h1 { font-size:clamp(2rem,5vw,3rem); font-weight:900; letter-spacing:-.03em; background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 60%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.hero-intro { color:var(--text-secondary); font-size:1.02rem; line-height:1.7; margin:0; }
.about-content { display:grid; gap:20px; max-width:800px; margin:0 auto; }
.about-block { padding:30px 32px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); display:grid; gap:12px; }
.accent-block { border-left:3px solid var(--primary); }
.block-label { font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.14em; color:var(--primary); }
.about-block h2 { margin:0; font-size:1.35rem; font-weight:800; letter-spacing:-.02em; }
.about-block p { margin:0; color:var(--text-secondary); font-size:.93rem; line-height:1.75; }
.about-block strong { color:var(--text); }
.block-quote { padding:14px 18px; border-radius:10px; background:var(--bg-surface); border:1px solid var(--border); font-size:.92rem; line-height:1.7; color:var(--text-secondary); display:grid; gap:2px; }
.block-quote strong { color:var(--text); }
.block-cta { margin-top:6px; }
.btn-outline { display:inline-flex; padding:12px 26px; border-radius:10px; border:1px solid var(--primary); color:var(--primary); font-weight:700; font-size:.9rem; text-decoration:none; transition:all .2s; }
.btn-outline:hover { background:rgba(47,125,246,0.1); transform:translateY(-1px); }
.about-outro { margin:40px auto 0; max-width:800px; text-align:center; padding:44px 32px; border-radius:var(--radius-lg); background:linear-gradient(160deg,rgba(47,125,246,0.08),rgba(124,58,237,0.08)); border:1px solid var(--border); display:grid; gap:10px; }
.about-outro h2 { margin:0; font-size:2.4rem; font-weight:900; letter-spacing:-.03em; }
.outro-tagline { margin:0; font-size:1.05rem; color:var(--text-secondary); }
.outro-list { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:10px; }
.outro-list span { padding:8px 16px; border-radius:999px; background:var(--bg-surface); border:1px solid var(--border); font-size:.82rem; color:var(--text-secondary); }
</style>
