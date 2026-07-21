<template>
  <div ref="pageRef" class="auth-page">
    <div class="auth-card anim-scale">
      <div class="auth-header anim-up">
        <NuxtLink to="/" class="auth-logo"><span class="logo-icon">G</span></NuxtLink>
        <h1>Créer un compte</h1>
      </div>
      <div class="account-options anim-up">
        <div class="option-card" :class="{ active: accountType === 'buyer' }" @click="accountType = 'buyer'; termsAccepted = false">
          <div class="opt-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg></div>
          <div><strong>Acheteur</strong><span>Accéder à la marketplace</span></div>
        </div>
        <div class="option-card" :class="{ active: accountType === 'seller' }" @click="accountType = 'seller'">
          <div class="opt-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <div><strong>Vendeur</strong><span>Vendre vos créations</span></div>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="field anim-up"><label>Pseudo</label><input v-model="username" type="text" placeholder="Votre pseudo" required /></div>
        <div class="field anim-up"><label>Email</label><input v-model="email" type="email" placeholder="vous@exemple.com" required /></div>
        <div class="field anim-up"><label>Mot de passe</label><input v-model="password" type="password" placeholder="••••••••" required minlength="6" /></div>
        <div v-if="accountType === 'seller'" class="seller-fields anim-scroll">
          <div class="field"><label>Nom de la boutique</label><input v-model="shopName" type="text" placeholder="Ma boutique" /></div>
          <div class="field"><label>Discord</label><input v-model="discord" type="text" placeholder="votre_discord#0000" /></div>
        </div>
        <p v-if="error" class="auth-error anim-fade">{{ error }}</p>
        <p v-if="success" class="auth-success anim-fade">Compte créé !</p>
        <button type="submit" class="btn-submit anim-up" :disabled="submitting">
          {{ submitting ? '…' : accountType === 'seller' ? 'Créer mon compte vendeur' : 'Créer mon compte' }}
        </button>
        <div class="divider anim-fade"><span>ou</span></div>
        <div class="social-btns anim-up">
          <button type="button" class="btn-social btn-steam" @click="socialLogin('steam')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2C7 2 3.3 5.2 2.5 9.5l4.3 1.8c.6-.4 1.4-.5 2.2-.3.9.2 1.6.8 2 1.6l2.9 7.1c.1.2.1.5.1.7 0 1.1-.9 2-2 2-.7 0-1.4-.4-1.7-1l-3.9-1.6c-.3 1.2-1 2.3-2.1 3.1C7.7 23.5 9.5 24 11.3 24c3.8 0 7.1-2.7 7.9-6.5l3.8-1.5.5-4.2L11.5 2zM6.6 13.4l-2.8-1.2c.2 2.4 2 4.3 4.4 4.5l2.4-1.1c.4.9 1.3 1.5 2.3 1.5 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5c-1 0-1.9.6-2.3 1.5L8.7 14c-.2-1-.7-1.9-1.5-2.5l1.4 1.9z"/></svg> Steam</button>
          <button type="button" class="btn-social btn-discord" @click="socialLogin('discord')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg> Discord</button>
        </div>
        <p class="auth-footer anim-fade">Déjà un compte ? <NuxtLink to="/login">Se connecter</NuxtLink></p>
      </form>
    </div>

    <!-- Terms Modal -->
    <Teleport to="body">
      <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
        <div class="modal-card anim-scale" @click.stop>
          <div class="modal-header">
            <h2>Conditions vendeur</h2>
            <button class="modal-close" @click="showTerms = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div ref="termsScrollRef" class="terms-scroll" @scroll="onTermsScroll">
            <div class="terms-content">
              <h3>1. Conditions générales de vente</h3>
              <p>En créant un compte vendeur sur GSA, vous acceptez les présentes conditions. Vous vous engagez à fournir des créations originales et de qualité, respectueuses des droits d'auteur.</p>
              <h3>2. Commission</h3>
              <p>GSA prélève une commission de <strong>25%</strong> sur chaque vente réalisée via la plateforme (20% pour les partenaires). Cette commission couvre les frais de transaction, d'hébergement et de mise en avant.</p>
              <h3>3. Paiements</h3>
              <p>Les paiements sont traités via Stripe. Vous devez liér votre compte Stripe pour recevoir vos fonds. Les virements sont effectués sous 48h ouvrées après validation de la commande.</p>
              <h3>4. Contenu interdit</h3>
              <p>Il est strictement interdit de :</p>
              <ul><li>Vendre du contenu volé ou repris sans autorisation</li><li>Utiliser des assets protégés par des droits d'auteur tiers</li><li>Publier du contenu inapproprié ou malveillant</li><li>Créer de faux avis ou manipuler les notes</li></ul>
              <h3>5. Qualité et support</h3>
              <p>Chaque produit doit être accompagné d'une description précise, d'images réelles et d'une documentation fonctionnelle. Vous vous engagez à fournir un support raisonnable aux acheteurs.</p>
              <h3>6. Résiliation</h3>
              <p>GSA se réserve le droit de suspendre ou supprimer tout compte vendeur en cas de non-respect des conditions. En cas de litige, une procédure de médiation sera engagée avant toute sanction.</p>
              <h3>7. Protection des données</h3>
              <p>Vos données personnelles sont traitées conformément au RGPD. Consultez notre politique de confidentialité pour plus d'informations.</p>
              <p style="margin-top:20px;padding:16px;background:rgba(47,125,246,0.06);border-radius:8px;border:1px solid rgba(47,125,246,0.15);text-align:center;">
                Scrollez jusqu'en bas pour accepter les conditions.
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <label class="terms-check" :class="{ disabled: !termsScrolled }">
              <input type="checkbox" v-model="termsAccepted" :disabled="!termsScrolled" />
              <span>J'accepte les conditions générales de vente</span>
            </label>
            <button class="btn-accept" :disabled="!termsAccepted" @click="confirmTerms">Confirmer et continuer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { register } = useAuth()
const pageRef = ref<HTMLElement | null>(null)
const termsScrollRef = ref<HTMLElement | null>(null)

const accountType = ref('buyer')
const username = ref(''); const email = ref(''); const password = ref('')
const shopName = ref(''); const discord = ref('')
const error = ref(''); const success = ref(false); const submitting = ref(false)
const showTerms = ref(false)
const termsAccepted = ref(false)
const termsScrolled = ref(false)

function onTermsScroll() {
  if (!termsScrollRef.value) return
  const el = termsScrollRef.value
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    termsScrolled.value = true
  }
}

function confirmTerms() {
  if (!termsAccepted.value) return
  showTerms.value = false
  handleRegister()
}

async function handleRegister() {
  if (accountType.value === 'seller' && !termsAccepted.value) {
    showTerms.value = true
    return
  }
  error.value = ''; submitting.value = true
  try {
    await register({ displayName: username.value, email: email.value, password: password.value, shopName: shopName.value, discord: discord.value })
    success.value = true
    setTimeout(() => navigateTo('/seller/account'), 1500)
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Erreur"
  } finally { submitting.value = false }
}

function socialLogin(p: string) { window.location.href = '/auth/' + p }

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.auth-page { display:grid; place-items:center; min-height:100vh; padding:20px; position:relative; }
.auth-card { width:100%; max-width:440px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); padding:36px; z-index:1; }
.auth-header { text-align:center; margin-bottom:20px; }
.auth-logo { display:inline-block; margin-bottom:10px; }
.logo-icon { width:44px;height:44px;display:grid;place-items:center;background:linear-gradient(135deg,var(--primary),var(--accent));border-radius:11px;color:#fff;font-weight:900;font-size:1.2rem; }
.auth-header h1 { font-size:1.4rem;font-weight:800;letter-spacing:-.03em; }
.account-options { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px; }
.option-card { display:flex;align-items:center;gap:12px;padding:14px;border-radius:10px;border:1px solid var(--border);cursor:pointer;transition:all .2s;background:transparent; }
.option-card:hover { border-color:var(--border-hover);background:rgba(255,255,255,0.02); }
.option-card.active { border-color:rgba(47,125,246,0.3);background:rgba(47,125,246,0.06); }
.opt-icon { width:40px;height:40px;display:grid;place-items:center;border-radius:9px;background:var(--bg-surface);flex-shrink:0; }
.option-card.active .opt-icon { background:rgba(47,125,246,0.1); }
.option-card strong { display:block;font-size:.85rem;font-weight:700; }
.option-card span { font-size:.75rem;color:var(--text-muted); }
.auth-form { display:grid;gap:14px; }
.field { display:grid;gap:5px; }
.field label { font-size:.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em; }
.field input { padding:11px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.9rem;outline:none;transition:border-color .2s; }
.field input:focus { border-color:var(--primary); }
.seller-fields { display:grid;gap:14px;padding:16px;border-radius:10px;background:rgba(110,231,183,0.03);border:1px solid rgba(110,231,183,0.1); }
.auth-error { color:var(--red);font-size:.85rem;padding:10px;border-radius:6px;background:rgba(248,113,113,0.1); }
.auth-success { color:var(--green);font-size:.85rem;padding:10px;border-radius:6px;background:rgba(110,231,183,0.1); }
.btn-submit { padding:12px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.9rem;font-weight:600;transition:all .2s;cursor:pointer;font-family:inherit; }
.btn-submit:hover:not(:disabled) { opacity:.9;transform:translateY(-1px); }
.btn-submit:disabled { opacity:.5;cursor:not-allowed; }
.divider { display:flex;align-items:center;gap:12px;color:var(--text-muted);font-size:.78rem; }
.divider::before,.divider::after { content:'';flex:1;height:1px;background:var(--border); }
.social-btns { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
.btn-social { display:flex;align-items:center;justify-content:center;gap:8px;padding:11px;border-radius:9px;border:1px solid var(--border);font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s;color:var(--text);background:transparent;font-family:inherit; }
.btn-social:hover { border-color:var(--border-hover);background:rgba(255,255,255,0.03); }
.btn-steam svg { color:#1b2838; } .btn-discord svg { color:#5865f2; }
.auth-footer { text-align:center;font-size:.85rem;color:var(--text-secondary); }
.auth-footer a { color:var(--primary);font-weight:600; }

/* Modal */
.modal-overlay { position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:grid;place-items:center;padding:20px;backdrop-filter:blur(4px); }
.modal-card { width:100%;max-width:560px;max-height:90vh;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:flex;flex-direction:column;overflow:hidden; }
.modal-header { display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border); }
.modal-header h2 { font-size:1.15rem;font-weight:700; }
.modal-close { width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.04);color:var(--text-muted);cursor:pointer;display:grid;place-items:center;transition:all .2s; }
.modal-close:hover { background:rgba(255,255,255,0.08);color:var(--text); }
.terms-scroll { flex:1;overflow-y:auto;padding:24px; }
.terms-scroll::-webkit-scrollbar { width:5px; }
.terms-scroll::-webkit-scrollbar-thumb { background:var(--border);border-radius:3px; }
.terms-content h3 { font-size:.95rem;font-weight:700;margin-top:20px;margin-bottom:8px; }
.terms-content h3:first-child { margin-top:0; }
.terms-content p { font-size:.88rem;color:var(--text-secondary);line-height:1.7; }
.terms-content ul { padding:0;list-style:none;display:grid;gap:4px;margin:8px 0; }
.terms-content li { padding:6px 10px;border-radius:6px;background:rgba(255,255,255,0.02);font-size:.85rem;color:var(--text-secondary);padding-left:12px;border-left:2px solid var(--primary); }
.modal-footer { padding:16px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap; }
.terms-check { display:flex;align-items:center;gap:8px;font-size:.85rem;color:var(--text-secondary);cursor:pointer; }
.terms-check.disabled { opacity:.4;cursor:not-allowed; }
.terms-check input { width:16px;height:16px;accent-color:var(--primary); }
.btn-accept { padding:10px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s; }
.btn-accept:disabled { opacity:.4;cursor:not-allowed; }
.btn-accept:not(:disabled):hover { opacity:.9;transform:translateY(-1px); }
</style>
