import io

p = "pages/about.vue"
t = io.open(p, encoding="utf-8", newline="").read()

pairs = [
  ("<h1>Pas une boutique. Un standard.</h1>", "<h1>{{ t('about.hero_h1') }}</h1>"),
  ("<p class=\"hero-intro\">GSA accompagne les créateurs, développeurs et équipes de production dans la réalisation de leurs projets gaming.</p>",
   "<p class=\"hero-intro\">{{ t('about.hero_intro1') }}</p>"),
  ("<p class=\"hero-intro\">Nous réunissons ressources numériques, Game Design et création 3D au sein d'une même plateforme, avec une approche simple : proposer des contenus sélectionnés, des services adaptés et un accompagnement humain.</p>",
   "<p class=\"hero-intro\">{{ t('about.hero_intro2') }}</p>"),
  ("<span class=\"block-label\">Notre vision</span>", "<span class=\"block-label\">{{ t('about.label_vision') }}</span>"),
  ("<h2>Créer devrait être plus simple.</h2>", "<h2>{{ t('about.vision_h2') }}</h2>"),
  ("<p>Un projet de jeu ne repose jamais sur une seule compétence.</p>", "<p>{{ t('about.vision_p1') }}</p>"),
  ("<p>Il faut concevoir, expérimenter, produire, trouver les bonnes ressources et parfois s'entourer des bonnes personnes. Pourtant, trouver des assets fiables ou obtenir un accompagnement adapté peut rapidement devenir un obstacle supplémentaire.</p>",
   "<p>{{ t('about.vision_p2') }}</p>"),
  ("<p><strong>GSA est née pour simplifier cette étape.</strong></p>", "<p><strong>{{ t('about.vision_p3') }}</strong></p>"),
  ("<p>Notre objectif est de créer un environnement dans lequel les créateurs peuvent trouver ce dont ils ont besoin pour faire avancer leurs projets, sans avoir à passer leur temps à vérifier, comparer et rechercher des ressources.</p>",
   "<p>{{ t('about.vision_p4') }}</p>"),
  ("<span class=\"block-label\">Une marketplace différente</span>", "<span class=\"block-label\">{{ t('about.label_market') }}</span>"),
  ("<h2>Les contenus ne sont pas simplement mis en ligne.</h2>", "<h2>{{ t('about.market_h2') }}</h2>"),
  ("<p>Sur GSA, un vendeur ne publie pas directement son contenu.</p>", "<p>{{ t('about.market_p1') }}</p>"),
  ("<p>Chaque ressource est d'abord soumise à GSA et <strong>vérifiée manuellement</strong> avant sa publication.</p>",
   "<p>{{ t('about.market_p2') }}</p>"),
  ("<p>Nous examinons le contenu, ses fichiers et les informations nécessaires à sa mise en ligne afin de nous assurer qu'il corresponde aux standards de la plateforme.</p>",
   "<p>{{ t('about.market_p3') }}</p>"),
  ("<p>Une fois validé, GSA prend également en charge sa présentation.</p>", "<p>{{ t('about.market_p4') }}</p>"),
  ("<p>Miniature, captures, vidéo, description et mise en avant : nous préparons le contenu pour qu'il puisse être présenté correctement aux utilisateurs.</p>",
   "<p>{{ t('about.market_p5') }}</p>"),
  ("<strong>Le vendeur crée.</strong>\n            GSA sélectionne, prépare et met en avant.",
   "<strong>{{ t('about.market_quote1') }}</strong>\n            {{ t('about.market_quote2') }}"),
  ("<span class=\"block-label\">Des ressources pour créer</span>", "<span class=\"block-label\">{{ t('about.label_resources') }}</span>"),
  ("<h2>Tout ce qu'il faut pour donner vie à un projet.</h2>", "<h2>{{ t('about.resources_h2') }}</h2>"),
  ("<p>GSA rassemble progressivement des ressources destinées aux créateurs de jeux et de serveurs.</p>", "<p>{{ t('about.resources_p1') }}</p>"),
  ("<p>L'objectif n'est pas de multiplier les contenus pour remplir un catalogue, mais de proposer des ressources réellement pertinentes pour la production : environnements, modèles, props, textures, effets visuels, interfaces, sons et autres éléments permettant de construire une expérience complète.</p>",
   "<p>{{ t('about.resources_p2') }}</p>"),
  ("<p>Chaque contenu est accompagné de conditions d'utilisation clairement définies afin que l'acheteur sache ce qu'il acquiert et dans quelles conditions il peut l'utiliser.</p>",
   "<p>{{ t('about.resources_p3') }}</p>"),
  ("<span class=\"block-label\">Plus que des ressources</span>", "<span class=\"block-label\">{{ t('about.label_more') }}</span>"),
  ("<h2>Concevoir, produire, améliorer.</h2>", "<h2>{{ t('about.more_h2') }}</h2>"),
  ("<p>Un projet ne se résume pas aux assets qui le composent.</p>", "<p>{{ t('about.more_p1') }}</p>"),
  ("<p>GSA propose également des prestations de <strong>Game Design</strong> pour accompagner les créateurs dans la conception et l'amélioration de leurs projets : réflexion autour des mécaniques, systèmes de gameplay, progression, expérience joueur, documentation ou encore audit de gameplay.</p>",
   "<p>{{ t('about.more_p2') }}</p>"),
  ("<p>Pour compléter cette approche, des prestations de <strong>modélisation 3D</strong> sont disponibles, permettant de concevoir des environnements, bâtiments, props et autres éléments directement adaptés aux besoins d'un projet.</p>",
   "<p>{{ t('about.more_p3') }}</p>"),
  ("<p><strong>GSA, un véritable espace de production pour les créateurs.</strong></p>", "<p><strong>{{ t('about.more_p4') }}</strong></p>"),
  ("<NuxtLink to=\"/prestation\" class=\"btn-outline\">Découvrir les prestations</NuxtLink>",
   "<NuxtLink to=\"/prestation\" class=\"btn-outline\">{{ t('about.more_cta') }}</NuxtLink>"),
  ("<span class=\"block-label\">Un accompagnement humain</span>", "<span class=\"block-label\">{{ t('about.label_support') }}</span>"),
  ("<h2>Parce qu'un achat ne devrait pas s'arrêter au téléchargement.</h2>", "<h2>{{ t('about.support_h2') }}</h2>"),
  ("<p>GSA assure un support de premier niveau après chaque achat.</p>", "<p>{{ t('about.support_p1') }}</p>"),
  ("<p>Pendant les sept jours suivant l'achat, notre équipe peut accompagner l'utilisateur lorsqu'il rencontre un problème concernant sa commande ou les fichiers fournis.</p>",
   "<p>{{ t('about.support_p2') }}</p>"),
  ("<p>Lorsqu'un problème concerne directement la conception ou le fonctionnement d'un contenu, GSA peut également intervenir auprès du vendeur afin de faciliter sa résolution.</p>",
   "<p>{{ t('about.support_p3') }}</p>"),
  ("<p>Notre rôle est simple :</p>", "<p>{{ t('about.support_p4') }}</p>"),
  ("<div class=\"block-quote\">Vous permettre de vous concentrer sur votre projet, pas sur les problèmes qui l'entourent.</div>",
   "<div class=\"block-quote\">{{ t('about.support_quote') }}</div>"),
  ("<span class=\"block-label\">Des licences claires</span>", "<span class=\"block-label\">{{ t('about.label_licenses') }}</span>"),
  ("<h2>Vous achetez le droit d'utiliser. Pas la propriété.</h2>", "<h2>{{ t('about.licenses_h2') }}</h2>"),
  ("<p>Chaque contenu est accompagné d'une licence définissant les droits accordés à l'acheteur.</p>", "<p>{{ t('about.licenses_p1') }}</p>"),
  ("<p>Lorsque le contenu le permet, celui-ci peut notamment être utilisé et modifié dans le cadre de son projet, tout en pouvant être transmis aux intervenants techniques nécessaires à sa réalisation.</p>",
   "<p>{{ t('about.licenses_p2') }}</p>"),
  ("<p>En revanche, la revente et la redistribution du contenu en tant que ressource indépendante restent interdites.</p>",
   "<p>{{ t('about.licenses_p3') }}</p>"),
  ("<p>Nous voulons que les règles soient compréhensibles avant même l'achat.</p>", "<p>{{ t('about.licenses_p4') }}</p>"),
  ("<div class=\"block-quote\"><strong>Pas de zone grise.</strong></div>", "<div class=\"block-quote\"><strong>{{ t('about.licenses_quote') }}</strong></div>"),
  ("<span class=\"block-label\">Pour les créateurs</span>", "<span class=\"block-label\">{{ t('about.label_creators') }}</span>"),
  ("<h2>Vous créez. GSA s'occupe du reste.</h2>", "<h2>{{ t('about.creators_h2') }}</h2>"),
  ("<p>Publier une ressource ne devrait pas obliger un créateur à devenir également graphiste, rédacteur, vidéaste et responsable de sa propre mise en avant.</p>",
   "<p>{{ t('about.creators_p1') }}</p>"),
  ("<p>GSA prend en charge la préparation du contenu avant sa publication et assure sa présentation sur la plateforme.</p>",
   "<p>{{ t('about.creators_p2') }}</p>"),
  ("<p>Le vendeur conserve ses droits sur sa création et reste responsable de son contenu, tandis que GSA lui fournit un environnement destiné à faciliter sa mise en relation avec des acheteurs.</p>",
   "<p>{{ t('about.creators_p3') }}</p>"),
  ("<span class=\"block-label\">Notre objectif</span>", "<span class=\"block-label\">{{ t('about.label_objective') }}</span>"),
  ("<h2>Construire un standard pour les ressources gaming.</h2>", "<h2>{{ t('about.objective_h2') }}</h2>"),
  ("<p>GSA commence avec les ressources destinées aux jeux et aux serveurs.</p>", "<p>{{ t('about.objective_p1') }}</p>"),
  ("<p>Mais notre ambition va plus loin.</p>", "<p>{{ t('about.objective_p2') }}</p>"),
  ("<p>Nous voulons construire une plateforme où la qualité des contenus, la clarté des licences et l'accompagnement des utilisateurs deviennent des standards, plutôt que des options.</p>",
   "<p>{{ t('about.objective_p3') }}</p>"),
  ("<p>Un endroit où créateurs, développeurs, artistes et équipes de production peuvent trouver les ressources et les compétences nécessaires pour faire avancer leurs projets.</p>",
   "<p>{{ t('about.objective_p4') }}</p>"),
  ("<p class=\"outro-tagline\">Pas une boutique. Un standard.</p>", "<p class=\"outro-tagline\">{{ t('about.outro_tag') }}</p>"),
  ("<span>Des ressources sélectionnées.</span>", "<span>{{ t('about.outro_1') }}</span>"),
  ("<span>Des services pour créer.</span>", "<span>{{ t('about.outro_2') }}</span>"),
  ("<span>Un accompagnement humain.</span>", "<span>{{ t('about.outro_3') }}</span>"),
]

ok, missing = 0, []
for old, new in pairs:
    if old in t:
        t = t.replace(old, new, 1)
        ok += 1
    else:
        missing.append(old[:60])

io.open(p, "w", encoding="utf-8", newline="").write(t)
print("remplacements:", ok, "/", len(pairs))
if missing:
    print("ABSENTS:")
    for m in missing:
        print("  -", m)
