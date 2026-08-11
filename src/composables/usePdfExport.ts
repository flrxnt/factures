import type { Invoice } from '../types/invoice'
import { generateInvoicePdf } from '../lib/pdf/generateInvoicePdf'
import { sanitizeFilename } from '../lib/filename'
import { saveFile } from '../lib/saveFile'
import { useInvoiceCollection } from './useInvoiceCollection'

export function usePdfExport() {
  const { save } = useInvoiceCollection()

  async function exportPdf(invoice: Invoice) {
    const doc = generateInvoicePdf(invoice)
    const fallback = invoice.meta.invoiceNumber ? `facture-${invoice.meta.invoiceNumber}` : 'facture'
    const filename = `${sanitizeFilename(invoice.name, fallback)}.pdf`
    const bytes = new Uint8Array(doc.output('arraybuffer'))
    const result = await saveFile(bytes, filename, 'application/pdf')
    if (result === 'saved') save(invoice)
  }

  return { exportPdf }
}
