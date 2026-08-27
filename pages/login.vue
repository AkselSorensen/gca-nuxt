<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({
  title: 'Connexion — GSA Store',
  description: 'Connectez-vous à GSA Store pour accéder à votre compte, vos téléchargements et vos avantages clients.',
  ogType: 'website',
  robots: 'noindex, nofollow',
})
const { login, user } = useAuth()
const { t } = useLang()
const route = useRoute()
const tab = ref('user')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)
const pageRef = ref<HTMLElement | null>(null)

// ?discord=required → l'utilisateur n'est pas membre du serveur Discord
const discordRequired = computed(() => route.query.discord === 'required')
// ?attempted=1 → il a tenté l'OAuth mais n'est toujours pas membre
const discordAttempted = computed(() => route.query.attempted === '1')

function discordLogin() {
  const isSeller = tab.value === 'seller'
  // Honore ?redirect= (ex. guest qui voulait acheter → retour sur la page produit)
  const redirect = route.query.redirect ? String(route.query.redirect) : ''
  const params = new URLSearchParams({
    return_url: redirect || route.path,
    account_type: isSeller ? 'seller' : 'buyer',
  })
  window.location.href = '/auth/discord?' + params.toString()
}

// "Rejoindre le serveur" : ouvre l'invite Discord, puis relance automatiquement
// l'OAuth au retour sur l'onglet (si l'utilisateur a rejoint → connexion directe)
function joinDiscord() {
  window.open('https://discord.gg/KDsEzGRnKs', '_blank')
  let rechecked = false
  const onFocus = () => {
    if (rechecked) return
    rechecked = true
    window.removeEventListener('focus', onFocus)
    discordLogin()
  }
  window.addEventListener('focus', onFocus)
}

async function handleLogin() {
  error.value = ''; submitting.value = true
  try {
    const res = await login(email.value, password.value)
    const role = res?.user?.role || user?.value?.role
    const slug = res?.user?.slug || user?.value?.slug
    if (tab.value === 'admin' && role !== 'admin') {
      error.value = 'Ces identifiants ne sont pas ceux d\'un administrateur.'
      submitting.value = false
      return
    }
    if (role === 'admin') navigateTo('/admin')
    else if (route.query.redirect) navigateTo(String(route.query.redirect))
    else if (role === 'seller' && slug) navigateTo('/seller/' + slug)
    else navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Erreur de connexion'
  } finally { submitting.value = false }
}

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<template>
  <div ref="pageRef" class="auth-page">
    <div class="auth-card anim-scale">
      <div class="auth-header anim-up">
        <NuxtLink to="/" class="auth-logo"><span class="logo-icon">G</span></NuxtLink>
        <h1>{{ t('login.title') }}</h1>
      </div>
      <div class="auth-tabs">
        <button class="tab-btn" :class="{ active: tab === 'user' }" @click="tab = 'user'">Utilisateur</button>
        <button class="tab-btn" :class="{ active: tab === 'seller' }" @click="tab = 'seller'">Vendeur</button>
        <button class="tab-btn" :class="{ active: tab === 'admin' }" @click="tab = 'admin'">Administrateur</button>
      </div>

      <!-- Panneau : pas membre du serveur Discord -->
      <div v-if="discordRequired && tab !== 'admin'" class="join-panel anim-scale">
        <div class="join-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#5865f2"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        </div>
        <h2>Rejoignez le serveur Discord GSA</h2>
        <p>Pour vous connecter ou vous inscrire, vous devez être membre du serveur Discord officiel GSA.</p>
        <div v-if="discordAttempted" class="join-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Vous n'avez pas encore rejoint le serveur Discord. Cliquez sur « Rejoindre le serveur Discord » ci-dessous, acceptez l'invitation, puis revenez ici.
        </div>
        <a href="https://discord.gg/KDsEzGRnKs" target="_blank" rel="noopener" class="btn-join" @click="joinDiscord">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          Rejoindre le serveur Discord
        </a>
        <button class="btn-retry" @click="discordLogin">Je suis membre, me connecter</button>
      </div>

      <!-- Connexion Discord -->
      <div v-else-if="tab !== 'admin'" class="auth-form">
        <button class="btn-discord-main" @click="discordLogin">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286z"/></svg>
          {{ submitting ? 'Redirection…' : (tab === 'seller' ? 'Se connecter en tant que vendeur avec Discord' : 'Se connecter avec Discord') }}
        </button>
        <p class="discord-note anim-fade">Vous devez être membre du serveur Discord GSA pour accéder à la plateforme.</p>
        <p class="auth-footer anim-fade">Pas encore de compte ? <NuxtLink :to="route.query.redirect ? '/register?redirect=' + encodeURIComponent(String(route.query.redirect)) : '/register'">S'inscrire</NuxtLink></p>
      </div>

      <!-- Admin Login -->
      <form v-if="tab === 'admin'" @submit.prevent="handleLogin" class="auth-form">
        <div class="admin-notice anim-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>{{ t('login.admin_sub') }}</span>
        </div>
        <div class="field anim-up"><label>Email</label><input v-model="email" type="email" placeholder="GSA" required /></div>
        <div class="field anim-up"><label>Mot de passe</label><input v-model="password" type="password" placeholder="••••••••" required /></div>
        <p v-if="error" class="auth-error anim-fade">{{ error }}</p>
        <button type="submit" class="btn-submit btn-admin anim-up" :disabled="submitting">{{ submitting ? 'Connexion…' : 'Accéder au panneau' }}</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page { display:grid; place-items:center; min-height:100vh; padding:20px; }
.auth-card { width:100%; max-width:420px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:36px; }
.auth-header { text-align:center; margin-bottom:20px; }
.auth-logo { display:inline-block; margin-bottom:10px; }
.logo-icon { width:44px;height:44px;display:grid;place-items:center;background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:11px;color:#fff;font-weight:900;font-size:1.2rem; }
.auth-header h1 { font-size:1.4rem;font-weight:800;letter-spacing:-.03em; }

/* Tabs */
.auth-tabs { display:flex;background:rgba(255,255,255,0.03);border-radius:10px;padding:3px;margin-bottom:24px; }
.tab-btn { flex:1;padding:9px 12px;border-radius:8px;border:none;background:transparent;color:var(--text-muted);font-size:.83rem;font-weight:600;cursor:pointer;transition:all .2s; }
.tab-btn.active { background:var(--bg-surface);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,0.2); }

/* Discord */
.auth-form { display:grid;gap:16px; }
.discord-hero { display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;border-radius:10px;background:rgba(88,101,242,0.06);border:1px solid rgba(88,101,242,0.15);font-weight:700;font-size:.92rem; }
.btn-discord-main { display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#5865f2,#4752c4);color:#fff;font-size:.95rem;font-weight:700;cursor:pointer;transition:filter .2s,transform .2s;font-family:inherit;box-shadow:0 8px 24px rgba(88,101,242,0.25); }
.btn-discord-main:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); }
.btn-discord-main:disabled { opacity:.6; cursor:not-allowed; }
.discord-note { margin:0; text-align:center; color:var(--text-muted); font-size:.78rem; }

/* Join panel */
.join-panel { display:grid; gap:14px; text-align:center; padding:10px 0; }
.join-icon { width:64px; height:64px; margin:0 auto; border-radius:50%; background:rgba(88,101,242,0.1); border:1px solid rgba(88,101,242,0.2); display:grid; place-items:center; }
.join-panel h2 { margin:0; font-size:1.15rem; font-weight:800; }
.join-panel p { margin:0; color:var(--text-secondary); font-size:.88rem; line-height:1.6; }
.btn-join { display:flex; align-items:center; justify-content:center; gap:10px; padding:14px; border-radius:10px; background:linear-gradient(135deg,#5865f2,#4752c4); color:#fff; font-weight:700; font-size:.92rem; text-decoration:none; transition:filter .2s,transform .2s; box-shadow:0 8px 24px rgba(88,101,242,0.25); }
.btn-join:hover { filter:brightness(1.1); transform:translateY(-1px); }
.btn-retry { padding:12px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--text-secondary); font-weight:600; font-size:.85rem; cursor:pointer; transition:all .2s; font-family:inherit; }
.btn-retry:hover { background:rgba(255,255,255,0.04); }
.join-error { display:flex; align-items:flex-start; gap:8px; padding:12px 14px; border-radius:10px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.25); color:var(--red); font-size:.82rem; line-height:1.5; text-align:left; }
.join-error svg { flex-shrink:0; margin-top:2px; }

.field { display:grid;gap:5px; }
.field label { font-size:.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em; }
.field input { padding:11px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.9rem;outline:none;transition:border-color .2s; }
.field input:focus { border-color:var(--primary); }
.auth-error { color:var(--red);font-size:.85rem;padding:10px;border-radius:6px;background:rgba(248,113,113,0.1); }
.btn-submit { padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.9rem;font-weight:600;transition:all .2s;cursor:pointer;font-family:inherit; }
.btn-submit:hover:not(:disabled) { opacity:.9;transform:translateY(-1px); }
.btn-submit:disabled { opacity:.5;cursor:not-allowed; }
.btn-admin { background:linear-gradient(135deg,#dc2626,#7c3aed); }
.auth-footer { text-align:center;font-size:.85rem;color:var(--text-secondary);margin-top:4px; }
.auth-footer a { color:var(--primary);font-weight:600; }
.admin-notice { display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.12);color:var(--text-secondary);font-size:.82rem;line-height:1.4; }
.admin-notice svg { flex-shrink:0;color:#dc2626; }
</style>
