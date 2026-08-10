<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { computeTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  invoice: Invoice
}>()

defineEmits<{
  load: []
  remove: []
}>()

const totals = computeTotals(props.invoice.items, props.invoice.discount, props.invoice.visibleSections.discount)
</script>

<template>
  <li class="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5">
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-slate-900">
        {{ invoice.meta.invoiceNumber || 'Sans numéro' }} — {{ invoice.client.name || 'Client sans nom' }}
      </p>
      <p class="text-xs text-slate-500">
        {{ invoice.meta.issueDate }} · {{ formatCurrency(totals.grandTotal, invoice.meta.currency, invoice.meta.locale) }}
      </p>
    </div>
    <div class="flex shrink-0 gap-2">
      <BaseButton variant="secondary" @click="$emit('load')">Charger</BaseButton>
      <BaseButton variant="danger" @click="$emit('remove')">Supprimer</BaseButton>
    </div>
  </li>
</template>
