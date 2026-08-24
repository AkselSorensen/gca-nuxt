<template>
  <LegalDocView title="Contrat Vendeur" subtitle="Document officiel GSA — conditions de vente sur la plateforme" :content="md" />
</template>

<script setup lang="ts">
import md from '~/content/legal/contrat-vendeur.md?raw'
</script>
