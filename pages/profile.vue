<template>
  <div ref="pageRef" class="profile-page">
    <div class="container">
      <div class="page-header anim-up">
        <h1>Mon profil</h1>
        <p>Gérez vos informations personnelles, vos comptes liés et votre statut vendeur.</p>
      </div>

      <div class="profile-grid">
        <!-- Profil -->
        <div class="pcard anim-card">
          <div class="pcard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h2>Informations personnelles</h2>
          </div>
          <div class="pcard-body">
            <div class="avatar-preview">
              <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar" class="avatar-img" @error="avatarError = true" />
              <div v-else class="avatar-placeholder">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="avatar-meta">
                <strong>{{ form.displayName || '—' }}</strong>
                <span>{{ form.email || '' }}</span>
              </div>
            </div>
            <div class="field">
              <label>Avatar (URL)</label>
              <input v-model="form.avatarUrl" type="text" placeholder="https://..." @input="avatarError = false" />
              <small v-if="avatarError" class="avatar-err">Image introuvable — vérifie l'URL.</small>
            </div>
            <div class="field">
              <label>Nom d'affichage</label>
              <input v-model="form.displayName" type="text" />
            </div>
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" />
            </div>
            <button class="btn-save" :disabled="saving" @click="saveProfile">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <span v-if="profileMsg" class="msg" :class="{ err: profileError }">{{ profileMsg }}</span>
          </div>
        </div>

        <!-- Comptes liés -->
        <div class="pcard anim-card">
          <div class="pcard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <h2>Comptes liés</h2>
          </div>
          <div class="pcard-body link-body">
            <div class="link-item" :class="{ linked: user?.discordId }">
              <div class="link-brand brand-discord">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
              </div>
              <div class="link-meta">
                <strong>Discord</strong>
                <span class="link-status" :class="{ on: user?.discordId }">{{ user?.discordId ? 'Connecté' : 'Non connecté' }}</span>
                <p class="link-desc">Associez votre compte Discord pour la vérification et la communauté.</p>
              </div>
              <div class="link-actions">
                <button v-if="user?.discordId" class="btn-link-ghost" @click="copyId(user.discordId)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {{ copied ? 'Copié !' : 'Copier l\'ID' }}
                </button>
                <button v-else class="btn-link-brand btn-discord-brand" @click="linkDiscord">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Lier
                </button>
              </div>
            </div>

            <div class="link-item" :class="{ linked: user?.steamId }">
              <div class="link-brand brand-steam">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-1.508 16.542l-3.259-1.296c.135.537.246 1.141.246 1.734 0 .078-.004.156-.012.23-.278.774-.873 1.401-1.643 1.743-.648.288-1.363.343-2.031.219 1.05 1.227 2.606 2.025 4.353 2.025 1.947 0 3.66-.975 4.676-2.447l-2.33-.208zm-4.837-3.168a2.199 2.199 0 0 0 2.199 2.199 2.199 2.199 0 0 0 2.199-2.199 2.199 2.199 0 0 0-2.199-2.199 2.199 2.199 0 0 0-2.199 2.199zm10.839-5.535c0-1.716-1.393-3.109-3.109-3.109s-3.109 1.393-3.109 3.109 1.393 3.109 3.109 3.109 3.109-1.393 3.109-3.109z"/></svg>
              </div>
              <div class="link-meta">
                <strong>Steam</strong>
                <span class="link-status" :class="{ on: user?.steamId }">{{ user?.steamId ? 'Connecté' : 'Non connecté' }}</span>
                <p class="link-desc">Associez votre compte Steam pour simplifier vos achats.</p>
              </div>
              <div class="link-actions">
                <button v-if="user?.steamId" class="btn-link-ghost" disabled>✓ Lié</button>
                <button v-else class="btn-link-brand btn-steam-brand" @click="linkSteam">Lier</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stripe Connect (vendeurs) -->
        <div v-if="isSeller" class="pcard anim-card stripe-card">
          <div class="pcard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <h2>Paiements Stripe</h2>
          </div>
          <div class="pcard-body">
            <div v-if="stripeStatus === 'linked'" class="seller-approved">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <strong>Compte Stripe connecté</strong>
                <span>Vos revenus sont transférés sur ce compte.</span>
              </div>
            </div>
            <template v-else>
              <p class="seller-hint">Pour recevoir vos revenus, associez votre compte Stripe. Vous serez redirigé vers Stripe pour finaliser l'onboarding.</p>
              <button class="btn-save" :disabled="stripeLoading" @click="connectStripe">
                {{ stripeLoading ? 'Redirection...' : 'Lier mon compte Stripe' }}
              </button>
              <span v-if="stripeMsg" class="msg" :class="{ err: stripeError }">{{ stripeMsg }}</span>
            </template>
          </div>
        </div>

        <!-- Statut vendeur -->
        <div class="pcard anim-card seller-card">
          <div class="pcard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <h2>Statut vendeur</h2>
          </div>
          <div class="pcard-body">
            <!-- Déjà vendeur -->
            <template v-if="user?.role === 'seller' || user?.role === 'admin'">
              <div class="seller-approved">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <strong>Votre compte vendeur est actif</strong>
                  <span>Vous pouvez gérer votre boutique et vos revenus.</span>
                </div>
              </div>
              <NuxtLink to="/seller/account" class="btn-save">Accéder à mon espace vendeur</NuxtLink>
            </template>

            <!-- En attente -->
            <template v-else-if="user?.sellerStatus === 'pending'">
              <div class="seller-pending">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f5b342" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <strong>Demande en attente de validation</strong>
                  <span>L'équipe GSA examine votre demande sous 24-48h. Vous serez notifié dès l'activation.</span>
                </div>
              </div>
            </template>

            <!-- Refusé -->
            <template v-else-if="user?.sellerStatus === 'rejected'">
              <div class="seller-rejected">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <div>
                  <strong>Demande refusée</strong>
                  <span>Votre demande a été refusée. Vous pouvez soumettre une nouvelle demande.</span>
                </div>
              </div>
              <form class="seller-form" @submit.prevent="submitSellerRequest">
                <div class="field"><label>Nom de la boutique</label><input v-model="sellerForm.shopName" type="text" required /></div>
                <div class="field"><label>Description / Bio</label><textarea v-model="sellerForm.bio" rows="3" placeholder="Présentez votre travail, vos créations..."></textarea></div>
                <div class="field"><label>Tag Discord</label><input v-model="sellerForm.discordTag" type="text" placeholder="pseudo#0000" /></div>
                <button class="btn-save" type="submit" :disabled="sellerSending">
                  {{ sellerSending ? 'Envoi...' : 'Envoyer la demande' }}
                </button>
              </form>
            </template>

            <!-- Jamais demandé -->
            <template v-else>
              <p class="seller-hint">Vendez vos créations sur GSA Store : scripts, modèles, maps et plus. Rejoignez les créateurs de la marketplace.</p>
              <form class="seller-form" @submit.prevent="submitSellerRequest">
                <div class="field"><label>Nom de la boutique</label><input v-model="sellerForm.shopName" type="text" required placeholder="Ma boutique" /></div>
                <div class="field"><label>Description / Bio</label><textarea v-model="sellerForm.bio" rows="3" placeholder="Présentez votre travail, vos créations..."></textarea></div>
                <div class="field"><label>Tag Discord</label><input v-model="sellerForm.discordTag" type="text" placeholder="pseudo#0000" /></div>
                <button class="btn-save" type="submit" :disabled="sellerSending">
                  {{ sellerSending ? 'Envoi...' : 'Devenir vendeur' }}
                </button>
              </form>
            </template>

            <span v-if="sellerMsg" class="msg" :class="{ err: sellerError }">{{ sellerMsg }}</span>
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

const { user, checkAuth } = useAuth()
const saving = ref(false)
const profileMsg = ref('')
const profileError = ref(false)
const avatarError = ref(false)
const copied = ref(false)
const sellerSending = ref(false)
const sellerMsg = ref('')
const sellerError = ref(false)

const form = reactive({ displayName: '', email: '', avatarUrl: '' })
const sellerForm = reactive({ shopName: '', bio: '', discordTag: '' })

const isSeller = computed(() => user.value?.role === 'seller' || user.value?.role === 'admin')
const stripeStatus = ref('loading')
const stripeMsg = ref('')
const stripeError = ref(false)
const stripeLoading = ref(false)

onMounted(async () => {
  await checkAuth()
  if (user.value) {
    form.displayName = user.value.displayName || ''
    form.email = user.value.email || ''
    form.avatarUrl = user.value.avatarUrl || ''
    sellerForm.shopName = user.value.shopName || ''
    sellerForm.bio = user.value.sellerDescription || ''
    sellerForm.discordTag = user.value.discordTag || ''
  }
  if (isSeller.value) checkStripeConnect()
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})

async function checkStripeConnect() {
  stripeStatus.value = 'loading'
  stripeMsg.value = ''
  try {
    const res = await $fetch(api + '/api/stripe/connect/status', { credentials: 'include' })
    if (res.connected) {
      stripeStatus.value = 'linked'
      stripeMsg.value = 'Compte Stripe connecté ✓'
    } else {
      stripeStatus.value = 'unlinked'
      stripeMsg.value = ''
    }
  } catch (e: any) {
    stripeStatus.value = 'unlinked'
    stripeMsg.value = 'Erreur: ' + (e?.data?.message || e?.message || 'vérification impossible')
    stripeError.value = true
  }
}

async function connectStripe() {
  stripeLoading.value = true
  stripeError.value = false
  stripeMsg.value = ''
  try {
    const res = await $fetch(api + '/api/stripe/connect', { method: 'POST', credentials: 'include' })
    if (res.connected) {
      stripeStatus.value = 'linked'
      stripeMsg.value = 'Compte Stripe connecté ✓'
    } else if (res.url) {
      window.location.href = res.url
    } else {
      stripeMsg.value = 'Réponse inattendue du serveur'
      stripeError.value = true
    }
  } catch (e: any) {
    stripeError.value = true
    stripeMsg.value = e?.data?.message || e?.message || 'Erreur de connexion Stripe'
  } finally {
    stripeLoading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  profileError.value = false
  try {
    const res = await $fetch(api + '/api/profile', {
      method: 'PATCH',
      credentials: 'include',
      body: { displayName: form.displayName, email: form.email, avatarUrl: form.avatarUrl },
    })
    if (user.value) user.value = res.user
    profileMsg.value = 'Profil mis à jour ✓'
  } catch (e: any) {
    profileError.value = true
    profileMsg.value = e?.data?.message || e?.message || 'Erreur lors de la mise à jour'
  } finally {
    saving.value = false
    setTimeout(() => (profileMsg.value = ''), 3500)
  }
}

async function submitSellerRequest() {
  sellerSending.value = true
  sellerError.value = false
  try {
    const res = await $fetch(api + '/api/seller/request', {
      method: 'POST',
      credentials: 'include',
      body: { shopName: sellerForm.shopName, bio: sellerForm.bio, discordTag: sellerForm.discordTag },
    })
    sellerMsg.value = res.message || 'Demande envoyée !'
    if (user.value) user.value = { ...user.value, sellerStatus: 'pending' }
  } catch (e: any) {
    sellerError.value = true
    sellerMsg.value = e?.data?.message || e?.message || 'Erreur lors de l\'envoi'
  } finally {
    sellerSending.value = false
  }
}

function linkDiscord() {
  window.location.href = '/auth/discord?return_url=' + encodeURIComponent('/profile')
}
function linkSteam() {
  window.location.href = '/auth/steam?return_url=' + encodeURIComponent('/profile')
}
async function copyId(id: string) {
  try {
    await navigator.clipboard.writeText(id)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch { /* ignore */ }
}
</script>

<style scoped>
.profile-page { padding: 48px 0 80px; }
.page-header { text-align: center; margin-bottom: 36px; }
.page-header h1 { font-size: 1.8rem; font-weight: 900; margin: 0 0 6px; }
.page-header p { color: var(--text-secondary); font-size: .95rem; margin: 0; }
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 980px; margin: 0 auto; }
@media (max-width: 860px) { .profile-grid { grid-template-columns: 1fr; } }
.pcard { border-radius: 14px; border: 1px solid var(--border); background: var(--bg-card); overflow: hidden; }
.seller-card { grid-column: 1 / -1; }
.pcard-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.pcard-header svg { color: var(--primary); }
.pcard-header h2 { margin: 0; font-size: 1rem; font-weight: 700; }
.pcard-body { padding: 20px; display: grid; gap: 14px; }
.field { display: grid; gap: 6px; }
.avatar-preview { display: flex; align-items: center; gap: 16px; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface); }
.avatar-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(47,125,246,0.25); flex-shrink: 0; }
.avatar-placeholder { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; background: rgba(47,125,246,0.08); color: var(--text-muted); flex-shrink: 0; }
.avatar-meta { display: grid; gap: 3px; min-width: 0; }
.avatar-meta strong { font-size: 1rem; }
.avatar-meta span { font-size: .8rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; }
.avatar-err { color: var(--red); font-size: .75rem; }
.field label { font-size: .78rem; font-weight: 600; color: var(--text-secondary); }
.field input, .field textarea {
  padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--bg-surface); color: var(--foreground); font-size: .88rem; font-family: inherit;
  width: 100%; box-sizing: border-box; outline: none; transition: border-color .15s;
}
.field input:focus, .field textarea:focus { border-color: var(--primary); }
.btn-save { padding: 11px 18px; border-radius: 8px; border: none; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; font-size: .88rem; font-weight: 700; cursor: pointer; font-family: inherit; width: fit-content; text-decoration: none; display: inline-block; }
.btn-save:hover:not(:disabled) { opacity: .9; }
.btn-save:disabled { opacity: .5; cursor: not-allowed; }
.msg { font-size: .8rem; color: var(--green); }
.msg.err { color: var(--red); }
.link-body { display: grid; gap: 14px; }
.link-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-surface); }
.link-brand { width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
.brand-discord { background: rgba(88,101,242,0.12); color: #5865f2; }
.brand-steam { background: rgba(24,26,33,0.4); color: #8892a8; }
.link-meta { flex: 1; min-width: 0; display: grid; gap: 2px; }
.link-meta strong { font-size: .88rem; }
.link-status { font-size: .72rem; font-weight: 600; color: var(--text-muted); }
.link-status.on { color: var(--green); }
.link-desc { margin: 0; font-size: .78rem; color: var(--text-muted); }
.link-actions { display: flex; gap: 8px; }
.btn-link-ghost { padding: 7px 12px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: .75rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.btn-link-brand { padding: 7px 14px; border-radius: 6px; border: none; color: #fff; font-size: .78rem; font-weight: 700; cursor: pointer; font-family: inherit; display: flex; align-items: center; gap: 6px; }
.btn-discord-brand { background: #5865f2; }
.btn-steam-brand { background: #1b2838; }
.seller-hint { color: var(--text-secondary); font-size: .88rem; margin: 0; line-height: 1.6; }
.seller-form { display: grid; gap: 12px; margin-top: 4px; }
.seller-approved, .seller-pending, .seller-rejected { display: flex; gap: 14px; align-items: center; padding: 14px; border-radius: 10px; }
.seller-approved { background: rgba(110,231,183,0.08); border: 1px solid rgba(110,231,183,0.2); }
.seller-pending { background: rgba(245,179,66,0.08); border: 1px solid rgba(245,179,66,0.2); }
.seller-rejected { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); }
.seller-approved div, .seller-pending div, .seller-rejected div { display: grid; gap: 2px; }
.seller-approved strong { color: var(--green); }
.seller-pending strong { color: #f5b342; }
.seller-rejected strong { color: var(--red); }
.seller-approved span, .seller-pending span, .seller-rejected span { font-size: .82rem; color: var(--text-secondary); }
</style>
