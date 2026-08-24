<template>
  <div ref="pageRef" class="page-static">
    <div class="container legal-wrap">
      <div class="page-header anim-up">
        <h1>Mentions légales</h1>
        <p>Conformément à la loi pour la confiance dans l'économie numérique (LCEN).</p>
      </div>
      <div class="legal-content anim-card">
        <section class="legal-block">
          <h2>Éditeur de la plateforme</h2>
          <p>La plateforme GSA est éditée par l'entreprise exploitante de la marque GSA.<br />Site : gca-nuxt.vercel.app<br />Contact : support via le serveur Discord officiel de GSA.</p>
        </section>
        <section class="legal-block">
          <h2>Activité</h2>
          <p>GSA exerce une activité hybride comprenant une activité de marketplace (mise en relation de Vendeurs et d'Acheteurs), une activité de prestation de services liés à la présentation, la sélection et la promotion des contenus, et une activité de création et de fourniture de prestations professionnelles (Préambule des Fondations Juridiques).</p>
        </section>
        <section class="legal-block">
          <h2>Hébergement</h2>
          <p>La plateforme est hébergée par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Les données sont hébergées sur l'infrastructure Supabase (PostgreSQL).</p>
        </section>
        <section class="legal-block">
          <h2>Propriété intellectuelle</h2>
          <p>L'ensemble des éléments composant la plateforme (structure, textes, graphismes, logo, Présentation GSA) sont protégés au titre du droit d'auteur. Les contenus proposés par les Vendeurs restent la propriété de leurs auteurs (art. 2 des Fondations Juridiques).</p>
        </section>
        <section class="legal-block">
          <h2>Contact</h2>
          <p>Pour toute question relative aux présentes mentions, vous pouvez contacter GSA via le serveur Discord : discord.gg/KDsEzGRnKs.</p>
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
.legal-wrap { max-width:860px; }
.page-header { margin-bottom:40px; }
.page-header h1 { font-size:2rem;font-weight:900;letter-spacing:-.03em; }
.page-header p { color:var(--text-secondary);margin-top:8px;font-size:.9rem; }
.legal-content { display:grid;gap:20px; }
.legal-block { padding:30px 32px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:12px; }
.legal-block h2 { margin:0;font-size:1.15rem;font-weight:800;letter-spacing:-.02em;color:var(--primary); }
.legal-block p { margin:0;color:var(--text-secondary);font-size:.93rem;line-height:1.75; }
</style>
