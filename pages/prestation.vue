<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <div class="page-header anim-up">
        <h1>{{ t('prestation.title') }}</h1>
        <p>Game Design & Modélisation 3D</p>
      </div>
      <div class="content-grid anim-card">
        <!-- Game Design -->
        <div class="service-card">
          <div class="sc-head">
            <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
            <h2>Game Design</h2>
          </div>
          <p>Nous concevons des mécaniques de jeu pensées pour votre projet, quelle que soit sa plateforme. De l'idée initiale à l'équilibrage final, nous transformons vos concepts en expériences cohérentes, engageantes et adaptées à vos joueurs.</p>
          <ul>
            <li>Conception de mécaniques sur mesure</li>
            <li>Équilibrage et progression</li>
            <li>Game Design Document (GDD)</li>
          </ul>
        </div>

        <!-- Modélisation 3D -->
        <div class="service-card">
          <div class="sc-head">
            <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
            <h2>Modélisation 3D architecturale &amp; props</h2>
          </div>
          <p>Création de bâtiments, environnements et props sur mesure pour vos projets sous Unreal Engine. Des modèles pensés pour s'intégrer efficacement à votre projet, avec une attention particulière portée aux détails, aux textures et à l'optimisation.</p>
          <ul>
            <li>Bâtiments et structures architecturales</li>
            <li>Environnements et éléments de décor</li>
            <li>Props et objets sur mesure</li>
          </ul>
        </div>
      </div>

      <!-- CTA Discord -->
      <div class="cta-discord anim-card">
        <a href="https://discord.gg/KDsEzGRnKs" target="_blank" rel="noopener" class="btn-discord-cta">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          Pour toute commande ou question, rendez-vous sur le discord
        </a>
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
.content-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,440px));justify-content:center;gap:24px; }
.service-card { padding:32px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:16px;transition:border-color .2s; }
.service-card:hover { border-color:var(--border-hover); }
.sc-head { display:flex; align-items:center; gap:14px; }
.sc-icon { width:48px;height:48px;display:grid;place-items:center;border-radius:12px;background:var(--bg-surface);flex-shrink:0; }
.service-card h2 { margin:0; font-size:1.15rem;font-weight:800;letter-spacing:-.01em; }
.service-card p { color:var(--text-secondary);font-size:.92rem;line-height:1.7; }
.service-card ul { display:grid;gap:8px;padding:0;list-style:none; }
.service-card li { padding:8px 12px;border-radius:8px;background:var(--bg-surface);font-size:.85rem;color:var(--text-secondary);padding-left:14px;border-left:3px solid var(--primary); }
.cta-discord { display:flex;justify-content:center;margin-top:32px; }
.btn-discord-cta { display:inline-flex;align-items:center;gap:10px;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#5865f2,#4752c4);color:#fff;font-weight:700;font-size:.95rem;text-decoration:none;transition:transform .2s,filter .2s;box-shadow:0 8px 24px rgba(88,101,242,0.3); }
.btn-discord-cta:hover { filter:brightness(1.1); transform:translateY(-2px); }
</style>
