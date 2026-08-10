export type SectionKey =
  | 'logo'
  | 'sellerInfo'
  | 'clientInfo'
  | 'invoiceMeta'
  | 'dueDate'
  | 'taxColumn'
  | 'discount'
  | 'notes'
  | 'paymentDetails'
  | 'footer'
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
  createdAt: string
  updatedAt: string
}
