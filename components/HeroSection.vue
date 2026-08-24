<template>
  <section class="hero">
    <video class="hero-video" autoplay loop muted playsinline>
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
    <div class="hero-overlay"></div>
    <div class="container hero-inner">
      <div class="hero-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        {{ totalProducts }}+ {{ t('hero.assets_verified') }}
      </div>
      <h1 class="hero-title">
        {{ t('hero.title1') }} {{ t('hero.title2') }}<br /><span class="accent">{{ t('hero.title3') }}</span>
      </h1>
      <p class="hero-desc">{{ t('hero.desc') }}</p>
      <div class="hero-actions">
        <NuxtLink to="/catalogue" class="btn-primary">
          {{ t('hero.explore') }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
        </NuxtLink>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-val">{{ totalProducts }}</span>
          <span class="stat-lbl">{{ t('hero.assets') }}</span>
        </div>
        <div class="stat">
          <span class="stat-val">{{ totalSales }}+</span>
          <span class="stat-lbl">{{ t('hero.sales') }}</span>
        </div>
        <div class="stat">
          <span class="stat-val">{{ avgRating }}</span>
          <span class="stat-lbl">{{ t('hero.rating') }}</span>
        </div>
        <div class="stat">
          <span class="stat-val">{{ totalCreators }}+</span>
          <span class="stat-lbl">{{ t('hero.creators') }}</span>
        </div>
      </div>
    </div>
    <div class="hero-scroll">
      <span>Scroll</span>
      <svg class="hero-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useLang()
defineProps({ totalProducts: Number, totalSales: Number, avgRating: String, totalCreators: Number })
</script>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 100px 0 32px;
  overflow: hidden;
}
.hero-scroll {
  position: absolute; bottom: 76px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: var(--text-muted); font-size: 0.68rem; text-transform: uppercase;
  letter-spacing: 0.18em; font-weight: 600; pointer-events: none; z-index: 2;
}
.hero-arrow { animation: hero-bounce 1.8s ease-in-out infinite; }
@keyframes hero-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(7px); opacity: 1; }
}
.hero-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.35;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, var(--bg) 90%);
  pointer-events: none;
}
.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(47,125,246,0.2);
  background: rgba(47,125,246,0.06);
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 600;
}
.hero-badge svg { color: #f5b342; }

.hero-title {
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.04em;
  max-width: 750px;
}
.hero-title .accent {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 500px;
}

.hero-actions { margin-top: 4px; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  border-radius: 12px;
  background: #fff;
  color: #000;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  text-decoration: none;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,255,255,0.15); }

.hero-stats {
  display: flex;
  gap: 36px;
  margin-top: 20px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.stat { text-align: center; }
.stat-val { display: block; font-size: 1.3rem; font-weight: 800; }
.stat-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-top: 2px; }

@media (max-width: 640px) {
  .hero { padding: 60px 0 48px; min-height: 100svh; }
  .hero-stats { gap: 20px; flex-wrap: wrap; justify-content: center; }
}
</style>
