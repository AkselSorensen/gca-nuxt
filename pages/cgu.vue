<template>
  <LegalDocView title="Conditions Générales d'Utilisation" subtitle="CGU GSA — document officiel" :content="md" />
</template>

<script setup lang="ts">
import md from '~/content/legal/cgu.md?raw'
</script>
