<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/confidentialite.md?raw'
import mdEn from '~/content/legal/en/confidentialite.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'GSA — Privacy Policy' : 'GSA — Politique de confidentialité'))
const subtitle = computed(() =>
  locale.value === 'en' ? 'Privacy Policy GSA — official document' : 'Politique de confidentialité GSA — document officiel'
)
</script>
