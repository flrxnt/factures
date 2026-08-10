import type { Invoice, LineItem, SectionKey } from '../types/invoice'

export const DEFAULT_CURRENCY = 'XOF'
export const DEFAULT_LOCALE = 'fr-FR'
export const DEFAULT_TAX_RATE_PERCENT = 18
export const MAX_HISTORY_ENTRIES = 50
export const DEFAULT_THEME_COLOR = '#a24a2c'

/** Curated preset swatches for the per-invoice theme picker — muted hues
 * chosen to stay legible on the paper background and in the PDF. Users can
 * still pick any custom color via the native color input. */
export const THEME_COLOR_PRESETS = [
  { label: 'Terracotta', value: '#a24a2c' },
  { label: 'Forêt', value: '#3f6b4f' },
  { label: 'Marine', value: '#2c4a6e' },
  { label: 'Bordeaux', value: '#7d2e3b' },
  { label: 'Ocre', value: '#a97c1f' },
  { label: 'Ardoise', value: '#3d5772' },
  { label: 'Prune', value: '#6a3d6e' },
  { label: 'Encre', value: '#2a2820' },
]

export const DEFAULT_VISIBLE_SECTIONS: Record<SectionKey, boolean> = {
  logo: true,
  sellerInfo: true,
  clientInfo: true,
  invoiceMeta: true,
  dueDate: true,
  quantityColumn: true,
  unitPriceColumn: true,
  taxColumn: true,
  lineTotalColumn: true,
  discount: false,
  notes: true,
  paymentDetails: true,
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
      defaultTaxRatePercent: DEFAULT_TAX_RATE_PERCENT,
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
    manualSubtotal: null,
    themeColor: DEFAULT_THEME_COLOR,
    createdAt: now,
    updatedAt: now,
  }
}

export function createEmptyLineItem(taxRatePercent: number = DEFAULT_TAX_RATE_PERCENT): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRatePercent,
  }
}
