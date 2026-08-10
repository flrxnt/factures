import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

export function drawClient(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const { client } = invoice
  const left = PDF_PAGE.marginX
  const startY = cursor.y

  doc.setFont(PDF_THEME.font.family, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text('FACTURÉ À', left, startY)

  doc.setFont(PDF_THEME.font.family, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody + 1)
  doc.setTextColor(...PDF_THEME.colors.heading)
  doc.text(client.name || 'Nom du client', left, startY + 5)

  doc.setFont(PDF_THEME.font.family, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.body)

  const lines = [
    client.addressLine1,
    client.addressLine2,
    [client.postalCode, client.city].filter(Boolean).join(' '),
    client.country,
    client.taxId && `N° fiscal : ${client.taxId}`,
    client.email,
    client.phone,
  ].filter(Boolean) as string[]

  let lineY = startY + 10
  for (const line of lines) {
    doc.text(line, left, lineY)
    lineY += 4
  }

  cursor.y = lineY + PDF_THEME.spacing.afterClient
}
