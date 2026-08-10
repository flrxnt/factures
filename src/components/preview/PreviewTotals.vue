<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'

const props = defineProps<{
  totals: InvoiceTotals
  showDiscount: boolean
  showWithholding: boolean
  currency: string
  locale: string
}>()

/** Only actually shifts emphasis to "Net à payer" once withholding is both
 * toggled on AND has a non-zero effect — a 0% rate shouldn't leave the
 * totals block with no emphasized final line at all. */
const withholdingActive = computed(() => props.showWithholding && props.totals.withholdingAmount > 0)
</script>

<template>
  <div class="ml-auto w-full max-w-xs space-y-1.5 text-sm">
    <div class="flex justify-between text-ink-soft">
      <span>Sous-total</span>
      <span class="tabular-nums">{{ formatCurrency(totals.subtotal, currency, locale) }}</span>
    </div>
    <div v-if="showDiscount && totals.discountAmount > 0" class="flex justify-between text-ink-soft">
      <span>Remise</span>
      <span class="tabular-nums">-{{ formatCurrency(totals.discountAmount, currency, locale) }}</span>
    </div>
    <div v-for="group in totals.taxGroups" :key="group.rate" class="flex justify-between text-ink-soft">
      <span>TVA {{ group.rate }}%</span>
      <span class="tabular-nums">{{ formatCurrency(group.amount, currency, locale) }}</span>
    </div>

    <div class="flex justify-between pt-3" :class="withholdingActive ? 'mt-2 border-t border-hairline text-ink-soft' : 'mt-2 border-t border-hairline-strong'">
      <span :class="withholdingActive ? 'text-sm' : 'font-display text-lg text-ink'">Total</span>
      <span class="tabular-nums" :class="withholdingActive ? 'text-sm' : 'font-display text-lg text-accent'">
        {{ formatCurrency(totals.grandTotal, currency, locale) }}
      </span>
    </div>

    <template v-if="withholdingActive">
      <div class="flex justify-between text-ink-soft">
        <span>Retenue {{ totals.withholdingRatePercent }}%</span>
        <span class="tabular-nums">-{{ formatCurrency(totals.withholdingAmount, currency, locale) }}</span>
      </div>
      <div class="mt-2 flex justify-between border-t border-hairline-strong pt-3">
        <span class="font-display text-lg text-ink">Net à payer</span>
        <span class="font-display text-lg text-accent tabular-nums">{{ formatCurrency(totals.netPayable, currency, locale) }}</span>
      </div>
    </template>
  </div>
</template>
