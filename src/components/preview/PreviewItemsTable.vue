<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem } from '../../types/invoice'
import { buildItemsColumns } from '../../config/invoiceLayout'
import { lineTotal } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'

const props = defineProps<{
  items: LineItem[]
  showTaxColumn: boolean
  currency: string
  locale: string
}>()

const columns = computed(() => buildItemsColumns(props.showTaxColumn))
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
  <div class="overflow-hidden rounded-md border border-slate-200">
    <div
      class="grid gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <span v-for="col in columns" :key="col.key" :class="col.align === 'right' ? 'text-right' : 'text-left'">
        {{ col.labelFr }}
      </span>
    </div>
    <p v-if="items.length === 0" class="px-3 py-6 text-center text-sm text-slate-400">Aucune ligne de facturation.</p>
    <div
      v-for="item in items"
      :key="item.id"
      class="grid gap-2 border-b border-slate-100 px-3 py-2 text-sm text-slate-700 last:border-b-0"
      :style="{ gridTemplateColumns: gridTemplate }"
    >
      <span v-for="col in columns" :key="col.key" :class="[col.align === 'right' ? 'text-right tabular-nums' : 'text-left', col.key === 'description' ? 'break-words' : '']">
        {{ cellValue(item, col.key) }}
      </span>
    </div>
  </div>
</template>
