<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { InvoiceStatus } from './types/invoice'
import { useInvoiceStore } from './composables/useInvoiceStore'
import { useInvoiceCollection } from './composables/useInvoiceCollection'
import { useAppNavigation } from './composables/useAppNavigation'
import { usePdfExport } from './composables/usePdfExport'
import { useUndoHistory } from './composables/useUndoHistory'
import AppHeader from './components/layout/AppHeader.vue'
import TwoPaneLayout from './components/layout/TwoPaneLayout.vue'
import InvoiceForm from './components/form/InvoiceForm.vue'
import InvoicePreview from './components/preview/InvoicePreview.vue'
import DashboardView from './components/dashboard/DashboardView.vue'

const { invoice, replaceInvoice } = useInvoiceStore()
const { create, cloneForEditing, useAutosave } = useInvoiceCollection()
const { view, openDashboard, openEditor } = useAppNavigation()
const { exportPdf } = usePdfExport()
const { undo, redo, reset: resetUndoHistory, canUndo, canRedo } = useUndoHistory(invoice)

// The store's `invoice` object identity never changes (replaceInvoice mutates
// it in place), so a single autosave watcher set up once here keeps working
// across every invoice the user opens during the session.
useAutosave(invoice)

const invoiceName = computed(() => invoice.name)
const invoiceStatus = computed(() => invoice.status)

function handleCreate() {
  const draft = create()
  replaceInvoice(draft)
  resetUndoHistory()
  openEditor(draft.id)
}

function handleOpen(id: string) {
  const clone = cloneForEditing(id)
  if (!clone) return
  replaceInvoice(clone)
  resetUndoHistory()
  openEditor(id)
}

function handleRename(name: string) {
  invoice.name = name
}

function handleStatusChange(status: InvoiceStatus) {
  invoice.status = status
}

// Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z (or Ctrl+Y) for undo/redo — but only when
// focus isn't inside a text field, so the browser's native per-field undo
// (e.g. undoing a typo mid-word) isn't hijacked by our app-level history.
function isEditableElement(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}

function handleKeydown(event: KeyboardEvent) {
  if (view.value !== 'editor') return
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
  if (isEditableElement(event.target)) return
  event.preventDefault()
  if (event.shiftKey) redo()
  else undo()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="min-h-screen bg-paper font-sans text-ink">
    <AppHeader
      :view="view"
      :invoice-name="invoiceName"
      :invoice-status="invoiceStatus"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @back="openDashboard"
      @rename="handleRename"
      @status-change="handleStatusChange"
      @undo="undo"
      @redo="redo"
      @export="exportPdf(invoice)"
    />

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
