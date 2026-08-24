<template>
  <div ref="pageRef" class="page-static">
    <div class="container legal-wrap">
      <div class="page-header anim-up">
        <h1>Politique de confidentialité</h1>
        <p>Traitement des données personnelles conformément au RGPD.</p>
      </div>
      <div class="legal-content anim-card">
        <section class="legal-block">
          <h2>1. Données collectées</h2>
          <p>GSA collecte les données nécessaires au fonctionnement de la plateforme : identité (nom d'affichage, email), informations de compte (identifiants Discord/Steam le cas échéant), données de commande, et données de navigation (cookies).</p>
        </section>
        <section class="legal-block">
          <h2>2. Finalités</h2>
          <p>Les données sont utilisées pour : la gestion des comptes, le traitement des commandes et paiements, la délivrance des téléchargements, le support après-achat (7 jours), la prévention de la fraude et l'amélioration des services.</p>
        </section>
        <section class="legal-block">
          <h2>3. Sous-traitants</h2>
          <p>Les données sont hébergées par Supabase (PostgreSQL) et le site par Vercel. Les paiements sont traités par Stripe, qui agit en qualité de sous-traitant pour le traitement des transactions.</p>
        </section>
        <section class="legal-block">
          <h2>4. Durée de conservation</h2>
          <p>Les données de compte sont conservées pendant la durée d'utilisation de la plateforme, puis supprimées ou anonymisées après la clôture du compte. Les données de commande sont conservées conformément aux obligations légales (notamment fiscales et comptables).</p>
        </section>
        <section class="legal-block">
          <h2>5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous pouvez exercer ces droits en contactant GSA via le serveur Discord : discord.gg/KDsEzGRnKs.</p>
        </section>
        <section class="legal-block">
          <h2>6. Cookies</h2>
          <p>GSA utilise des cookies techniques (session, panier) et, le cas échéant, des cookies de mesure d'audience. Vous pouvez configurer votre navigateur pour refuser les cookies, sachant que certains services pourraient ne plus fonctionner correctement.</p>
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
