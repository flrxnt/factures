<script setup lang="ts">
import type { InvoiceMeta } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'

defineProps<{
  meta: InvoiceMeta
  showDueDate: boolean
}>()

const COMMON_CURRENCIES = ['XOF', 'XAF', 'EUR', 'USD', 'GBP', 'CAD', 'MAD', 'NGN']
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="text-base font-semibold text-slate-900">Informations de facture</legend>
    <BaseInput v-model="meta.invoiceNumber" label="Numéro de facture" placeholder="FAC-2026-001" required />
    <div class="grid gap-3" :class="showDueDate ? 'grid-cols-3' : 'grid-cols-2'">
      <BaseInput v-model="meta.issueDate" type="date" label="Date d'émission" />
      <BaseInput v-if="showDueDate" v-model="meta.dueDate" type="date" label="Date d'échéance" />
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Devise</span>
        <input
          v-model="meta.currency"
          list="currency-options"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 uppercase shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="XOF"
        />
        <datalist id="currency-options">
          <option v-for="code in COMMON_CURRENCIES" :key="code" :value="code" />
        </datalist>
      </label>
    </div>
  </fieldset>
</template>
