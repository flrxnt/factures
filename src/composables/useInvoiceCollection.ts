import { ref, watch } from 'vue'
import type { Invoice } from '../types/invoice'
import { getItem, setItem } from '../lib/storage'
import { MAX_INVOICES, createEmptyInvoice } from '../config/defaults'

const INVOICES_KEY = 'flofactures:invoices:v1'
const AUTOSAVE_DELAY_MS = 400

/**
 * Every invoice the user creates lives here (there's no separate "draft"
 * concept) — this is what the dashboard lists, and what the editor's
 * autosave writes back into. Replaces the old draft+history split: a
 * document is a document whether or not it's been downloaded yet.
 */
const invoices = ref<Invoice[]>(getItem<Invoice[]>(INVOICES_KEY, []))

function persist() {
  setItem(INVOICES_KEY, invoices.value)
}

function save(invoice: Invoice) {
  const snapshot: Invoice = JSON.parse(JSON.stringify(invoice))
  snapshot.updatedAt = new Date().toISOString()
  const index = invoices.value.findIndex((entry) => entry.id === invoice.id)
  if (index !== -1) {
    invoices.value[index] = snapshot
  } else {
    invoices.value.unshift(snapshot)
  }
  if (invoices.value.length > MAX_INVOICES) {
    invoices.value = invoices.value.slice(0, MAX_INVOICES)
  }
  persist()
}

function remove(id: string) {
  invoices.value = invoices.value.filter((entry) => entry.id !== id)
  persist()
}

function get(id: string): Invoice | undefined {
  return invoices.value.find((entry) => entry.id === id)
}

/** Deep-clones an entry into an independent working copy for the editor —
 * mutating it never touches the stored collection directly; only save()
 * (via autosave) writes changes back, so there's a single point of truth
 * for what "persisted" means. */
function cloneForEditing(id: string): Invoice | null {
  const source = get(id)
  return source ? JSON.parse(JSON.stringify(source)) : null
}

/** Creates a new invoice, persists it immediately (so it shows up on the
 * dashboard right away), and returns an independent working copy. */
function create(): Invoice {
  const invoice = createEmptyInvoice()
  invoices.value.unshift(invoice)
  persist()
  return JSON.parse(JSON.stringify(invoice))
}

function rename(id: string, name: string) {
  const entry = get(id)
  if (!entry) return
  entry.name = name
  entry.updatedAt = new Date().toISOString()
  persist()
}

/** Watches the given (working-copy) invoice deeply and writes it back into
 * the collection, debounced so every keystroke doesn't trigger a write. */
function useAutosave(invoice: Invoice) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return watch(
    invoice,
    () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => save(invoice), AUTOSAVE_DELAY_MS)
    },
    { deep: true },
  )
}

export function useInvoiceCollection() {
  return { invoices, save, remove, get, cloneForEditing, create, rename, useAutosave }
}
