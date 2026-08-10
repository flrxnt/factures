<script setup lang="ts">
import { ref } from 'vue'
import { useInvoiceCollection } from '../../composables/useInvoiceCollection'
import { getItem, setItem } from '../../lib/storage'
import InvoiceCard from './InvoiceCard.vue'
import InvoiceListRow from './InvoiceListRow.vue'
import NewInvoiceCard from './NewInvoiceCard.vue'
import ViewModeToggle from './ViewModeToggle.vue'
import BaseButton from '../ui/BaseButton.vue'

const emit = defineEmits<{
  create: []
  open: [id: string]
}>()

const { invoices, remove, rename } = useInvoiceCollection()

const VIEW_MODE_KEY = 'flofactures:dashboard-view-mode:v1'
const viewMode = ref<'grid' | 'list'>(getItem<'grid' | 'list'>(VIEW_MODE_KEY, 'grid'))
function setViewMode(mode: 'grid' | 'list') {
  viewMode.value = mode
  setItem(VIEW_MODE_KEY, mode)
}

function handleRemove(id: string, name: string) {
  if (confirm(`Supprimer « ${name || 'cette facture'} » ? Cette action est irréversible.`)) {
    remove(id)
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div class="mb-6 flex items-center justify-between gap-4">
      <h2 class="font-display text-2xl text-ink">Mes factures</h2>
      <div class="flex items-center gap-3">
        <ViewModeToggle v-if="invoices.length > 0" :model-value="viewMode" @update:model-value="setViewMode" />
        <BaseButton variant="primary" @click="emit('create')">+ Nouvelle facture</BaseButton>
      </div>
    </div>

    <p v-if="invoices.length === 0" class="rounded-2xl border border-dashed border-hairline-strong py-16 text-center text-sm text-muted">
      Aucune facture pour le moment. Créez-en une pour commencer.
    </p>

    <div v-else-if="viewMode === 'grid'" class="flex flex-wrap gap-5">
      <NewInvoiceCard @click="emit('create')" />
      <InvoiceCard
        v-for="invoice in invoices"
        :key="invoice.id"
        :invoice="invoice"
        @open="emit('open', invoice.id)"
        @rename="(name) => rename(invoice.id, name)"
        @remove="handleRemove(invoice.id, invoice.name)"
      />
    </div>

    <ul v-else class="overflow-hidden rounded-xl border border-hairline">
      <InvoiceListRow
        v-for="invoice in invoices"
        :key="invoice.id"
        :invoice="invoice"
        @open="emit('open', invoice.id)"
        @rename="(name) => rename(invoice.id, name)"
        @remove="handleRemove(invoice.id, invoice.name)"
      />
    </ul>
  </div>
</template>
