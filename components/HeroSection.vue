<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-glow"></div>
      <div class="floating-cards">
        <div v-for="i in 6" :key="i" class="float-card" :style="floatStyle(i)"></div>
      </div>
    </div>
    <div class="container">
      <div class="hero-layout">
        <div class="hero-main">
          <h1 class="hero-title">
            <span class="title-line">{{ t('hero.title1') }}</span>
            <span class="title-line accent">{{ t('hero.title2') }}</span>
            <span class="title-line">{{ t('hero.title3') }}</span>
          </h1>
          <p class="hero-desc">{{ t('hero.desc') }}</p>
          <div class="hero-actions">
            <NuxtLink to="/catalogue" class="btn-primary">
              {{ t('hero.explore') }}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
            </NuxtLink>
          </div>
          <div class="hero-metrics">
            <div class="metric-item" style="--hue:210">
              <div class="metric-ring">
                <svg viewBox="0 0 40 40"><circle class="track" cx="20" cy="20" r="17"/><circle class="fill" cx="20" cy="20" r="17" stroke-dasharray="106.8" stroke-dashoffset="26.7"/></svg>
                <span class="metric-val">{{ totalProducts }}</span>
              </div>
              <span class="metric-lbl">{{ t('hero.assets') }}</span>
            </div>
            <div class="metric-item" style="--hue:270">
              <div class="metric-ring">
                <svg viewBox="0 0 40 40"><circle class="track" cx="20" cy="20" r="17"/><circle class="fill" cx="20" cy="20" r="17" stroke-dasharray="106.8" stroke-dashoffset="10.7"/></svg>
                <span class="metric-val">{{ totalSales }}+</span>
              </div>
              <span class="metric-lbl">{{ t('hero.sales') }}</span>
            </div>
            <div class="metric-item" style="--hue:150">
              <div class="metric-ring">
                <svg viewBox="0 0 40 40"><circle class="track" cx="20" cy="20" r="17"/><circle class="fill" cx="20" cy="20" r="17" stroke-dasharray="106.8" stroke-dashoffset="37.4"/></svg>
                <span class="metric-val">{{ avgRating }}</span>
              </div>
              <span class="metric-lbl">{{ t('hero.rating') }}</span>
            </div>
            <div class="metric-item" style="--hue:330">
              <div class="metric-ring">
                <svg viewBox="0 0 40 40"><circle class="track" cx="20" cy="20" r="17"/><circle class="fill" cx="20" cy="20" r="17" stroke-dasharray="106.8" stroke-dashoffset="21.4"/></svg>
                <span class="metric-val">25+</span>
              </div>
              <span class="metric-lbl">{{ t('hero.creators') }}</span>
            </div>
          </div>
        </div>
        <div class="hero-showcase">
          <div class="showcase-card card-1">
            <div class="sc-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <div class="sc-body">
              <strong>{{ t('hero.themes') }}</strong>
              <span>{{ t('hero.themes_sub') }}</span>
            </div>
          </div>
          <div class="showcase-card card-2">
            <div class="sc-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div class="sc-body">
              <strong>{{ t('hero.env') }}</strong>
              <span>{{ t('hero.env_sub') }}</span>
            </div>
          </div>
          <div class="showcase-card card-3">
            <div class="sc-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <div class="sc-body">
              <strong>{{ t('hero.dev') }}</strong>
              <span>{{ t('hero.dev_sub') }}</span>
            </div>
          </div>
          <div class="showcase-card card-4">
            <div class="sc-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div class="sc-body">
              <strong>{{ t('hero.visual') }}</strong>
              <span>{{ t('hero.visual_sub') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useLang()
defineProps({ totalProducts: Number, totalSales: Number, avgRating: String })

const colors = ['var(--primary)', 'var(--accent)', '#a78bfa', '#6ee7b7', '#fbbf24', '#f87171']
const sizes = [180, 140, 200, 160, 220, 130]
const positions = [
  { top: '10%', left: '5%' }, { top: '60%', left: '85%' },
  { top: '5%', left: '45%' }, { top: '70%', left: '15%' },
  { top: '30%', left: '75%' }, { top: '50%', left: '50%' }
]
const durations = [18, 22, 15, 20, 25, 17]

function floatStyle(i: number) {
  const idx = i - 1
  return {
    width: sizes[idx] + 'px',
    height: sizes[idx] + 'px',
    background: colors[idx],
    top: positions[idx].top,
    left: positions[idx].left,
    animationDuration: durations[idx] + 's',
    animationDelay: -(idx * 3) + 's'
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  padding: 60px 0 80px;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hero-glow {
  position: absolute;
  top: -200px;
  right: -100px;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(47,125,246,0.1) 0%, rgba(108,92,231,0.05) 50%, transparent 70%);
  filter: blur(80px);
}

.floating-cards {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.float-card {
  position: absolute;
  border-radius: 20px;
  opacity: 0.06;
  filter: blur(40px);
  animation: floatDrift linear infinite;
}

@keyframes floatDrift {
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
  25%  { transform: translate(40px, -30px) rotate(5deg) scale(1.1); }
  50%  { transform: translate(-20px, 20px) rotate(-3deg) scale(0.95); }
  75%  { transform: translate(30px, -10px) rotate(4deg) scale(1.05); }
  100% { transform: translate(0, 0) rotate(0deg) scale(1); }
}

.hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Left side */
.hero-main { display: grid; gap: 20px; }

.hero-title { display: grid; gap: 0; }
.title-line {
  display: block;
  font-size: clamp(2.4rem, 5.5vw, 3.8rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.04em;
}
.title-line.accent {
  background: linear-gradient(135deg, var(--primary), var(--accent), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), #4f46e5);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.25s;
  border: none;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(47,125,246,0.3);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(47,125,246,0.4); }

.hero-metrics {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 12px;
}
.metric-item {
  display: grid;
  gap: 6px;
  text-align: center;
}
.metric-ring {
  position: relative;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
}
.metric-ring svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.metric-ring .track {
  fill: none;
  stroke: rgba(255,255,255,0.04);
  stroke-width: 2.5;
}
.metric-ring .fill {
  fill: none;
  stroke: hsl(var(--hue), 70%, 60%);
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s ease;
}
.metric-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
  z-index: 1;
}
.metric-lbl {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}
@media (max-width: 768px) {
  .hero-metrics { gap: 16px; flex-wrap: wrap; justify-content: center; }
}
.hero-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.showcase-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px 22px;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  backdrop-filter: blur(8px);
  transition: all 0.3s;
}
.showcase-card:hover { border-color: rgba(47,125,246,0.2); transform: translateY(-2px); }
.card-1 { background: rgba(47,125,246,0.04); grid-column: 1; grid-row: 1; }
.card-2 { background: rgba(108,92,231,0.04); grid-column: 2; grid-row: 1; margin-top: 24px; }
.card-3 { background: rgba(110,231,183,0.03); grid-column: 1; grid-row: 2; margin-top: -12px; }
.card-4 { background: rgba(251,191,36,0.03); grid-column: 2; grid-row: 2; }

.sc-icon {
  width: 44px; height: 44px;
  display: grid; place-items: center;
  border-radius: 12px;
  background: var(--bg-surface);
}
.card-1 .sc-icon svg { stroke: var(--primary); }
.card-2 .sc-icon svg { stroke: var(--accent); }
.card-3 .sc-icon svg { stroke: var(--green); }
.card-4 .sc-icon svg { stroke: var(--orange); }
.sc-body strong { display: block; font-size: 0.95rem; font-weight: 700; }
.sc-body span { font-size: 0.8rem; color: var(--text-secondary); }

@media (max-width: 900px) {
  .hero-layout { grid-template-columns: 1fr; }
  .hero-showcase { display: none; }
  .hero-metrics { flex-wrap: wrap; gap: 16px; }
}
</style>
