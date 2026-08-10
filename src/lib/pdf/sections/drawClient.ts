import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

export function drawClient(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const { client } = invoice
  const left = PDF_PAGE.marginX
  const startY = cursor.y

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text('FACTURÉ À', left, startY)

  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody + 2)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(client.name || 'Nom du client', left, startY + 6)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.inkSoft)

  const lines = [
    client.addressLine1,
    client.addressLine2,
    [client.postalCode, client.city].filter(Boolean).join(' '),
    client.country,
    client.taxId && `N° fiscal : ${client.taxId}`,
    client.email,
    client.phone,
  ].filter(Boolean) as string[]

  let lineY = startY + 11.5
  for (const line of lines) {
    doc.text(line, left, lineY)
    lineY += 4
  }

  cursor.y = lineY + PDF_THEME.spacing.afterClient
}
