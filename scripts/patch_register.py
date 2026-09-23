import io

p = "pages/register.vue"
s = io.open(p, encoding="utf-8", newline="").read()

repl = [
  # Options de compte
  ("<div><strong>Vendeur</strong><span>{{ t('register.seller_sub') }}</span></div>",
   "<div><strong>{{ t('register.seller') }}</strong><span>{{ t('register.seller_sub') }}</span></div>"),
  # Panneau Discord
  ("<h2>Rejoignez le serveur Discord GSA</h2>", "<h2>{{ t('login.join_title') }}</h2>"),
  ("<p>Pour vous inscrire, vous devez être membre du serveur Discord officiel GSA.</p>",
   "<p>{{ t('register.join_desc') }}</p>"),
  ("Vous n'avez pas encore rejoint le serveur Discord. Cliquez sur « Rejoindre le serveur Discord » ci-dessous, acceptez l'invitation, puis revenez ici.",
   "{{ t('login.join_error') }}"),
  ("Rejoindre le serveur Discord\n", "{{ t('login.join_btn') }}\n"),
  (">Je suis membre, m'inscrire</button>", ">{{ t('register.join_retry') }}</button>"),
  # Verification email
  ("<h2>Vérifiez votre email</h2>", "<h2>{{ t('register.verify_title') }}</h2>"),
  ('<p class="verify-sub">Un code de validation a été envoyé à <strong>{{ registeredEmail }}</strong>.</p>',
   '<p class="verify-sub" v-html="t(\'register.verify_sub\').replace(\'{email}\', registeredEmail)"></p>'),
  ("<span>Mode démo (email non configuré) — votre code :</span>", "<span>{{ t('register.devcode') }}</span>"),
  ("<label>Code de validation</label>", "<label>{{ t('register.verify_code') }}</label>"),
  ("{{ verifying ? 'Vérification...' : 'Valider mon email' }}",
   "{{ verifying ? t('register.verifying') : t('register.verify_btn') }}"),
  # Bouton Discord
  ("{{ accountType === 'seller' ? 'S\\'inscrire en tant que vendeur avec Discord' : 'S\\'inscrire avec Discord' }}",
   "{{ accountType === 'seller' ? t('register.with_discord_seller') : t('register.with_discord') }}"),
  ('<p class="discord-note anim-fade">Vous devez être membre du serveur Discord GSA pour accéder à la plateforme.</p>',
   '<p class="discord-note anim-fade">{{ t(\'login.discord_note\') }}</p>'),
  # Modal termes
  ("<h2>{{ accountType === 'seller' ? 'Contrat vendeur' : 'Conditions générales' }}</h2>",
   "<h2>{{ accountType === 'seller' ? t('register.terms_title_seller') : t('register.terms_title') }}</h2>"),
  ("<h3>Préambule</h3>", "<h3>{{ t('register.terms_preamble') }}</h3>"),
  ("<p>GSA est une plateforme numérique spécialisée dans la distribution, la valorisation et la commercialisation de ressources numériques destinées à la création de projets vidéoludiques. GSA exerce une activité hybride comprenant une activité de marketplace mettant en relation vendeurs et acheteurs, une activité de prestation de services liés à la présentation, la sélection et la promotion des contenus, et une activité de création et de fourniture de prestations professionnelles réalisées directement par GSA.</p>",
   "<p>{{ t('register.terms_preamble_p1') }}</p>"),
  ("<p>Le présent contrat régit les relations entre <strong>GSA Store</strong> (ci-après « GSA » ou « la Plateforme ») et tout créateur inscrit en qualité de vendeur (ci-après « le Vendeur »). En créant un compte vendeur, le Vendeur accepte sans réserve l'intégralité des présentes conditions ainsi que les Fondations Juridiques de GSA.</p>",
   '<p v-html="t(\'register.terms_preamble_p2\')"></p>'),
  ("<h3>Article 1 — Définitions</h3>", "<h3>{{ t('register.terms_art1') }}</h3>"),
  ("<p>Les termes utilisés dans le présent contrat s'entendent au sens des Fondations Juridiques de GSA (version 1.0.0) :</p>",
   "<p>{{ t('register.terms_art1_p1') }}</p>"),
  ("<li><strong>Produit numérique</strong> : tout contenu immatériel proposé à la vente (modèles 3D, textures, environnements, maps, effets visuels, interfaces, sons, animations, ressources pour moteurs de jeux…) ;</li>",
   '<li v-html="t(\'register.terms_art1_l1\')"></li>'),
  ("<li><strong>Validation GSA</strong> : processus interne de contrôle humain effectué avant publication — prestation de contrôle qualité, ne constituant ni certification technique absolue, ni garantie contre tout défaut, ni garantie de compatibilité ;</li>",
   '<li v-html="t(\'register.terms_art1_l2\')"></li>'),
  ("<li><strong>Présentation GSA</strong> : miniatures, captures, vidéos, descriptions et textes promotionnels préparés par GSA, protégés au titre du droit d'auteur ;</li>",
   '<li v-html="t(\'register.terms_art1_l3\')"></li>'),
  ("<li><strong>Commission</strong> : rémunération perçue par GSA, définie contractuellement avec chaque Vendeur.</li>",
   '<li v-html="t(\'register.terms_art1_l4\')"></li>'),
  ("<h3>Article 2 — Nature du rôle de GSA</h3>", "<h3>{{ t('register.terms_art2') }}</h3>"),
  ("<p>GSA agit en qualité d'opérateur de plateforme permettant la mise en relation entre vendeurs et acheteurs. Sauf indication contraire, GSA n'est ni l'auteur des contenus proposés par les Vendeurs, ni le titulaire des droits attachés à ces contenus, ni le développeur des produits commercialisés par des tiers. Les obligations relatives au contenu vendu demeurent à la charge du Vendeur concerné.</p>",
   "<p>{{ t('register.terms_art2_p1') }}</p>"),
  ("<h3>Article 3 — Obligations du Vendeur</h3>", "<h3>{{ t('register.terms_art3') }}</h3>"),
  ("<p>Le Vendeur demeure responsable :</p>", "<p>{{ t('register.terms_art3_p1') }}</p>"),
  ("<li>de la titularité des droits attachés aux contenus proposés (contenu original ou réalisé avec l'autorisation expresse des ayants droit) ;</li>",
   "<li>{{ t('register.terms_art3_l1') }}</li>"),
  ("<li>de la conformité juridique des produits et du respect des licences tierces applicables ;</li>",
   "<li>{{ t('register.terms_art3_l2') }}</li>"),
  ("<li>de l'exactitude des informations fournies (descriptions, images, documentation) ;</li>",
   "<li>{{ t('register.terms_art3_l3') }}</li>"),
  ("<li>de ne pas publier de contenu contraire aux lois, aux droits des tiers ou aux bonnes mœurs.</li>",
   "<li>{{ t('register.terms_art3_l4') }}</li>"),
  ("<h3>Article 4 — Commission et paiements</h3>", "<h3>{{ t('register.terms_art4') }}</h3>"),
  ("<p>La Plateforme prélève une commission de <strong>25%</strong> sur le prix de chaque vente (20% pour les vendeurs partenaires), qui rémunère notamment l'accès à la plateforme, la visibilité, la Validation GSA, la Présentation GSA, la gestion technique et le support de premier niveau. Les paiements sont traités exclusivement via Stripe : le Vendeur doit disposer d'un compte Stripe Connect actif pour recevoir ses fonds. Le montant net, après déduction de la commission, est transféré dans les délais prévus par Stripe (généralement 2 à 7 jours ouvrés). Les frais de traitement Stripe (1,5% + 0,25 € par transaction) restent à la charge de la Plateforme.</p>",
   '<p v-html="t(\'register.terms_art4_p1\')"></p>'),
  ("<h3>Article 5 — Propriété intellectuelle et licence de vente</h3>", "<h3>{{ t('register.terms_art5') }}</h3>"),
  ("<p>Le Vendeur conserve l'intégralité des droits de propriété intellectuelle sur ses créations. Il concède à GSA une licence non exclusive lui permettant de représenter, stocker et distribuer les créations dans le cadre strict de la vente. L'acheteur acquiert une Licence GSA : non exclusive, personnelle, non transférable, sans transfert de propriété et sans droit de redistribution. Sont notamment interdits sauf autorisation : la reproduction, la redistribution, la revente, la mise à disposition publique et l'exploitation commerciale non autorisée des contenus.</p>",
   "<p>{{ t('register.terms_art5_p1') }}</p>"),
  ("<h3>Article 6 — Hiérarchie contractuelle</h3>", "<h3>{{ t('register.terms_art6') }}</h3>"),
  ("<p>Les documents contractuels applicables sont : 1. Mentions légales ; 2. Conditions Générales d'Utilisation ; 3. Conditions Générales de Vente ; 4. Licence GSA ; 5. Contrat vendeur (présent contrat) ; 6. Politiques complémentaires. En cas de contradiction, le document spécifique prévaut sur le document général. En cas de manquement grave aux présentes conditions, GSA se réserve le droit de suspendre ou supprimer le compte Vendeur. Le droit applicable est le droit français.</p>",
   "<p>{{ t('register.terms_art6_p1') }}</p>"),
  ("<h3>1. Conditions générales de vente (CGV)</h3>", "<h3>{{ t('register.terms_cgv_title') }}</h3>"),
  ("<p>Les présentes CGV régissent les achats effectués sur la Plateforme GSA Store. Toute commande implique l'acceptation des présentes conditions. Les prix sont affichés en euros, TTC. La Plateforme se réserve le droit de modifier ses prix à tout moment, les produits étant facturés sur la base du tarif en vigueur au moment de la commande.</p>",
   "<p>{{ t('register.terms_cgv_p1') }}</p>"),
  ("<h3>2. Conditions générales d'utilisation (CGU)</h3>", "<h3>{{ t('register.terms_cgu_title') }}</h3>"),
  ("<p>En utilisant la Plateforme, vous vous engagez à :</p>", "<p>{{ t('register.terms_cgu_p1') }}</p>"),
  ("<li>Fournir des informations exactes lors de la création de votre compte ;</li>", "<li>{{ t('register.terms_cgu_l1') }}</li>"),
  ("<li>Ne pas porter atteinte aux droits des créateurs (pas de redistribution, copie ou revente des créations téléchargées) ;</li>", "<li>{{ t('register.terms_cgu_l2') }}</li>"),
  ("<li>Ne pas publier de contenu illégal, frauduleux ou malveillant ;</li>", "<li>{{ t('register.terms_cgu_l3') }}</li>"),
  ("<li>Ne pas contourner les systèmes de paiement ou de protection de la Plateforme.</li>", "<li>{{ t('register.terms_cgu_l4') }}</li>"),
  ("<h3>3. Paiement et livraison</h3>", "<h3>{{ t('register.terms_pay_title') }}</h3>"),
  ("<p>Les paiements sont sécurisés et traités via Stripe. Après validation du paiement, l'accès au téléchargement de la création est immédiat dans votre espace « Mes téléchargements ». En cas de paiement effectué mais non confirmé, une vérification automatique est effectuée et le produit est débloqué dès confirmation.</p>",
   "<p>{{ t('register.terms_pay_p1') }}</p>"),
  ("<h3>4. Droit de rétractation et remboursements</h3>", "<h3>{{ t('register.terms_with_title') }}</h3>"),
  ("<p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement et téléchargés. Toutefois, en cas de produit non conforme ou non fonctionnel, le remboursement peut être accordé sous 14 jours après étude de la demande. Contactez le support via le vendeur ou la Plateforme.</p>",
   "<p>{{ t('register.terms_with_p1') }}</p>"),
  ("<h3>5. Propriété intellectuelle</h3>", "<h3>{{ t('register.terms_ip_title') }}</h3>"),
  ("<p>Les créations restent la propriété de leurs auteurs. L'achat confère une licence d'utilisation personnelle, non transférable et non exclusive. Toute redistribution, revente ou copie du contenu téléchargé est interdite.</p>",
   "<p>{{ t('register.terms_ip_p1') }}</p>"),
  ("<h3>6. Protection des données</h3>", "<h3>{{ t('register.terms_data_title') }}</h3>"),
  ("<p>Vos données personnelles sont traitées conformément au RGPD. Elles sont utilisées pour la gestion de votre compte, des commandes et de la relation client, et ne sont jamais revendues à des tiers.</p>",
   "<p>{{ t('register.terms_data_p1') }}</p>"),
  ("<h3>7. Responsabilité et litiges</h3>", "<h3>{{ t('register.terms_liab_title') }}</h3>"),
  ("<p>La Plateforme agit comme intermédiaire technique entre vendeurs et acheteurs. En cas de litige, une solution amiable sera recherchée en priorité. Le droit applicable est le droit français.</p>",
   "<p>{{ t('register.terms_liab_p1') }}</p>"),
  ("Scrollez jusqu'en bas pour accepter les conditions.", "{{ t('register.terms_scroll') }}"),
  ('<span class="doc-list-title">Documents à accepter ({{ termsDocs.length }}) :</span>',
   '<span class="doc-list-title">{{ t(\'register.terms_docs\').replace(\'{n}\', String(termsDocs.length)) }}</span>'),
  ("<span>J'ai lu et j'accepte l'ensemble des documents ci-dessus.</span>",
   "<span>{{ t('register.terms_accept') }}</span>"),
  (">Confirmer et continuer</button>", ">{{ t('register.terms_confirm') }}</button>"),
]

n = 0
for old, new in repl:
    if old in s:
        s = s.replace(old, new, 1)
        n += 1
    else:
        print("ABSENT:", old[:70])

io.open(p, "w", encoding="utf-8", newline="").write(s)
print("register.vue replacements:", n, "/", len(repl))
