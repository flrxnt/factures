<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Invoice, InvoiceStatus } from '../../types/invoice'
import { computeInvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { UNTITLED_INVOICE_NAME } from '../../config/defaults'
import StatusSelect from '../ui/StatusSelect.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const emit = defineEmits<{
  open: []
  rename: [name: string]
  duplicate: []
  remove: []
  'status-change': [status: InvoiceStatus]
}>()

const totals = computed(() => computeInvoiceTotals(props.invoice))

const renaming = ref(false)
const nameDraft = ref('')

function startRename(event: Event) {
  event.stopPropagation()
  nameDraft.value = props.invoice.name
  renaming.value = true
}

function commitRename() {
  renaming.value = false
  const trimmed = nameDraft.value.trim()
  if (trimmed && trimmed !== props.invoice.name) emit('rename', trimmed)
}
</script>

<template>
  <li
    class="group flex cursor-pointer items-center justify-between gap-4 border-b border-hairline px-3 py-3 transition last:border-b-0 hover:bg-paper-dim/60"
    @click="$emit('open')"
  >
    <div class="min-w-0 flex-1">
      <input
        v-if="renaming"
        v-model="nameDraft"
        type="text"
        autofocus
        class="w-full max-w-xs border-0 border-b border-accent bg-transparent text-sm font-medium text-ink outline-none"
        @click.stop
        @keydown.enter="commitRename"
        @keydown.esc="renaming = false"
        @blur="commitRename"
      />
      <p v-else class="truncate text-sm font-medium text-ink">{{ invoice.name || UNTITLED_INVOICE_NAME }}</p>
      <p class="truncate text-xs text-muted">{{ invoice.client.name || 'Sans client' }} · {{ invoice.meta.issueDate }}</p>
    </div>
    <StatusSelect :model-value="invoice.status" @update:model-value="(status) => emit('status-change', status)" />
    <p class="shrink-0 text-sm tabular-nums text-ink-soft">{{ formatCurrency(totals.netPayable, invoice.meta.currency, invoice.meta.locale) }}</p>
    <div class="flex shrink-0 gap-2 opacity-0 transition group-hover:opacity-100">
      <button type="button" title="Renommer" class="text-muted hover:text-ink" @click="startRename">✎</button>
      <button type="button" title="Dupliquer" class="text-muted hover:text-ink" @click.stop="$emit('duplicate')">⧉</button>
      <button type="button" title="Supprimer" class="text-muted hover:text-accent-dark" @click.stop="$emit('remove')">✕</button>
    </div>
  </li>
</template>
