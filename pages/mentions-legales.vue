<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/mentions-legales.md?raw'
import mdEn from '~/content/legal/en/mentions-legales.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'Legal Notice' : 'Mentions légales'))
const subtitle = computed(() =>
  locale.value === 'en' ? 'GSA Store — legal information' : 'GSA Store — informations légales'
)
</script>
