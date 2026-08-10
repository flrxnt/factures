import type { Discount, Invoice, LineItem } from '../types/invoice'

/** Rounds to the nearest cent to avoid floating-point artifacts (e.g. 0.1 + 0.2). */
export function roundCurrency(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function lineTotal(item: LineItem): number {
  return roundCurrency(item.quantity * item.unitPrice)
}

export function subtotal(items: LineItem[]): number {
  return roundCurrency(items.reduce((sum, item) => sum + lineTotal(item), 0))
}

export interface TaxGroup {
  rate: number
  base: number
  amount: number
}

/**
 * Tax convention: each line's tax is computed on that line's own pre-discount
 * amount, then grouped by rate for display (e.g. "TVA 18% : 12 000"). The
 * discount (when enabled) is a single global row applied to the subtotal
 * afterwards, not redistributed back across each line's tax base. This is a
 * simple, common convention — not the only valid one — chosen to keep the
 * "single discount row" requirement straightforward.
 */
export function taxGroups(items: LineItem[]): TaxGroup[] {
  const byRate = new Map<number, number>()
  for (const item of items) {
    const base = lineTotal(item)
    byRate.set(item.taxRatePercent, (byRate.get(item.taxRatePercent) ?? 0) + base)
  }
  return [...byRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, base]) => ({
      rate,
      base: roundCurrency(base),
      amount: roundCurrency((base * rate) / 100),
    }))
}

export function taxTotal(items: LineItem[]): number {
  return roundCurrency(taxGroups(items).reduce((sum, g) => sum + g.amount, 0))
}

export function discountAmount(subtotalValue: number, discount: Discount, enabled: boolean): number {
  if (!enabled || discount.value <= 0) return 0
  const amount = discount.type === 'percent' ? (subtotalValue * discount.value) / 100 : discount.value
  return roundCurrency(Math.min(Math.max(amount, 0), subtotalValue))
}

export function grandTotal(subtotalValue: number, discountValue: number, taxTotalValue: number): number {
  return roundCurrency(subtotalValue - discountValue + taxTotalValue)
}

/**
 * Withholding convention (deliberately the mirror image of VAT): VAT is added
 * on top of the net subtotal (net × (1 + rate) = gross). A withholding tax /
 * "retenue à la source" instead is deducted from the grand total (gross ×
 * (1 - rate) = net payable) — e.g. a 5% withholding on a 789 474 total leaves
 * 750 000 net payable. Both can be active on the same invoice at once: VAT
 * still grosses up the subtotal into the total, then withholding is taken
 * off that total separately.
 */
export function withholdingAmount(grandTotalValue: number, ratePercent: number, enabled: boolean): number {
  if (!enabled || ratePercent <= 0) return 0
  return roundCurrency((grandTotalValue * ratePercent) / 100)
}

export function netPayable(grandTotalValue: number, withholdingValue: number): number {
  return roundCurrency(grandTotalValue - withholdingValue)
}

export interface InvoiceTotals {
  subtotal: number
  taxGroups: TaxGroup[]
  taxTotal: number
  discountAmount: number
  grandTotal: number
  withholdingRatePercent: number
  withholdingAmount: number
  netPayable: number
}

export function computeTotals(
  items: LineItem[],
  discount: Discount,
  discountEnabled: boolean,
  withholding: { ratePercent: number } = { ratePercent: 0 },
  withholdingEnabled = false,
): InvoiceTotals {
  const sub = subtotal(items)
  const groups = taxGroups(items)
  const tax = taxTotal(items)
  const disc = discountAmount(sub, discount, discountEnabled)
  const gt = grandTotal(sub, disc, tax)
  const wh = withholdingAmount(gt, withholding.ratePercent, withholdingEnabled)
  return {
    subtotal: sub,
    taxGroups: groups,
    taxTotal: tax,
    discountAmount: disc,
    grandTotal: gt,
    withholdingRatePercent: withholding.ratePercent,
    withholdingAmount: wh,
    netPayable: netPayable(gt, wh),
  }
}

/** True as soon as any line has a price — the trigger for locking totals to
 * the line items instead of a directly-entered subtotal (see Invoice.manualSubtotal). */
export function hasLineAmounts(items: LineItem[]): boolean {
  return items.some((item) => item.unitPrice > 0)
}

/**
 * Single source of truth for "which totals mode is active", used identically
 * by the on-screen preview, the PDF generator, and history entries so they
 * can never disagree: line items with an amount always win; a directly-entered
 * subtotal only applies when no line has a price, using the invoice's default
 * tax rate as the (single) rate for that direct entry. Withholding is then
 * applied on top of whichever grand total results, in both modes alike.
 */
export function computeInvoiceTotals(invoice: Invoice): InvoiceTotals {
  const discountEnabled = invoice.visibleSections.discount
  const withholdingEnabled = invoice.visibleSections.withholding

  if (!hasLineAmounts(invoice.items) && invoice.manualSubtotal !== null) {
    const sub = roundCurrency(invoice.manualSubtotal)
    const rate = invoice.meta.defaultTaxRatePercent
    const tax = roundCurrency((sub * rate) / 100)
    const disc = discountAmount(sub, invoice.discount, discountEnabled)
    const gt = grandTotal(sub, disc, tax)
    const wh = withholdingAmount(gt, invoice.withholding.ratePercent, withholdingEnabled)
    return {
      subtotal: sub,
      taxGroups: rate > 0 ? [{ rate, base: sub, amount: tax }] : [],
      taxTotal: tax,
      discountAmount: disc,
      grandTotal: gt,
      withholdingRatePercent: invoice.withholding.ratePercent,
      withholdingAmount: wh,
      netPayable: netPayable(gt, wh),
    }
  }

  return computeTotals(invoice.items, invoice.discount, discountEnabled, invoice.withholding, withholdingEnabled)
}
