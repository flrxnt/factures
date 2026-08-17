<script setup lang="ts">
import { computed, ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { Pencil, Copy, Mail, Trash2, ArrowRightLeft } from '@lucide/vue'
import type { Invoice, InvoiceStatus } from '../../types/invoice'
import { computeInvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { UNTITLED_INVOICE_NAME } from '../../config/defaults'
import InvoicePreview from '../preview/InvoicePreview.vue'
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

// Cards are a fixed width (see the `w-[200px]` on the root element below) so
// this scale factor reliably matches the actual rendered size — a fluid
// (percentage-based) card width would drift out of sync with a fixed-px
// CSS transform and either leave gaps or crop the thumbnail.
const PREVIEW_NATIVE_WIDTH = 794
const CARD_WIDTH = 200
const thumbnailScale = CARD_WIDTH / PREVIEW_NATIVE_WIDTH

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
  <div
    class="group w-[200px] cursor-pointer overflow-hidden rounded-2xl border border-hairline bg-surface transition hover:border-hairline-strong hover:shadow-[0_2px_10px_rgba(28,26,20,0.06)]"
    @click="$emit('open')"
  >
    <div class="relative aspect-[210/297] overflow-hidden border-b border-hairline bg-paper-dim">
      <div
        class="pointer-events-none absolute top-0 left-0 origin-top-left"
        :style="{ width: `${PREVIEW_NATIVE_WIDTH}px`, transform: `scale(${thumbnailScale})` }"
      >
        <InvoicePreview :invoice="invoice" />
      </div>
      <div class="absolute top-2 left-2 bg-surface/95 backdrop-blur-sm rounded-full">
        <StatusSelect :model-value="invoice.status" @update:model-value="(status) => emit('status-change', status)" />
      </div>
    </div>
    <div class="space-y-1 p-3">
      <div class="flex items-start justify-between gap-2">
        <input
          v-if="renaming"
          v-model="nameDraft"
          type="text"
          autofocus
          class="min-w-0 flex-1 border-0 border-b border-accent bg-transparent text-sm font-medium text-ink outline-none"
          @click.stop
          @keydown.enter="commitRename"
          @keydown.esc="renaming = false"
          @blur="commitRename"
        />
        <p v-else class="min-w-0 flex-1 truncate text-sm font-medium text-ink">{{ invoice.name || UNTITLED_INVOICE_NAME }}</p>
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
      </div>
      <p class="truncate text-xs text-muted">
        {{ invoice.client.name || 'Sans client' }} · {{ formatCurrency(totals.netPayable, invoice.meta.currency, invoice.meta.locale) }}
      </p>
    </div>
  </div>
</template>
