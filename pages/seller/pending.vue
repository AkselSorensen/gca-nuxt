<template>
  <div ref="pageRef" class="pending-page">
    <div class="container">
      <div class="pending-card anim-scale">
        <div class="pending-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        </div>
        <h1>Demande envoyée !</h1>
        <p>Votre demande de compte vendeur a bien été reçue.</p>
        <div class="pending-info">
          <div class="info-row"><span>Statut</span><span class="badge-pending">En attente de validation</span></div>
        </div>
        <p class="pending-note">
          L'équipe GSA va examiner votre demande sous 24-48h. Vous recevrez une confirmation dès que votre compte sera activé.
        </p>
        <NuxtLink to="/" class="btn-home">Retour à l'accueil</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const pageRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.pending-page { display: grid; place-items: center; min-height: 70vh; padding: 40px 20px; }
.pending-card {
  width: 100%; max-width: 480px; text-align: center;
  padding: 48px 36px; border-radius: 16px;
  border: 1px solid var(--border); background: var(--bg-card);
  display: grid; gap: 16px; place-items: center;
}
.pending-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(47,125,246,0.08); display: grid; place-items: center;
}
.pending-card h1 { font-size: 1.4rem; font-weight: 900; margin: 0; }
.pending-card p { color: var(--text-secondary); font-size: .92rem; margin: 0; }
.pending-info {
  width: 100%; padding: 16px; border-radius: 10px;
  background: var(--bg-surface); border: 1px solid var(--border);
  display: grid; gap: 10px;
}
.info-row { display: flex; justify-content: space-between; align-items: center; font-size: .85rem; }
.badge-pending { padding: 3px 10px; border-radius: 20px; background: rgba(245,179,66,0.1); border: 1px solid rgba(245,179,66,0.2); color: #f5b342; font-size: .75rem; font-weight: 700; }
.pending-note { font-size: .82rem !important; color: var(--text-muted) !important; line-height: 1.6; }
.btn-home { padding: 12px 28px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .9rem; font-weight: 700; text-decoration: none; margin-top: 8px; }
</style>
