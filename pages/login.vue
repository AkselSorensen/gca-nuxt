<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { login, user } = useAuth()
const { t } = useLang()
const tab = ref('user')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)
const pageRef = ref<HTMLElement | null>(null)

async function handleLogin() {
  error.value = ''; submitting.value = true
  try {
    const res = await login(email.value, password.value)
    const role = res?.user?.role || user?.value?.role
    const slug = res?.user?.slug || user?.value?.slug

    // Vérifier que le rôle correspond à l'onglet sélectionné
    if (tab.value === 'admin' && role !== 'admin') {
      error.value = 'Ces identifiants ne sont pas ceux d\'un administrateur.'
      submitting.value = false
      return
    }
    if (tab.value === 'seller' && role === 'admin') {
      error.value = t('login.admin_error')
      submitting.value = false
      return
    }
    if (tab.value === 'user' && role === 'admin') {
      error.value = t('login.admin_error')
      submitting.value = false
      return
    }

    if (role === 'admin') navigateTo('/admin')
    else if (role === 'seller' && slug) navigateTo('/seller/' + slug)
    else if (tab.value === 'seller' && slug) navigateTo('/seller/' + slug)
    else navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Erreur de connexion'
  } finally { submitting.value = false }
}

function socialLogin(provider: string) {
  window.location.href = '/auth/' + provider + '?return_url=' + encodeURIComponent(window.location.pathname)
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

      <!-- User Login -->
      <form v-if="tab === 'user'" @submit.prevent="handleLogin" class="auth-form">
        <div class="social-btns anim-up">
          <button type="button" class="btn-social btn-steam" @click="socialLogin('steam')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-1.508 16.542l-3.259-1.296c.135.537.246 1.141.246 1.734 0 .078-.004.156-.012.23-.278.774-.873 1.401-1.643 1.743-.648.288-1.363.343-2.031.219 1.05 1.227 2.606 2.025 4.353 2.025 1.947 0 3.66-.975 4.676-2.447l-2.33-.208zm-4.837-3.168a2.199 2.199 0 0 0 2.199 2.199 2.199 2.199 0 0 0 2.199-2.199 2.199 2.199 0 0 0-2.199-2.199 2.199 2.199 0 0 0-2.199 2.199zm10.839-5.535c0-1.716-1.393-3.109-3.109-3.109s-3.109 1.393-3.109 3.109 1.393 3.109 3.109 3.109 3.109-1.393 3.109-3.109z"/></svg> Steam
          </button>
          <button type="button" class="btn-social btn-discord" @click="socialLogin('discord')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg> Discord
          </button>
        </div>
        <div class="divider anim-fade"><span>ou par email</span></div>
        <div class="field anim-up"><label>Email</label><input v-model="email" type="email" placeholder="vous@exemple.com" required /></div>
        <div class="field anim-up"><label>Mot de passe</label><input v-model="password" type="password" placeholder="••••••••" required /></div>
        <p v-if="error" class="auth-error anim-fade">{{ error }}</p>
        <button type="submit" class="btn-submit anim-up" :disabled="submitting">{{ submitting ? 'Connexion…' : t('login.submit') }}</button>
        <p class="auth-footer anim-fade">Pas encore de compte ? <NuxtLink to="/register">S'inscrire</NuxtLink></p>
      </form>

      <!-- Seller Login -->
      <form v-if="tab === 'seller'" @submit.prevent="handleLogin" class="auth-form">
        <div class="seller-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span>{{ t('login.seller_sub') }}</span>
        </div>
        <div class="field anim-up"><label>Email</label><input v-model="email" type="email" placeholder="vendeur@gsa.fr" required /></div>
        <div class="field anim-up"><label>Mot de passe</label><input v-model="password" type="password" placeholder="••••••••" required /></div>
        <p v-if="error" class="auth-error anim-fade">{{ error }}</p>
        <button type="submit" class="btn-submit btn-seller anim-up" :disabled="submitting">{{ submitting ? 'Connexion…' : 'Accéder à mon espace' }}</button>
        <p class="auth-footer anim-fade">Pas encore de compte vendeur ? <NuxtLink to="/register">S'inscrire</NuxtLink></p>
      </form>

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

/* Social */
.social-btns { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px; }
.btn-social { display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:9px;border:1px solid var(--border);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text);background:transparent;font-family:inherit; }
.btn-social:hover { border-color:var(--border-hover);background:rgba(255,255,255,0.03); }
.btn-steam svg { color:#1b2838; } .btn-steam:hover { border-color:rgba(27,40,56,0.3); } .btn-discord svg { color:#5865f2; } .btn-discord:hover { border-color:rgba(88,101,242,0.3); }

.divider { display:flex;align-items:center;gap:12px;margin:12px 0;color:var(--text-muted);font-size:.78rem; }
.divider::before,.divider::after { content:'';flex:1;height:1px;background:var(--border); }

.auth-form { display:grid;gap:16px; }
.field { display:grid;gap:5px; }
.field label { font-size:.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em; }
.field input { padding:11px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.9rem;outline:none;transition:border-color .2s; }
.field input:focus { border-color:var(--primary); }
.auth-error { color:var(--red);font-size:.85rem;padding:10px;border-radius:6px;background:rgba(248,113,113,0.1); }
.btn-submit { padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.9rem;font-weight:600;transition:all .2s;cursor:pointer;font-family:inherit; }
.btn-submit:hover:not(:disabled) { opacity:.9;transform:translateY(-1px); }
.btn-submit:disabled { opacity:.5;cursor:not-allowed; }
.btn-admin { background:linear-gradient(135deg,#dc2626,#7c3aed); }
.btn-seller { background:linear-gradient(135deg,#6ee7b7,#2f7df6); }

.seller-notice { display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;background:rgba(110,231,183,0.06);border:1px solid rgba(110,231,183,0.12);color:var(--text-secondary);font-size:.82rem;line-height:1.4; }
.seller-notice svg { flex-shrink:0;color:var(--green); }

.auth-footer { text-align:center;font-size:.85rem;color:var(--text-secondary);margin-top:4px; }
.auth-footer a { color:var(--primary);font-weight:600; }

/* Admin notice */
.admin-notice { display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.12);color:var(--text-secondary);font-size:.82rem;line-height:1.4; }
.admin-notice svg { flex-shrink:0;color:#dc2626; }
</style>
