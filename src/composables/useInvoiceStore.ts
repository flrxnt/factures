import { reactive } from 'vue'
import type { Invoice } from '../types/invoice'
import { createEmptyInvoice, createEmptyLineItem } from '../config/defaults'

const invoice = reactive<Invoice>(createEmptyInvoice())

function touch() {
  invoice.updatedAt = new Date().toISOString()
}

function addLineItem() {
  invoice.items.push(createEmptyLineItem())
  touch()
}

function removeLineItem(id: string) {
  const index = invoice.items.findIndex((item) => item.id === id)
  if (index !== -1) invoice.items.splice(index, 1)
  touch()
}

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
  return { invoice, addLineItem, removeLineItem, replaceInvoice, resetToNew, touch }
}
