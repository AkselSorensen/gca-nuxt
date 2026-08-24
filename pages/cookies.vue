<template>
  <LegalDocView title="Politique des cookies" subtitle="Document officiel GSA" :content="md" />
</template>

<script setup lang="ts">
import md from '~/content/legal/cookies.md?raw'
</script>
