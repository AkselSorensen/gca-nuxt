<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <div class="page-header anim-up">
        <h1>{{ t('prestation.title') }}</h1>
        <p>Game Design & Modélisation 3D pour Garry's Mod</p>
      </div>
      <div class="content-grid anim-card">
        <!-- Game Design -->
        <div class="service-card">
          <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <h2>Game Design</h2>
          <p>Conception et équilibrage de mécaniques de jeu pour serveurs Garry's Mod. Du concept initial au polish final, chaque système est pensé pour offrir une expérience joueur cohérente et engageante.</p>
          <ul>
            <li>Conception de mécaniques sur mesure</li>
            <li>Équilibrage économique et progression</li>
            <li>Game Design Document complet</li>
            <li>Itérations et playtests</li>
          </ul>
        </div>

        <!-- Modélisation 3D -->
        <div class="service-card">
          <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <h2>Modélisation 3D architecturale & props</h2>
          <p>Création de décors, bâtiments et props pour vos serveurs Garry's Mod. Modélisation sur mesure, optimisée pour le rendu Source Engine, avec textures et collisions propres.</p>
          <ul>
            <li>Bâtiments et structures architecturales</li>
            <li>Props et objets décoratifs</li>
            <li>Texturing PBR optimisé Source</li>
            <li>Export et intégration Garry's Mod</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pageRef = ref<HTMLElement | null>(null)
const { t } = useLang()
onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.page-static { padding:40px 0 64px; }
.page-header { margin-bottom:40px; }
.page-header h1 { font-size:2rem;font-weight:900;letter-spacing:-.03em; }
.page-header p { color:var(--text-secondary);margin-top:8px;font-size:1.05rem; }
.content-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px; }
.service-card { padding:32px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:16px;transition:border-color .2s; }
.service-card:hover { border-color:var(--border-hover); }
.sc-icon { width:48px;height:48px;display:grid;place-items:center;border-radius:12px;background:var(--bg-surface); }
.service-card h2 { font-size:1.15rem;font-weight:800;letter-spacing:-.01em; }
.service-card p { color:var(--text-secondary);font-size:.92rem;line-height:1.7; }
.service-card ul { display:grid;gap:8px;padding:0;list-style:none; }
.service-card li { padding:8px 12px;border-radius:8px;background:var(--bg-surface);font-size:.85rem;color:var(--text-secondary);padding-left:14px;border-left:3px solid var(--primary); }
</style>
