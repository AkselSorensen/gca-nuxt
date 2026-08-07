<template>
  <div ref="pageRef" class="page-static">
    <div class="container">
      <div class="page-header anim-up">
        <h1>{{ t('about.title') }}</h1>
        <p>{{ t('about.subtitle') }}</p>
      </div>
      <div class="about-content anim-card">
        <section class="about-block">
          <h2>{{ t('about.mission_title') }}</h2>
          {{ t('about.mission1') }}
        </section>
        <section class="about-block">
          <h2>Pourquoi GSA ?</h2>
          <p>Les créateurs passent trop de temps sur l'aspect commercial au détriment de leur art. Les porteurs de projets peinent à trouver des ressources fiables. GSA résout ce problème en proposant une plateforme centralisée où qualité et confiance sont les maîtres-mots.</p>
        </section>
        <section class="about-block">
          <h2>Ce que GSA prend en charge</h2>
          <ul><li>{{ t('about.list1') }}</li><li>{{ t('about.list2') }}</li><li>{{ t('about.list3') }}</li><li>{{ t('about.list4') }}</li><li>{{ t('about.list5') }}</li></ul>
        </section>
        <section class="about-block">
          <h2>{{ t('about.nonexcl_title') }}</h2>
          <p>{{ t('about.nonexcl_desc') }}</p>
          <ul><li>{{ t('about.nonexcl1') }}</li><li>{{ t('about.nonexcl2') }}</li><li>{{ t('about.nonexcl3') }}</li><li>{{ t('about.nonexcl4') }}</li></ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const pageRef = ref<HTMLElement | null>(null)
onMounted(async () => {
  const { load, pageEntrance } = await import('~/composables/useAnimation')
  const { gsap } = await load()
  if (gsap) pageEntrance(gsap, pageRef.value)
})
const { t } = useLang()

</script>

<style scoped>
.page-static { padding:40px 0 64px; }
.page-header { margin-bottom:40px; }
.page-header h1 { font-size:2rem;font-weight:900;letter-spacing:-.03em; }
.page-header p { color:var(--text-secondary);margin-top:8px;font-size:1.05rem; }
.about-content { display:grid;gap:24px;max-width:800px; }
.about-block { padding:28px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);display:grid;gap:12px; }
.about-block h2 { font-size:1.15rem;font-weight:700; }
.about-block p { color:var(--text-secondary);font-size:.92rem;line-height:1.7; }
.about-block ul { display:grid;gap:6px;padding:0;list-style:none; }
.about-block li { padding:6px 10px;border-radius:6px;background:rgba(255,255,255,0.02);font-size:.85rem;color:var(--text-secondary);padding-left:12px;border-left:2px solid var(--accent); }
</style>
