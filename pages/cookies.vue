<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/cookies.md?raw'
import mdEn from '~/content/legal/en/cookies.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'GSA — Cookie Policy' : 'GSA — Politique cookies et autres traceurs'))
const subtitle = computed(() =>
  locale.value === 'en' ? 'Cookie Policy GSA — official document' : 'Politique cookies GSA — document officiel'
)
</script>
