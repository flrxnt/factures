import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

const BOX_WIDTH = 56
const BOX_HEIGHT = 16

export function drawSignature(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  cursor.ensureSpace(BOX_HEIGHT + 8)
  const right = PDF_PAGE.marginX + PDF_CONTENT_WIDTH
  const left = right - BOX_WIDTH
  const lineY = cursor.y + BOX_HEIGHT

  doc.setDrawColor(...PDF_THEME.colors.border)
  doc.line(left, lineY, right, lineY)

  doc.setFont(PDF_THEME.font.family, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text(invoice.signatureLabel || 'Signature', left + BOX_WIDTH / 2, lineY + 4, { align: 'center' })

  cursor.y = lineY + 4 + PDF_THEME.spacing.betweenBlocks
}
