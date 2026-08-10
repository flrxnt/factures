import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

const NOTE_MAX_WIDTH = PDF_CONTENT_WIDTH * 0.46

/** Stamped on every page as a final pass (not part of the top-down cursor
 * flow), so it's correct regardless of how many pages the rest of the
 * content produced: user-editable left/right notes (complementary info,
 * e.g. legal mentions), plus "Page X / Y" — only when the invoice actually
 * spans multiple pages, to avoid pointless clutter on a single page. */
export function drawFooter(doc: jsPDF, invoice: Invoice): void {
  const pageCount = doc.getNumberOfPages()
  const left = PDF_PAGE.marginX
  const right = PDF_PAGE.marginX + PDF_CONTENT_WIDTH
  const showNotes = invoice.visibleSections.footer && (invoice.footerNoteLeft || invoice.footerNoteRight)

  if (!showNotes && pageCount < 2) return

  const notesY = PDF_PAGE.height - PDF_PAGE.marginBottom + 7
  const pageNumY = showNotes ? notesY + 5 : notesY

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)

    if (showNotes) {
      doc.setFont(PDF_THEME.font.body, 'normal')
      doc.setFontSize(PDF_THEME.font.sizeSmall)
      doc.setTextColor(...PDF_THEME.colors.muted)

      if (invoice.footerNoteLeft) {
        const lines = doc.splitTextToSize(invoice.footerNoteLeft, NOTE_MAX_WIDTH)
        doc.text(lines, left, notesY)
      }
      if (invoice.footerNoteRight) {
        const lines = doc.splitTextToSize(invoice.footerNoteRight, NOTE_MAX_WIDTH)
        doc.text(lines, right, notesY, { align: 'right' })
      }
    }

    if (pageCount > 1) {
      doc.setFont(PDF_THEME.font.body, 'normal')
      doc.setFontSize(PDF_THEME.font.sizeSmall)
      doc.setTextColor(...PDF_THEME.colors.faint)
      doc.text(`Page ${page} / ${pageCount}`, right, pageNumY, { align: 'right' })
    }
  }
}
