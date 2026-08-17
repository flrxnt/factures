import { ref, watch } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import type { DocumentType, Invoice, InvoiceStatus } from '../types/invoice'
import { getItem, setItem } from '../lib/storage'
import { MAX_INVOICES, createEmptyInvoice } from '../config/defaults'
import { useAppSettings } from './useAppSettings'
import * as documentsApi from '../lib/documentsApi'
import { applyInvoiceStockMovements } from '../lib/stockApi'

const INVOICES_KEY = 'flofactures:invoices:v1'
const AUTOSAVE_DELAY_MS = 400
const tauriEnv = isTauri()

/**
 * Every invoice/quote the user creates lives here (there's no separate
 * "draft" concept) — this is what the dashboard lists, and what the
 * editor's autosave writes back into.
 *
 * On the web build (no backend), this array IS the store — it's hydrated
 * synchronously from localStorage and every mutation rewrites the whole
 * blob back to it, same as always.
 *
 * On desktop, the local SQLite database is the source of truth: this array
 * is a full in-memory mirror, hydrated once asynchronously at startup
 * (`bootstrapDesktop`), after which every read here stays synchronous
 * (unchanged for every consumer) while writes fire an async Tauri command
 * in the background. `MAX_INVOICES` — an artifact of localStorage blob
 * size — no longer applies once SQLite is the backend.
 */
const invoices = ref<Invoice[]>(tauriEnv ? [] : getItem<Invoice[]>(INVOICES_KEY, []))
const isLoading = ref(tauriEnv)

async function bootstrapDesktop() {
  try {
    const alreadyMigrated = await documentsApi.hasImportedLegacyInvoices()
    if (!alreadyMigrated) {
      const legacy = getItem<Invoice[]>(INVOICES_KEY, [])
      if (legacy.length > 0) await documentsApi.importLegacyInvoices(legacy)
    }
    invoices.value = await documentsApi.listDocuments()
  } catch (error) {
    console.error('Failed to load documents from the local database', error)
  } finally {
    isLoading.value = false
  }
}

if (tauriEnv) bootstrapDesktop()

function persistWeb() {
  setItem(INVOICES_KEY, invoices.value)
}

/** Upserts a single document. On desktop this is a fire-and-forget Tauri
 * call (local SQLite write, fast and reliable) so every existing caller
 * keeps its synchronous call shape; on web it's the original whole-array
 * localStorage rewrite.
 *
 * Every persist also asks Rust to reconcile stock movements for the
 * document — a no-op unless it's a non-draft invoice with catalog-linked
 * lines that haven't already been recorded (idempotent, see
 * apply_invoice_stock_movements), so it's safe to call unconditionally
 * here rather than threading "did the status just leave draft?" logic
 * through every one of this file's several call sites. */
function persistOne(invoice: Invoice) {
  if (tauriEnv) {
    documentsApi.saveDocument(invoice).catch((error) => console.error('Failed to save document', error))
    applyInvoiceStockMovements(invoice.id, invoice.updatedAt).catch((error) => console.error('Failed to reconcile stock movements', error))
  } else {
    persistWeb()
  }
}

function persistRemoval(id: string) {
  if (tauriEnv) {
    documentsApi.removeDocument(id).catch((error) => console.error('Failed to delete document', error))
  } else {
    persistWeb()
  }
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
  if (!tauriEnv && invoices.value.length > MAX_INVOICES) {
    invoices.value = invoices.value.slice(0, MAX_INVOICES)
  }
  persistOne(snapshot)
}

function remove(id: string) {
  invoices.value = invoices.value.filter((entry) => entry.id !== id)
  persistRemoval(id)
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

/** Creates a new invoice or quote, persists it immediately (so it shows up
 * on the dashboard right away), and returns an independent working copy. */
function create(docType: DocumentType = 'invoice'): Invoice {
  const invoice = createEmptyInvoice(docType)
  const { invoiceDefaults } = useAppSettings().settings
  invoice.meta.currency = invoiceDefaults.currency
  invoice.meta.locale = invoiceDefaults.locale
  invoice.meta.defaultTaxRatePercent = invoiceDefaults.taxRatePercent
  invoice.themeColor = invoiceDefaults.themeColor
  invoice.template = invoiceDefaults.template
  invoices.value.unshift(invoice)
  persistOne(invoice)
  return JSON.parse(JSON.stringify(invoice))
}

function rename(id: string, name: string) {
  const entry = get(id)
  if (!entry) return
  entry.name = name
  entry.updatedAt = new Date().toISOString()
  persistOne(entry)
}

/** Updates status directly from the dashboard, without opening the editor. */
function setStatus(id: string, status: InvoiceStatus) {
  const entry = get(id)
  if (!entry) return
  entry.status = status
  entry.updatedAt = new Date().toISOString()
  persistOne(entry)
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
  persistOne(copy)
  return copy
}

/** Desktop-only: creates a new document of `targetDocType` pre-filled from
 * `sourceId` (e.g. turning a Devis into a Facture in one click), and
 * records the relation between the two in `document_links`. Web has no
 * relational storage, so document transformation isn't offered there. */
async function transformDocument(sourceId: string, targetDocType: DocumentType): Promise<Invoice | null> {
  const source = get(sourceId)
  if (!source) return null

  const now = new Date().toISOString()
  const target: Invoice = JSON.parse(JSON.stringify(source))
  target.id = crypto.randomUUID()
  target.docType = targetDocType
  target.status = 'draft'
  target.paymentLink = ''
  target.createdAt = now
  target.updatedAt = now

  invoices.value.unshift(target)
  persistOne(target)

  if (tauriEnv) {
    try {
      await documentsApi.createDocumentLink({
        id: crypto.randomUUID(),
        sourceDocumentId: source.id,
        targetDocumentId: target.id,
        relation: `${source.docType}_to_${target.docType}`,
        createdAt: now,
      })
    } catch (error) {
      console.error('Failed to record the document link', error)
    }
  }

  return JSON.parse(JSON.stringify(target))
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
 * file's own updatedAt); everything else is merged in. On web, the merged
 * set is sorted by updatedAt (most recent first) before the MAX_INVOICES
 * cap is applied, so a bulk import can't silently push out invoices that
 * are actually more recent than some of the incoming ones; desktop has no
 * such cap.
 */
function importInvoices(payload: unknown): ImportResult {
  const incoming = payload && typeof payload === 'object' ? (payload as Record<string, unknown>).invoices : undefined
  if (!Array.isArray(incoming)) return { imported: 0, skipped: 0 }

  const byId = new Map(invoices.value.map((entry) => [entry.id, entry]))
  let imported = 0
  let skipped = 0
  const importedEntries: Invoice[] = []

  for (const entry of incoming) {
    if (!isValidInvoiceShape(entry)) {
      skipped += 1
      continue
    }
    if (!entry.docType) entry.docType = 'invoice'
    byId.set(entry.id, entry)
    importedEntries.push(entry)
    imported += 1
  }

  const merged = [...byId.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  invoices.value = tauriEnv ? merged : merged.slice(0, MAX_INVOICES)

  if (tauriEnv) {
    for (const entry of importedEntries) persistOne(entry)
  } else {
    persistWeb()
  }

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
  return {
    invoices,
    isLoading,
    save,
    remove,
    get,
    cloneForEditing,
    create,
    rename,
    duplicate,
    setStatus,
    importInvoices,
    useAutosave,
    transformDocument,
  }
}
