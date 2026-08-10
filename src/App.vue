<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useInvoiceStore } from './composables/useInvoiceStore'
import { loadDraft, useDraftAutosave } from './composables/useDraftPersistence'
import { useInvoiceHistory } from './composables/useInvoiceHistory'
import { usePdfExport } from './composables/usePdfExport'
import AppHeader from './components/layout/AppHeader.vue'
import TwoPaneLayout from './components/layout/TwoPaneLayout.vue'
import InvoiceForm from './components/form/InvoiceForm.vue'
import InvoicePreview from './components/preview/InvoicePreview.vue'
import InvoiceHistoryDrawer from './components/history/InvoiceHistoryDrawer.vue'

const { invoice, replaceInvoice, resetToNew } = useInvoiceStore()
const { cloneAsDraft } = useInvoiceHistory()
const { exportPdf } = usePdfExport()

const historyOpen = ref(false)

onMounted(() => {
  const draft = loadDraft()
  if (draft) replaceInvoice(draft)
})

const stopAutosave = useDraftAutosave(invoice)
onUnmounted(stopAutosave)

function handleNew() {
  if (confirm('Repartir sur une facture vierge ? Le brouillon actuel sera remplacé.')) {
    resetToNew()
  }
}

function handleLoadFromHistory(id: string) {
  const draft = cloneAsDraft(id)
  if (draft) replaceInvoice(draft)
  historyOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <AppHeader @new="handleNew" @history="historyOpen = true" @export="exportPdf(invoice)" />

    <TwoPaneLayout>
      <template #form>
        <InvoiceForm :invoice="invoice" />
      </template>
      <template #preview>
        <InvoicePreview :invoice="invoice" />
      </template>
    </TwoPaneLayout>

    <InvoiceHistoryDrawer :open="historyOpen" @close="historyOpen = false" @load="handleLoadFromHistory" />
  </div>
</template>
