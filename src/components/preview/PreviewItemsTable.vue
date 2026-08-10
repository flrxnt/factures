<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem } from '../../types/invoice'
import { buildItemsColumns } from '../../config/invoiceLayout'
import { lineTotal } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'

const props = defineProps<{
  items: LineItem[]
  showQuantityColumn: boolean
  showUnitPriceColumn: boolean
  showTaxColumn: boolean
  showLineTotalColumn: boolean
  currency: string
  locale: string
}>()

const columns = computed(() =>
  buildItemsColumns({
    showQuantity: props.showQuantityColumn,
    showUnitPrice: props.showUnitPriceColumn,
    showTax: props.showTaxColumn,
    showLineTotal: props.showLineTotalColumn,
  }),
)
const gridTemplate = computed(() => columns.value.map((c) => `${c.width}fr`).join(' '))

function cellValue(item: LineItem, key: string): string {
  switch (key) {
    case 'description':
      return item.description || '—'
    case 'quantity':
      return String(item.quantity)
    case 'unitPrice':
      return formatCurrency(item.unitPrice, props.currency, props.locale)
    case 'taxRate':
      return `${item.taxRatePercent}%`
    case 'lineTotal':
      return formatCurrency(lineTotal(item), props.currency, props.locale)
    default:
      return ''
  }
}
</script>

<template>
  <div>
    <div
      class="grid gap-2 border-b border-hairline-strong pb-2 text-xs font-medium tracking-wide text-muted uppercase"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <span v-for="col in columns" :key="col.key" :class="col.align === 'right' ? 'text-right' : 'text-left'">
        {{ col.labelFr }}
      </span>
    </div>
    <p v-if="items.length === 0" class="px-1 py-6 text-center text-sm text-muted">Aucune ligne de facturation.</p>
    <div
      v-for="item in items"
      :key="item.id"
      class="grid gap-2 border-b border-hairline py-2.5 text-sm text-ink-soft last:border-b-0"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <span v-for="col in columns" :key="col.key" :class="[col.align === 'right' ? 'text-right tabular-nums' : 'text-left text-ink', col.key === 'description' ? 'break-words' : '']">
        {{ cellValue(item, col.key) }}
      </span>
    </div>
  </div>
</template>
