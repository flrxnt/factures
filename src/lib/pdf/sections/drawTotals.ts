import type { jsPDF } from 'jspdf'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import type { InvoiceTotals } from '../../../lib/calculations'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../../config/invoiceLayout'
import { formatCurrency } from '../../../composables/useCurrencyFormat'
import { PDF_THEME, hexToRgb } from '../pdfTheme'

const ROW_HEIGHT = 5.5

function drawEmphasizedRow(doc: jsPDF, invoice: Invoice, label: string, value: string, labelX: number, right: number, y: number): void {
  const { template } = invoice
  const accent = hexToRgb(invoice.themeColor)

  if (template === 'minimal') {
    doc.setFillColor(...accent)
    doc.rect(labelX, y - 3, 1.6, 1.6, 'F')
    doc.setFont(PDF_THEME.font.body, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    doc.setTextColor(...PDF_THEME.colors.ink)
    doc.text(label.toUpperCase(), labelX + 3, y)
    doc.text(value, right, y, { align: 'right' })
    return
  }

  if (template === 'bold') {
    doc.setFont(PDF_THEME.font.body, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    doc.setTextColor(...PDF_THEME.colors.ink)
    doc.text(label.toUpperCase(), labelX, y)

    doc.setFont(PDF_THEME.font.body, 'bold')
    doc.setFontSize(PDF_THEME.font.sizeBody)
    const valueWidth = doc.getTextWidth(value)
    const pillWidth = valueWidth + 8
    doc.setFillColor(...accent)
    doc.roundedRect(right - pillWidth, y - 4.5, pillWidth, 6.5, 3.25, 3.25, 'F')
    doc.setTextColor(255, 253, 248)
    doc.text(value, right - pillWidth / 2, y, { align: 'center' })
    return
  }

  // editorial
  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeTotal)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(label, labelX, y)
  doc.setTextColor(...accent)
  doc.text(value, right, y, { align: 'right' })
}

export function drawTotals(doc: jsPDF, invoice: Invoice, cursor: PdfCursor, totals: InvoiceTotals): void {
  const { currency, locale } = invoice.meta
  const { template } = invoice
  // Only actually shifts emphasis to "Net à payer" once withholding is both
  // toggled on AND has a non-zero effect — mirrors PreviewTotals.vue.
  const withholdingActive = invoice.visibleSections.withholding && totals.withholdingAmount > 0

  const rows: [string, string, boolean?][] = [['Sous-total', formatCurrency(totals.subtotal, currency, locale)]]

  if (invoice.visibleSections.discount && totals.discountAmount > 0) {
    rows.push(['Remise', `-${formatCurrency(totals.discountAmount, currency, locale)}`])
  }
  for (const group of totals.taxGroups) {
    if (group.rate <= 0) continue // 0% contributes nothing — no need to clutter the totals block
    rows.push([`TVA ${group.rate}%`, formatCurrency(group.amount, currency, locale)])
  }
  rows.push(['Total', formatCurrency(totals.grandTotal, currency, locale), !withholdingActive])

  if (withholdingActive) {
    rows.push([`Retenue ${totals.withholdingRatePercent}%`, `-${formatCurrency(totals.withholdingAmount, currency, locale)}`])
    rows.push(['Net à payer', formatCurrency(totals.netPayable, currency, locale), true])
  }

  const blockHeight = rows.length * ROW_HEIGHT + 4
  cursor.ensureSpace(blockHeight)

  const boxWidth = 70
  const right = PDF_PAGE.marginX + PDF_CONTENT_WIDTH
  const labelX = right - boxWidth
  let y = cursor.y

  for (const [label, value, isEmphasized] of rows) {
    if (isEmphasized) {
      y += 2
      if (template === 'editorial') {
        doc.setDrawColor(...PDF_THEME.colors.hairlineStrong)
        doc.setLineWidth(0.3)
        doc.line(labelX, y - 4, right, y - 4)
        doc.setLineWidth(0.1)
      }
      drawEmphasizedRow(doc, invoice, label, value, labelX, right, y)
    } else {
      doc.setFont(PDF_THEME.font.body, 'normal')
      doc.setFontSize(PDF_THEME.font.sizeBody)
      doc.setTextColor(...PDF_THEME.colors.inkSoft)
      doc.text(label, labelX, y)
      doc.text(value, right, y, { align: 'right' })
    }
    y += ROW_HEIGHT
  }

  cursor.y = y + PDF_THEME.spacing.afterTotals
}
