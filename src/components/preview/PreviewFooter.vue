<script setup lang="ts">
defineProps<{
  sellerName: string
}>()
</script>

<template>
  <div class="border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
    {{ sellerName || 'Votre entreprise' }} — Facture générée avec Générateur de facture
  </div>
</template>
