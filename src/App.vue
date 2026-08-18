<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import type { DocumentType, InvoiceStatus } from './types/invoice'
import { useInvoiceStore } from './composables/useInvoiceStore'
import { useInvoiceCollection } from './composables/useInvoiceCollection'
import { useAppNavigation } from './composables/useAppNavigation'
import { usePdfExport } from './composables/usePdfExport'
import { useUndoHistory } from './composables/useUndoHistory'
import { useAppTheme } from './composables/useAppTheme'
import { useEmailCompose } from './composables/useEmailCompose'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import TwoPaneLayout from './components/layout/TwoPaneLayout.vue'
import InvoiceForm from './components/form/InvoiceForm.vue'
import InvoicePreview from './components/preview/InvoicePreview.vue'
import DashboardView from './components/dashboard/DashboardView.vue'
import SettingsView from './components/settings/SettingsView.vue'
import CatalogView from './components/catalog/CatalogView.vue'
import StockView from './components/stock/StockView.vue'
import ExpensesView from './components/expenses/ExpensesView.vue'
import AppDialog from './components/ui/AppDialog.vue'
import EmailComposeDialog from './components/ui/EmailComposeDialog.vue'

const isTauriEnv = isTauri()

const { invoice, replaceInvoice } = useInvoiceStore()
const { create, cloneForEditing, useAutosave } = useInvoiceCollection()
const { view, openDashboard, openEditor, openSettings, openCatalog, openStock, openExpenses } = useAppNavigation()
const { exportPdf } = usePdfExport()
const { undo, redo, reset: resetUndoHistory, canUndo, canRedo } = useUndoHistory(invoice)
const { start: startTheme, stop: stopTheme } = useAppTheme()
const { openCompose } = useEmailCompose()

// The store's `invoice` object identity never changes (replaceInvoice mutates
// it in place), so a single autosave watcher set up once here keeps working
// across every invoice the user opens during the session.
useAutosave(invoice)

const invoiceName = computed(() => invoice.name)
const invoiceStatus = computed(() => invoice.status)

function handleCreate(docType: DocumentType = 'invoice') {
  const draft = create(docType)
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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startTheme()
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  stopTheme()
})
</script>

<template>
  <div class="flex min-h-screen bg-paper font-sans text-ink">
    <AppSidebar
      :view="view"
      :is-tauri-env="isTauriEnv"
      @open-dashboard="openDashboard"
      @open-catalog="openCatalog"
      @open-stock="openStock"
      @open-expenses="openExpenses"
      @open-settings="openSettings"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader
        v-if="view === 'editor'"
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
        @send-email="openCompose(invoice)"
      />

      <Transition name="view-fade" mode="out-in">
        <DashboardView v-if="view === 'dashboard'" key="dashboard" @create="handleCreate" @open="handleOpen" />

        <SettingsView v-else-if="view === 'settings'" key="settings" />

        <CatalogView v-else-if="view === 'catalog'" key="catalog" />

        <StockView v-else-if="view === 'stock'" key="stock" />

        <ExpensesView v-else-if="view === 'expenses'" key="expenses" />

        <TwoPaneLayout v-else key="editor">
          <template #form>
            <InvoiceForm :invoice="invoice" />
          </template>
          <template #preview>
            <InvoicePreview :invoice="invoice" />
          </template>
        </TwoPaneLayout>
      </Transition>

      <AppDialog />
      <EmailComposeDialog />
    </div>
  </div>
</template>
