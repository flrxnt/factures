<script setup lang="ts">
import { computed } from 'vue'
import { useInvoiceStore } from './composables/useInvoiceStore'
import { useInvoiceCollection } from './composables/useInvoiceCollection'
import { useAppNavigation } from './composables/useAppNavigation'
import { usePdfExport } from './composables/usePdfExport'
import AppHeader from './components/layout/AppHeader.vue'
import TwoPaneLayout from './components/layout/TwoPaneLayout.vue'
import InvoiceForm from './components/form/InvoiceForm.vue'
import InvoicePreview from './components/preview/InvoicePreview.vue'
import DashboardView from './components/dashboard/DashboardView.vue'

const { invoice, replaceInvoice } = useInvoiceStore()
const { create, cloneForEditing, useAutosave } = useInvoiceCollection()
const { view, openDashboard, openEditor } = useAppNavigation()
const { exportPdf } = usePdfExport()

// The store's `invoice` object identity never changes (replaceInvoice mutates
// it in place), so a single autosave watcher set up once here keeps working
// across every invoice the user opens during the session.
useAutosave(invoice)

const invoiceName = computed(() => invoice.name)

function handleCreate() {
  const draft = create()
  replaceInvoice(draft)
  openEditor(draft.id)
}

function handleOpen(id: string) {
  const clone = cloneForEditing(id)
  if (!clone) return
  replaceInvoice(clone)
  openEditor(id)
}

function handleRename(name: string) {
  invoice.name = name
}
</script>

<template>
  <div class="min-h-screen bg-paper font-sans text-ink">
    <AppHeader :view="view" :invoice-name="invoiceName" @back="openDashboard" @rename="handleRename" @export="exportPdf(invoice)" />

    <DashboardView v-if="view === 'dashboard'" @create="handleCreate" @open="handleOpen" />

    <TwoPaneLayout v-else>
      <template #form>
        <InvoiceForm :invoice="invoice" />
      </template>
      <template #preview>
        <InvoicePreview :invoice="invoice" />
      </template>
    </TwoPaneLayout>
  </div>
</template>
