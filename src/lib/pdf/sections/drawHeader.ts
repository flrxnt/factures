import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

const LOGO_SIZE = 18

export function drawHeader(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const { seller, visibleSections } = invoice
  const left = PDF_PAGE.marginX
  const startY = cursor.y
  let textX = left

  if (visibleSections.logo && seller.logoDataUrl) {
    try {
      doc.addImage(seller.logoDataUrl, 'JPEG', left, startY, LOGO_SIZE, LOGO_SIZE)
      textX = left + LOGO_SIZE + 4
    } catch {
      // Corrupt/unsupported image data: skip silently, seller text still renders.
    }
  }

  doc.setFont(PDF_THEME.font.family, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody + 1)
  doc.setTextColor(...PDF_THEME.colors.heading)
  doc.text(seller.name || "Nom de l'entreprise", textX, startY + 4)

  doc.setFont(PDF_THEME.font.family, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.body)

  const lines = [
    seller.addressLine1,
    seller.addressLine2,
    [seller.postalCode, seller.city].filter(Boolean).join(' '),
    seller.country,
    seller.taxId && `N° fiscal : ${seller.taxId}`,
    seller.email,
    seller.phone,
  ].filter(Boolean) as string[]

  let lineY = startY + 9
  for (const line of lines) {
    doc.text(line, textX, lineY)
    lineY += 4
  }

  doc.setFont(PDF_THEME.font.family, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeTitle)
  doc.setTextColor(...PDF_THEME.colors.accent)
  doc.text('FACTURE', left + PDF_CONTENT_WIDTH, startY + 6, { align: 'right' })

  const blockHeight = Math.max(LOGO_SIZE, lineY - startY)
  cursor.y = startY + blockHeight + PDF_THEME.spacing.afterHeader
}
