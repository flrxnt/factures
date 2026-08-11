import { ref, watch } from 'vue'
import type { Invoice, InvoiceStatus } from '../types/invoice'
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

/** Updates status directly from the dashboard, without opening the editor. */
function setStatus(id: string, status: InvoiceStatus) {
  const entry = get(id)
  if (!entry) return
  entry.status = status
  entry.updatedAt = new Date().toISOString()
  persist()
}

/** Clones an entry as a brand-new independent invoice (fresh id/timestamps,
 * "(copie)" appended to the name) and inserts it into the collection right
 * next to the original. */
function duplicate(id: string): Invoice | null {
  const source = get(id)
  if (!source) return null
  const now = new Date().toISOString()
  const copy: Invoice = JSON.parse(JSON.stringify(source))
  copy.id = crypto.randomUUID()
  copy.name = copy.name ? `${copy.name} (copie)` : ''
  copy.createdAt = now
  copy.updatedAt = now
  const index = invoices.value.findIndex((entry) => entry.id === id)
  invoices.value.splice(index === -1 ? 0 : index + 1, 0, copy)
  persist()
  return copy
}

export interface ImportResult {
  imported: number
  skipped: number
}

/** Minimal structural check — not a full schema validation, just enough to
 * reject obviously-wrong files (wrong app, corrupted export, hand-edited
 * JSON missing required nesting) without crashing on `.id`/`.client` access. */
function isValidInvoiceShape(value: unknown): value is Invoice {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && typeof v.client === 'object' && typeof v.seller === 'object' && typeof v.meta === 'object'
}

/**
 * Counterpart to exportInvoicesAsJson (lib/exportData.ts) — restores a
 * previously-exported `{ exportedAt, invoices }` backup. Existing invoices
 * with a matching id are overwritten (last-write-wins, using the imported
 * file's own updatedAt); everything else is merged in. The merged set is
 * sorted by updatedAt (most recent first) *before* the MAX_INVOICES cap is
 * applied, so a bulk import can't silently push out invoices that are
 * actually more recent than some of the incoming ones.
 */
function importInvoices(payload: unknown): ImportResult {
  const incoming = payload && typeof payload === 'object' ? (payload as Record<string, unknown>).invoices : undefined
  if (!Array.isArray(incoming)) return { imported: 0, skipped: 0 }

  const byId = new Map(invoices.value.map((entry) => [entry.id, entry]))
  let imported = 0
  let skipped = 0

  for (const entry of incoming) {
    if (!isValidInvoiceShape(entry)) {
      skipped += 1
      continue
    }
    byId.set(entry.id, entry)
    imported += 1
  }

  invoices.value = [...byId.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, MAX_INVOICES)
  persist()

  return { imported, skipped }
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
  return { invoices, save, remove, get, cloneForEditing, create, rename, duplicate, setStatus, importInvoices, useAutosave }
}
