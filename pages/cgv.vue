<template>
  <LegalDocView title="Conditions Générales de Vente" subtitle="CGV GSA — document officiel" :content="md" />
</template>

<script setup lang="ts">
import md from '~/content/legal/cgv.md?raw'
</script>
