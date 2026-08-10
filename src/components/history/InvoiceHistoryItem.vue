<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import { computeInvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  invoice: Invoice
}>()

defineEmits<{
  load: []
  remove: []
}>()

const totals = computeInvoiceTotals(props.invoice)
</script>

<template>
  <li class="flex items-center justify-between gap-3 rounded-md border border-hairline px-3 py-2.5">
    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-ink">
        {{ invoice.meta.invoiceNumber || 'Sans numéro' }} — {{ invoice.client.name || 'Client sans nom' }}
      </p>
      <p class="text-xs text-muted">
        {{ invoice.meta.issueDate }} · {{ formatCurrency(totals.grandTotal, invoice.meta.currency, invoice.meta.locale) }}
      </p>
    </div>
    <div class="flex shrink-0 gap-2">
      <BaseButton variant="secondary" @click="$emit('load')">Charger</BaseButton>
      <BaseButton variant="danger" @click="$emit('remove')">Supprimer</BaseButton>
    </div>
  </li>
</template>
