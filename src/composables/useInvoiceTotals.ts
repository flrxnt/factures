import { computed } from 'vue'
import type { Invoice } from '../types/invoice'
import { computeInvoiceTotals } from '../lib/calculations'

export function useInvoiceTotals(invoice: Invoice) {
  const totals = computed(() => computeInvoiceTotals(invoice))
  return { totals }
}
