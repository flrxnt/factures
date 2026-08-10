import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
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
  const right = left + PDF_CONTENT_WIDTH
  const blockHeight = 15
  const topY = cursor.y
  const textBaseline = topY + 9.5

  const fields: [string, string][] = [['N° facture', meta.invoiceNumber || '—'], ['Émise le', formatDate(meta.issueDate, meta.locale)]]
  if (visibleSections.dueDate) fields.push(['Échéance', formatDate(meta.dueDate, meta.locale)])

  const colWidth = 42
  doc.setDrawColor(...PDF_THEME.colors.hairlineStrong)
  doc.setLineWidth(0.3)
  doc.line(left, topY, right, topY)

  fields.forEach(([label, value], i) => {
    const x = left + i * colWidth
    doc.setFont(PDF_THEME.font.body, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeSectionLabel)
    doc.setTextColor(...PDF_THEME.colors.muted)
    doc.text(label.toUpperCase(), x, topY + 5.5)

    doc.setFont(PDF_THEME.font.body, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    doc.setTextColor(...PDF_THEME.colors.ink)
    doc.text(value, x, textBaseline)
  })

  doc.line(left, topY + blockHeight, right, topY + blockHeight)
  doc.setLineWidth(0.1)

  cursor.y = topY + blockHeight + PDF_THEME.spacing.afterMeta
}
