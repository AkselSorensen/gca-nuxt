<template>
  <LegalDocView :title="title" :subtitle="subtitle" :content="md" />
</template>

<script setup lang="ts">
import mdFr from '~/content/legal/retractation.md?raw'
import mdEn from '~/content/legal/en/retractation.md?raw'

const { locale } = useLang()
const md = computed(() => (locale.value === 'en' ? mdEn : mdFr))
const title = computed(() =>
  locale.value === 'en' ? 'GSA — Withdrawal, Refund and Complaints Policy' : 'GSA — Politique de rétractation, remboursement et réclamations'
)
const subtitle = computed(() =>
  locale.value === 'en' ? 'Refund policy GSA — official document' : 'Politique de rétractation GSA — document officiel'
)
</script>
