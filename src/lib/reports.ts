import type { Invoice } from '../types/invoice'
import type { Payment } from '../types/finance'
import type { Product } from '../types/product'
import { computeInvoiceTotals, roundCurrency } from './calculations'

export type ReportPeriod = 'all' | 'year' | 'month'

export const REPORT_PERIOD_ORDER: { value: ReportPeriod; labelFr: string }[] = [
  { value: 'month', labelFr: 'Ce mois' },
  { value: 'year', labelFr: 'Cette année' },
  { value: 'all', labelFr: 'Tout' },
]

function isInPeriod(dateIso: string, period: ReportPeriod): boolean {
  if (period === 'all') return true
  const date = dateIso.slice(0, 10)
  const now = new Date()
  if (period === 'year') return date.slice(0, 4) === String(now.getFullYear())
  return date.slice(0, 7) === now.toISOString().slice(0, 7)
}

/** Invoices counted toward revenue/VAT/unpaid figures — real sales
 * commitments only: drafts aren't issued yet and cancelled ones never
 * happened, so both are excluded from every report below. */
function billableInvoices(invoices: Invoice[], period: ReportPeriod): Invoice[] {
  return invoices.filter(
    (i) => i.docType === 'invoice' && i.status !== 'draft' && i.status !== 'cancelled' && isInPeriod(i.meta.issueDate, period),
  )
}

export interface RevenueReport {
  invoiceCount: number
  revenueHt: number
  vatCollected: number
  collected: number
  unpaid: number
}

export function computeRevenueReport(invoices: Invoice[], paidTotalFor: (documentId: string) => number, period: ReportPeriod): RevenueReport {
  const billable = billableInvoices(invoices, period)
  let revenueHt = 0
  let vatCollected = 0
  let collected = 0
  let unpaid = 0
  for (const invoice of billable) {
    const totals = computeInvoiceTotals(invoice)
    const paid = paidTotalFor(invoice.id)
    revenueHt += totals.subtotal
    vatCollected += totals.taxTotal
    collected += Math.min(paid, totals.netPayable)
    unpaid += Math.max(totals.netPayable - paid, 0)
  }
  return {
    invoiceCount: billable.length,
    revenueHt: roundCurrency(revenueHt),
    vatCollected: roundCurrency(vatCollected),
    collected: roundCurrency(collected),
    unpaid: roundCurrency(unpaid),
  }
}

export interface UnpaidInvoiceRow {
  id: string
  name: string
  clientName: string
  issueDate: string
  netPayable: number
  paid: number
  balance: number
}

export function computeUnpaidInvoices(invoices: Invoice[], paidTotalFor: (documentId: string) => number, period: ReportPeriod): UnpaidInvoiceRow[] {
  return billableInvoices(invoices, period)
    .map((invoice) => {
      const totals = computeInvoiceTotals(invoice)
      const paid = paidTotalFor(invoice.id)
      return {
        id: invoice.id,
        name: invoice.name,
        clientName: invoice.client.name,
        issueDate: invoice.meta.issueDate,
        netPayable: totals.netPayable,
        paid: roundCurrency(Math.min(paid, totals.netPayable)),
        balance: roundCurrency(Math.max(totals.netPayable - paid, 0)),
      }
    })
    .filter((row) => row.balance > 0)
    .sort((a, b) => b.balance - a.balance)
}

export interface MarginByProductRow {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
  cost: number
  margin: number
}

export interface MarginReport {
  revenue: number
  cost: number
  margin: number
  marginPercent: number
  byProduct: MarginByProductRow[]
}

/** Margin only covers lines linked to a catalog product with a known
 * purchase price — manually-typed lines and service-only sales have no cost
 * basis to compare against, so they're left out rather than assumed to be
 * pure profit. */
export function computeMarginReport(invoices: Invoice[], products: Product[], period: ReportPeriod): MarginReport {
  const productById = new Map(products.map((p) => [p.id, p]))
  const byProduct = new Map<string, MarginByProductRow>()

  for (const invoice of billableInvoices(invoices, period)) {
    for (const item of invoice.items) {
      if (!item.productId) continue
      const product = productById.get(item.productId)
      if (!product || product.purchasePrice == null) continue

      const revenue = roundCurrency(item.quantity * item.unitPrice)
      const cost = roundCurrency(item.quantity * product.purchasePrice)
      const existing = byProduct.get(product.id)
      if (existing) {
        existing.quantitySold += item.quantity
        existing.revenue = roundCurrency(existing.revenue + revenue)
        existing.cost = roundCurrency(existing.cost + cost)
        existing.margin = roundCurrency(existing.revenue - existing.cost)
      } else {
        byProduct.set(product.id, {
          productId: product.id,
          productName: product.name || 'Sans nom',
          quantitySold: item.quantity,
          revenue,
          cost,
          margin: roundCurrency(revenue - cost),
        })
      }
    }
  }

  const rows = [...byProduct.values()].sort((a, b) => b.margin - a.margin)
  const revenue = roundCurrency(rows.reduce((sum, r) => sum + r.revenue, 0))
  const cost = roundCurrency(rows.reduce((sum, r) => sum + r.cost, 0))
  const margin = roundCurrency(revenue - cost)
  return { revenue, cost, margin, marginPercent: revenue > 0 ? roundCurrency((margin / revenue) * 100) : 0, byProduct: rows }
}

export interface StockValuationRow {
  productId: string
  productName: string
  quantity: number
  unitCost: number
  value: number
}

export interface StockValuationReport {
  totalValue: number
  lines: StockValuationRow[]
}

/** A snapshot of stock as it stands right now — not period-filtered, unlike
 * every other report here, since "value of what's on the shelf today" has no
 * meaningful date range. Falls back to sale price when no purchase price is
 * set, so a product never silently values at zero. */
export function computeStockValuationReport(products: Product[], quantityFor: (productId: string) => number): StockValuationReport {
  const lines = products
    .filter((p) => p.kind === 'good' && !p.archivedAt)
    .map((p) => {
      const quantity = quantityFor(p.id)
      const unitCost = p.purchasePrice ?? p.salePrice
      return { productId: p.id, productName: p.name || 'Sans nom', quantity, unitCost, value: roundCurrency(quantity * unitCost) }
    })
    .filter((row) => row.quantity !== 0)
    .sort((a, b) => b.value - a.value)

  return { totalValue: roundCurrency(lines.reduce((sum, l) => sum + l.value, 0)), lines }
}

export function computeExpensesTotal(payments: Payment[], period: ReportPeriod): number {
  return roundCurrency(
    payments.filter((p) => p.direction === 'out' && isInPeriod(p.paidAt, period)).reduce((sum, p) => sum + p.amount, 0),
  )
}
