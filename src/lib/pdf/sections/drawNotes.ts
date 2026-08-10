import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

export function drawNotes(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  if (!invoice.notes && !invoice.termsAndConditions) return
  const left = PDF_PAGE.marginX

  doc.setDrawColor(...PDF_THEME.colors.border)
  cursor.ensureSpace(10)
  doc.line(left, cursor.y, left + PDF_CONTENT_WIDTH, cursor.y)
  cursor.advance(6)

  if (invoice.notes) {
    doc.setFont(PDF_THEME.font.family, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    doc.setTextColor(...PDF_THEME.colors.body)
    const lines = doc.splitTextToSize(invoice.notes, PDF_CONTENT_WIDTH)
    cursor.ensureSpace(lines.length * 4.5)
    doc.text(lines, left, cursor.y)
    cursor.advance(lines.length * 4.5 + 3)
  }

  if (invoice.termsAndConditions) {
    doc.setFont(PDF_THEME.font.family, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeSmall)
    doc.setTextColor(...PDF_THEME.colors.muted)
    const lines = doc.splitTextToSize(invoice.termsAndConditions, PDF_CONTENT_WIDTH)
    cursor.ensureSpace(lines.length * 4)
    doc.text(lines, left, cursor.y)
    cursor.advance(lines.length * 4)
  }

  cursor.advance(PDF_THEME.spacing.betweenBlocks)
}
