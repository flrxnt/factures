import type { Invoice } from '../types/invoice'
import { downloadInvoicePdf } from '../lib/pdf/generateInvoicePdf'
import { useInvoiceHistory } from './useInvoiceHistory'

export function usePdfExport() {
  const { save } = useInvoiceHistory()

  function exportPdf(invoice: Invoice) {
    downloadInvoicePdf(invoice)
    save(invoice)
  }

  return { exportPdf }
}
