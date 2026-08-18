import type { Payment, PaymentDirection } from '../types/finance'

/** Free-text suggestions (not an enum), same `<datalist>` pattern as
 * currency codes / product units elsewhere in the app. */
export const PAYMENT_METHOD_PRESETS = ['Espèces', 'Virement', 'Mobile Money', 'Chèque', 'Carte bancaire']

export function createEmptyPayment(direction: PaymentDirection = 'in', documentId: string | null = null): Payment {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    documentId,
    direction,
    amount: 0,
    method: '',
    category: '',
    counterparty: '',
    paidAt: now.slice(0, 10),
    reference: '',
    note: '',
    createdAt: now,
  }
}
