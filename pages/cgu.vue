<template>
  <div ref="pageRef" class="page-static">
    <div class="container legal-wrap">
      <div class="page-header anim-up">
        <h1>Conditions Générales d'Utilisation</h1>
        <p>En vigueur à compter du 24/08/2026 — voir les Fondations Juridiques pour les définitions.</p>
      </div>
      <div class="legal-content anim-card">
        <section class="legal-block">
          <h2>1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la plateforme GSA par tout Utilisateur (Acheteur, Vendeur, Client professionnel, Prestataire ou Visiteur).</p>
        </section>
        <section class="legal-block">
          <h2>2. Comptes</h2>
          <p>La création d'un compte implique la fourniture d'informations exactes et à jour. L'Utilisateur est responsable de la confidentialité de ses identifiants. GSA peut suspendre ou supprimer tout compte en cas de violation des présentes conditions.</p>
        </section>
        <section class="legal-block">
          <h2>3. Rôle de GSA</h2>
          <p>GSA agit en qualité d'opérateur de plateforme mettant en relation Vendeurs et Acheteurs. GSA n'est ni l'auteur des contenus proposés par les Vendeurs, ni le titulaire des droits attachés à ces contenus (art. 2 des Fondations Juridiques).</p>
        </section>
        <section class="legal-block">
          <h2>4. Utilisation acceptable</h2>
          <p>Il est notamment interdit : la reproduction, la redistribution, la revente, la mise à disposition publique et l'exploitation commerciale non autorisée des contenus, ainsi que toute tentative de contournement des mesures techniques ou des droits de propriété intellectuelle.</p>
        </section>
        <section class="legal-block">
          <h2>5. Propriété intellectuelle</h2>
          <p>Les contenus proposés sur la plateforme ainsi que la Présentation GSA (miniatures, captures, vidéos, descriptions) sont protégés au titre du droit d'auteur (art. L111-1 et suivants du Code de la propriété intellectuelle).</p>
        </section>
        <section class="legal-block">
          <h2>6. Responsabilité</h2>
          <p>La Validation GSA constitue une prestation de contrôle qualité et ne constitue ni une certification technique absolue, ni une garantie contre tout défaut, ni une garantie de compatibilité avec tous les environnements (art. 1.7 des Fondations Juridiques).</p>
        </section>
        <section class="legal-block">
          <h2>7. Données personnelles</h2>
          <p>Les données des Utilisateurs sont traitées conformément à la Politique de confidentialité de GSA, dans le respect du Règlement Général sur la Protection des Données (RGPD).</p>
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
