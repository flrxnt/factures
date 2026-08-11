<script setup lang="ts">
import { computed } from 'vue'
import type { LineItem, InvoiceTemplate } from '../../types/invoice'
import { buildItemsColumns } from '../../config/invoiceLayout'
import { lineTotal } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { isEmptyHtml } from '../../lib/richText'

const props = defineProps<{
  items: LineItem[]
  showQuantityColumn: boolean
  showUnitPriceColumn: boolean
  showTaxColumn: boolean
  showLineTotalColumn: boolean
  currency: string
  locale: string
  template: InvoiceTemplate
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

const headerRowClass = computed(() => {
  if (props.template === 'minimal') return 'grid gap-2 border-t border-hairline pt-2 text-xs font-medium text-muted'
  if (props.template === 'bold')
    return 'grid gap-2 rounded-t-md bg-[color-mix(in_srgb,var(--color-accent)_16%,white)] px-2 py-2 text-xs font-bold text-ink uppercase'
  return 'grid gap-2 border-b border-hairline-strong pb-2 text-xs font-medium tracking-wide text-muted uppercase'
})

const itemRowClass = computed(() => {
  if (props.template === 'minimal') return 'grid gap-2 py-3 text-sm text-ink-soft'
  if (props.template === 'bold') return 'grid gap-2 border-b border-hairline px-2 py-2.5 text-sm text-ink-soft last:border-b-0'
  return 'grid gap-2 border-b border-hairline py-2.5 text-sm text-ink-soft last:border-b-0'
})

function descriptionHtml(item: LineItem): string {
  return isEmptyHtml(item.description) ? '—' : item.description
}

function cellValue(item: LineItem, key: string): string {
  switch (key) {
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
    <div :class="headerRowClass" :style="{ gridTemplateColumns: gridTemplate }">
      <span v-for="col in columns" :key="col.key" :class="col.align === 'right' ? 'text-right' : 'text-left'">
        {{ col.labelFr }}
      </span>
    </div>
    <p v-if="items.length === 0" class="px-1 py-6 text-center text-sm text-muted">Aucune ligne de facturation.</p>
    <div v-for="item in items" :key="item.id" :class="itemRowClass" :style="{ gridTemplateColumns: gridTemplate }">
      <template v-for="col in columns" :key="col.key">
        <div v-if="col.key === 'description'" class="rich-text-cell text-left text-ink break-words" v-html="descriptionHtml(item)"></div>
        <span v-else :class="col.align === 'right' ? 'text-right tabular-nums' : 'text-left text-ink'">
          {{ cellValue(item, col.key) }}
        </span>
      </template>
    </div>
  </div>
</template>

<style>
.rich-text-cell p {
  margin: 0;
}
.rich-text-cell p + p {
  margin-top: 0.25em;
}
.rich-text-cell ul,
.rich-text-cell ol {
  margin: 0;
  padding-left: 1.25em;
}
.rich-text-cell ul {
  list-style: disc;
}
.rich-text-cell ol {
  list-style: decimal;
}
</style>
