<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { useSectionToggles } from '../../composables/useSectionToggles'
import BaseToggle from '../ui/BaseToggle.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const { SECTIONS, isVisible, toggle } = useSectionToggles(props.invoice)
</script>

<template>
  <fieldset class="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
    <legend class="px-1 text-base font-semibold text-slate-900">Éléments affichés</legend>
    <p class="text-sm text-slate-500">Choisissez les sections à afficher sur l'aperçu et le PDF.</p>
    <div class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      <BaseToggle
        v-for="section in SECTIONS"
        :key="section.key"
        :model-value="isVisible(section.key)"
        :label="section.labelFr"
        @update:model-value="toggle(section.key)"
      />
    </div>
  </fieldset>
</template>
