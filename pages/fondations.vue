<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/fondations.md?raw'
import mdEn from '~/content/legal/en/fondations.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'GSA — Legal Foundations' : 'GSA — Fondations Juridiques'))
const subtitle = computed(() =>
  locale.value === 'en'
    ? 'General definitions and fundamental principles · Version 1.0.0 · Effective 24/08/2026'
    : 'Définitions générales et principes fondamentaux · Version 1.0.0 · Entrée en vigueur le 24/08/2026'
)
</script>
