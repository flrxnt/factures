<script setup lang="ts">
import type { InvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'

defineProps<{
  totals: InvoiceTotals
  showDiscount: boolean
  currency: string
  locale: string
}>()
</script>

<template>
  <div class="ml-auto w-full max-w-xs space-y-1.5 text-sm">
    <div class="flex justify-between text-slate-600">
      <span>Sous-total</span>
      <span class="tabular-nums">{{ formatCurrency(totals.subtotal, currency, locale) }}</span>
    </div>
    <div v-if="showDiscount && totals.discountAmount > 0" class="flex justify-between text-slate-600">
      <span>Remise</span>
      <span class="tabular-nums">-{{ formatCurrency(totals.discountAmount, currency, locale) }}</span>
    </div>
    <div v-for="group in totals.taxGroups" :key="group.rate" class="flex justify-between text-slate-600">
      <span>TVA {{ group.rate }}%</span>
      <span class="tabular-nums">{{ formatCurrency(group.amount, currency, locale) }}</span>
    </div>
    <div class="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
      <span>Total</span>
      <span class="tabular-nums">{{ formatCurrency(totals.grandTotal, currency, locale) }}</span>
    </div>
  </div>
</template>
