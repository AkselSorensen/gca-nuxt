<template>
  <div ref="pageRef" class="auth-page">
    <div class="auth-card anim-scale">
      <div class="auth-header anim-up">
        <NuxtLink to="/" class="auth-logo"><span class="logo-icon">G</span></NuxtLink>
        <h1>{{ t('register.title') }}</h1>
      </div>
      <div class="account-options anim-up">
        <div class="option-card" :class="{ active: accountType === 'buyer' }" @click="accountType = 'buyer'; termsAccepted = false">
          <div class="opt-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg></div>
          <div><strong>{{ t('register.buyer') }}</strong><span>{{ t('register.buyer_sub') }}</span></div>
        </div>
        <div class="option-card" :class="{ active: accountType === 'seller' }" @click="accountType = 'seller'">
          <div class="opt-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <div><strong>Vendeur</strong><span>{{ t('register.seller_sub') }}</span></div>
        </div>
      </div>

      <div v-if="showVerify" class="verify-panel anim-scale">
        <div class="verify-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </div>
        <h2>Vérifiez votre email</h2>
        <p class="verify-sub">Un code de validation a été envoyé à <strong>{{ registeredEmail }}</strong>.</p>
        <div v-if="devCode" class="verify-devcode">
          <span>Mode démo (email non configuré) — votre code :</span>
          <strong>{{ devCode }}</strong>
        </div>
        <div class="field anim-up">
          <label>Code de validation</label>
          <input v-model="verifyCode" type="text" inputmode="numeric" placeholder="000000" maxlength="6" class="verify-input" @keyup.enter="verifyEmail" />
        </div>
        <p v-if="verifyError" class="auth-error anim-fade">{{ verifyError }}</p>
        <button class="btn-submit" :disabled="verifying" @click="verifyEmail">
          {{ verifying ? 'Vérification...' : 'Valider mon email' }}
        </button>
      </div>

      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="field anim-up"><label>Pseudo</label><input v-model="username" type="text" placeholder="Votre pseudo" required /></div>
        <div class="field anim-up"><label>Email</label><input v-model="email" type="email" placeholder="vous@exemple.com" required /></div>
        <div class="field anim-up"><label>Mot de passe</label><input v-model="password" type="password" placeholder="••••••••" required minlength="6" /></div>
        <div v-if="accountType === 'seller'" class="seller-fields anim-scroll">
          <div class="field"><label>Nom de la boutique</label><input v-model="shopName" type="text" placeholder="Ma boutique" /></div>
          <div class="field"><label>Discord</label>
            <div v-if="discordLinked" class="discord-linked">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865f2"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
              <span>{{ t('register.discord_linked') }}</span>
              <small>{{ discordLinked }}</small>
            </div>
            <button v-else type="button" class="btn-discord-link" @click="linkDiscord">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
              Lier mon compte Discord
            </button>
          </div>
          <div class="field"><label>{{ t('register.intro') }}</label><textarea v-model="sellerDescription" rows="4" placeholder="Parlez-nous de vous, votre expérience, ce que vous créez…" maxlength="1000"></textarea></div>
        </div>
        <p v-if="error" class="auth-error anim-fade">{{ error }}</p>
        <p v-if="success" class="auth-success anim-fade">{{ t('register.success') }}</p>
        <button type="submit" class="btn-submit anim-up" :disabled="submitting">
          {{ submitting ? '…' : accountType === 'seller' ? t('register.create_seller') : t('register.create_buyer') }}
        </button>
        <div class="divider anim-fade"><span>ou</span></div>
        <div class="social-btns anim-up">
          <button type="button" class="btn-social btn-steam" @click="socialLogin('steam')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12 0-6.625-5.373-12-12-12zm-1.508 16.542l-3.259-1.296c.135.537.246 1.141.246 1.734 0 .078-.004.156-.012.23-.278.774-.873 1.401-1.643 1.743-.648.288-1.363.343-2.031.219 1.05 1.227 2.606 2.025 4.353 2.025 1.947 0 3.66-.975 4.676-2.447l-2.33-.208zm-4.837-3.168a2.199 2.199 0 0 0 2.199 2.199 2.199 2.199 0 0 0 2.199-2.199 2.199 2.199 0 0 0-2.199-2.199 2.199 2.199 0 0 0-2.199 2.199zm10.839-5.535c0-1.716-1.393-3.109-3.109-3.109s-3.109 1.393-3.109 3.109 1.393 3.109 3.109 3.109 3.109-1.393 3.109-3.109z"/></svg> Steam</button>
          <button type="button" class="btn-social btn-discord" @click="socialLogin('discord')"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2914a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg> Discord</button>
        </div>
        <p class="auth-footer anim-fade">{{ t('register.has_account') }} <NuxtLink to="/login">{{ t('register.login_link') }}</NuxtLink></p>
      </form>
    </div>

    <!-- Terms Modal -->
    <Teleport to="body">
      <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
        <div class="modal-card anim-scale" @click.stop>
          <div class="modal-header">
            <h2>{{ accountType === 'seller' ? 'Contrat vendeur' : 'Conditions générales' }}</h2>
            <button class="modal-close" @click="showTerms = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div ref="termsScrollRef" class="terms-scroll" @scroll="onTermsScroll">
            <div v-if="accountType === 'seller'" class="terms-content">
              <h3>Préambule</h3>
              <p>GSA est une plateforme numérique spécialisée dans la distribution, la valorisation et la commercialisation de ressources numériques destinées à la création de projets vidéoludiques. GSA exerce une activité hybride comprenant une activité de marketplace mettant en relation vendeurs et acheteurs, une activité de prestation de services liés à la présentation, la sélection et la promotion des contenus, et une activité de création et de fourniture de prestations professionnelles réalisées directement par GSA.</p>
              <p>Le présent contrat régit les relations entre <strong>GSA Store</strong> (ci-après « GSA » ou « la Plateforme ») et tout créateur inscrit en qualité de vendeur (ci-après « le Vendeur »). En créant un compte vendeur, le Vendeur accepte sans réserve l'intégralité des présentes conditions ainsi que les Fondations Juridiques de GSA.</p>

              <h3>Article 1 — Définitions</h3>
              <p>Les termes utilisés dans le présent contrat s'entendent au sens des Fondations Juridiques de GSA (version 1.0.0) :</p>
              <ul>
                <li><strong>Produit numérique</strong> : tout contenu immatériel proposé à la vente (modèles 3D, textures, environnements, maps, effets visuels, interfaces, sons, animations, ressources pour moteurs de jeux…) ;</li>
                <li><strong>Validation GSA</strong> : processus interne de contrôle humain effectué avant publication — prestation de contrôle qualité, ne constituant ni certification technique absolue, ni garantie contre tout défaut, ni garantie de compatibilité ;</li>
                <li><strong>Présentation GSA</strong> : miniatures, captures, vidéos, descriptions et textes promotionnels préparés par GSA, protégés au titre du droit d'auteur ;</li>
                <li><strong>Commission</strong> : rémunération perçue par GSA, définie contractuellement avec chaque Vendeur.</li>
              </ul>

              <h3>Article 2 — Nature du rôle de GSA</h3>
              <p>GSA agit en qualité d'opérateur de plateforme permettant la mise en relation entre vendeurs et acheteurs. Sauf indication contraire, GSA n'est ni l'auteur des contenus proposés par les Vendeurs, ni le titulaire des droits attachés à ces contenus, ni le développeur des produits commercialisés par des tiers. Les obligations relatives au contenu vendu demeurent à la charge du Vendeur concerné.</p>

              <h3>Article 3 — Obligations du Vendeur</h3>
              <p>Le Vendeur demeure responsable :</p>
              <ul>
                <li>de la titularité des droits attachés aux contenus proposés (contenu original ou réalisé avec l'autorisation expresse des ayants droit) ;</li>
                <li>de la conformité juridique des produits et du respect des licences tierces applicables ;</li>
                <li>de l'exactitude des informations fournies (descriptions, images, documentation) ;</li>
                <li>de ne pas publier de contenu contraire aux lois, aux droits des tiers ou aux bonnes mœurs.</li>
              </ul>

              <h3>Article 4 — Commission et paiements</h3>
              <p>La Plateforme prélève une commission de <strong>25%</strong> sur le prix de chaque vente (20% pour les vendeurs partenaires), qui rémunère notamment l'accès à la plateforme, la visibilité, la Validation GSA, la Présentation GSA, la gestion technique et le support de premier niveau. Les paiements sont traités exclusivement via Stripe : le Vendeur doit disposer d'un compte Stripe Connect actif pour recevoir ses fonds. Le montant net, après déduction de la commission, est transféré dans les délais prévus par Stripe (généralement 2 à 7 jours ouvrés). Les frais de traitement Stripe (1,5% + 0,25 € par transaction) restent à la charge de la Plateforme.</p>

              <h3>Article 5 — Propriété intellectuelle et licence de vente</h3>
              <p>Le Vendeur conserve l'intégralité des droits de propriété intellectuelle sur ses créations. Il concède à GSA une licence non exclusive lui permettant de représenter, stocker et distribuer les créations dans le cadre strict de la vente. L'acheteur acquiert une Licence GSA : non exclusive, personnelle, non transférable, sans transfert de propriété et sans droit de redistribution. Sont notamment interdits sauf autorisation : la reproduction, la redistribution, la revente, la mise à disposition publique et l'exploitation commerciale non autorisée des contenus.</p>

              <h3>Article 6 — Hiérarchie contractuelle</h3>
              <p>Les documents contractuels applicables sont : 1. Mentions légales ; 2. Conditions Générales d'Utilisation ; 3. Conditions Générales de Vente ; 4. Licence GSA ; 5. Contrat vendeur (présent contrat) ; 6. Politiques complémentaires. En cas de contradiction, le document spécifique prévaut sur le document général. En cas de manquement grave aux présentes conditions, GSA se réserve le droit de suspendre ou supprimer le compte Vendeur. Le droit applicable est le droit français.</p>
            </div>

            <div v-else class="terms-content">
              <h3>1. Conditions générales de vente (CGV)</h3>
              <p>Les présentes CGV régissent les achats effectués sur la Plateforme GSA Store. Toute commande implique l'acceptation des présentes conditions. Les prix sont affichés en euros, TTC. La Plateforme se réserve le droit de modifier ses prix à tout moment, les produits étant facturés sur la base du tarif en vigueur au moment de la commande.</p>

              <h3>2. Conditions générales d'utilisation (CGU)</h3>
              <p>En utilisant la Plateforme, vous vous engagez à :</p>
              <ul>
                <li>Fournir des informations exactes lors de la création de votre compte ;</li>
                <li>Ne pas porter atteinte aux droits des créateurs (pas de redistribution, copie ou revente des créations téléchargées) ;</li>
                <li>Ne pas publier de contenu illégal, frauduleux ou malveillant ;</li>
                <li>Ne pas contourner les systèmes de paiement ou de protection de la Plateforme.</li>
              </ul>

              <h3>3. Paiement et livraison</h3>
              <p>Les paiements sont sécurisés et traités via Stripe. Après validation du paiement, l'accès au téléchargement de la création est immédiat dans votre espace « Mes téléchargements ». En cas de paiement effectué mais non confirmé, une vérification automatique est effectuée et le produit est débloqué dès confirmation.</p>

              <h3>4. Droit de rétractation et remboursements</h3>
              <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement et téléchargés. Toutefois, en cas de produit non conforme ou non fonctionnel, le remboursement peut être accordé sous 14 jours après étude de la demande. Contactez le support via le vendeur ou la Plateforme.</p>

              <h3>5. Propriété intellectuelle</h3>
              <p>Les créations restent la propriété de leurs auteurs. L'achat confère une licence d'utilisation personnelle, non transférable et non exclusive. Toute redistribution, revente ou copie du contenu téléchargé est interdite.</p>

              <h3>6. Protection des données</h3>
              <p>Vos données personnelles sont traitées conformément au RGPD. Elles sont utilisées pour la gestion de votre compte, des commandes et de la relation client, et ne sont jamais revendues à des tiers.</p>

              <h3>7. Responsabilité et litiges</h3>
              <p>La Plateforme agit comme intermédiaire technique entre vendeurs et acheteurs. En cas de litige, une solution amiable sera recherchée en priorité. Le droit applicable est le droit français.</p>
            </div>
            <p style="margin-top:20px;padding:16px;background:rgba(47,125,246,0.06);border-radius:8px;border:1px solid rgba(47,125,246,0.15);text-align:center;">
              Scrollez jusqu'en bas pour accepter les conditions.
            </p>
          </div>
          <div class="modal-footer">
            <div class="doc-list">
              <span class="doc-list-title">Documents à accepter ({{ termsDocs.length }}) :</span>
              <NuxtLink v-for="d in termsDocs" :key="d.path" :to="d.path" target="_blank" class="doc-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {{ d.label }}
              </NuxtLink>
            </div>
            <label class="terms-check" :class="{ disabled: !termsScrolled }">
              <input type="checkbox" v-model="termsAccepted" :disabled="!termsScrolled" />
              <span>J'ai lu et j'accepte l'ensemble des documents ci-dessus.</span>
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
const { t } = useLang()
const pageRef = ref<HTMLElement | null>(null)
const termsScrollRef = ref<HTMLElement | null>(null)

const accountType = ref('buyer')
const username = ref(''); const email = ref(''); const password = ref('')
const shopName = ref(''); const discord = ref(''); const sellerDescription = ref('')
const discordLinked = ref('')
const error = ref(''); const success = ref(false); const submitting = ref(false)
const showVerify = ref(false)
const registeredEmail = ref('')
const devCode = ref('')
const verifyCode = ref('')
const verifyError = ref('')
const verifying = ref(false)
const pendingSellerAfterVerify = ref(false)
const config = useRuntimeConfig()
const api = config.public.apiOrigin
const showTerms = ref(false)
const termsAccepted = ref(false)

const buyerDocs = [
  { label: 'Mentions légales', path: '/mentions-legales' },
  { label: 'Conditions Générales d\'Utilisation (CGU)', path: '/cgu' },
  { label: 'Politique de confidentialité des données', path: '/confidentialite' },
  { label: 'Politique des cookies', path: '/cookies' },
  { label: 'Politique de rétractation', path: '/retractation' },
  { label: 'Conditions Générales de Vente (CGV)', path: '/cgv' },
]
const sellerExtraDoc = { label: 'Contrat Vendeur', path: '/contrat-vendeur' }
const termsDocs = computed(() => accountType.value === 'seller' ? [...buyerDocs, sellerExtraDoc] : buyerDocs)
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
  if (!termsAccepted.value) {
    showTerms.value = true
    return
  }
  error.value = ''; submitting.value = true
  try {
    const body: any = { displayName: username.value, email: email.value, password: password.value }
    if (accountType.value === 'seller') {
      body.role = 'seller'
      body.shopName = shopName.value
      body.discordTag = discord.value
      body.sellerDescription = sellerDescription.value
    }
    const res = await register(body)
    success.value = true
    pendingSellerAfterVerify.value = !!res?.sellerPending
    if (res?.needsVerification) {
      // Étape de validation email
      showVerify.value = true
      registeredEmail.value = email.value.trim()
      devCode.value = res.devCode || ''
      return
    }
    if (res?.sellerPending) {
      setTimeout(() => navigateTo('/seller/pending'), 1500)
    } else {
      setTimeout(() => navigateTo('/'), 1500)
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || "Erreur"
  } finally { submitting.value = false }
}

async function verifyEmail() {
  if (!verifyCode.value.trim()) { verifyError.value = 'Entrez le code reçu.'; return }
  verifying.value = true
  verifyError.value = ''
  try {
    await $fetch(api + '/api/auth/verify-email', {
      method: 'POST',
      credentials: 'include',
      body: { email: registeredEmail.value, code: verifyCode.value.trim() },
    })
    if (pendingSellerAfterVerify.value) {
      navigateTo('/seller/pending')
    } else {
      navigateTo('/')
    }
  } catch (e: any) {
    verifyError.value = e.data?.message || e.message || 'Code invalide'
  } finally { verifying.value = false }
}

function socialLogin(p: string) { window.location.href = '/auth/' + p + '?return_url=' + encodeURIComponent(window.location.pathname) }
function linkDiscord() {
  window.location.href = '/auth/discord?return_url=' + encodeURIComponent(window.location.origin + '/register')
}

onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)

  // Check URL params for Discord link
  const params = new URLSearchParams(window.location.search)
  const did = params.get('discord_id')
  const duser = params.get('discord_username')
  if (did && duser) {
    discordLinked.value = duser
    discord.value = did
  }
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
.field textarea { padding:11px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-surface);color:var(--text);font-size:.9rem;outline:none;transition:border-color .2s;font-family:inherit;resize:vertical;min-height:80px;width:100%;box-sizing:border-box; }
.field textarea:focus { border-color:var(--primary); }
.seller-fields { display:grid;gap:14px;padding:16px;border-radius:10px;background:rgba(110,231,183,0.03);border:1px solid rgba(110,231,183,0.1); }
.discord-linked { display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:8px;background:rgba(88,101,242,0.08);border:1px solid rgba(88,101,242,0.15); }
.discord-linked span { font-size:.85rem;font-weight:600;color:#5865f2; }
.discord-linked small { font-size:.75rem;color:var(--text-muted);margin-left:auto; }
.btn-discord-link { display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:8px;border:1px solid rgba(88,101,242,0.2);background:rgba(88,101,242,0.04);color:#5865f2;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s;font-family:inherit;width:100%; }
.btn-discord-link:hover { background:rgba(88,101,242,0.1);border-color:rgba(88,101,242,0.3); }
.auth-error { color:var(--red);font-size:.85rem;padding:10px;border-radius:6px;background:rgba(248,113,113,0.1); }
.auth-success { color:var(--green);font-size:.85rem;padding:10px;border-radius:6px;background:rgba(110,231,183,0.1);text-align:center; }
.verify-panel { display:grid; gap:14px; text-align:center; padding:8px 0; }
.verify-icon { width:72px;height:72px;border-radius:50%;background:rgba(47,125,246,0.08);display:grid;place-items:center;margin:0 auto; }
.verify-panel h2 { font-size:1.2rem;font-weight:800;margin:0; }
.verify-sub { color:var(--text-secondary);font-size:.88rem;margin:0;line-height:1.6; }
.verify-devcode { padding:10px;border-radius:8px;background:rgba(245,179,66,0.08);border:1px dashed rgba(245,179,66,0.3);font-size:.8rem;color:var(--text-secondary);display:grid;gap:4px; }
.verify-devcode strong { font-size:1.4rem;letter-spacing:6px;color:#f5b342; }
.verify-input { text-align:center;font-size:1.2rem;letter-spacing:8px; }
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
.doc-list { display:grid; gap:6px; padding:12px 14px; border-radius:10px; background:rgba(47,125,246,0.05); border:1px solid rgba(47,125,246,0.12); width:100%; }
.doc-list-title { font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); }
.doc-link { display:flex; align-items:center; gap:8px; font-size:.8rem; color:var(--text-secondary); text-decoration:none; padding:4px 6px; border-radius:6px; transition:all .15s; }
.doc-link:hover { color:var(--primary); background:rgba(47,125,246,0.08); }
.btn-accept { padding:10px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s; }
.btn-accept:disabled { opacity:.4;cursor:not-allowed; }
.btn-accept:not(:disabled):hover { opacity:.9;transform:translateY(-1px); }
</style>
