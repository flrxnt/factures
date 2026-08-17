export type ProductKind = 'good' | 'service'

export interface Product {
  id: string
  kind: ProductKind
  sku: string
  name: string
  description: string
  category: string
  unit: string
  purchasePrice: number | null
  salePrice: number
  taxRatePercent: number
  supplierId: string | null
  /** Below this quantity, the catalog/stock screens should flag the product
   * as low — meaningless until the Stock phase adds real quantity tracking,
   * kept here now so the field exists on every product from day one. */
  lowStockThreshold: number | null
  /** ISO timestamp, or empty string if not archived. Archiving (not
   * deleting) is the default way to retire a product so past invoice lines
   * that reference it keep resolving correctly. */
  archivedAt: string
  createdAt: string
  updatedAt: string
}
