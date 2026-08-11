import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME, hexToRgb } from '../pdfTheme'

export function drawPaymentLink(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const url = invoice.paymentLink.trim()
  if (!url) return

  const left = PDF_PAGE.marginX
  cursor.ensureSpace(16)

  doc.setDrawColor(...PDF_THEME.colors.hairline)
  doc.line(left, cursor.y, left + PDF_CONTENT_WIDTH, cursor.y)
  cursor.advance(6)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text('PAIEMENT EN LIGNE', left, cursor.y)
  cursor.advance(5)

  const label = 'Payer cette facture en ligne →'
  doc.setFont(PDF_THEME.font.body, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  doc.setTextColor(...hexToRgb(invoice.themeColor))
  doc.textWithLink(label, left, cursor.y, { url })
  cursor.advance(5)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text(url, left, cursor.y)
  cursor.advance(4.5)

  cursor.advance(PDF_THEME.spacing.betweenBlocks)
}
