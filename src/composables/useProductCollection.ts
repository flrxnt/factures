import { ref } from 'vue'
import type { Product } from '../types/product'
import { createEmptyProduct } from '../config/products'
import * as productsApi from '../lib/productsApi'

// Module-level singleton, lazily hydrated — unlike invoices, the catalog
// isn't needed on every screen, so it's only fetched once something actually
// asks for it (the Catalogue view, or the line-item autocomplete).
const products = ref<Product[]>([])
const isLoading = ref(false)
let hydrated = false

async function ensureLoaded(): Promise<void> {
  if (hydrated) return
  isLoading.value = true
  try {
    products.value = await productsApi.listProducts()
    hydrated = true
  } catch (error) {
    console.error('Failed to load the product catalog', error)
  } finally {
    isLoading.value = false
  }
}

function get(id: string): Product | undefined {
  return products.value.find((p) => p.id === id)
}

/** Unlike invoices' fire-and-forget persistence, catalog writes are awaited
 * and errors are re-thrown — the Catalogue screen is a dedicated CRUD UI
 * where the user expects to know immediately if a save/delete failed
 * (e.g. deleting a product still referenced by a document). */
async function save(product: Product): Promise<void> {
  product.updatedAt = new Date().toISOString()
  await productsApi.saveProduct(product)
  const index = products.value.findIndex((p) => p.id === product.id)
  if (index !== -1) products.value[index] = product
  else products.value.unshift(product)
}

async function remove(id: string): Promise<void> {
  await productsApi.removeProduct(id)
  products.value = products.value.filter((p) => p.id !== id)
}

export function useProductCollection() {
  return { products, isLoading, ensureLoaded, get, save, remove, create: createEmptyProduct }
}
