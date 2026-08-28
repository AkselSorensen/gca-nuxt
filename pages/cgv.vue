<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/cgv.md?raw'
import mdEn from '~/content/legal/en/cgv.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'GSA — Terms of Sale' : 'GSA — Conditions Générales de Vente'))
const subtitle = computed(() =>
  locale.value === 'en' ? 'ToS GSA — official document' : 'CGV GSA — document officiel'
)
</script>
