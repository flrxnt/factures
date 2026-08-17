import type { StockLevel, StockMovement, Warehouse } from '../types/stock'

/** Desktop-only, same as products — the stock ledger lives entirely in the
 * local SQLite database. */

export async function listWarehouses(): Promise<Warehouse[]> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<Warehouse[]>('list_warehouses')
}

export async function saveWarehouse(warehouse: Warehouse): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('save_warehouse', { warehouse })
}

export async function removeWarehouse(id: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('remove_warehouse', { id })
}

export async function createStockMovement(movement: StockMovement): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('create_stock_movement', { movement })
}

export async function listStockMovements(productId?: string): Promise<StockMovement[]> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<StockMovement[]>('list_stock_movements', { productId: productId ?? null })
}

export async function getStockLevels(): Promise<StockLevel[]> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<StockLevel[]>('get_stock_levels')
}

/** Fire-and-forget from the invoice save path — a no-op on the Rust side
 * unless the document is a non-draft invoice with catalog-linked lines that
 * haven't already been recorded. */
export async function applyInvoiceStockMovements(documentId: string, createdAt: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('apply_invoice_stock_movements', { documentId, createdAt })
}
