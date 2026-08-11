<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceTotals } from '../../lib/calculations'
import type { InvoiceTemplate } from '../../types/invoice'
import { formatCurrency } from '../../composables/useCurrencyFormat'

const props = defineProps<{
  totals: InvoiceTotals
  showDiscount: boolean
  showWithholding: boolean
  currency: string
  locale: string
  template: InvoiceTemplate
}>()

/** Only actually shifts emphasis to "Net à payer" once withholding is both
 * toggled on AND has a non-zero effect — a 0% rate shouldn't leave the
 * totals block with no emphasized final line at all. */
const withholdingActive = computed(() => props.showWithholding && props.totals.withholdingAmount > 0)

/** A 0% tax group (the default for new lines) contributes nothing to the
 * total — showing "TVA 0% : 0" would just be noise. */
const visibleTaxGroups = computed(() => props.totals.taxGroups.filter((group) => group.rate > 0))

/** Styling for whichever line is the final/emphasized one (Total, or Net à
 * payer when withholding is active) — kept as one computed so both spots in
 * the template stay visually consistent with each other. */
const finalLine = computed(() => {
  if (props.template === 'minimal') {
    return {
      wrapper: 'mt-3 flex items-center justify-between gap-2',
      label: 'flex items-center gap-2 text-sm font-semibold tracking-wide text-ink uppercase',
      value: 'font-sans text-base font-semibold text-ink tabular-nums',
      dot: true,
    }
  }
  if (props.template === 'bold') {
    return {
      wrapper: 'mt-3 flex items-center justify-between gap-2',
      label: 'text-sm font-bold text-ink uppercase',
      value: 'rounded-full bg-accent px-3.5 py-1.5 font-sans text-sm font-bold text-paper tabular-nums',
      dot: false,
    }
  }
  return {
    wrapper: 'mt-2 flex justify-between border-t border-hairline-strong pt-3',
    label: 'font-display text-lg text-ink',
    value: 'font-display text-lg text-accent tabular-nums',
    dot: false,
  }
})
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
    <div v-for="group in visibleTaxGroups" :key="group.rate" class="flex justify-between text-ink-soft">
      <span>TVA {{ group.rate }}%</span>
      <span class="tabular-nums">{{ formatCurrency(group.amount, currency, locale) }}</span>
    </div>

    <div v-if="!withholdingActive" :class="finalLine.wrapper">
      <span :class="finalLine.label"><span v-if="finalLine.dot" class="h-1.5 w-1.5 bg-accent"></span>Total</span>
      <span :class="finalLine.value">{{ formatCurrency(totals.grandTotal, currency, locale) }}</span>
    </div>
    <div v-else class="mt-2 flex justify-between border-t border-hairline pt-3 text-ink-soft">
      <span>Total</span>
      <span class="tabular-nums">{{ formatCurrency(totals.grandTotal, currency, locale) }}</span>
    </div>

    <template v-if="withholdingActive">
      <div class="flex justify-between text-ink-soft">
        <span>Retenue {{ totals.withholdingRatePercent }}%</span>
        <span class="tabular-nums">-{{ formatCurrency(totals.withholdingAmount, currency, locale) }}</span>
      </div>
      <div :class="finalLine.wrapper">
        <span :class="finalLine.label"><span v-if="finalLine.dot" class="h-1.5 w-1.5 bg-accent"></span>Net à payer</span>
        <span :class="finalLine.value">{{ formatCurrency(totals.netPayable, currency, locale) }}</span>
      </div>
    </template>
  </div>
</template>
