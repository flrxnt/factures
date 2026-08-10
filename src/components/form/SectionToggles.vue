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
  <fieldset class="space-y-3 rounded-xl border border-hairline bg-paper-dim/60 p-4">
    <legend class="px-1 font-display text-lg text-ink">Éléments affichés</legend>
    <p class="text-sm text-ink-soft">Choisissez les sections à afficher sur l'aperçu et le PDF.</p>
    <div class="flex flex-wrap gap-2">
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
