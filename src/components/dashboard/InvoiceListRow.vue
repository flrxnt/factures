<script setup lang="ts">
import { computed, ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { Pencil, Copy, Mail, Trash2, ArrowRightLeft } from '@lucide/vue'
import type { Invoice, InvoiceStatus } from '../../types/invoice'
import { computeInvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { UNTITLED_INVOICE_NAME } from '../../config/defaults'
import { getDocumentLabel } from '../../config/documentTypes'
import StatusSelect from '../ui/StatusSelect.vue'
import ActionsMenu from '../ui/ActionsMenu.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const emit = defineEmits<{
  open: []
  rename: [name: string]
  duplicate: []
  remove: []
  'send-email': []
  'transform-to-invoice': []
  'status-change': [status: InvoiceStatus]
}>()

const isTauriEnv = isTauri()

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
      <p v-else class="flex items-center gap-2 truncate text-sm font-medium text-ink">
        {{ invoice.name || UNTITLED_INVOICE_NAME }}
        <span
          v-if="invoice.docType !== 'invoice'"
          class="shrink-0 rounded-full border border-hairline-strong px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted uppercase"
        >
          {{ getDocumentLabel(invoice) }}
        </span>
      </p>
      <p class="truncate text-xs text-muted">{{ invoice.client.name || 'Sans client' }} · {{ invoice.meta.issueDate }}</p>
    </div>
    <StatusSelect :model-value="invoice.status" @update:model-value="(status) => emit('status-change', status)" />
    <p class="shrink-0 text-sm tabular-nums text-ink-soft">{{ formatCurrency(totals.netPayable, invoice.meta.currency, invoice.meta.locale) }}</p>
    <div class="opacity-0 transition group-hover:opacity-100">
      <ActionsMenu>
        <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim" @click="startRename">
          <Pencil class="h-4 w-4" /> Renommer
        </button>
        <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim" @click.stop="$emit('duplicate')">
          <Copy class="h-4 w-4" /> Dupliquer
        </button>
        <button
          v-if="isTauriEnv"
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim"
          @click.stop="$emit('send-email')"
        >
          <Mail class="h-4 w-4" /> Envoyer par e-mail
        </button>
        <button
          v-if="isTauriEnv && invoice.docType === 'quote'"
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-paper-dim"
          @click.stop="$emit('transform-to-invoice')"
        >
          <ArrowRightLeft class="h-4 w-4" /> Transformer en facture
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-accent-dark hover:bg-paper-dim"
          @click.stop="$emit('remove')"
        >
          <Trash2 class="h-4 w-4" /> Supprimer
        </button>
      </ActionsMenu>
    </div>
  </li>
</template>
