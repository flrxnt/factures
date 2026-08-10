import type { Invoice, SectionKey } from '../types/invoice'

export const DEFAULT_CURRENCY = 'XOF'
export const DEFAULT_LOCALE = 'fr-FR'
export const MAX_HISTORY_ENTRIES = 50

export const DEFAULT_VISIBLE_SECTIONS: Record<SectionKey, boolean> = {
  logo: true,
  sellerInfo: true,
  clientInfo: true,
  invoiceMeta: true,
  dueDate: true,
  taxColumn: true,
  discount: false,
  notes: true,
  paymentDetails: true,
  footer: true,
  signature: false,
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function dueDateIso(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().slice(0, 10)
}

export function createEmptyInvoice(): Invoice {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    meta: {
      invoiceNumber: '',
      issueDate: todayIso(),
      dueDate: dueDateIso(30),
      currency: DEFAULT_CURRENCY,
      locale: DEFAULT_LOCALE,
    },
    seller: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      city: '',
      country: '',
      taxId: '',
      email: '',
      phone: '',
      logoDataUrl: '',
    },
    client: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      city: '',
      country: '',
      taxId: '',
      email: '',
      phone: '',
    },
    items: [],
    discount: {
      type: 'percent',
      value: 0,
    },
    notes: '',
    termsAndConditions: '',
    payment: {
      bankName: '',
      accountHolder: '',
      iban: '',
      bic: '',
      otherInstructions: '',
    },
    signatureLabel: '',
    visibleSections: { ...DEFAULT_VISIBLE_SECTIONS },
    createdAt: now,
    updatedAt: now,
  }
}

export function createEmptyLineItem() {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRatePercent: 18,
  }
}
