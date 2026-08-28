<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/contrat-vendeur.md?raw'
import mdEn from '~/content/legal/en/contrat-vendeur.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() => (locale.value === 'en' ? 'GSA — Seller Contract' : 'GSA — Contrat Vendeur'))
const subtitle = computed(() =>
  locale.value === 'en' ? 'Seller Contract GSA — official document' : 'Contrat Vendeur GSA — document officiel'
)
</script>
