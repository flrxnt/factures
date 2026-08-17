import { ref } from 'vue'

export type AppView = 'dashboard' | 'editor' | 'settings' | 'catalog'

const view = ref<AppView>('dashboard')
const activeInvoiceId = ref<string | null>(null)

function openDashboard() {
  view.value = 'dashboard'
  activeInvoiceId.value = null
}

function openEditor(invoiceId: string) {
  activeInvoiceId.value = invoiceId
  view.value = 'editor'
}

function openSettings() {
  view.value = 'settings'
  activeInvoiceId.value = null
}

function openCatalog() {
  view.value = 'catalog'
  activeInvoiceId.value = null
}

/** Reactive singleton: a single global "which screen / which invoice" state
 * is enough for this app's views — no need for a router. */
export function useAppNavigation() {
  return { view, activeInvoiceId, openDashboard, openEditor, openSettings, openCatalog }
}
