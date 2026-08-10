<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { THEME_COLOR_PRESETS } from '../../config/defaults'

defineProps<{
  invoice: Invoice
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="font-display text-lg text-ink">Couleur de la facture</legend>
    <p class="text-sm text-muted">S'applique à cette facture uniquement, sur l'aperçu et le PDF.</p>
    <div class="flex flex-wrap items-center gap-2.5">
      <button
        v-for="preset in THEME_COLOR_PRESETS"
        :key="preset.value"
        type="button"
        :title="preset.label"
        class="h-7 w-7 rounded-full ring-1 ring-hairline-strong ring-offset-2 ring-offset-surface transition"
        :class="invoice.themeColor.toLowerCase() === preset.value ? 'ring-2 ring-ink' : ''"
        :style="{ backgroundColor: preset.value }"
        @click="invoice.themeColor = preset.value"
      />
      <span class="ml-1 h-7 w-7 overflow-hidden rounded-full ring-1 ring-hairline-strong ring-offset-2 ring-offset-surface">
        <input v-model="invoice.themeColor" type="color" class="h-9 w-9 -translate-x-1 -translate-y-1 cursor-pointer border-0 p-0" title="Couleur personnalisée" />
      </span>
    </div>
  </fieldset>
</template>
