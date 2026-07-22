<template>
  <div ref="pageRef" class="seller-account-page">
    <div class="container">
      <div class="page-header anim-up">
        <h1>Mon compte vendeur</h1>
        <p>Gérez votre profil et vos moyens de paiement.</p>
      </div>

      <div class="account-grid">
        <!-- Profile card -->
        <div class="acard anim-card">
          <div class="acard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h2>Profil</h2>
          </div>
          <div class="acard-body">
            <div class="field"><label>Nom de la boutique</label><input v-model="profile.shopName" type="text" /></div>
            <div class="field"><label>Discord</label><input v-model="profile.discord" type="text" /></div>
            <div class="field"><label>Bio</label><textarea v-model="profile.bio" rows="3" placeholder="Présentez votre travail…"></textarea></div>
            <button class="btn-save" @click="saveProfile">Enregistrer</button>
            <span v-if="profileMsg" class="msg">{{ profileMsg }}</span>
          </div>
        </div>

        <!-- Stripe card -->
        <div class="acard anim-card">
          <div class="acard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <h2>Paiements Stripe</h2>
          </div>
          <div class="acard-body">
            <div v-if="stripeLinked" class="stripe-status linked">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div>
                <strong>Compte Stripe lié</strong>
                <span>Vous pouvez recevoir des paiements.</span>
              </div>
            </div>
            <div v-else class="stripe-status">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <strong>Stripe non connecté</strong>
                <span>{{ stripeMsg }}</span>
              </div>
            </div>
            <a v-if="!stripeLinked" class="btn-stripe" :class="{ loading: stripeLoading }" @click.prevent="connectStripe">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.693 0 3.033.642 3.964 1.219l.295-1.812c-.789-.537-2.303-1.088-4.105-1.088-2.645 0-4.475 1.356-4.475 3.562 0 2.248 1.928 3.21 4.344 4.033 2.154.734 3.226 1.342 3.226 2.416 0 .86-.695 1.446-2.077 1.446-1.909 0-3.548-.791-4.399-1.454l-.325 1.845c.902.66 2.663 1.283 4.794 1.283 2.995 0 4.81-1.522 4.81-3.799 0-2.318-1.798-3.246-4.212-4.077zM3.575 16.138V7.828h-1.78v9.489h4.916v-1.179H3.575zM20.205 16.138c.627 0 1.196-.049 1.795-.182v-1.702c-.53.144-1.066.218-1.605.218-2.636 0-4.259-1.67-4.259-4.211 0-2.43 1.691-4.256 4.135-4.256.614 0 1.195.127 1.795.327V4.584c-.583-.17-1.17-.249-1.795-.249-3.523 0-6.124 2.518-6.124 6.072 0 3.538 2.527 5.731 6.058 5.731z"/></svg>
              {{ stripeLoading ? 'Redirection…' : 'Connecter Stripe' }}
            </a>
          </div>
        </div>

        <!-- Stats card -->
        <div class="acard anim-card">
          <div class="acard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <h2>Statistiques</h2>
          </div>
          <div class="acard-body stats-grid">
            <div class="stat-item"><span class="stat-val">{{ stats.products }}</span><span class="stat-lbl">Produits</span></div>
            <div class="stat-item"><span class="stat-val">{{ stats.sales }}</span><span class="stat-lbl">Ventes</span></div>
            <div class="stat-item"><span class="stat-val">{{ stats.revenue }}€</span><span class="stat-lbl">Revenus</span></div>
            <div class="stat-item"><span class="stat-val">{{ stats.rating }}</span><span class="stat-lbl">Note</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const config = useRuntimeConfig()
const api = config.public.apiOrigin
const pageRef = ref<HTMLElement | null>(null)
const stripeLinked = ref(false)
const profileMsg = ref('')
const stripeUrl = ref('/api/stripe/connect')
const stripeMsg = ref('Vérification du compte Stripe…')
const stripeStatus = ref('loading')
const stripeError = ref('')
const stripeLoading = ref(false)

const profile = reactive({
  shopName: 'Ma boutique',
  discord: '',
  bio: 'Créateur de contenu pour Garry\'s Mod.'
})

const stats = reactive({
  products: 0,
  sales: 0,
  revenue: 0,
  rating: '—'
})

function saveProfile() {
  profileMsg.value = 'Profil mis à jour !'
  setTimeout(() => profileMsg.value = '', 3000)
}

async function checkStripeConnect() {
  stripeStatus.value = 'loading'
  stripeMsg.value = 'Vérification…'
  try {
    const res = await $fetch(api + '/api/stripe/connect/status', { credentials: 'include' })
    if (res.connected) {
      stripeLinked.value = true
      stripeStatus.value = 'linked'
      stripeMsg.value = 'Compte Stripe connecté ✓'
    } else {
      stripeLinked.value = false
      stripeStatus.value = 'unlinked'
      stripeMsg.value = 'Connectez votre compte Stripe pour recevoir vos paiements.'
    }
  } catch {
    stripeLinked.value = false
    stripeStatus.value = 'unlinked'
    stripeMsg.value = 'Impossible de vérifier le statut Stripe.'
  }
}

async function connectStripe() {
  stripeLoading.value = true
  try {
    const res = await $fetch(api + '/api/stripe/connect', { method: 'POST', credentials: 'include' })
    if (res.url) window.location.href = res.url
  } catch (e: any) {
    stripeError.value = e?.data?.message || 'Erreur de connexion Stripe'
  } finally {
    stripeLoading.value = false
  }
}

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)

  checkStripeConnect()
})
</script>

<style scoped>
.seller-account-page { padding:40px 0 64px; }
.page-header { margin-bottom:36px; }
.page-header h1 { font-size:1.6rem;font-weight:900;letter-spacing:-.03em; }
.page-header p { color:var(--text-secondary);margin-top:6px;font-size:.95rem; }

.account-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
.acard { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden; }
.acard-header { display:flex;align-items:center;gap:10px;padding:18px 20px;border-bottom:1px solid var(--border); }
.acard-header svg { color:var(--primary);flex-shrink:0; }
.acard-header h2 { font-size:1rem;font-weight:700; }
.acard-body { padding:20px;display:grid;gap:14px; }
.field { display:grid;gap:5px; }
.field label { font-size:.78rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em; }
.field input,.field textarea { padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.88rem;outline:none;transition:border-color .2s;font-family:inherit;resize:vertical; }
.field input:focus,.field textarea:focus { border-color:var(--primary); }
.btn-save { padding:10px 18px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;justify-self:start;font-family:inherit; }
.btn-save:hover { opacity:.9;transform:translateY(-1px); }
.msg { font-size:.82rem;color:var(--green); }

/* Stripe */
.stripe-status { display:flex;align-items:center;gap:14px;padding:16px;border-radius:10px;background:rgba(255,255,255,0.02); }
.stripe-status.linked { background:rgba(110,231,183,0.04);border:1px solid rgba(110,231,183,0.12); }
.stripe-status svg { flex-shrink:0; }
.stripe-status strong { display:block;font-size:.9rem;font-weight:700; }
.stripe-status span { font-size:.82rem;color:var(--text-secondary); }
.btn-stripe { display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:10px;background:#635bff;color:#fff;font-size:.9rem;font-weight:700;text-decoration:none;transition:all .2s;justify-self:start;border:none;cursor:pointer;font-family:inherit; }
.btn-stripe:hover { opacity:.9;transform:translateY(-1px);box-shadow:0 4px 16px rgba(99,91,255,0.3); }

/* Stats */
.stats-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.stat-item { text-align:center;padding:16px;border-radius:10px;background:rgba(255,255,255,0.02);display:grid;gap:4px; }
.stat-val { font-size:1.3rem;font-weight:800;color:var(--text); }
.stat-lbl { font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em; }

.acard:last-child { grid-column:1/2; }
@media(max-width:768px){ .account-grid{grid-template-columns:1fr}.acard:last-child{grid-column:auto} }
</style>
