<script setup lang="ts">
import type { LineItem } from '../../types/invoice'
import { lineTotal } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'

const props = defineProps<{
  item: LineItem
  showTaxColumn: boolean
  currency: string
  locale: string
}>()

defineEmits<{
  remove: []
}>()
</script>

<template>
  <div class="grid items-start gap-2" :class="showTaxColumn ? 'grid-cols-[1fr_5rem_7rem_5rem_7rem_2rem]' : 'grid-cols-[1fr_5rem_7rem_7rem_2rem]'">
    <input
      v-model="item.description"
      type="text"
      placeholder="Description de la prestation"
      class="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
    <input
      v-model.number="item.quantity"
      type="number"
      min="0"
      step="1"
      class="rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
    <input
      v-model.number="item.unitPrice"
      type="number"
      min="0"
      step="0.01"
      class="rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
    <input
      v-if="showTaxColumn"
      v-model.number="item.taxRatePercent"
      type="number"
      min="0"
      step="0.5"
      class="rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
    <div class="flex items-center justify-end px-1 text-sm text-slate-700 tabular-nums">
      {{ formatCurrency(lineTotal(props.item), currency, locale) }}
    </div>
    <button type="button" class="text-slate-400 hover:text-red-600" title="Supprimer la ligne" @click="$emit('remove')">
      ✕
    </button>
  </div>
</template>
