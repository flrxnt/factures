export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

/**
 * What kind of commercial document this is — 'invoice' is the only type on
 * the web build (no backend, no relational storage); 'quote' is available on
 * desktop once documents are persisted in the local SQLite database. Kept as
 * a field on the same `Invoice` shape rather than a separate type, since a
 * quote and an invoice share ~everything (header, lines, totals, seller/
 * client) — see config/documentTypes.ts for the label catalogue.
 */
export type DocumentType = 'invoice' | 'quote'

/**
 * A layout style, not just a color — each one changes title typography,
 * header arrangement, and table/totals treatment, applied identically to
 * the on-screen preview and the PDF. See config/templates.ts for the
 * catalogue and lib/pdf/pdfTheme.ts / preview components for how each is
 * actually drawn.
 */
export type InvoiceTemplate = 'editorial' | 'minimal' | 'bold'

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
  | 'withholding'
  | 'notes'
  | 'paymentDetails'
  | 'paymentLink'
  | 'signature'
  | 'footer'

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

/**
 * A deduction taken from the grand total (TTC) — e.g. "retenue à la source" /
 * income tax withholding — distinct from VAT: VAT is added on top of the
 * subtotal (net × (1 + rate) = gross), withholding is subtracted from the
 * total (gross × (1 - rate) = net payable). Both can be active at once.
 */
export interface Withholding {
  ratePercent: number
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
  docType: DocumentType
  /** User-editable document name shown on the dashboard and used (sanitized)
   * as the downloaded PDF's filename — independent of meta.invoiceNumber. */
  name: string
  /** Manual tracking status — never inferred automatically (e.g. from due
   * date) so it stays predictable; surfaced on the dashboard for at-a-glance
   * follow-up. */
  status: InvoiceStatus
  meta: InvoiceMeta
  seller: CompanyInfo
  client: ClientInfo
  items: LineItem[]
  discount: Discount
  withholding: Withholding
  notes: string
  termsAndConditions: string
  payment: PaymentDetails
  /** External payment page URL — pasted manually or generated via a
   * configured provider (Stripe/PayDunya). Empty string if none. */
  paymentLink: string
  signatureLabel: string
  /** Hand-drawn (canvas) or uploaded signature image, data URL — empty string
   * if none. Same storage regardless of how it was captured. */
  signatureImageDataUrl: string
  /** Free-text notes shown at the very bottom of the page, left/right — for
   * complementary info (legal mentions, registration numbers, etc.). */
  footerNoteLeft: string
  footerNoteRight: string
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
  /** Layout style for this specific invoice's preview and PDF. */
  template: InvoiceTemplate
  createdAt: string
  updatedAt: string
}
