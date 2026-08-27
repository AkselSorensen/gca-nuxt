<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <!-- Hero -->
      <div class="about-hero anim-up">
        <h1>Pas une boutique. Un standard.</h1>
        <p class="hero-intro">GSA accompagne les créateurs, développeurs et équipes de production dans la réalisation de leurs projets gaming.</p>
        <p class="hero-intro">Nous réunissons ressources numériques, Game Design et création 3D au sein d'une même plateforme, avec une approche simple : proposer des contenus sélectionnés, des services adaptés et un accompagnement humain.</p>
      </div>

      <div class="about-content anim-card">
        <!-- Notre vision -->
        <section class="about-block">
          <span class="block-label">Notre vision</span>
          <h2>Créer devrait être plus simple.</h2>
          <p>Un projet de jeu ne repose jamais sur une seule compétence.</p>
          <p>Il faut concevoir, expérimenter, produire, trouver les bonnes ressources et parfois s'entourer des bonnes personnes. Pourtant, trouver des assets fiables ou obtenir un accompagnement adapté peut rapidement devenir un obstacle supplémentaire.</p>
          <p><strong>GSA est née pour simplifier cette étape.</strong></p>
          <p>Notre objectif est de créer un environnement dans lequel les créateurs peuvent trouver ce dont ils ont besoin pour faire avancer leurs projets, sans avoir à passer leur temps à vérifier, comparer et rechercher des ressources.</p>
        </section>

        <!-- Une marketplace différente -->
        <section class="about-block accent-block">
          <span class="block-label">Une marketplace différente</span>
          <h2>Les contenus ne sont pas simplement mis en ligne.</h2>
          <p>Sur GSA, un vendeur ne publie pas directement son contenu.</p>
          <p>Chaque ressource est d'abord soumise à GSA et <strong>vérifiée manuellement</strong> avant sa publication.</p>
          <p>Nous examinons le contenu, ses fichiers et les informations nécessaires à sa mise en ligne afin de nous assurer qu'il corresponde aux standards de la plateforme.</p>
          <p>Une fois validé, GSA prend également en charge sa présentation.</p>
          <p>Miniature, captures, vidéo, description et mise en avant : nous préparons le contenu pour qu'il puisse être présenté correctement aux utilisateurs.</p>
          <div class="block-quote">
            <strong>Le vendeur crée.</strong>
            GSA sélectionne, prépare et met en avant.
          </div>
        </section>

        <!-- Des ressources pour créer -->
        <section class="about-block">
          <span class="block-label">Des ressources pour créer</span>
          <h2>Tout ce qu'il faut pour donner vie à un projet.</h2>
          <p>GSA rassemble progressivement des ressources destinées aux créateurs de jeux et de serveurs.</p>
          <p>L'objectif n'est pas de multiplier les contenus pour remplir un catalogue, mais de proposer des ressources réellement pertinentes pour la production : environnements, modèles, props, textures, effets visuels, interfaces, sons et autres éléments permettant de construire une expérience complète.</p>
          <p>Chaque contenu est accompagné de conditions d'utilisation clairement définies afin que l'acheteur sache ce qu'il acquiert et dans quelles conditions il peut l'utiliser.</p>
        </section>

        <!-- Plus que des ressources -->
        <section class="about-block accent-block">
          <span class="block-label">Plus que des ressources</span>
          <h2>Concevoir, produire, améliorer.</h2>
          <p>Un projet ne se résume pas aux assets qui le composent.</p>
          <p>GSA propose également des prestations de <strong>Game Design</strong> pour accompagner les créateurs dans la conception et l'amélioration de leurs projets : réflexion autour des mécaniques, systèmes de gameplay, progression, expérience joueur, documentation ou encore audit de gameplay.</p>
          <p>Pour compléter cette approche, des prestations de <strong>modélisation 3D</strong> sont disponibles, permettant de concevoir des environnements, bâtiments, props et autres éléments directement adaptés aux besoins d'un projet.</p>
          <p><strong>GSA, un véritable espace de production pour les créateurs.</strong></p>
          <div class="block-cta">
            <NuxtLink to="/prestation" class="btn-outline">Découvrir les prestations</NuxtLink>
          </div>
        </section>

        <!-- Un accompagnement humain -->
        <section class="about-block">
          <span class="block-label">Un accompagnement humain</span>
          <h2>Parce qu'un achat ne devrait pas s'arrêter au téléchargement.</h2>
          <p>GSA assure un support de premier niveau après chaque achat.</p>
          <p>Pendant les sept jours suivant l'achat, notre équipe peut accompagner l'utilisateur lorsqu'il rencontre un problème concernant sa commande ou les fichiers fournis.</p>
          <p>Lorsqu'un problème concerne directement la conception ou le fonctionnement d'un contenu, GSA peut également intervenir auprès du vendeur afin de faciliter sa résolution.</p>
          <p>Notre rôle est simple :</p>
          <div class="block-quote">Vous permettre de vous concentrer sur votre projet, pas sur les problèmes qui l'entourent.</div>
        </section>

        <!-- Des licences claires -->
        <section class="about-block accent-block">
          <span class="block-label">Des licences claires</span>
          <h2>Vous achetez le droit d'utiliser. Pas la propriété.</h2>
          <p>Chaque contenu est accompagné d'une licence définissant les droits accordés à l'acheteur.</p>
          <p>Lorsque le contenu le permet, celui-ci peut notamment être utilisé et modifié dans le cadre de son projet, tout en pouvant être transmis aux intervenants techniques nécessaires à sa réalisation.</p>
          <p>En revanche, la revente et la redistribution du contenu en tant que ressource indépendante restent interdites.</p>
          <p>Nous voulons que les règles soient compréhensibles avant même l'achat.</p>
          <div class="block-quote"><strong>Pas de zone grise.</strong></div>
        </section>

        <!-- Pour les créateurs -->
        <section class="about-block">
          <span class="block-label">Pour les créateurs</span>
          <h2>Vous créez. GSA s'occupe du reste.</h2>
          <p>Publier une ressource ne devrait pas obliger un créateur à devenir également graphiste, rédacteur, vidéaste et responsable de sa propre mise en avant.</p>
          <p>GSA prend en charge la préparation du contenu avant sa publication et assure sa présentation sur la plateforme.</p>
          <p>Le vendeur conserve ses droits sur sa création et reste responsable de son contenu, tandis que GSA lui fournit un environnement destiné à faciliter sa mise en relation avec des acheteurs.</p>
        </section>

        <!-- Notre objectif -->
        <section class="about-block accent-block">
          <span class="block-label">Notre objectif</span>
          <h2>Construire un standard pour les ressources gaming.</h2>
          <p>GSA commence avec les ressources destinées aux jeux et aux serveurs.</p>
          <p>Mais notre ambition va plus loin.</p>
          <p>Nous voulons construire une plateforme où la qualité des contenus, la clarté des licences et l'accompagnement des utilisateurs deviennent des standards, plutôt que des options.</p>
          <p>Un endroit où créateurs, développeurs, artistes et équipes de production peuvent trouver les ressources et les compétences nécessaires pour faire avancer leurs projets.</p>
        </section>
      </div>

      <!-- Bannière finale -->
      <div class="about-outro anim-card">
        <h2>GSA</h2>
        <p class="outro-tagline">Pas une boutique. Un standard.</p>
        <div class="outro-list">
          <span>Des ressources sélectionnées.</span>
          <span>Des services pour créer.</span>
          <span>Un accompagnement humain.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ link: [{ rel: 'canonical', href: 'https://gsa-store.fr/about' }] })
useSeoMeta({
  title: 'À propos — GSA Store',
  description: 'GSA, pas une boutique. Un standard. Découvrez notre vision de la marketplace.',
  ogType: 'website',
  
})

const pageRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
</script>

<style scoped>
.page-static { padding:40px 0 64px; }
.about-hero { text-align:center; max-width:780px; margin:0 auto 48px; display:grid; gap:14px; }
.about-hero h1 { font-size:clamp(2rem,5vw,3rem); font-weight:900; letter-spacing:-.03em; background:linear-gradient(135deg,var(--primary) 0%,var(--accent) 60%,#a78bfa 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.hero-intro { color:var(--text-secondary); font-size:1.02rem; line-height:1.7; margin:0; }
.about-content { display:grid; gap:20px; max-width:800px; margin:0 auto; }
.about-block { padding:30px 32px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-lg); display:grid; gap:12px; }
.accent-block { border-left:3px solid var(--primary); }
.block-label { font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.14em; color:var(--primary); }
.about-block h2 { margin:0; font-size:1.35rem; font-weight:800; letter-spacing:-.02em; }
.about-block p { margin:0; color:var(--text-secondary); font-size:.93rem; line-height:1.75; }
.about-block strong { color:var(--text); }
.block-quote { padding:14px 18px; border-radius:10px; background:var(--bg-surface); border:1px solid var(--border); font-size:.92rem; line-height:1.7; color:var(--text-secondary); display:grid; gap:2px; }
.block-quote strong { color:var(--text); }
.block-cta { margin-top:6px; }
.btn-outline { display:inline-flex; padding:12px 26px; border-radius:10px; border:1px solid var(--primary); color:var(--primary); font-weight:700; font-size:.9rem; text-decoration:none; transition:all .2s; }
.btn-outline:hover { background:rgba(47,125,246,0.1); transform:translateY(-1px); }
.about-outro { margin:40px auto 0; max-width:800px; text-align:center; padding:44px 32px; border-radius:var(--radius-lg); background:linear-gradient(160deg,rgba(47,125,246,0.08),rgba(124,58,237,0.08)); border:1px solid var(--border); display:grid; gap:10px; }
.about-outro h2 { margin:0; font-size:2.4rem; font-weight:900; letter-spacing:-.03em; }
.outro-tagline { margin:0; font-size:1.05rem; color:var(--text-secondary); }
.outro-list { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:10px; }
.outro-list span { padding:8px 16px; border-radius:999px; background:var(--bg-surface); border:1px solid var(--border); font-size:.82rem; color:var(--text-secondary); }
</style>
