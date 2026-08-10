<script setup lang="ts">
import { computed } from 'vue'
import type { Invoice } from '../../types/invoice'
import { hasLineAmounts, roundCurrency } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import BaseInput from '../ui/BaseInput.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const locked = computed(() => hasLineAmounts(props.invoice.items))

const subtotalModel = computed({
  get: () => props.invoice.manualSubtotal ?? 0,
  set: (value: number) => {
    props.invoice.manualSubtotal = Number.isFinite(value) ? value : 0
  },
})

const totalModel = computed({
  get: () => {
    const rate = props.invoice.meta.defaultTaxRatePercent
    return roundCurrency((props.invoice.manualSubtotal ?? 0) * (1 + rate / 100))
  },
  set: (value: number) => {
    const rate = props.invoice.meta.defaultTaxRatePercent
    const safeValue = Number.isFinite(value) ? value : 0
    props.invoice.manualSubtotal = roundCurrency(safeValue / (1 + rate / 100))
  },
})
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="font-display text-lg text-ink">Sous-total / Total</legend>

    <p v-if="locked" class="text-sm text-muted">
      Calculés automatiquement à partir des lignes de facturation ci-dessus.
    </p>
    <template v-if="locked">
      <div class="grid grid-cols-2 gap-4 opacity-60">
        <div>
          <p class="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Sous-total</p>
          <p class="border-b border-hairline-strong py-1.5 text-sm text-ink">
            {{ formatCurrency(subtotalModel, invoice.meta.currency, invoice.meta.locale) }}
          </p>
        </div>
        <div>
          <p class="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Total</p>
          <p class="border-b border-hairline-strong py-1.5 text-sm text-ink">
            {{ formatCurrency(totalModel, invoice.meta.currency, invoice.meta.locale) }}
          </p>
        </div>
      </div>
    </template>
    <template v-else>
      <p class="text-sm text-muted">
        Aucune ligne chiffrée : saisissez directement un sous-total ou un total, l'autre se calcule avec le taux de TVA ({{ invoice.meta.defaultTaxRatePercent }}%).
      </p>
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model.number="subtotalModel" type="number" label="Sous-total" placeholder="0" />
        <BaseInput v-model.number="totalModel" type="number" label="Total" placeholder="0" />
      </div>
    </template>
  </fieldset>
</template>
