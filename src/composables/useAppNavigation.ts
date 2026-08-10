import { ref } from 'vue'

export type AppView = 'dashboard' | 'editor'

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

/** Reactive singleton: a single global "which screen / which invoice" state
 * is enough for this app's two views — no need for a router. */
export function useAppNavigation() {
  return { view, activeInvoiceId, openDashboard, openEditor }
}
