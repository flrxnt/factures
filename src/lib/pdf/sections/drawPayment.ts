import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

export function drawPayment(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const { payment } = invoice
  const lines = [
    payment.bankName && `Banque : ${payment.bankName}`,
    payment.accountHolder && `Titulaire : ${payment.accountHolder}`,
    payment.iban && `IBAN : ${payment.iban}`,
    payment.bic && `BIC : ${payment.bic}`,
    payment.otherInstructions,
  ].filter(Boolean) as string[]
  if (lines.length === 0) return

  const left = PDF_PAGE.marginX
  cursor.ensureSpace(6 + lines.length * 4.5)

  doc.setDrawColor(...PDF_THEME.colors.hairline)
  doc.line(left, cursor.y, left + PDF_CONTENT_WIDTH, cursor.y)
  cursor.advance(6)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text('COORDONNÉES BANCAIRES', left, cursor.y)
  cursor.advance(5)

  doc.setFontSize(PDF_THEME.font.sizeBody)
  doc.setTextColor(...PDF_THEME.colors.inkSoft)
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, PDF_CONTENT_WIDTH)
    doc.text(wrapped, left, cursor.y)
    cursor.advance(wrapped.length * 4.5)
  }

  cursor.advance(PDF_THEME.spacing.betweenBlocks)
}
