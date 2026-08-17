import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { PDF_THEME, hexToRgb, trackedUpper } from '../pdfTheme'
import { getDocumentTypeDescriptor } from '../../../config/documentTypes'

const LOGO_SIZE = 16

function drawSellerBlock(doc: jsPDF, invoice: Invoice, textX: number, startY: number, nameSize: number): number {
  const { seller } = invoice
  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(nameSize)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(seller.name || "Nom de l'entreprise", textX, startY + 5)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.inkSoft)

  const lines = [
    seller.addressLine1,
    seller.addressLine2,
    [seller.postalCode, seller.city].filter(Boolean).join(' '),
    seller.country,
    seller.taxId && `N° fiscal : ${seller.taxId}`,
    seller.email,
    seller.phone,
  ].filter(Boolean) as string[]

  let lineY = startY + 10.5
  for (const line of lines) {
    doc.text(line, textX, lineY)
    lineY += 4
  }
  return lineY
}

export function drawHeader(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const { seller, visibleSections, template } = invoice
  const left = PDF_PAGE.marginX
  const right = left + PDF_CONTENT_WIDTH
  const startY = cursor.y
  const docTitle = getDocumentTypeDescriptor(invoice.docType).pdfTitleFr

  if (template === 'minimal') {
    doc.setFillColor(...hexToRgb(invoice.themeColor))
    doc.rect(left, startY + 0.5, 2.2, 2.2, 'F')
    doc.setFont(PDF_THEME.font.body, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    doc.setTextColor(...PDF_THEME.colors.ink)
    doc.text(trackedUpper(docTitle), left + 5, startY + 2.5)

    let textX = left
    const logoY = startY + 9
    if (visibleSections.logo && seller.logoDataUrl) {
      try {
        doc.addImage(seller.logoDataUrl, 'JPEG', left, logoY, LOGO_SIZE * 0.7, LOGO_SIZE * 0.7)
        textX = left + LOGO_SIZE * 0.7 + 4
      } catch {
        // Corrupt/unsupported image data: skip silently.
      }
    }
    const bottomY = drawSellerBlock(doc, invoice, textX, logoY, PDF_THEME.font.sizeBody)
    cursor.y = Math.max(logoY + LOGO_SIZE * 0.7, bottomY) + PDF_THEME.spacing.afterHeader
    return
  }

  if (template === 'bold') {
    const bandHeight = 18
    doc.setFillColor(...hexToRgb(invoice.themeColor))
    doc.roundedRect(left, startY, PDF_CONTENT_WIDTH, bandHeight, 1.5, 1.5, 'F')
    doc.setFont(PDF_THEME.font.body, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeTitle - 4)
    doc.setTextColor(255, 253, 248) // paper
    doc.text(docTitle.toUpperCase(), left + 6, startY + bandHeight / 2 + 3)

    if (visibleSections.logo && seller.logoDataUrl) {
      try {
        doc.addImage(seller.logoDataUrl, 'JPEG', right - LOGO_SIZE - 4, startY + (bandHeight - LOGO_SIZE) / 2, LOGO_SIZE, LOGO_SIZE)
      } catch {
        // Corrupt/unsupported image data: skip silently.
      }
    }

    const sellerStartY = startY + bandHeight + 8
    const bottomY = drawSellerBlock(doc, invoice, left, sellerStartY - 5, PDF_THEME.font.sizeBody + 2)
    cursor.y = bottomY + PDF_THEME.spacing.afterHeader
    return
  }

  // editorial (default)
  let textX = left
  if (visibleSections.logo && seller.logoDataUrl) {
    try {
      doc.addImage(seller.logoDataUrl, 'JPEG', left, startY, LOGO_SIZE, LOGO_SIZE)
      textX = left + LOGO_SIZE + 4
    } catch {
      // Corrupt/unsupported image data: skip silently, seller text still renders.
    }
  }

  const lineY = drawSellerBlock(doc, invoice, textX, startY, PDF_THEME.font.sizeBody + 3)

  doc.setFont(PDF_THEME.font.display, 'bolditalic')
  doc.setFontSize(PDF_THEME.font.sizeTitle)
  doc.setTextColor(...hexToRgb(invoice.themeColor))
  doc.text(docTitle, right, startY + 7, { align: 'right' })

  const blockHeight = Math.max(LOGO_SIZE, lineY - startY)
  cursor.y = startY + blockHeight + PDF_THEME.spacing.afterHeader
}
