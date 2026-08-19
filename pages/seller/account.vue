<template>
  <div ref="pageRef" class="seller-account-page">
    <div class="container">
      <div class="page-header anim-up">
        <h1>Mon compte vendeur</h1>
        <p>{{ t('seller.subtitle') }}</p>
      </div>

      <div class="account-grid">
        <!-- Profile card -->
        <div class="acard anim-card">
          <div class="acard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h2>{{ t('seller.profile') }}</h2>
          </div>
          <div class="acard-body">
            <div class="field"><label>Nom de la boutique</label><input v-model="profile.shopName" type="text" /></div>
            <div class="field"><label>{{ t('seller.bio') }}</label><textarea v-model="profile.bio" rows="3" :placeholder="t('seller.bio_ph')"></textarea></div>
            <button class="btn-save" @click="saveProfile">{{ t('seller.save') }}</button>
            <span v-if="profileMsg" class="msg">{{ profileMsg }}</span>
          </div>
        </div>

        <!-- Linked accounts card -->
        <div class="acard anim-card">
          <div class="acard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            <h2>{{ t('seller.linked') }}</h2>
          </div>
          <div class="acard-body link-body">
            <!-- Discord -->
            <div class="link-item" :class="{ linked: discordLinked }">
              <div class="link-brand brand-discord">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
              </div>
              <div class="link-meta">
                <div class="link-name">
                  <strong>{{ t('seller.discord') }}</strong>
                  <span class="link-status" :class="{ on: discordLinked }">{{ discordLinked ? t('seller.connected') : t('seller.not_connected') }}</span>
                </div>
                <p class="link-desc">{{ t('seller.discord_desc') }}</p>
                <span v-if="userDiscordId" class="link-id">ID: {{ userDiscordId }}</span>
              </div>
              <div class="link-actions">
                <button v-if="discordLinked" class="btn-link-ghost" @click="copyDiscordId">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {{ discordCopied ? t('seller.copied') : t('seller.copy_id') }}
                </button>
                <button v-else class="btn-link-brand btn-discord-brand" @click="linkDiscord">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {{ t('seller.link') }}
                </button>
              </div>
            </div>
            <!-- Steam -->
            <div class="link-item" :class="{ linked: steamLinked }">
              <div class="link-brand brand-steam">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-1.508 16.542l-3.259-1.296c.135.537.246 1.141.246 1.734 0 .078-.004.156-.012.23-.278.774-.873 1.401-1.643 1.743-.648.288-1.363.343-2.031.219 1.05 1.227 2.606 2.025 4.353 2.025 1.947 0 3.66-.975 4.676-2.447l-2.33-.208zm-4.837-3.168a2.199 2.199 0 0 0 2.199 2.199 2.199 2.199 0 0 0 2.199-2.199 2.199 2.199 0 0 0-2.199-2.199 2.199 2.199 0 0 0-2.199 2.199zm10.839-5.535c0-1.716-1.393-3.109-3.109-3.109s-3.109 1.393-3.109 3.109 1.393 3.109 3.109 3.109 3.109-1.393 3.109-3.109z"/></svg>
              </div>
              <div class="link-meta">
                <div class="link-name">
                  <strong>{{ t('seller.steam') }}</strong>
                  <span class="link-status" :class="{ on: steamLinked }">{{ steamLinked ? t('seller.connected') : t('seller.not_connected') }}</span>
                </div>
                <p class="link-desc">{{ t('seller.steam_desc') }}</p>
                <span v-if="userSteamId" class="link-id">ID: {{ userSteamId }}</span>
              </div>
              <div class="link-actions">
                <button v-if="steamLinked" class="btn-link-ghost" disabled>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ t('seller.connected') }}
                </button>
                <button v-else class="btn-link-brand btn-steam-brand" @click="linkSteam">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  {{ t('seller.link') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stripe card -->
        <div class="acard anim-card">
          <div class="acard-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#635bff"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.693 0 3.033.642 3.964 1.219l.295-1.812c-.789-.537-2.303-1.088-4.105-1.088-2.645 0-4.475 1.356-4.475 3.562 0 2.248 1.928 3.21 4.344 4.033 2.154.734 3.226 1.342 3.226 2.416 0 .86-.695 1.446-2.077 1.446-1.909 0-3.548-.791-4.399-1.454l-.325 1.845c.902.66 2.663 1.283 4.794 1.283 2.995 0 4.81-1.522 4.81-3.799 0-2.318-1.798-3.246-4.212-4.077zM3.575 16.138V7.828h-1.78v9.489h4.916v-1.179H3.575zM20.205 16.138c.627 0 1.196-.049 1.795-.182v-1.702c-.53.144-1.066.218-1.605.218-2.636 0-4.259-1.67-4.259-4.211 0-2.43 1.691-4.256 4.135-4.256.614 0 1.195.127 1.795.327V4.584c-.583-.17-1.17-.249-1.795-.249-3.523 0-6.124 2.518-6.124 6.072 0 3.538 2.527 5.731 6.058 5.731z"/></svg>
            <h2>{{ t('seller.stripe') }}</h2>
          </div>
          <div class="acard-body">
            <div class="stripe-status" :class="stripeStatus === 'linked' ? 'linked' : (stripeHasAccount ? 'incomplete' : '')">
              <svg v-if="stripeStatus === 'loading'" class="spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <svg v-else-if="stripeLinked" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <svg v-else-if="stripeHasAccount" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <strong>{{ stripeStatus === 'loading' ? t('seller.stripe_checking') : (stripeLinked ? t('seller.stripe_linked') : (stripeHasAccount ? t('seller.stripe_incomplete') : t('seller.stripe_unlinked'))) }}</strong>
                <span>{{ stripeMsg }}</span>
              </div>
            </div>
            <a v-if="stripeStatus === 'linked'" class="btn-stripe outlined" @click.prevent="openStripeDashboard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              {{ t('seller.stripe_dashboard') }}
            </a>
            <a v-else class="btn-stripe" :class="{ disabled: stripeLoading }" @click.prevent="connectStripe">
              <svg v-if="stripeLoading" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.693 0 3.033.642 3.964 1.219l.295-1.812c-.789-.537-2.303-1.088-4.105-1.088-2.645 0-4.475 1.356-4.475 3.562 0 2.248 1.928 3.21 4.344 4.033 2.154.734 3.226 1.342 3.226 2.416 0 .86-.695 1.446-2.077 1.446-1.909 0-3.548-.791-4.399-1.454l-.325 1.845c.902.66 2.663 1.283 4.794 1.283 2.995 0 4.81-1.522 4.81-3.799 0-2.318-1.798-3.246-4.212-4.077zM3.575 16.138V7.828h-1.78v9.489h4.916v-1.179H3.575zM20.205 16.138c.627 0 1.196-.049 1.795-.182v-1.702c-.53.144-1.066.218-1.605.218-2.636 0-4.259-1.67-4.259-4.211 0-2.43 1.691-4.256 4.135-4.256.614 0 1.195.127 1.795.327V4.584c-.583-.17-1.17-.249-1.795-.249-3.523 0-6.124 2.518-6.124 6.072 0 3.538 2.527 5.731 6.058 5.731z"/></svg>
              {{ stripeLoading ? 'Redirection…' : (stripeHasAccount ? t('seller.resume_onboarding') : t('seller.connect_stripe')) }}
            </a>
            <p v-if="stripeError" class="stripe-error">{{ stripeError }}</p>
            <p v-if="!stripeLinked && stripeStatus === 'unlinked' && stripeHasAccount && stripeDetails" class="stripe-detail">
              charges: {{ stripeDetails.charges ? '✓' : '✗' }} · payouts: {{ stripeDetails.payouts ? '✓' : '✗' }} · détails: {{ stripeDetails.details ? '✓' : '✗' }}
            </p>
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
const { t } = useLang()

const config = useRuntimeConfig()
const api = config.public.apiOrigin
const pageRef = ref<HTMLElement | null>(null)
const stripeLinked = ref(false)
const stripeHasAccount = ref(false)
const discordLinked = ref(false)
const steamLinked = ref(false)
const userDiscordId = ref('')
const userSteamId = ref('')
const discordCopied = ref(false)
const profileMsg = ref('')
const stripeUrl = ref('/api/stripe/connect')
const stripeMsg = ref('')
const stripeStatus = ref('loading')
const stripeError = ref('')
const stripeDetails = ref<{ charges: boolean; payouts: boolean; details: boolean } | null>(null)
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
  profileMsg.value = t('seller.saved')
  setTimeout(() => profileMsg.value = '', 3000)
}

async function checkStripeConnect() {
  stripeStatus.value = 'loading'
  stripeMsg.value = ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await $fetch(api + '/api/stripe/connect/status', { credentials: 'include', signal: controller.signal })
    stripeHasAccount.value = !!res.hasAccount
    stripeDetails.value = res.hasAccount
      ? { charges: !!res.chargesEnabled, payouts: !!res.payoutsEnabled, details: !!res.detailsSubmitted }
      : null
    if (res.connected) {
      stripeLinked.value = true
      stripeStatus.value = 'linked'
      stripeMsg.value = t('seller.stripe_ok')
    } else {
      stripeLinked.value = false
      stripeStatus.value = 'unlinked'
      stripeMsg.value = stripeHasAccount.value
        ? t('seller.stripe_onboarding_hint')
        : t('seller.stripe_unlinked_hint')
    }
  } catch (e: any) {
    stripeLinked.value = false
    stripeStatus.value = 'unlinked'
    stripeMsg.value = e?.name === 'AbortError'
      ? t('seller.stripe_timeout')
      : 'Erreur: ' + (e?.data?.message || e?.message || 'vérification impossible')
  } finally {
    clearTimeout(timer)
  }
}

async function connectStripe() {
  stripeLoading.value = true
  stripeError.value = ''
  try {
    const res = await $fetch(api + '/api/stripe/connect', { method: 'POST', credentials: 'include' })
    if (res.url) window.location.href = res.url
    else stripeError.value = 'Réponse inattendue du serveur'
  } catch (e: any) {
    stripeError.value = e?.data?.message || e?.message || 'Erreur de connexion Stripe'
  } finally {
    stripeLoading.value = false
  }
}

// Associe le compte Stripe revenu de l'onboarding (via ?account=acct_xxx)
async function linkStripeAccount(accountId: string) {
  try {
    const res = await $fetch(api + '/api/stripe/connect/link', { method: 'POST', credentials: 'include', body: { accountId } })
    stripeHasAccount.value = true
    stripeDetails.value = {
      charges: !!res.chargesEnabled,
      payouts: !!res.payoutsEnabled,
      details: !!res.detailsSubmitted,
    }
    if (res.connected) {
      stripeLinked.value = true
      stripeStatus.value = 'linked'
      stripeMsg.value = t('seller.stripe_ok')
    } else {
      stripeLinked.value = false
      stripeStatus.value = 'unlinked'
      stripeMsg.value = t('seller.stripe_onboarding_hint')
    }
  } catch (e: any) {
    stripeError.value = e?.data?.message || e?.message || 'Erreur lors de la liaison Stripe'
    checkStripeConnect()
  }
}

async function openStripeDashboard() {
  try {
    const res = await $fetch(api + '/api/stripe/dashboard', { method: 'POST', credentials: 'include' })
    if (res.url) window.open(res.url, '_blank')
  } catch (e: any) {
    stripeError.value = e?.data?.message || 'Erreur dashboard Stripe'
  }
}

function linkDiscord() {
  window.location.href = '/auth/discord?return_url=' + encodeURIComponent('/seller/account')
}
function linkSteam() {
  window.location.href = '/auth/steam?return_url=' + encodeURIComponent('/seller/account')
}

async function copyDiscordId() {
  const id = userDiscordId.value
  if (!id) return
  try {
    await navigator.clipboard.writeText(id)
    discordCopied.value = true
    setTimeout(() => (discordCopied.value = false), 2000)
  } catch { /* clipboard indisponible */ }
}

onMounted(async () => {
  // Stripe d'abord — indépendant de GSAP (si GSAP échoue, le statut part quand même)
  checkStripeConnect()

  try {
    const { load, pageEntrance } = await import('~/composables/useAnimation')
    const { gsap } = await load()
    if (gsap) pageEntrance(gsap, pageRef.value)
  } catch { /* animations non bloquantes */ }

  // Check linked accounts from URL params (after OAuth callback)
  const params = new URLSearchParams(window.location.search)

  // Retour d'onboarding Stripe : ?account=acct_xxx => associer CE compte
  // précis à l'utilisateur (indépendant de l'email), puis re-vérifier.
  const stripeAccountParam = params.get('account')
  if (stripeAccountParam && stripeAccountParam.startsWith('acct_')) {
    linkStripeAccount(stripeAccountParam)
  }

  if (params.get('discord_id')) { discordLinked.value = true; userDiscordId.value = params.get('discord_id') }
  if (params.get('steam_id')) { steamLinked.value = true; userSteamId.value = params.get('steam_id') }

  // Check from user session
  const { user } = useAuth()
  if (user.value?.discordId) { discordLinked.value = true; userDiscordId.value = user.value.discordId }
  if (user.value?.steamId) { steamLinked.value = true; userSteamId.value = user.value.steamId }
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

/* Linked accounts */
.link-body { gap:10px; }
.link-item { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px; background:var(--bg-surface); border:1px solid var(--border); transition:border-color .2s, box-shadow .2s, background .2s; }
.link-item.linked { border-color:rgba(110,231,183,.22); background:linear-gradient(135deg, rgba(110,231,183,.05), rgba(255,255,255,0) 65%); }
.link-brand { width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.brand-discord { background:rgba(88,101,242,.15); color:#5865f2; }
.brand-steam { background:linear-gradient(135deg, #2a475e, #1b2838); color:#66c0f4; border:1px solid rgba(102,192,244,.15); }
.link-meta { flex:1; min-width:0; display:grid; gap:3px; }
.link-name { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.link-name strong { font-size:.9rem; font-weight:700; }
.link-status { font-size:.64rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; padding:3px 10px; border-radius:20px; color:var(--text-muted); background:rgba(255,255,255,.03); border:1px solid var(--border); }
.link-status.on { color:#6ee7b7; background:rgba(110,231,183,.08); border-color:rgba(110,231,183,.2); }
.link-desc { font-size:.76rem; color:var(--text-muted); line-height:1.4; }
.link-id { font-size:.7rem; color:var(--text-secondary); font-family:ui-monospace,Consolas,monospace; letter-spacing:.02em; }
.link-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.btn-link-brand { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:10px; border:none; font-size:.8rem; font-weight:700; cursor:pointer; color:#fff; transition:all .2s; font-family:inherit; }
.btn-discord-brand { background:#5865f2; box-shadow:0 2px 10px rgba(88,101,242,.25); }
.btn-discord-brand:hover { background:#4752c4; transform:translateY(-1px); box-shadow:0 4px 16px rgba(88,101,242,.4); }
.btn-steam-brand { background:linear-gradient(135deg, #2a475e, #1b2838); border:1px solid rgba(102,192,244,.25); }
.btn-steam-brand:hover { background:linear-gradient(135deg, #35586f, #23313f); transform:translateY(-1px); box-shadow:0 4px 16px rgba(27,40,56,.5); }
.btn-link-ghost { display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-size:.78rem; font-weight:600; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-link-ghost:hover { color:var(--text); border-color:var(--text-muted); }
.btn-link-ghost:disabled { opacity:.5; cursor:default; }
@media(max-width:520px){ .link-item { flex-wrap:wrap; } .link-actions { width:100%; justify-content:flex-end; } }

/* Stripe */
.stripe-status { display:flex; align-items:flex-start; gap:14px; padding:16px; border-radius:12px; background:var(--bg-surface); border:1px solid var(--border); }
.stripe-status.linked { background:rgba(110,231,183,.05); border-color:rgba(110,231,183,.18); }
.stripe-status.incomplete { background:rgba(245,158,11,.05); border-color:rgba(245,158,11,.22); }
.stripe-status svg { flex-shrink:0; margin-top:2px; }
.stripe-status strong { display:block; font-size:.9rem; font-weight:700; }
.stripe-status span { display:block; font-size:.8rem; color:var(--text-secondary); margin-top:3px; line-height:1.45; }
.stripe-status .spin { animation:spin 1s linear infinite; color:var(--primary); }
@keyframes spin { to { transform:rotate(360deg); } }
.btn-stripe { display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:12px 22px; border-radius:12px; background:linear-gradient(135deg,#635bff,#7a5cff); color:#fff; font-size:.9rem; font-weight:700; text-decoration:none; transition:all .2s; justify-self:start; border:none; cursor:pointer; font-family:inherit; box-shadow:0 2px 12px rgba(99,91,255,.25); }
.btn-stripe:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,91,255,.4); }
.btn-stripe:active { transform:translateY(0); }
.btn-stripe.disabled { opacity:.6; pointer-events:none; }
.btn-stripe.outlined { background:transparent; color:#635bff; border:2px solid #635bff; box-shadow:none; }
.btn-stripe.outlined:hover { background:#635bff; color:#fff; }
.stripe-error { font-size:.78rem; color:var(--red); background:rgba(248,113,113,.06); border:1px solid rgba(248,113,113,.18); border-radius:8px; padding:8px 12px; }
.stripe-detail { font-size:.72rem; color:var(--text-muted); font-family:ui-monospace,Consolas,monospace; }

/* Stats */
.stats-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
.stat-item { text-align:center;padding:16px;border-radius:10px;background:rgba(255,255,255,0.02);display:grid;gap:4px; }
.stat-val { font-size:1.3rem;font-weight:800;color:var(--text); }
.stat-lbl { font-size:.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em; }

.acard:last-child { grid-column:1/2; }
@media(max-width:768px){ .account-grid{grid-template-columns:1fr}.acard:last-child{grid-column:auto} }
</style>
