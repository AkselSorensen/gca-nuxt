<template>
  <LegalDocView title="Mentions légales" subtitle="Document officiel GSA — conforme LCEN" :content="md" />
</template>

<script setup lang="ts">
import md from '~/content/legal/mentions-legales.md?raw'
</script>
