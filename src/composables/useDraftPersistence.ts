import { watch } from 'vue'
import type { Invoice } from '../types/invoice'
import { getItem, setItem } from '../lib/storage'

const DRAFT_KEY = 'flofactures:draft:v1'
const AUTOSAVE_DELAY_MS = 400

export function loadDraft(): Invoice | null {
  return getItem<Invoice | null>(DRAFT_KEY, null)
}

export function saveDraft(invoice: Invoice): void {
  setItem(DRAFT_KEY, invoice)
}

/** Watches the invoice deeply and persists it to localStorage, debounced so
 * every keystroke doesn't trigger a synchronous write. */
export function useDraftAutosave(invoice: Invoice) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const stop = watch(
    invoice,
    () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => saveDraft(invoice), AUTOSAVE_DELAY_MS)
    },
    { deep: true },
  )

  return stop
}
