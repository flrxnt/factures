import { isTauri } from '@tauri-apps/api/core'
import type { Invoice } from '../types/invoice'

/** Desktop-only local SQLite persistence layer — mirrors the isTauri()-gated,
 * dynamic-import shape already used by saveFile.ts/sendEmail.ts so the web
 * bundle never even attempts to import Tauri's invoke bridge. */

export async function hasImportedLegacyInvoices(): Promise<boolean> {
  if (!isTauri()) return true
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<boolean>('has_imported_legacy_invoices')
}

export async function importLegacyInvoices(invoices: Invoice[]): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('import_legacy_invoices', { invoices })
}

export async function listDocuments(): Promise<Invoice[]> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<Invoice[]>('list_documents')
}

export async function saveDocument(document: Invoice): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('save_document', { document })
}

export async function removeDocument(id: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('remove_document', { id })
}

export async function createDocumentLink(params: {
  id: string
  sourceDocumentId: string
  targetDocumentId: string
  relation: string
  createdAt: string
}): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('create_document_link', { request: params })
}
