import { describe, expect, it } from 'vitest'
import { computeRevenueReport, computeUnpaidInvoices, computeMarginReport, computeStockValuationReport, computeExpensesTotal } from './reports'
import { createEmptyInvoice, createEmptyLineItem } from '../config/defaults'
import type { Invoice, InvoiceStatus } from '../types/invoice'
import type { Product } from '../types/product'
import type { Payment } from '../types/finance'

function invoice(overrides: Partial<Invoice> & { status?: InvoiceStatus } = {}): Invoice {
  const inv = createEmptyInvoice('invoice')
  inv.meta.issueDate = new Date().toISOString().slice(0, 10) // defaults inside "this month"/"this year"
  return { ...inv, ...overrides }
}

function line(overrides: Partial<ReturnType<typeof createEmptyLineItem>> = {}) {
  return { ...createEmptyLineItem(), ...overrides }
}

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    kind: 'good',
    sku: '',
    name: 'Produit',
    description: '',
    category: '',
    unit: '',
    purchasePrice: 1000,
    salePrice: 2000,
    taxRatePercent: 0,
    supplierId: null,
    lowStockThreshold: null,
    archivedAt: '',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('computeRevenueReport', () => {
  it('excludes draft and cancelled invoices', () => {
    const invoices = [
      invoice({ status: 'draft', items: [line({ quantity: 1, unitPrice: 1000 })] }),
      invoice({ status: 'cancelled', items: [line({ quantity: 1, unitPrice: 1000 })] }),
      invoice({ status: 'sent', items: [line({ quantity: 1, unitPrice: 1000, taxRatePercent: 18 })] }),
    ]
    const report = computeRevenueReport(invoices, () => 0, 'all')
    expect(report.invoiceCount).toBe(1)
    expect(report.revenueHt).toBe(1000)
    expect(report.vatCollected).toBe(180)
    expect(report.unpaid).toBe(1180)
    expect(report.collected).toBe(0)
  })

  it('splits collected vs unpaid based on payments, capped at what is owed', () => {
    const invoices = [invoice({ id: 'inv-1', status: 'sent', items: [line({ quantity: 1, unitPrice: 1000 })] })]
    const paid = (id: string) => (id === 'inv-1' ? 400 : 0)
    const report = computeRevenueReport(invoices, paid, 'all')
    expect(report.collected).toBe(400)
    expect(report.unpaid).toBe(600)
  })

  it('never lets an overpayment push collected above the net payable', () => {
    const invoices = [invoice({ id: 'inv-1', status: 'paid', items: [line({ quantity: 1, unitPrice: 1000 })] })]
    const report = computeRevenueReport(invoices, () => 5000, 'all')
    expect(report.collected).toBe(1000)
    expect(report.unpaid).toBe(0)
  })
})

describe('computeUnpaidInvoices', () => {
  it('only lists invoices with an outstanding balance, largest first', () => {
    const invoices = [
      invoice({ id: 'a', name: 'A', status: 'sent', items: [line({ quantity: 1, unitPrice: 500 })] }),
      invoice({ id: 'b', name: 'B', status: 'paid', items: [line({ quantity: 1, unitPrice: 300 })] }),
      invoice({ id: 'c', name: 'C', status: 'sent', items: [line({ quantity: 1, unitPrice: 900 })] }),
    ]
    const paid = (id: string) => (id === 'b' ? 300 : 0)
    const rows = computeUnpaidInvoices(invoices, paid, 'all')
    expect(rows.map((r) => r.name)).toEqual(['C', 'A'])
    expect(rows[0].balance).toBe(900)
  })
})

describe('computeMarginReport', () => {
  it('only counts lines linked to a product with a known purchase price', () => {
    const products = [product({ id: 'p1', purchasePrice: 1000 }), product({ id: 'p2', purchasePrice: null })]
    const invoices = [
      invoice({
        status: 'sent',
        items: [
          line({ productId: 'p1', quantity: 2, unitPrice: 1500 }), // revenue 3000, cost 2000
          line({ productId: 'p2', quantity: 1, unitPrice: 500 }), // no cost basis, excluded
          line({ quantity: 1, unitPrice: 200 }), // manual line, no productId, excluded
        ],
      }),
    ]
    const report = computeMarginReport(invoices, products, 'all')
    expect(report.revenue).toBe(3000)
    expect(report.cost).toBe(2000)
    expect(report.margin).toBe(1000)
    expect(report.byProduct).toHaveLength(1)
    expect(report.byProduct[0].quantitySold).toBe(2)
  })

  it('aggregates repeated purchases of the same product across invoices', () => {
    const products = [product({ id: 'p1', purchasePrice: 100 })]
    const invoices = [
      invoice({ status: 'sent', items: [line({ productId: 'p1', quantity: 1, unitPrice: 200 })] }),
      invoice({ status: 'paid', items: [line({ productId: 'p1', quantity: 3, unitPrice: 200 })] }),
    ]
    const report = computeMarginReport(invoices, products, 'all')
    expect(report.byProduct).toHaveLength(1)
    expect(report.byProduct[0].quantitySold).toBe(4)
    expect(report.byProduct[0].margin).toBe(400) // (4*200) - (4*100)
  })
})

describe('computeStockValuationReport', () => {
  it('values stock at purchase price, falling back to sale price when unset', () => {
    const products = [
      product({ id: 'p1', purchasePrice: 100, salePrice: 200 }),
      product({ id: 'p2', purchasePrice: null, salePrice: 50, name: 'No cost basis' }),
      product({ id: 'p3', kind: 'service', name: 'Service (excluded)' }),
      product({ id: 'p4', archivedAt: '2026-01-01T00:00:00.000Z', name: 'Archived (excluded)' }),
    ]
    const quantities: Record<string, number> = { p1: 10, p2: 4, p3: 999, p4: 999 }
    const report = computeStockValuationReport(products, (id) => quantities[id] ?? 0)
    expect(report.lines).toHaveLength(2)
    expect(report.totalValue).toBe(1000 + 200) // p1: 10*100, p2: 4*50
  })
})

describe('computeExpensesTotal', () => {
  it('only sums outgoing payments', () => {
    const payments: Payment[] = [
      { id: '1', documentId: null, direction: 'out', amount: 500, method: '', category: '', counterparty: '', paidAt: new Date().toISOString().slice(0, 10), reference: '', note: '', createdAt: '' },
      { id: '2', documentId: 'doc-1', direction: 'in', amount: 1000, method: '', category: '', counterparty: '', paidAt: new Date().toISOString().slice(0, 10), reference: '', note: '', createdAt: '' },
    ]
    expect(computeExpensesTotal(payments, 'all')).toBe(500)
  })
})
