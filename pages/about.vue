<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <div class="page-header anim-up">
        <h1>À propos</h1>
        <p>GSA — Pas une boutique, un standard.</p>
      </div>
      <div class="about-content anim-card">
        <section class="about-block">
          <h2>Notre mission</h2>
          <p>GSA structure la distribution d'assets Garry's Mod, les prestations et l'accompagnement de projet dans une marketplace premium pensée par et pour la communauté.</p>
        </section>
        <section class="about-block">
          <h2>Pourquoi GSA ?</h2>
          <p>Les créateurs passent trop de temps sur l'aspect commercial au détriment de leur art. Les porteurs de projets peinent à trouver des ressources fiables. GSA résout ce problème en proposant une plateforme centralisée où qualité et confiance sont les maîtres-mots.</p>
        </section>
        <section class="about-block">
          <h2>Ce que GSA prend en charge</h2>
          <ul><li>Mise en avant des assets de qualité</li><li>Gestion des paiements sécurisés</li><li>Système de notation et d'avis vérifiés</li><li>Accompagnement des créateurs</li><li>Support client dédié</li></ul>
        </section>
        <section class="about-block">
          <h2>Pourquoi la non exclusivité ?</h2>
          <p>Nous croyons que les créateurs doivent pouvoir vendre où ils le souhaitent. GSA n'impose pas d'exclusivité — c'est un canal de vente supplémentaire, sans contrainte.</p>
          <ul><li>Liberté totale pour les créateurs</li><li>Aucun frais caché</li><li>Visibilité sur une marketplace dédiée</li><li>Communauté active et bienveillante</li></ul>
        </section>
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
.about-content { display:grid;gap:24px;max-width:800px; }
.about-block { padding:28px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:12px; }
.about-block h2 { font-size:1.15rem;font-weight:700; }
.about-block p { color:var(--text-secondary);font-size:.92rem;line-height:1.7; }
.about-block ul { display:grid;gap:6px;padding:0;list-style:none; }
.about-block li { padding:6px 10px;border-radius:6px;background:rgba(255,255,255,0.02);font-size:.85rem;color:var(--text-secondary);padding-left:12px;border-left:2px solid var(--accent); }
</style>
