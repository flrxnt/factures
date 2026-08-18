import type { InvoiceStatus } from '../types/invoice'

export interface StatusDescriptor {
  value: InvoiceStatus
  labelFr: string
  /** Hex color for the status badge/dot — deliberately reuses hues already
   * in THEME_COLOR_PRESETS (config/defaults.ts) rather than a separate
   * palette, and is independent of the invoice's own theme color since a
   * status must stay visually consistent regardless of which color the
   * invoice document uses. */
  color: string
}

export const STATUS_ORDER: StatusDescriptor[] = [
  { value: 'draft', labelFr: 'Brouillon', color: '#928d7c' },
  { value: 'sent', labelFr: 'Envoyée', color: '#3d5772' },
  { value: 'partially_paid', labelFr: 'Partiellement payée', color: '#a97c1f' },
  { value: 'paid', labelFr: 'Payée', color: '#3f6b4f' },
  { value: 'overdue', labelFr: 'En retard', color: '#7d2e3b' },
  { value: 'cancelled', labelFr: 'Annulée', color: '#928d7c' },
]

const STATUS_MAP = new Map(STATUS_ORDER.map((s) => [s.value, s]))

export function getStatusDescriptor(status: InvoiceStatus): StatusDescriptor {
  return STATUS_MAP.get(status) ?? STATUS_ORDER[0]
}
