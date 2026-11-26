<template>
  <div v-if="((maintenance.enabled && !isAdminSession) || route.query.maintenancePreview === '1') && route.path !== '/admin' && !(route.path === '/login' && route.query.admin === '1')" class="maintenance-screen">
    <div class="maintenance-noise"></div>
    <header class="maintenance-topbar">
      <NuxtLink to="/" class="maintenance-brand" :aria-label="tr(`GSA, accueil`, `GSA, home`)"><img src="/logo.png" alt="GSA" class="maintenance-logo" /><small>MARKETPLACE</small></NuxtLink>
      <div class="maintenance-actions">
        <div class="maintenance-live"><span></span> {{ tr(`Intervention en cours`, `Work in progress`) }}</div>
        <a href="/login?admin=1" class="maintenance-admin-btn">{{ tr(`Connexion admin`, `Admin login`) }}</a>
      </div>
    </header>
    <main class="maintenance-main">
      <section class="maintenance-copy">
        <div class="maintenance-eyebrow"><span class="eyebrow-line"></span> {{ tr(`UNE PETITE PAUSE POUR MIEUX REVENIR`, `A SHORT BREAK TO COME BACK STRONGER`) }}</div>
        <h1>{{ tr(`On améliore`, `We are upgrading`) }}<br />{{ tr(`votre`, `your`) }} <span>{{ tr(`terrain de jeu.`, `playground.`) }}</span></h1>
        <p class="maintenance-description">{{ maintenanceText }}</p>
        <div class="maintenance-status">
          <div class="status-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z"/><path d="m15.5 5.5 3 3"/></svg></div>
          <div><strong>{{ tr(`Nous sommes sur le coup`, `We are on it`) }}</strong><span>{{ tr(`Le site sera de retour dès que possible.`, `The site will be back as soon as possible.`) }}</span></div>
          <div class="status-pulse"><i></i><i></i><i></i></div>
        </div>
        <div class="maintenance-footnote"><span class="footnote-star">✳</span> {{ tr(`Merci de votre patience, on ne sera pas longs.`, `Thank you for your patience, we will not be long.`) }}</div>
      </section>
      <section class="maintenance-art" :aria-label="tr(`Illustration abstraite de maintenance`, `Abstract maintenance illustration`)">
        <div class="art-grid"></div>
        <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-orbit orbit-three"></div>
        <div class="art-core"><div class="core-glow"></div><img src="/logo.png" alt="GSA" class="core-logo" /><span class="core-caption">GSA<br />SYSTEMS</span></div>
        <div class="float-chip chip-top"><span class="chip-spark">✦</span> {{ tr(`AMÉLIORATION EN COURS`, `UPGRADING EXPERIENCE`) }}</div>
        <div class="float-chip chip-bottom"><span class="chip-dot"></span> {{ tr(`BIENTÔT DE RETOUR`, `ONLINE AGAIN SOON`) }}</div>
        <div class="art-cross cross-a">+</div><div class="art-cross cross-b">+</div>
        <div class="art-coordinates">48°51' N<br />02°21' E</div>
      </section>
    </main>
    <a href="/login?admin=1" class="maintenance-admin-btn-mobile"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>{{ tr(`Connexion admin`, `Admin login`) }}</a>
    <footer class="maintenance-footer"><span>© {{ new Date().getFullYear() }} GSA Marketplace</span><span class="footer-center"><i></i> {{ tr(`Amélioration de la plateforme`, `Platform improvements`) }}</span><span>{{ tr(`À très vite`, `See you soon`) }} <b>↗</b></span></footer>
  </div>
  <template v-else>
    <div v-if="maintenance.enabled && isAdminSession" class="maintenance-admin-bar" role="status">
      <span>{{ tr(`Maintenance activée : les visiteurs voient la page d'attente, vous voyez tout le site car vous êtes connecté en admin`, `Maintenance is on: visitors see the waiting page, you see the whole site because you are signed in as admin`) }}</span>
      <a href="/admin">{{ tr(`Ouvrir l'administration`, `Open the admin panel`) }}</a>
    </div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </template>
</template>

<script setup lang="ts">
const route = useRoute()
const { locale, tr } = useLang()
const FR_MAINTENANCE_DEFAULT = 'Le site est temporairement indisponible afin d’effectuer quelques améliorations. Merci de votre patience.'
const maintenanceText = computed(() => {
  const m = maintenance.value.message
  return !m || m === FR_MAINTENANCE_DEFAULT
    ? tr(FR_MAINTENANCE_DEFAULT, 'The site is temporarily unavailable while we make a few improvements. Thank you for your patience.')
    : m
})
useHead({ htmlAttrs: { lang: () => locale.value } })
const { settings: maintenance, refresh } = useMaintenance()
await refresh()

// Un administrateur connecté garde l'accès à tout le site pendant la maintenance ;
// seuls les visiteurs voient la page d'attente. Le cookie est relayé côté serveur pour éviter tout flash.
const { user: authUser } = useAuth()
const { data: me } = await useFetch<any>('/api/me', {
  key: 'app-session',
  headers: useRequestHeaders(['cookie']),
  immediate: maintenance.value.enabled,
})
const isAdminSession = computed(() => authUser.value?.role === 'admin' || me.value?.user?.role === 'admin')
watch(() => route.fullPath, refresh)
onMounted(() => {
  const timer = window.setInterval(refresh, 30000)
  onBeforeUnmount(() => window.clearInterval(timer))
})
</script>

<style>
.maintenance-screen { --maint-blue:#6d94ff;position:relative;isolation:isolate;min-height:100svh;overflow:hidden;display:flex;flex-direction:column;padding:0 clamp(22px,7vw,112px);background:#080b11;color:#f5f6fa;font-family:Inter,system-ui,sans-serif; }
.maintenance-screen::before { content:"";position:absolute;z-index:-2;inset:0;background:radial-gradient(ellipse at 73% 48%,rgba(66,91,190,.18),transparent 39%),radial-gradient(ellipse at 8% 92%,rgba(109,148,255,.07),transparent 34%),#080b11; }
.maintenance-noise { position:absolute;z-index:-1;inset:0;pointer-events:none;opacity:.15;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E"); }
.maintenance-topbar { height:90px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08); }
.maintenance-brand { display:flex;align-items:center;gap:11px;color:#fff;text-decoration:none;font-size:1.16rem;font-weight:900;letter-spacing:-.04em; }
.maintenance-brand-mark { width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:linear-gradient(145deg,rgba(109,148,255,.3),rgba(109,148,255,.05));color:#a9bdff; }
.maintenance-logo { height:46px;width:auto;display:block; }
.maintenance-brand small { display:block;padding-left:11px;border-left:1px solid rgba(255,255,255,.14);color:#8a92a3;font-size:.56rem;font-weight:700;letter-spacing:.19em; }
.core-logo { position:relative;width:74%;height:auto;display:block;transform:rotate(8deg);filter:drop-shadow(0 0 28px rgba(155,158,255,.5)); }
.brand-separator { padding:0 3px;color:#67718a;font-weight:400; }
.maintenance-live { display:inline-flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:#abb2c1;font-size:.7rem;font-weight:600;letter-spacing:.02em; }
.maintenance-actions { display:flex;align-items:center;gap:10px; }
.maintenance-admin-bar { position:sticky;top:0;z-index:100000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 16px;min-height:36px;padding:6px 16px;background:#1b1c1f;border-bottom:1px solid rgba(255,255,255,.1);color:#e3b565;font-size:13px;line-height:20px;text-align:center; }
.maintenance-admin-bar a { color:#ececee;text-decoration:underline; }
.maintenance-admin-btn-mobile { display:none;align-items:center;justify-content:center;gap:9px;min-height:48px;margin-bottom:14px;border:1px solid rgba(154,174,255,.4);border-radius:14px;background:rgba(109,148,255,.13);color:#c9d5ff;font-size:.88rem;font-weight:700;text-decoration:none; }
.maintenance-admin-btn { padding:9px 15px;border:1px solid rgba(154,174,255,.35);border-radius:999px;background:rgba(109,148,255,.12);color:#c0cdff;font-size:.7rem;font-weight:700;text-decoration:none;transition:background .2s,border-color .2s; }
.maintenance-admin-btn:hover { background:rgba(109,148,255,.25);border-color:rgba(154,174,255,.6); }
.maintenance-live>span,.footer-center i { width:7px;height:7px;border-radius:50%;background:#9c83ff;box-shadow:0 0 12px rgba(156,131,255,.75);animation:maintenanceBlink 2s ease-in-out infinite; }
.maintenance-main { flex:1;min-height:560px;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:4%;max-width:1440px;width:100%;margin:auto; }
.maintenance-copy { position:relative;z-index:2;padding:70px 0;animation:maintenanceRise .7s ease both; }
.maintenance-eyebrow { display:flex;align-items:center;gap:11px;margin-bottom:27px;color:#929bad;font-size:.68rem;font-weight:700;letter-spacing:.16em; }
.eyebrow-line { width:28px;height:1px;background:#9a87ff;box-shadow:0 0 9px #9a87ff; }
.maintenance-copy h1 { margin:0;font-size:clamp(3.2rem,6.5vw,6.5rem);line-height:.99;letter-spacing:-.075em;font-weight:750; }
.maintenance-copy h1 span { color:#9aaeff;background:linear-gradient(100deg,#c0cdff 0%,#9382ff 49%,#75a8ff 100%);background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
.maintenance-description { max-width:490px;margin:28px 0 0;color:#9da5b4;font-size:clamp(.94rem,1.2vw,1.08rem);line-height:1.8; }
.maintenance-status { display:flex;align-items:center;gap:14px;max-width:420px;margin-top:36px;padding:15px 17px;border:1px solid rgba(255,255,255,.09);border-radius:13px;background:rgba(255,255,255,.025); }
.status-icon { width:40px;height:40px;flex:none;display:grid;place-items:center;border:1px solid rgba(151,135,255,.24);border-radius:11px;background:rgba(151,135,255,.1);color:#b7aaff; }
.status-icon svg { width:19px;height:19px;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round; }
.maintenance-status strong,.maintenance-status span { display:block; }
.maintenance-status strong { font-size:.8rem; }
.maintenance-status div:nth-child(2) span { margin-top:4px;color:#747d8e;font-size:.7rem; }
.status-pulse { display:flex;gap:3px;margin-left:auto;align-items:center; }
.status-pulse i { display:block;width:3px;height:9px;border-radius:3px;background:#8d7cff;animation:maintenanceBars .8s ease-in-out infinite alternate; }
.status-pulse i:nth-child(2) { height:15px;animation-delay:.2s; }.status-pulse i:nth-child(3) { height:11px;animation-delay:.4s; }
.maintenance-footnote { display:flex;align-items:center;gap:8px;margin-top:23px;color:#656d7b;font-size:.73rem; }
.footnote-star { color:#9d8aff;font-size:1.05rem; }
.maintenance-art { position:relative;min-height:min(70vh,650px);display:grid;place-items:center;overflow:hidden;animation:maintenanceRise .9s .12s ease both; }
.art-grid { position:absolute;inset:5%;opacity:.2;background-image:linear-gradient(rgba(160,172,220,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(160,172,220,.12) 1px,transparent 1px);background-size:45px 45px;mask-image:radial-gradient(ellipse,black 10%,transparent 70%); }
.art-orbit { position:absolute;left:50%;top:50%;border:1px solid rgba(143,158,232,.15);border-radius:50%;transform:translate(-50%,-50%); }
.orbit-one { width:min(32vw,420px);aspect-ratio:1;animation:orbitSpin 28s linear infinite; }
.orbit-two { width:min(25vw,330px);aspect-ratio:1;border-style:dashed;animation:orbitSpin 36s linear infinite reverse; }
.orbit-three { width:min(43vw,560px);aspect-ratio:1;border-color:rgba(143,158,232,.08); }
.orbit-one::before,.orbit-two::before { content:"";position:absolute;top:14%;left:16%;width:8px;height:8px;border-radius:50%;background:#a69aff;box-shadow:0 0 18px 4px rgba(166,154,255,.55); }
.orbit-two::before { top:auto;bottom:10%;left:24%;width:5px;height:5px;background:#72b4ff;box-shadow:0 0 16px 4px rgba(114,180,255,.6); }
.art-core { position:relative;width:min(22vw,260px);aspect-ratio:1;display:grid;place-items:center;border:1px solid rgba(182,188,255,.23);border-radius:32%;background:linear-gradient(145deg,rgba(36,43,75,.8),rgba(12,16,28,.9));box-shadow:0 0 90px rgba(108,116,255,.19),inset 0 0 45px rgba(136,138,255,.1);transform:rotate(-8deg); }
.art-core::before,.art-core::after { content:"";position:absolute;inset:-13px;border:1px solid rgba(167,156,255,.18);border-radius:30%;transform:rotate(20deg); }
.art-core::after { inset:-28px;border-color:rgba(131,161,255,.11);transform:rotate(45deg); }
.core-glow { position:absolute;inset:5%;border-radius:32%;background:radial-gradient(circle at 50% 35%,rgba(133,140,255,.3),transparent 67%);filter:blur(10px); }
.core-g { position:relative;margin-top:-9px;color:#d5d9ff;font-size:clamp(4rem,9vw,7.8rem);font-weight:900;letter-spacing:-.11em;text-shadow:0 0 42px rgba(155,158,255,.65); }
.core-caption { position:absolute;right:-48px;bottom:13px;color:#9ba5c3;font-size:.52rem;line-height:1.5;font-weight:800;letter-spacing:.16em;transform:rotate(8deg); }
.float-chip { position:absolute;z-index:2;display:flex;align-items:center;gap:8px;padding:10px 13px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(15,19,31,.82);box-shadow:0 12px 35px rgba(0,0,0,.25);color:#aab2c4;font-size:.57rem;font-weight:700;letter-spacing:.1em;backdrop-filter:blur(12px); }
.chip-top { top:23%;right:3%;animation:chipFloat 5s ease-in-out infinite; }.chip-bottom { bottom:23%;left:4%;animation:chipFloat 6s ease-in-out infinite reverse; }
.chip-spark { color:#afa3ff;font-size:.9rem; }.chip-dot { width:6px;height:6px;border-radius:50%;background:#75cbb0;box-shadow:0 0 10px #75cbb0; }
.art-cross { position:absolute;color:rgba(178,188,255,.55);font-size:1.1rem;font-weight:200; }.cross-a { top:23%;left:18%; }.cross-b { right:17%;bottom:20%;font-size:1.5rem; }
.art-coordinates { position:absolute;right:4%;bottom:13%;color:#616b80;font:600 .55rem/1.6 ui-monospace,monospace;letter-spacing:.12em;text-align:right; }
.maintenance-footer { min-height:66px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-top:1px solid rgba(255,255,255,.08);color:#697181;font-size:.68rem; }
.maintenance-footer>span:last-child { color:#a7afbd; }.maintenance-footer b { padding-left:5px;color:#a497ff; }
.footer-center { display:flex;align-items:center;gap:8px; }.footer-center i { width:5px;height:5px; }
@keyframes maintenanceBlink { 0%,100%{opacity:1}50%{opacity:.4} }
@keyframes maintenanceBars { to { transform:scaleY(.55);opacity:.5; } }
@keyframes orbitSpin { to { transform:translate(-50%,-50%) rotate(360deg); } }
@keyframes chipFloat { 0%,100%{translate:0 0}50%{translate:0 -9px} }
@keyframes maintenanceRise { from{opacity:0;translate:0 15px}to{opacity:1;translate:0 0} }
@media(max-width:900px) { .maintenance-screen { padding:0 5vw; }.maintenance-main { gap:0;grid-template-columns:1.1fr .9fr; }.maintenance-copy h1 { font-size:clamp(3rem,7vw,5rem); }.maintenance-art { min-height:520px; }.orbit-one { width:min(38vw,360px); }.orbit-two { width:min(30vw,285px); }.orbit-three { width:min(50vw,470px); }.art-core { width:min(27vw,220px); } }
@media(max-width:650px) { .maintenance-screen { padding:0 20px; }.maintenance-topbar { height:68px; }.maintenance-logo { height:36px; }.maintenance-brand { gap:9px; }.maintenance-brand small { padding-left:9px;font-size:.5rem;letter-spacing:.17em; }.maintenance-live { padding:7px 10px;font-size:.62rem;gap:7px; }.maintenance-admin-btn { display:none; }.maintenance-main { display:flex;flex-direction:column;align-items:stretch;gap:0;min-height:0; }.maintenance-copy { padding:36px 0 0; }.maintenance-eyebrow { gap:10px;margin-bottom:16px;font-size:.6rem;letter-spacing:.14em; }.eyebrow-line { width:22px; }.maintenance-copy h1 { font-size:46px;letter-spacing:-.065em;line-height:1; }.maintenance-description { margin-top:16px;font-size:.9rem;line-height:1.65; }.maintenance-status { margin-top:22px;padding:12px 14px;gap:12px;border-radius:13px; }.status-icon { width:36px;height:36px; }.maintenance-art { min-height:320px;margin-top:0; }.orbit-one { width:238px; }.orbit-two { width:188px; }.orbit-three { width:300px; }.art-core { width:132px; }.core-logo { width:74%; }.core-caption,.art-coordinates,.art-cross { display:none; }.float-chip { padding:8px 10px;font-size:.5rem;gap:7px; }.chip-top { top:8%;right:0; }.chip-bottom { bottom:8%;left:0; }.maintenance-admin-btn-mobile { display:flex; }.maintenance-footer { min-height:48px;font-size:.65rem; }.footer-center,.maintenance-footnote { display:none; } }
@media(max-width:380px) { .maintenance-screen { padding:0 18px; }.maintenance-brand { font-size:1rem; }.maintenance-brand-mark { width:30px;height:30px; }.maintenance-live { font-size:.55rem; }.maintenance-copy h1 { font-size:2.8rem; }.maintenance-art { min-height:330px; }.art-core { width:150px; }.maintenance-status { padding:12px; }.maintenance-status div:nth-child(2) span { max-width:190px;line-height:1.4; } }
@media(prefers-reduced-motion:reduce) { .maintenance-screen *, .maintenance-screen *::before, .maintenance-screen *::after { animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important; } }
</style>
