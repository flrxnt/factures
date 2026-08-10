import { ref } from 'vue'
import type { Invoice } from '../types/invoice'
import { getItem, setItem } from '../lib/storage'
import { MAX_HISTORY_ENTRIES } from '../config/defaults'

const HISTORY_KEY = 'flofactures:history:v1'

const history = ref<Invoice[]>(getItem<Invoice[]>(HISTORY_KEY, []))

function persist() {
  setItem(HISTORY_KEY, history.value)
}

function save(invoice: Invoice) {
  const index = history.value.findIndex((entry) => entry.id === invoice.id)
  const snapshot: Invoice = JSON.parse(JSON.stringify(invoice))
  snapshot.updatedAt = new Date().toISOString()

  if (index !== -1) {
    history.value[index] = snapshot
  } else {
    history.value.unshift(snapshot)
  }
  if (history.value.length > MAX_HISTORY_ENTRIES) {
    history.value = history.value.slice(0, MAX_HISTORY_ENTRIES)
  }
  persist()
}

function remove(id: string) {
  history.value = history.value.filter((entry) => entry.id !== id)
  persist()
}

/** Clones a history entry into a fresh, independent draft (new id/timestamps)
 * so editing it doesn't mutate the saved history entry. */
function cloneAsDraft(id: string): Invoice | null {
  const source = history.value.find((entry) => entry.id === id)
  if (!source) return null
  const clone: Invoice = JSON.parse(JSON.stringify(source))
  clone.id = crypto.randomUUID()
  clone.createdAt = new Date().toISOString()
  clone.updatedAt = clone.createdAt
  return clone
}

export function useInvoiceHistory() {
  return { history, save, remove, cloneAsDraft }
}
