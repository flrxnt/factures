import type { Product, ProductKind } from '../types/product'

export interface ProductKindDescriptor {
  value: ProductKind
  labelFr: string
}

export const PRODUCT_KIND_ORDER: ProductKindDescriptor[] = [
  { value: 'good', labelFr: 'Produit' },
  { value: 'service', labelFr: 'Service' },
]

const PRODUCT_KIND_MAP = new Map(PRODUCT_KIND_ORDER.map((k) => [k.value, k]))

export function getProductKindDescriptor(kind: ProductKind): ProductKindDescriptor {
  return PRODUCT_KIND_MAP.get(kind) ?? PRODUCT_KIND_ORDER[0]
}

/** Free-text suggestions (not an enum) — same `<datalist>` pattern already
 * used for currency codes in InvoiceMetaForm.vue, so a unit outside this
 * list is still perfectly valid. */
export const COMMON_UNITS = ['pièce', 'heure', 'jour', 'mois', 'forfait', 'kg', 'g', 'L', 'm', 'm²']

export function createEmptyProduct(kind: ProductKind = 'good'): Product {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    kind,
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: '',
    purchasePrice: null,
    salePrice: 0,
    taxRatePercent: 0,
    supplierId: null,
    lowStockThreshold: null,
    archivedAt: '',
    createdAt: now,
    updatedAt: now,
  }
}
