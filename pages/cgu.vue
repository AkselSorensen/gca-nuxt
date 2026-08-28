<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/cgu.md?raw'
import mdEn from '~/content/legal/en/cgu.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'Terms of Use' : "Conditions Générales d'Utilisation"))
const subtitle = computed(() =>
  locale.value === 'en' ? 'GSA ToU — official document' : 'CGU GSA — document officiel'
)
</script>
