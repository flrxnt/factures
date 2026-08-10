<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem } from '../../types/invoice'
import { buildFormRowGridTemplate } from '../../config/invoiceLayout'
import { lineTotal } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'

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

const gridTemplate = computed(() =>
  buildFormRowGridTemplate({
    showQuantity: props.showQuantityColumn,
    showUnitPrice: props.showUnitPriceColumn,
    showTax: props.showTaxColumn,
    showLineTotal: props.showLineTotalColumn,
  }),
)

const fieldClass =
  'rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent'
</script>

<template>
  <div class="grid items-start gap-2" :style="{ gridTemplateColumns: gridTemplate }">
    <input v-model="item.description" type="text" placeholder="Description de la prestation" :class="fieldClass" />
    <input v-if="showQuantityColumn" v-model.number="item.quantity" type="number" min="0" step="1" :class="[fieldClass, 'text-right']" />
    <input v-if="showUnitPriceColumn" v-model.number="item.unitPrice" type="number" min="0" step="0.01" :class="[fieldClass, 'text-right']" />
    <input v-if="showTaxColumn" v-model.number="item.taxRatePercent" type="number" min="0" step="0.5" :class="[fieldClass, 'text-right']" />
    <div v-if="showLineTotalColumn" class="flex items-center justify-end px-1 text-sm text-ink-soft tabular-nums">
      {{ formatCurrency(lineTotal(props.item), currency, locale) }}
    </div>
    <button type="button" class="text-muted hover:text-accent" title="Supprimer la ligne" @click="$emit('remove')">✕</button>
  </div>
</template>
