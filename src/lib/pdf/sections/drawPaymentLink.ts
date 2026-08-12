import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME, hexToRgb } from '../pdfTheme'

export function drawPaymentLink(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const url = invoice.paymentLink.trim()
  if (!url) return

  const left = PDF_PAGE.marginX
  cursor.ensureSpace(40)

  doc.setDrawColor(...PDF_THEME.colors.hairline)
  doc.line(left, cursor.y, left + PDF_CONTENT_WIDTH, cursor.y)
  cursor.advance(6)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text('PAIEMENT EN LIGNE', left, cursor.y)
  cursor.advance(7)

  // A plain colored text link doesn't read as a clickable "button" — draw an
  // actual filled pill (matching the on-screen preview's `bg-accent` button)
  // with a doc.link() region over the whole shape, not just the glyphs
  // (textWithLink only makes the text outlines clickable).
  const label = 'Payer cette facture en ligne →'
  doc.setFont(PDF_THEME.font.body, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  const paddingX = 5
  const buttonHeight = 9
  const buttonWidth = doc.getTextWidth(label) + paddingX * 2

  doc.setFillColor(...hexToRgb(invoice.themeColor))
  doc.roundedRect(left, cursor.y, buttonWidth, buttonHeight, buttonHeight / 2, buttonHeight / 2, 'F')
  doc.setTextColor(255, 253, 248)
  doc.text(label, left + paddingX, cursor.y + buttonHeight / 2, { baseline: 'middle' })
  doc.link(left, cursor.y, buttonWidth, buttonHeight, { url })
  cursor.advance(buttonHeight + 5)

  // Fallback for viewers where the link annotation doesn't carry through:
  // the raw URL as plain, selectable text right below the button.
  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text(url, left, cursor.y)
  cursor.advance(4.5)

  cursor.advance(PDF_THEME.spacing.betweenBlocks)
}
