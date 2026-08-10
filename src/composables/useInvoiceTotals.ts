import { computed } from 'vue'
import type { Invoice } from '../types/invoice'
import { computeTotals } from '../lib/calculations'

export function useInvoiceTotals(invoice: Invoice) {
  const totals = computed(() => computeTotals(invoice.items, invoice.discount, invoice.visibleSections.discount))
  return { totals }
}
