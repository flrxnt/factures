import type { Product } from '../types/product'

/** Desktop-only — the product catalog lives entirely in the local SQLite
 * database, there is no web/localStorage fallback (unlike invoices). Every
 * function here is only ever called from Tauri-gated call sites. */

export async function listProducts(): Promise<Product[]> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<Product[]>('list_products')
}

export async function saveProduct(product: Product): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('save_product', { product })
}

export async function removeProduct(id: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('remove_product', { id })
}
