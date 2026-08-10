<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue'

defineEmits<{
  new: []
  history: []
  export: []
}>()
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <h1 class="text-lg font-bold text-slate-900">Générateur de facture</h1>
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton variant="secondary" @click="$emit('new')">Nouvelle facture</BaseButton>
        <BaseButton variant="secondary" @click="$emit('history')">Historique</BaseButton>
        <BaseButton variant="primary" @click="$emit('export')">Télécharger le PDF</BaseButton>
      </div>
    </div>
  </header>
</template>
