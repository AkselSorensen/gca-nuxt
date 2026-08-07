<template>
  <section class="hero">
    <div class="container">
      <div class="hero-inner">
        <h1 class="hero-title">
          Des assets <span class="accent">premium</span>,<br />prêts à déployer.
        </h1>
        <p class="hero-desc">{{ t('hero.desc') }}</p>
        <div class="hero-actions">
          <NuxtLink to="/catalogue" class="btn-primary">
            {{ t('hero.explore') }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
          </NuxtLink>
        </div>
        <div class="hero-pills">
          <div class="pill"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> {{ t('hero.themes') }}</div>
          <div class="pill"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> {{ t('hero.env') }}</div>
          <div class="pill"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> {{ t('hero.dev') }}</div>
          <div class="pill"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {{ t('hero.visual') }}</div>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>{{ totalProducts }}</strong> <span>{{ t('hero.assets') }}</span></div>
          <div class="stat"><strong>{{ totalSales }}+</strong> <span>{{ t('hero.sales') }}</span></div>
          <div class="stat"><strong>{{ avgRating }}</strong> <span>{{ t('hero.rating') }}</span></div>
          <div class="stat"><strong>25+</strong> <span>{{ t('hero.creators') }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useLang()
defineProps({ totalProducts: Number, totalSales: Number, avgRating: String })
</script>

<style scoped>
.hero {
  padding: 80px 0 64px;
  text-align: center;
}
.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.04em;
  max-width: 700px;
}
.hero-title .accent {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 520px;
}

.hero-actions { margin-top: 4px; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 12px;
  background: #fff;
  color: #000;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.25s;
  text-decoration: none;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,255,255,0.15); }

.hero-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.pill svg { opacity: 0.5; }

.hero-stats {
  display: flex;
  gap: 32px;
  margin-top: 20px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}
.stat { text-align: center; }
.stat strong { display: block; font-size: 1.15rem; font-weight: 800; }
.stat span { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }

@media (max-width: 640px) {
  .hero { padding: 48px 0 40px; }
  .hero-stats { gap: 20px; flex-wrap: wrap; justify-content: center; }
}
</style>
