export type SectionKey =
  | 'logo'
  | 'sellerInfo'
  | 'clientInfo'
  | 'invoiceMeta'
  | 'dueDate'
  | 'quantityColumn'
  | 'unitPriceColumn'
  | 'taxColumn'
  | 'lineTotalColumn'
  | 'discount'
  | 'notes'
  | 'paymentDetails'
  | 'signature'

export interface CompanyInfo {
  name: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  taxId: string
  email: string
  phone: string
  /** Data URL (already downscaled/compressed client-side), empty string if none. */
  logoDataUrl: string
}

export interface ClientInfo {
  name: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  taxId: string
  email: string
  phone: string
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRatePercent: number
}

export interface Discount {
  type: 'percent' | 'fixed'
  value: number
}

export interface PaymentDetails {
  bankName: string
  accountHolder: string
  iban: string
  bic: string
  otherInstructions: string
}

export interface InvoiceMeta {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  locale: string
  /** Applied to newly added line items and to "apply to all lines" bulk edits. */
  defaultTaxRatePercent: number
}

export interface Invoice {
  id: string
  schemaVersion: number
  meta: InvoiceMeta
  seller: CompanyInfo
  client: ClientInfo
  items: LineItem[]
  discount: Discount
  notes: string
  termsAndConditions: string
  payment: PaymentDetails
  signatureLabel: string
  visibleSections: Record<SectionKey, boolean>
  /**
   * Directly-entered subtotal, used only when no line item has an amount
   * (see lib/calculations.ts hasLineAmounts). As soon as any line has a
   * price, totals are computed from the lines instead and this is ignored.
   */
  manualSubtotal: number | null
  /** Hex color (e.g. "#a24a2c") driving the accent color of this specific
   * invoice's preview and PDF — not a global app setting. */
  themeColor: string
  createdAt: string
  updatedAt: string
}
