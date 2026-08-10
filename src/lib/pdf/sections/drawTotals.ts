import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import type { InvoiceTotals } from '../../../lib/calculations'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { formatCurrency } from '../../../composables/useCurrencyFormat'
import { PDF_THEME } from '../pdfTheme'

const ROW_HEIGHT = 5.5

export function drawTotals(doc: jsPDF, invoice: Invoice, cursor: PdfCursor, totals: InvoiceTotals): void {
  const { currency, locale } = invoice.meta
  const rows: [string, string, boolean?][] = [['Sous-total', formatCurrency(totals.subtotal, currency, locale)]]

  if (invoice.visibleSections.discount && totals.discountAmount > 0) {
    rows.push(['Remise', `-${formatCurrency(totals.discountAmount, currency, locale)}`])
  }
  for (const group of totals.taxGroups) {
    rows.push([`TVA ${group.rate}%`, formatCurrency(group.amount, currency, locale)])
  }
  rows.push(['Total', formatCurrency(totals.grandTotal, currency, locale), true])

  const blockHeight = rows.length * ROW_HEIGHT + 4
  cursor.ensureSpace(blockHeight)

  const boxWidth = 70
  const right = PDF_PAGE.marginX + PDF_CONTENT_WIDTH
  const labelX = right - boxWidth
  let y = cursor.y

  for (const [label, value, isTotal] of rows) {
    if (isTotal) {
      y += 1.5
      doc.setDrawColor(...PDF_THEME.colors.border)
      doc.line(labelX, y - 3.5, right, y - 3.5)
      doc.setFont(PDF_THEME.font.family, 'bold')
      doc.setFontSize(PDF_THEME.font.sizeTotal - 3)
      doc.setTextColor(...PDF_THEME.colors.heading)
    } else {
      doc.setFont(PDF_THEME.font.family, 'normal')
      doc.setFontSize(PDF_THEME.font.sizeBody)
      doc.setTextColor(...PDF_THEME.colors.body)
    }
    doc.text(label, labelX, y)
    doc.text(value, right, y, { align: 'right' })
    y += ROW_HEIGHT
  }

  cursor.y = y + PDF_THEME.spacing.afterTotals
}
