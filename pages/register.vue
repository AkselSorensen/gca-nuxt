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
          <div><strong>{{ tr(`Vendeur`, `Seller`) }}</strong><span>{{ t('register.seller_sub') }}</span></div>
        </div>
      </div>

      <!-- Inscription obligatoire via Discord -->
      <div v-if="discordRequired" class="join-panel anim-scale">
        <div class="join-icon">
          <IconDiscord :size="30" />
        </div>
        <h2>{{ tr(`Rejoignez le serveur Discord GSA`, `Join the GSA Discord server`) }}</h2>
        <p>{{ tr(`Pour vous inscrire, vous devez être membre du serveur Discord officiel GSA.`, `To sign up, you must be a member of the official GSA Discord server.`) }}</p>
        <div v-if="discordAttempted" class="join-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ tr(`Vous n'avez pas encore rejoint le serveur Discord. Cliquez sur « Rejoindre le serveur Discord » ci-dessous, acceptez l'invitation, puis revenez ici.`, `You have not joined the Discord server yet. Click "Join the Discord server" below, accept the invitation, then come back here.`) }}
        </div>
        <a href="https://discord.gg/KDsEzGRnKs" target="_blank" rel="noopener" class="btn-join" @click="joinDiscord">
          <IconDiscord :size="18" />
          {{ tr(`Rejoindre le serveur Discord`, `Join the Discord server`) }}
        </a>
        <button class="btn-retry" @click="registerDiscord">{{ tr(`Je suis membre, m'inscrire`, `I am a member, sign me up`) }}</button>
      </div>

      <!-- Bouton Discord principal -->
      <div v-if="showVerify && !discordRequired" class="verify-panel anim-scale">
        <div class="verify-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </div>
        <h2>{{ tr(`Vérifiez votre email`, `Check your email`) }}</h2>
        <p class="verify-sub">{{ tr(`Un code de validation a été envoyé à`, `A verification code has been sent to`) }} <strong>{{ registeredEmail }}</strong>.</p>
        <div v-if="devCode" class="verify-devcode">
          <span>{{ tr(`Mode démo (email non configuré) - votre code :`, `Demo mode (email not configured) - your code:`) }}</span>
          <strong>{{ devCode }}</strong>
        </div>
        <div class="field anim-up">
          <label>{{ tr(`Code de validation`, `Verification code`) }}</label>
          <input v-model="verifyCode" type="text" inputmode="numeric" placeholder="000000" maxlength="6" class="verify-input" @keyup.enter="verifyEmail" />
        </div>
        <p v-if="verifyError" class="auth-error anim-fade">{{ verifyError }}</p>
        <button class="btn-submit" :disabled="verifying" @click="verifyEmail">
          {{ verifying ? tr('Vérification...', 'Verifying...') : tr('Valider mon email', 'Confirm my email') }}
        </button>
      </div>

      <div class="auth-form discord-register">
        <button class="btn-discord-main anim-up" @click="onDiscordRegister">
          <IconDiscord :size="20" />
          {{ accountType === 'seller' ? tr('S\'inscrire en tant que vendeur avec Discord', 'Sign up as a seller with Discord') : tr('S\'inscrire avec Discord', 'Sign up with Discord') }}
        </button>
        <p class="discord-note anim-fade">{{ tr(`Vous devez être membre du serveur Discord GSA pour accéder à la plateforme.`, `You must be a member of the GSA Discord server to access the platform.`) }}</p>
        <p class="auth-footer anim-fade">{{ t('register.has_account') }} <NuxtLink :to="route.query.redirect ? '/login?redirect=' + encodeURIComponent(String(route.query.redirect)) : '/login'">{{ t('register.login_link') }}</NuxtLink></p>
      </div>
    </div>

    <!-- Terms Modal -->
    <Teleport to="body">
      <div v-if="showTerms" class="modal-overlay" @click.self="showTerms = false">
        <div class="modal-card anim-scale" @click.stop>
          <div class="modal-header">
            <h2>{{ accountType === 'seller' ? tr('Contrat vendeur', 'Seller contract') : tr('Conditions générales', 'General terms') }}</h2>
            <button class="modal-close" @click="showTerms = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div ref="termsScrollRef" class="terms-scroll" @scroll="onTermsScroll">
            <div v-if="accountType === 'seller' && locale !== 'en'" class="terms-content">
              <h3>Préambule</h3>
              <p>GSA est une plateforme numérique spécialisée dans la distribution, la valorisation et la commercialisation de ressources numériques destinées à la création de projets vidéoludiques. GSA exerce une activité hybride comprenant une activité de marketplace mettant en relation vendeurs et acheteurs, une activité de prestation de services liés à la présentation, la sélection et la promotion des contenus, et une activité de création et de fourniture de prestations professionnelles réalisées directement par GSA.</p>
              <p>Le présent contrat régit les relations entre <strong>GSA Store</strong> (ci-après « GSA » ou « la Plateforme ») et tout créateur inscrit en qualité de vendeur (ci-après « le Vendeur »). En créant un compte vendeur, le Vendeur accepte sans réserve l'intégralité des présentes conditions ainsi que les Fondations Juridiques de GSA.</p>

              <h3>Article 1 - Définitions</h3>
              <p>Les termes utilisés dans le présent contrat s'entendent au sens des Fondations Juridiques de GSA (version 1.0.0) :</p>
              <ul>
                <li><strong>Produit numérique</strong> : tout contenu immatériel proposé à la vente (modèles 3D, textures, environnements, maps, effets visuels, interfaces, sons, animations, ressources pour moteurs de jeux…) ;</li>
                <li><strong>Validation GSA</strong> : processus interne de contrôle humain effectué avant publication - prestation de contrôle qualité, ne constituant ni certification technique absolue, ni garantie contre tout défaut, ni garantie de compatibilité ;</li>
                <li><strong>Présentation GSA</strong> : miniatures, captures, vidéos, descriptions et textes promotionnels préparés par GSA, protégés au titre du droit d'auteur ;</li>
                <li><strong>Commission</strong> : rémunération perçue par GSA, définie contractuellement avec chaque Vendeur.</li>
              </ul>

              <h3>Article 2 - Nature du rôle de GSA</h3>
              <p>GSA agit en qualité d'opérateur de plateforme permettant la mise en relation entre vendeurs et acheteurs. Sauf indication contraire, GSA n'est ni l'auteur des contenus proposés par les Vendeurs, ni le titulaire des droits attachés à ces contenus, ni le développeur des produits commercialisés par des tiers. Les obligations relatives au contenu vendu demeurent à la charge du Vendeur concerné.</p>

              <h3>Article 3 - Obligations du Vendeur</h3>
              <p>Le Vendeur demeure responsable :</p>
              <ul>
                <li>de la titularité des droits attachés aux contenus proposés (contenu original ou réalisé avec l'autorisation expresse des ayants droit) ;</li>
                <li>de la conformité juridique des produits et du respect des licences tierces applicables ;</li>
                <li>de l'exactitude des informations fournies (descriptions, images, documentation) ;</li>
                <li>de ne pas publier de contenu contraire aux lois, aux droits des tiers ou aux bonnes mœurs.</li>
              </ul>

              <h3>Article 4 - Commission et paiements</h3>
              <p>La Plateforme prélève une commission de <strong>25%</strong> sur le prix de chaque vente (20% pour les vendeurs partenaires), qui rémunère notamment l'accès à la plateforme, la visibilité, la Validation GSA, la Présentation GSA, la gestion technique et le support de premier niveau. Les paiements sont traités exclusivement via Stripe : le Vendeur doit disposer d'un compte Stripe Connect actif pour recevoir ses fonds. Le montant net, après déduction de la commission, est transféré dans les délais prévus par Stripe (généralement 2 à 7 jours ouvrés). Les frais de traitement Stripe (1,5% + 0,25 € par transaction) restent à la charge de la Plateforme.</p>

              <h3>Article 5 - Propriété intellectuelle et licence de vente</h3>
              <p>Le Vendeur conserve l'intégralité des droits de propriété intellectuelle sur ses créations. Il concède à GSA une licence non exclusive lui permettant de représenter, stocker et distribuer les créations dans le cadre strict de la vente. L'acheteur acquiert une Licence GSA : non exclusive, personnelle, non transférable, sans transfert de propriété et sans droit de redistribution. Sont notamment interdits sauf autorisation : la reproduction, la redistribution, la revente, la mise à disposition publique et l'exploitation commerciale non autorisée des contenus.</p>

              <h3>Article 6 - Hiérarchie contractuelle</h3>
              <p>Les documents contractuels applicables sont : 1. Mentions légales ; 2. Conditions Générales d'Utilisation ; 3. Conditions Générales de Vente ; 4. Licence GSA ; 5. Contrat vendeur (présent contrat) ; 6. Politiques complémentaires. En cas de contradiction, le document spécifique prévaut sur le document général. En cas de manquement grave aux présentes conditions, GSA se réserve le droit de suspendre ou supprimer le compte Vendeur. Le droit applicable est le droit français.</p>
            </div>

            <div v-else-if="locale !== 'en'" class="terms-content">
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
            <div v-else-if="accountType === 'seller'" class="terms-content">
              <h3>Preamble</h3>
              <p>GSA is a digital platform specialised in the distribution, promotion and sale of digital resources intended for the creation of video game projects. GSA carries out a hybrid activity comprising a marketplace connecting sellers and buyers, a service activity related to the presentation, selection and promotion of content, and an activity of creating and providing professional services carried out directly by GSA.</p>
              <p>This contract governs the relationship between <strong>GSA Store</strong> (hereinafter "GSA" or "the Platform") and any creator registered as a seller (hereinafter "the Seller"). By creating a seller account, the Seller fully accepts these terms as well as GSA's Legal Foundations.</p>

              <h3>Article 1 - Definitions</h3>
              <p>The terms used in this contract have the meaning given in GSA's Legal Foundations (version 1.0.0):</p>
              <ul>
                <li><strong>Digital product</strong>: any intangible content offered for sale (3D models, textures, environments, maps, visual effects, interfaces, sounds, animations, game engine resources...);</li>
                <li><strong>GSA Validation</strong>: an internal human review carried out before publication - a quality control service that is neither an absolute technical certification, nor a guarantee against any defect, nor a guarantee of compatibility;</li>
                <li><strong>GSA Presentation</strong>: thumbnails, screenshots, videos, descriptions and promotional texts prepared by GSA, protected by copyright;</li>
                <li><strong>Commission</strong>: remuneration received by GSA, contractually defined with each Seller.</li>
              </ul>

              <h3>Article 2 - Nature of GSA's role</h3>
              <p>GSA acts as a platform operator connecting sellers and buyers. Unless stated otherwise, GSA is neither the author of the content offered by Sellers, nor the holder of the rights attached to that content, nor the developer of products sold by third parties. Obligations relating to the content sold remain the responsibility of the Seller concerned.</p>

              <h3>Article 3 - Seller obligations</h3>
              <p>The Seller remains responsible for:</p>
              <ul>
                <li>holding the rights attached to the content offered (original content or content made with the express permission of the rights holders);</li>
                <li>the legal compliance of the products and compliance with applicable third-party licences;</li>
                <li>the accuracy of the information provided (descriptions, images, documentation);</li>
                <li>not publishing content that is contrary to the law, to the rights of third parties or to public decency.</li>
              </ul>

              <h3>Article 4 - Commission and payments</h3>
              <p>The Platform takes a commission of <strong>25%</strong> on the price of each sale (20% for partner sellers), which pays in particular for access to the platform, visibility, GSA Validation, GSA Presentation, technical management and first-level support. Payments are processed exclusively through Stripe: the Seller must have an active Stripe Connect account to receive funds. The net amount, after deduction of the commission, is transferred within the timeframe set by Stripe (generally 2 to 7 business days). Stripe processing fees (1.5% + €0.25 per transaction) remain at the Platform's expense.</p>

              <h3>Article 5 - Intellectual property and sales licence</h3>
              <p>The Seller keeps all intellectual property rights over their creations. They grant GSA a non-exclusive licence allowing it to display, store and distribute the creations strictly for the purpose of the sale. The buyer acquires a GSA Licence: non-exclusive, personal, non-transferable, without transfer of ownership and without any right of redistribution. In particular, the following are prohibited unless authorised: reproduction, redistribution, resale, public availability and unauthorised commercial use of the content.</p>

              <h3>Article 6 - Contractual hierarchy</h3>
              <p>The applicable contractual documents are: 1. Legal notice; 2. Terms of Use; 3. Terms of Sale; 4. GSA Licence; 5. Seller contract (this contract); 6. Additional policies. In case of contradiction, the specific document prevails over the general one. In case of serious breach of these terms, GSA reserves the right to suspend or delete the Seller account. French law applies.</p>
            </div>

            <div v-else class="terms-content">
              <h3>1. Terms of Sale</h3>
              <p>These Terms of Sale govern purchases made on the GSA Store Platform. Every order implies acceptance of these terms. Prices are displayed in euros, including tax. The Platform reserves the right to change its prices at any time; products are invoiced at the price in force when the order is placed.</p>

              <h3>2. Terms of Use</h3>
              <p>By using the Platform, you agree to:</p>
              <ul>
                <li>Provide accurate information when creating your account;</li>
                <li>Not infringe creators' rights (no redistribution, copying or resale of downloaded creations);</li>
                <li>Not publish illegal, fraudulent or malicious content;</li>
                <li>Not circumvent the Platform's payment or protection systems.</li>
              </ul>

              <h3>3. Payment and delivery</h3>
              <p>Payments are secured and processed through Stripe. Once the payment is validated, access to the download of the creation is immediate in your "My downloads" area. If a payment has been made but not confirmed, an automatic check is carried out and the product is unlocked as soon as it is confirmed.</p>

              <h3>4. Right of withdrawal and refunds</h3>
              <p>In accordance with article L221-28 of the French Consumer Code, the right of withdrawal does not apply to digital content supplied immediately and downloaded. However, if a product is non-compliant or does not work, a refund may be granted within 14 days after review of the request. Contact support through the seller or the Platform.</p>

              <h3>5. Intellectual property</h3>
              <p>Creations remain the property of their authors. The purchase grants a personal, non-transferable and non-exclusive licence of use. Any redistribution, resale or copying of the downloaded content is prohibited.</p>

              <h3>6. Data protection</h3>
              <p>Your personal data is processed in accordance with the GDPR. It is used to manage your account, your orders and the customer relationship, and is never sold to third parties.</p>

              <h3>7. Liability and disputes</h3>
              <p>The Platform acts as a technical intermediary between sellers and buyers. In case of dispute, an amicable solution will be sought first. French law applies.</p>
            </div>
            <p style="margin-top:20px;padding:16px;background:rgba(47,125,246,0.06);border-radius:8px;border:1px solid rgba(47,125,246,0.15);text-align:center;">
              {{ tr(`Scrollez jusqu'en bas pour accepter les conditions.`, `Scroll to the bottom to accept the terms.`) }}
            </p>
          </div>
          <div class="modal-footer">
            <div class="doc-list">
              <span class="doc-list-title">{{ tr(`Documents à accepter`, `Documents to accept`) }} ({{ termsDocs.length }}):</span>
              <NuxtLink v-for="d in termsDocs" :key="d.path" :to="d.path" target="_blank" class="doc-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {{ d.label }}
              </NuxtLink>
            </div>
            <label class="terms-check" :class="{ disabled: !termsScrolled }">
              <input type="checkbox" v-model="termsAccepted" :disabled="!termsScrolled" />
              <span>{{ tr(`J'ai lu et j'accepte l'ensemble des documents ci-dessus.`, `I have read and accept all of the documents above.`) }}</span>
            </label>
            <button class="btn-accept" :disabled="!termsAccepted" @click="confirmTerms">{{ tr(`Confirmer et continuer`, `Confirm and continue`) }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const { tr: trSeo } = useLang()
useSeoMeta({
  title: () => trSeo('Inscription - GSA Store', 'Sign up - GSA Store'),
  description: () => trSeo('Créez votre compte GSA Store : acheteurs et vendeurs d\'assets premium.', 'Create your GSA Store account: buyers and sellers of premium assets.'),
  ogType: 'website',
  robots: 'noindex, nofollow',
})
const { register } = useAuth()
const { t, tr, locale } = useLang()
const pageRef = ref<HTMLElement | null>(null)

// Déjà connecté → pas de page d'inscription
if (process.client) {
  onMounted(async () => {
    const { checkAuth, user } = useAuth()
    await checkAuth()
    if (user.value?.id) navigateTo('/')
  })
}
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

const buyerDocs = computed(() => [
  { label: tr('Mentions légales', 'Legal notice'), path: '/mentions-legales' },
  { label: tr('Conditions Générales d\'Utilisation (CGU)', 'Terms of Use'), path: '/cgu' },
  { label: tr('Politique de confidentialité des données', 'Privacy policy'), path: '/confidentialite' },
  { label: tr('Politique des cookies', 'Cookie policy'), path: '/cookies' },
  { label: tr('Politique de rétractation', 'Withdrawal policy'), path: '/retractation' },
  { label: tr('Conditions Générales de Vente (CGV)', 'Terms of Sale'), path: '/cgv' },
])
const sellerExtraDoc = computed(() => ({ label: tr('Contrat Vendeur', 'Seller Contract'), path: '/contrat-vendeur' }))
const termsDocs = computed(() => accountType.value === 'seller' ? [...buyerDocs.value, sellerExtraDoc.value] : buyerDocs.value)
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
  if (pendingDiscordRedirect.value) {
    pendingDiscordRedirect.value = false
    registerDiscord()
  } else {
    handleRegister()
  }
}

// Inscription Discord : les vendeurs doivent d'abord accepter le contrat
const pendingDiscordRedirect = ref(false)
function onDiscordRegister() {
  if (accountType.value === 'seller' && !termsAccepted.value) {
    pendingDiscordRedirect.value = true
    showTerms.value = true
    return
  }
  registerDiscord()
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
    error.value = e.data?.message || e.message || tr('Erreur', 'Error')
  } finally { submitting.value = false }
}

async function verifyEmail() {
  if (!verifyCode.value.trim()) { verifyError.value = tr('Entrez le code reçu.', 'Enter the code you received.'); return }
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
    verifyError.value = e.data?.message || e.message || tr('Code invalide', 'Invalid code')
  } finally { verifying.value = false }
}

const route = useRoute()
const discordRequired = computed(() => route.query.discord === 'required')
const discordAttempted = computed(() => route.query.attempted === '1')

function registerDiscord() {
  // Honore ?redirect= (ex. guest qui voulait acheter → retour sur la page produit)
  const redirect = route.query.redirect ? String(route.query.redirect) : ''
  const params = new URLSearchParams({
    return_url: redirect || route.path,
    account_type: accountType.value === 'seller' ? 'seller' : 'buyer',
  })
  if (accountType.value === 'seller') {
    if (shopName.value) params.set('shop_name', shopName.value)
    if (sellerDescription.value) params.set('bio', sellerDescription.value)
    if (discordLinked.value) params.set('discord_tag', discordLinked.value)
  }
  window.location.href = '/auth/discord?' + params.toString()
}

// "Rejoindre le serveur" : ouvre l'invite Discord, puis relance automatiquement
// l'OAuth au retour sur l'onglet (si l'utilisateur a rejoint → inscription directe)
function joinDiscord() {
  window.open('https://discord.gg/KDsEzGRnKs', '_blank')
  let rechecked = false
  const onFocus = () => {
    if (rechecked) return
    rechecked = true
    window.removeEventListener('focus', onFocus)
    registerDiscord()
  }
  window.addEventListener('focus', onFocus)
}
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
.auth-form { display:grid;gap:16px; }
.discord-register { margin-top:20px; }
.discord-note { margin:0; text-align:center; color:var(--text-muted); font-size:.78rem; }
.btn-discord-main { display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#5865f2,#4752c4);color:#fff;font-size:.95rem;font-weight:700;cursor:pointer;transition:filter .2s,transform .2s;font-family:inherit;box-shadow:0 8px 24px rgba(88,101,242,0.25); }
.btn-discord-main:hover { filter:brightness(1.1); transform:translateY(-1px); }
.join-panel { display:grid; gap:14px; text-align:center; padding:10px 0; }
.join-icon { width:64px; height:64px; margin:0 auto; border-radius:50%; background:rgba(88,101,242,0.1); border:1px solid rgba(88,101,242,0.2); display:grid; place-items:center; color:#5865f2; }
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
.btn-discord svg { color:#5865f2; }
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
