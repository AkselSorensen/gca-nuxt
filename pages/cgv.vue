<template>
  <div ref="pageRef" class="page-static">
    <div class="container legal-wrap">
      <div class="page-header anim-up">
        <h1>Conditions Générales de Vente</h1>
        <p>En vigueur à compter du 24/08/2026 — voir les Fondations Juridiques pour les définitions.</p>
      </div>
      <div class="legal-content anim-card">
        <section class="legal-block">
          <h2>1. Objet</h2>
          <p>Les présentes Conditions Générales de Vente régissent les ventes de produits numériques et de prestations réalisées via la plateforme GSA, entre les Vendeurs et les Acheteurs.</p>
        </section>
        <section class="legal-block">
          <h2>2. Produits numériques</h2>
          <p>Un Produit numérique (modèles 3D, textures, environnements, maps, effets visuels, interfaces, sons, animations, ressources pour moteurs de jeux…) est vendu via GSA uniquement s'il a fait l'objet d'une Validation GSA préalable.</p>
        </section>
        <section class="legal-block">
          <h2>3. Prix et paiement</h2>
          <p>Les prix sont affichés en euros, toutes taxes comprises. Le paiement est traité par le prestataire de paiement sécurisé de la plateforme (Stripe). La Commission GSA est prélevée sur chaque vente conformément aux conditions commerciales applicables au Vendeur.</p>
        </section>
        <section class="legal-block">
          <h2>4. Licence GSA</h2>
          <p>L'Acheteur acquiert une Licence GSA : non exclusive, personnelle, non transférable, sans transfert de propriété ni droit de redistribution. L'achat d'un contenu numérique n'emporte pas transfert automatique des droits d'auteur (Code de la propriété intellectuelle).</p>
        </section>
        <section class="legal-block">
          <h2>5. Délivrance et téléchargement</h2>
          <p>Dès confirmation du paiement, le Produit est accessible dans la section « Mes téléchargements » du compte de l'Acheteur. Les liens de téléchargement sont fournis avec une durée de validité limitée.</p>
        </section>
        <section class="legal-block">
          <h2>6. Support post-achat</h2>
          <p>GSA assure un support de premier niveau pendant sept (7) jours suivant l'achat. Lorsqu'un problème concerne la conception ou le fonctionnement d'un contenu, GSA peut intervenir auprès du Vendeur afin de faciliter sa résolution.</p>
        </section>
        <section class="legal-block">
          <h2>7. Droit de rétractation</h2>
          <p>Conformément à la réglementation applicable (art. L221-18 et suivants du Code de la consommation), le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement et téléchargés par l'Acheteur, lorsque ce dernier a expressément renoncé à ce droit.</p>
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
