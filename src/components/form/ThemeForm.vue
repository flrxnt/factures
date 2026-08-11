<script setup lang="ts">
import type { Invoice, InvoiceTemplate } from '../../types/invoice'
import { THEME_COLOR_PRESETS } from '../../config/defaults'
import { TEMPLATE_ORDER } from '../../config/templates'

const props = defineProps<{
  invoice: Invoice
}>()

function selectTemplate(template: InvoiceTemplate) {
  props.invoice.template = template
}
</script>

<template>
  <fieldset class="space-y-5">
    <div class="space-y-3">
      <legend class="font-display text-lg text-ink">Mise en page</legend>
      <p class="text-sm text-muted">S'applique à cette facture uniquement, sur l'aperçu et le PDF.</p>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="tpl in TEMPLATE_ORDER"
          :key="tpl.value"
          type="button"
          class="rounded-lg border p-2 text-left transition"
          :class="invoice.template === tpl.value ? 'border-ink ring-1 ring-ink' : 'border-hairline hover:border-hairline-strong'"
          @click="selectTemplate(tpl.value)"
        >
          <!-- Editorial mockup -->
          <div v-if="tpl.value === 'editorial'" class="h-16 rounded border border-hairline bg-surface p-2">
            <div class="flex items-center justify-between">
              <div class="h-1.5 w-5 rounded-sm bg-ink/60"></div>
              <div class="font-display text-[9px] text-ink italic" :style="{ color: invoice.themeColor }">F.</div>
            </div>
            <div class="mt-2.5 space-y-1">
              <div class="h-px w-full bg-hairline-strong"></div>
              <div class="h-0.5 w-4/5 bg-hairline"></div>
              <div class="h-0.5 w-3/5 bg-hairline"></div>
            </div>
          </div>
          <!-- Minimal mockup -->
          <div v-else-if="tpl.value === 'minimal'" class="h-16 rounded border border-hairline bg-surface p-2">
            <div class="flex items-center gap-1">
              <div class="h-1 w-1" :style="{ backgroundColor: invoice.themeColor }"></div>
              <div class="h-1 w-7 bg-ink/60"></div>
            </div>
            <div class="mt-3 h-px w-full bg-hairline"></div>
            <div class="mt-2 space-y-1.5">
              <div class="h-0.5 w-3/5 bg-hairline"></div>
              <div class="h-0.5 w-2/5 bg-hairline"></div>
            </div>
          </div>
          <!-- Bold mockup -->
          <div v-else class="h-16 rounded border border-hairline bg-surface p-2">
            <div class="h-4 w-full rounded-sm" :style="{ backgroundColor: invoice.themeColor }"></div>
            <div class="mt-2 space-y-1">
              <div class="h-0.5 w-4/5 bg-hairline-strong"></div>
              <div class="h-0.5 w-3/5 bg-hairline"></div>
            </div>
          </div>
          <p class="mt-1.5 text-xs font-medium text-ink">{{ tpl.labelFr }}</p>
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <p class="text-xs font-medium tracking-wide text-muted uppercase">Couleur</p>
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
    </div>
  </fieldset>
</template>
