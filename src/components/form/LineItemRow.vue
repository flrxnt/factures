<script setup lang="ts">
import { isTauri } from '@tauri-apps/api/core'
import type { LineItem } from '../../types/invoice'
import type { Product } from '../../types/product'
import { lineTotal } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import RichTextEditor from './RichTextEditor.vue'
import ProductAutocomplete from './ProductAutocomplete.vue'

const props = defineProps<{
  item: LineItem
  showQuantityColumn: boolean
  showUnitPriceColumn: boolean
  showTaxColumn: boolean
  showLineTotalColumn: boolean
  currency: string
  locale: string
}>()

defineEmits<{
  remove: []
}>()

const isTauriEnv = isTauri()

const fieldClass =
  'w-full rounded-md border border-hairline bg-surface px-2 py-1 text-right text-sm text-ink outline-none transition focus:border-accent'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function applyProduct(product: Product) {
  props.item.description = product.description ? `<p>${escapeHtml(product.description)}</p>` : `<p>${escapeHtml(product.name)}</p>`
  props.item.unitPrice = product.salePrice
  props.item.taxRatePercent = product.taxRatePercent
  props.item.productId = product.id
}
</script>

<template>
  <div class="space-y-2 rounded-md border border-hairline p-2.5">
    <ProductAutocomplete v-if="isTauriEnv" @select="applyProduct" />
    <div class="flex items-start gap-2">
      <RichTextEditor v-model="item.description" placeholder="Description de la prestation" class="flex-1" />
      <button type="button" class="mt-1 shrink-0 text-muted hover:text-accent" title="Supprimer la ligne" @click="$emit('remove')">✕</button>
    </div>
    <div class="flex flex-wrap items-end justify-end gap-3 text-xs">
      <label v-if="showQuantityColumn" class="w-20">
        <span class="mb-1 block text-muted uppercase">Qté</span>
        <input v-model.number="item.quantity" type="number" min="0" step="1" :class="fieldClass" />
      </label>
      <label v-if="showUnitPriceColumn" class="w-28">
        <span class="mb-1 block text-muted uppercase">Prix unitaire</span>
        <input v-model.number="item.unitPrice" type="number" min="0" step="0.01" :class="fieldClass" />
      </label>
      <label v-if="showTaxColumn" class="w-20">
        <span class="mb-1 block text-muted uppercase">TVA %</span>
        <input v-model.number="item.taxRatePercent" type="number" min="0" step="0.5" :class="fieldClass" />
      </label>
      <div v-if="showLineTotalColumn" class="w-28">
        <span class="mb-1 block text-muted uppercase">Total</span>
        <p class="px-2 py-1 text-right text-sm text-ink-soft tabular-nums">{{ formatCurrency(lineTotal(props.item), currency, locale) }}</p>
      </div>
    </div>
  </div>
</template>
