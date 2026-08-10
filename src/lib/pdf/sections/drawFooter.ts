import type { jsPDF } from 'jspdf'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

/** Stamps "Page X / Y" on every page as a final pass (not part of the
 * top-down cursor flow), so it's always accurate regardless of how many
 * pages the rest of the content produced. Only stamped when the invoice
 * actually spans multiple pages — pointless clutter on a single page. */
export function drawFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  if (pageCount < 2) return

  const y = PDF_PAGE.height - PDF_PAGE.marginBottom + 8
  const right = PDF_PAGE.marginX + PDF_CONTENT_WIDTH

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFont(PDF_THEME.font.body, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeSmall)
    doc.setTextColor(...PDF_THEME.colors.faint)
    doc.text(`Page ${page} / ${pageCount}`, right, y, { align: 'right' })
  }
}
