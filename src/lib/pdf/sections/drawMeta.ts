import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE } from '../../../config/invoiceLayout'
import { PDF_THEME } from '../pdfTheme'

function formatDate(iso: string, locale: string): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

export function drawMeta(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const { meta, visibleSections } = invoice
  const left = PDF_PAGE.marginX
  const startY = cursor.y
  const boxHeight = 16
  const boxWidth = 90

  doc.setFillColor(...PDF_THEME.colors.tableHead)
  doc.roundedRect(left, startY, boxWidth, boxHeight, 1.5, 1.5, 'F')

  const fields: [string, string][] = [['N° facture', meta.invoiceNumber || '—'], ['Émise le', formatDate(meta.issueDate, meta.locale)]]
  if (visibleSections.dueDate) fields.push(['Échéance', formatDate(meta.dueDate, meta.locale)])

  const colWidth = boxWidth / fields.length
  fields.forEach(([label, value], i) => {
    const x = left + 4 + i * colWidth
    doc.setFont(PDF_THEME.font.family, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
    doc.setTextColor(...PDF_THEME.colors.muted)
    doc.text(label.toUpperCase(), x, startY + 6)

    doc.setFont(PDF_THEME.font.family, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    doc.setTextColor(...PDF_THEME.colors.heading)
    doc.text(value, x, startY + 12)
  })

  cursor.y = startY + boxHeight + PDF_THEME.spacing.afterMeta
}
