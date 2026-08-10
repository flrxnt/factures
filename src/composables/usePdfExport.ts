import type { Invoice } from '../types/invoice'
import { generateInvoicePdf } from '../lib/pdf/generateInvoicePdf'
import { sanitizeFilename } from '../lib/filename'
import { useInvoiceCollection } from './useInvoiceCollection'

export function usePdfExport() {
  const { save } = useInvoiceCollection()

  function exportPdf(invoice: Invoice) {
    const doc = generateInvoicePdf(invoice)
    const fallback = invoice.meta.invoiceNumber ? `facture-${invoice.meta.invoiceNumber}` : 'facture'
    doc.save(`${sanitizeFilename(invoice.name, fallback)}.pdf`)
    save(invoice)
  }

  return { exportPdf }
}
