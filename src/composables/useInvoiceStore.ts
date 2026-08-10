import { reactive } from 'vue'
import type { Invoice } from '../types/invoice'
import { createEmptyInvoice } from '../config/defaults'

const invoice = reactive<Invoice>(createEmptyInvoice())

function replaceInvoice(next: Invoice) {
  Object.assign(invoice, next)
}

function resetToNew() {
  replaceInvoice(createEmptyInvoice())
}

/** Reactive singleton: the app has a single cohesive piece of state (the
 * current draft invoice), so a plain exported reactive object is enough —
 * no need for a Pinia store. */
export function useInvoiceStore() {
  return { invoice, replaceInvoice, resetToNew }
}
