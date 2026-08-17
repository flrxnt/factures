export interface Warehouse {
  id: string
  name: string
  isDefault: boolean
  archivedAt: string
}

export type MovementType = 'in' | 'out' | 'adjustment'

export interface StockMovement {
  id: string
  productId: string
  warehouseId: string
  movementType: MovementType
  quantity: number
  unitCost: number | null
  documentId: string | null
  note: string
  createdAt: string
}

/** SUM of all movements for a product across all warehouses — never a
 * mutable counter, always recomputed server-side from the movement ledger. */
export interface StockLevel {
  productId: string
  quantity: number
}
