<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import BaseTextarea from '../ui/BaseTextarea.vue'

defineProps<{
  invoice: Invoice
}>()
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Notes de bas de page</legend>
    <p class="text-sm text-muted">Informations complémentaires affichées en bas de chaque page (gauche / droite).</p>
    <div class="grid grid-cols-2 gap-4">
      <BaseTextarea v-model="invoice.footerNoteLeft" label="Gauche" placeholder="N° RCCM, capital social..." :rows="2" />
      <BaseTextarea v-model="invoice.footerNoteRight" label="Droite" placeholder="Site web, mentions légales..." :rows="2" />
    </div>
  </fieldset>
</template>
