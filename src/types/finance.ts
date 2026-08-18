/** 'in' = money received (a payment against a sales document), 'out' = money
 * paid out (a supplier/expense entry, usually with no linked document). */
export type PaymentDirection = 'in' | 'out'

export interface Payment {
  id: string
  /** The invoice this payment settles — null for a standalone expense. */
  documentId: string | null
  direction: PaymentDirection
  amount: number
  method: string
  /** Free-text expense category ("Fournitures", "Loyer"...) — mostly
   * relevant for direction='out' entries. */
  category: string
  /** Supplier/payer name — free text, not a formal contact record yet. */
  counterparty: string
  paidAt: string
  reference: string
  note: string
  createdAt: string
}
