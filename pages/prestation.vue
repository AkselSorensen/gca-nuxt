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
          <IconDiscord :size="20" />
          Pour toute commande ou question, rendez-vous sur le discord
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ link: [{ rel: 'canonical', href: 'https://gsa-store.fr/prestation' }] })
useSeoMeta({
  title: 'Prestations — Game Design & Modélisation 3D — GSA Store',
  description: 'Prestations GSA : game design et modélisation 3D pour vos projets.',
  ogType: 'website',
  
})

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
