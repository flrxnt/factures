<script setup lang="ts">
import BaseButton from '../ui/BaseButton.vue'

defineEmits<{
  new: []
  history: []
  export: []
}>()
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-hairline bg-paper/90 backdrop-blur">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <h1 class="font-display text-xl text-ink">
        Facture<span class="text-accent">.</span>
      </h1>
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton variant="secondary" @click="$emit('new')">Nouvelle facture</BaseButton>
        <BaseButton variant="secondary" @click="$emit('history')">Historique</BaseButton>
        <BaseButton variant="primary" @click="$emit('export')">Télécharger le PDF</BaseButton>
      </div>
    </div>
  </header>
</template>
