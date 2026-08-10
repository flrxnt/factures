<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'

const props = defineProps<{
  invoice: Invoice
  showDueDate: boolean
  showTaxRate: boolean
}>()

const COMMON_CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GBP', 'CAD', 'MAD', 'NGN']

function applyTaxRateToAllLines() {
  const rate = props.invoice.meta.defaultTaxRatePercent
  for (const item of props.invoice.items) item.taxRatePercent = rate
}
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Informations de facture</legend>
    <BaseInput v-model="invoice.meta.invoiceNumber" label="Numéro de facture" placeholder="FAC-2026-001" required />
    <div class="grid gap-4" :class="showDueDate ? 'grid-cols-3' : 'grid-cols-2'">
      <BaseInput v-model="invoice.meta.issueDate" type="date" label="Date d'émission" />
      <BaseInput v-if="showDueDate" v-model="invoice.meta.dueDate" type="date" label="Date d'échéance" />
      <label class="block">
        <span class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">Devise</span>
        <input
          v-model="invoice.meta.currency"
          list="currency-options"
          class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink uppercase outline-none transition focus:border-accent"
          placeholder="XOF"
        />
        <datalist id="currency-options">
          <option v-for="code in COMMON_CURRENCIES" :key="code" :value="code" />
        </datalist>
      </label>
    </div>

    <div v-if="showTaxRate" class="flex items-end gap-3">
      <div class="w-32">
        <BaseInput v-model.number="invoice.meta.defaultTaxRatePercent" type="number" label="Taux de TVA (%)" placeholder="0" />
      </div>
      <button
        type="button"
        class="mb-1.5 text-xs font-medium tracking-wide text-accent uppercase hover:text-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="invoice.items.length === 0"
        @click="applyTaxRateToAllLines"
      >
        Appliquer à toutes les lignes
      </button>
    </div>
  </fieldset>
</template>
