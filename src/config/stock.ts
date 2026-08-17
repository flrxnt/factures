import type { MovementType, Warehouse } from '../types/stock'

export interface MovementTypeDescriptor {
  value: MovementType
  labelFr: string
  /** +1 or -1 — how this movement type affects the running quantity, used
   * purely for on-screen sign display (the actual sum happens server-side). */
  sign: 1 | -1
}

export const MOVEMENT_TYPE_ORDER: MovementTypeDescriptor[] = [
  { value: 'in', labelFr: 'Entrée', sign: 1 },
  { value: 'out', labelFr: 'Sortie', sign: -1 },
  { value: 'adjustment', labelFr: 'Ajustement', sign: 1 },
]

const MOVEMENT_TYPE_MAP = new Map(MOVEMENT_TYPE_ORDER.map((m) => [m.value, m]))

export function getMovementTypeDescriptor(type: MovementType): MovementTypeDescriptor {
  return MOVEMENT_TYPE_MAP.get(type) ?? MOVEMENT_TYPE_ORDER[0]
}

export const DEFAULT_WAREHOUSE_NAME = 'Entrepôt principal'

export function createEmptyWarehouse(name = ''): Warehouse {
  return {
    id: crypto.randomUUID(),
    name,
    isDefault: false,
    archivedAt: '',
  }
}
