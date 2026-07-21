<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <div class="page-header anim-up">
        <h1>Prestation</h1>
        <p>Accompagnement de projet et Game Design</p>
      </div>
      <div class="content-grid anim-card">
        <div class="service-card">
          <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2f7df6" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
          <h2>Accompagnement de projet</h2>
          <p>De l'idée à la réalisation, je vous accompagne dans la conception et le développement de votre projet Garry's Mod.</p>
          <ul><li>Analyse des besoins</li><li>Architecture technique</li><li>Suivi et itérations</li><li>Documentation complète</li></ul>
        </div>
        <div class="service-card">
          <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <h2>Game Design</h2>
          <p>Conception de mécaniques de jeu, équilibrage et optimisation pour garantir une expérience de qualité à vos joueurs.</p>
          <ul><li>Mécaniques de jeu</li><li>Équilibrage économique</li><li>Progression et levelling</li><li>Tests et validation</li></ul>
        </div>
        <div class="service-card">
          <div class="sc-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
          <h2>Mise en relation</h2>
          <p>Vous avez besoin d'un développeur, d'un designer ou d'un asset spécifique ? Je vous mets en relation avec les bons profils.</p>
          <a href="https://discord.gg/ZbCrwE73uK" class="btn-outline">Discuter sur Discord</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pageRef = ref<HTMLElement | null>(null)
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
.content-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px; }
.service-card { padding:28px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:14px; }
.sc-icon { width:46px;height:46px;display:grid;place-items:center;border-radius:11px;background:var(--bg-surface); }
.service-card h2 { font-size:1.1rem;font-weight:700; }
.service-card p { color:var(--text-secondary);font-size:.9rem;line-height:1.6; }
.service-card ul { display:grid;gap:6px;padding:0;list-style:none; }
.service-card li { padding:6px 10px;border-radius:6px;background:rgba(255,255,255,0.02);font-size:.85rem;color:var(--text-secondary);padding-left:12px;border-left:2px solid var(--primary); }
.btn-outline { display:inline-block;padding:10px 20px;border-radius:8px;border:1px solid var(--border);color:var(--text);font-size:.85rem;font-weight:600;text-decoration:none;transition:all .2s;justify-self:start; }
.btn-outline:hover { border-color:var(--primary);color:var(--primary); }
</style>
