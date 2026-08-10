import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

/** Stamped on every page as a final pass (not part of the top-down cursor
 * flow) so "Page X / Y" is always accurate regardless of how many pages the
 * rest of the content produced. */
export function drawFooter(doc: jsPDF, invoice: Invoice): void {
  const pageCount = doc.getNumberOfPages()
  const y = PDF_PAGE.height - PDF_PAGE.marginBottom + 8
  const left = PDF_PAGE.marginX
  const right = left + PDF_CONTENT_WIDTH

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont(PDF_THEME.font.family, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeSmall)
    doc.setTextColor(...PDF_THEME.colors.faint)
    doc.text(invoice.seller.name || 'Votre entreprise', left, y)
    doc.text(`Page ${page} / ${pageCount}`, right, y, { align: 'right' })
  }
}
