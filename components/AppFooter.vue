<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo"><img src="/logo.png" alt="GSA" class="logo-img" /></NuxtLink>
          <p>{{ t('footer.tagline') }}</p>
        </div>
        <div class="footer-links"><h4>{{ t('footer.platform') }}</h4><NuxtLink to="/catalogue">{{ t('nav.marketplace') }}</NuxtLink><NuxtLink to="/prestation">{{ t('nav.services') }}</NuxtLink><NuxtLink to="/about">{{ t('nav.about') }}</NuxtLink></div>
        <div class="footer-links"><h4>{{ t('footer.legal') }}</h4><NuxtLink to="/mentions-legales">Mentions légales</NuxtLink><NuxtLink to="/cgu">CGU</NuxtLink><NuxtLink to="/cgv">CGV</NuxtLink><NuxtLink to="/confidentialite">Confidentialité</NuxtLink><NuxtLink to="/cookies">Politique des cookies</NuxtLink><NuxtLink to="/retractation">Politique de rétractation</NuxtLink><NuxtLink to="/contrat-vendeur">Contrat vendeur</NuxtLink></div>
        <div class="footer-links"><h4>{{ t('footer.support') }}</h4><a href="https://discord.gg/KDsEzGRnKs" target="_blank" rel="noopener">{{ t('footer.discord') }}</a><a href="#">{{ t('footer.contact') }}</a></div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} GSA. {{ t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useLang()
</script>

<style scoped>
.site-footer { border-top: 1px solid var(--border); padding: 48px 0 24px; margin-top: auto; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; }
.footer-brand .logo-icon { width: 40px; height: 40px; display: grid; place-items: center; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 12px; color: #fff; font-weight: 900; font-size: 1.2rem; margin-bottom: 12px; }
.footer-logo { display:inline-block; }
.footer-logo .logo-img { height:40px;margin-bottom:12px; }
.footer-brand p { color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6; max-width: 280px; }
.footer-links { display: grid; gap: 8px; align-content: start; }
.footer-links h4 { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text); margin: 0 0 4px; }
.footer-links a, .footer-links .nuxt-link { font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; transition: color .2s; }
.footer-links a:hover, .footer-links .nuxt-link:hover { color: var(--text); }
.footer-bottom { margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border); text-align: center; }
.footer-bottom p { color: var(--text-muted); font-size: 0.82rem; }
@media (max-width: 640px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
</style>
