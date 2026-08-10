import { describe, expect, it } from 'vitest'
import { computeTotals, discountAmount, lineTotal, roundCurrency, subtotal, taxGroups, taxTotal } from './calculations'
import type { LineItem } from '../types/invoice'

function item(overrides: Partial<LineItem> = {}): LineItem {
  return { id: '1', description: 'x', quantity: 1, unitPrice: 0, taxRatePercent: 0, ...overrides }
}

describe('roundCurrency', () => {
  it('avoids floating point artifacts', () => {
    expect(roundCurrency(0.1 + 0.2)).toBe(0.3)
  })
})

describe('lineTotal / subtotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(lineTotal(item({ quantity: 3, unitPrice: 1000 }))).toBe(3000)
  })

  it('sums all line totals', () => {
    const items = [item({ quantity: 2, unitPrice: 500 }), item({ quantity: 1, unitPrice: 250 })]
    expect(subtotal(items)).toBe(1250)
  })
})

describe('taxGroups / taxTotal', () => {
  it('groups by rate and computes amount per group', () => {
    const items = [
      item({ quantity: 1, unitPrice: 1000, taxRatePercent: 18 }),
      item({ quantity: 1, unitPrice: 2000, taxRatePercent: 18 }),
      item({ quantity: 1, unitPrice: 500, taxRatePercent: 0 }),
    ]
    const groups = taxGroups(items)
    expect(groups).toEqual([
      { rate: 0, base: 500, amount: 0 },
      { rate: 18, base: 3000, amount: 540 },
    ])
    expect(taxTotal(items)).toBe(540)
  })
})

describe('discountAmount', () => {
  it('returns 0 when disabled', () => {
    expect(discountAmount(1000, { type: 'percent', value: 10 }, false)).toBe(0)
  })

  it('computes a percent discount', () => {
    expect(discountAmount(1000, { type: 'percent', value: 10 }, true)).toBe(100)
  })

  it('computes a fixed discount', () => {
    expect(discountAmount(1000, { type: 'fixed', value: 150 }, true)).toBe(150)
  })

  it('clamps a fixed discount to the subtotal', () => {
    expect(discountAmount(100, { type: 'fixed', value: 500 }, true)).toBe(100)
  })
})

describe('computeTotals', () => {
  it('combines subtotal, tax and discount into a grand total', () => {
    const items = [item({ quantity: 2, unitPrice: 5000, taxRatePercent: 18 })]
    const totals = computeTotals(items, { type: 'percent', value: 10 }, true)
    expect(totals.subtotal).toBe(10000)
    expect(totals.discountAmount).toBe(1000)
    expect(totals.taxTotal).toBe(1800)
    expect(totals.grandTotal).toBe(10800)
  })
})
