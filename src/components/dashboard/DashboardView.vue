<script setup lang="ts">
import { computed, ref } from 'vue'
import type { InvoiceStatus } from '../../types/invoice'
import { useInvoiceCollection } from '../../composables/useInvoiceCollection'
import { getItem, setItem } from '../../lib/storage'
import { STATUS_ORDER, getStatusDescriptor } from '../../config/statuses'
import { exportInvoicesAsCsv, exportInvoicesAsJson } from '../../lib/exportData'
import InvoiceCard from './InvoiceCard.vue'
import InvoiceListRow from './InvoiceListRow.vue'
import NewInvoiceCard from './NewInvoiceCard.vue'
import ViewModeToggle from './ViewModeToggle.vue'
import BaseButton from '../ui/BaseButton.vue'

const emit = defineEmits<{
  create: []
  open: [id: string]
}>()

const { invoices, remove, rename, duplicate, setStatus, importInvoices } = useInvoiceCollection()

const importInputRef = ref<HTMLInputElement | null>(null)

function triggerImport() {
  importInputRef.value?.click()
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-selecting the same file next time
  if (!file) return

  try {
    const payload = JSON.parse(await file.text())
    const { imported, skipped } = importInvoices(payload)
    if (imported === 0 && skipped === 0) {
      alert("Fichier invalide : aucune facture trouvée dans ce fichier JSON.")
    } else {
      const skippedNote = skipped > 0 ? ` (${skipped} ignorée${skipped > 1 ? 's' : ''}, format invalide)` : ''
      alert(`${imported} facture${imported > 1 ? 's' : ''} importée${imported > 1 ? 's' : ''}${skippedNote}.`)
    }
  } catch {
    alert("Fichier invalide : impossible de lire ce fichier JSON.")
  }
}

const VIEW_MODE_KEY = 'flofactures:dashboard-view-mode:v1'
const viewMode = ref<'grid' | 'list'>(getItem<'grid' | 'list'>(VIEW_MODE_KEY, 'grid'))
function setViewMode(mode: 'grid' | 'list') {
  viewMode.value = mode
  setItem(VIEW_MODE_KEY, mode)
}

const statusFilter = ref<InvoiceStatus | 'all'>('all')
const filteredInvoices = computed(() =>
  statusFilter.value === 'all' ? invoices.value : invoices.value.filter((invoice) => invoice.status === statusFilter.value),
)

function handleRemove(id: string, name: string) {
  if (confirm(`Supprimer « ${name || 'cette facture'} » ? Cette action est irréversible.`)) {
    remove(id)
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 class="font-display text-2xl text-ink">Mes factures</h2>
      <div class="flex items-center gap-3">
        <ViewModeToggle v-if="invoices.length > 0" :model-value="viewMode" @update:model-value="setViewMode" />
        <input ref="importInputRef" type="file" accept="application/json" class="hidden" @change="handleImportFile" />
        <BaseButton variant="secondary" @click="triggerImport">Importer (JSON)</BaseButton>
        <BaseButton variant="primary" @click="emit('create')">+ Nouvelle facture</BaseButton>
      </div>
    </div>

    <div v-if="invoices.length > 0" class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase transition"
          :class="statusFilter === 'all' ? 'border-ink bg-ink text-paper' : 'border-hairline-strong text-muted hover:text-ink'"
          @click="statusFilter = 'all'"
        >
          Tous ({{ invoices.length }})
        </button>
        <button
          v-for="status in STATUS_ORDER"
          :key="status.value"
          type="button"
          class="rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase transition"
          :style="statusFilter === status.value ? { borderColor: status.color, backgroundColor: status.color, color: '#fffdf8' } : { borderColor: status.color + '55', color: status.color }"
          @click="statusFilter = status.value"
        >
          {{ status.labelFr }} ({{ invoices.filter((i) => i.status === status.value).length }})
        </button>
      </div>
      <div class="flex gap-3 text-sm">
        <button type="button" class="text-muted hover:text-ink" @click="exportInvoicesAsJson(invoices)">Exporter (JSON)</button>
        <button type="button" class="text-muted hover:text-ink" @click="exportInvoicesAsCsv(invoices)">Exporter (CSV)</button>
      </div>
    </div>

    <p v-if="invoices.length === 0" class="rounded-2xl border border-dashed border-hairline-strong py-16 text-center text-sm text-muted">
      Aucune facture pour le moment. Créez-en une pour commencer.
    </p>
    <p
      v-else-if="filteredInvoices.length === 0"
      class="rounded-2xl border border-dashed border-hairline-strong py-16 text-center text-sm text-muted"
    >
      Aucune facture avec le statut « {{ getStatusDescriptor(statusFilter as InvoiceStatus).labelFr }} ».
    </p>

    <div v-else-if="viewMode === 'grid'" class="flex flex-wrap gap-5">
      <NewInvoiceCard v-if="statusFilter === 'all'" @click="emit('create')" />
      <InvoiceCard
        v-for="invoice in filteredInvoices"
        :key="invoice.id"
        :invoice="invoice"
        @open="emit('open', invoice.id)"
        @rename="(name) => rename(invoice.id, name)"
        @duplicate="duplicate(invoice.id)"
        @remove="handleRemove(invoice.id, invoice.name)"
        @status-change="(status) => setStatus(invoice.id, status)"
      />
    </div>

    <ul v-else class="overflow-hidden rounded-xl border border-hairline">
      <InvoiceListRow
        v-for="invoice in filteredInvoices"
        :key="invoice.id"
        :invoice="invoice"
        @open="emit('open', invoice.id)"
        @rename="(name) => rename(invoice.id, name)"
        @duplicate="duplicate(invoice.id)"
        @remove="handleRemove(invoice.id, invoice.name)"
        @status-change="(status) => setStatus(invoice.id, status)"
      />
    </ul>
  </div>
</template>
