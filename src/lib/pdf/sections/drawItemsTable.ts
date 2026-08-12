import type { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH, buildItemsColumns } from '../../../config/invoiceLayout'
import { lineTotal } from '../../../lib/calculations'
import { formatCurrency } from '../../../composables/useCurrencyFormat'
import { htmlToPlainText } from '../../../lib/richText'
import type { RichLine } from '../../../lib/richText'
import { htmlToWrappedRichLines, hasRichFormatting, drawRichLines } from '../richTextPdf'
import { PDF_THEME, hexToRgb, lighten } from '../pdfTheme'

export function drawItemsTable(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const columns = buildItemsColumns({
    showQuantity: invoice.visibleSections.quantityColumn,
    showUnitPrice: invoice.visibleSections.unitPriceColumn,
    showTax: invoice.visibleSections.taxColumn,
    showLineTotal: invoice.visibleSections.lineTotalColumn,
  })
  const { currency, locale } = invoice.meta
  const { template } = invoice
  const descriptionColumnIndex = columns.findIndex((c) => c.key === 'description')

  const head = [columns.map((c) => c.labelFr.toUpperCase())]
  const body = invoice.items.map((item) =>
    columns.map((col) => {
      switch (col.key) {
        case 'description':
          return htmlToPlainText(item.description) || '—'
        case 'quantity':
          return String(item.quantity)
        case 'unitPrice':
          return formatCurrency(item.unitPrice, currency, locale)
        case 'taxRate':
          return `${item.taxRatePercent}%`
        case 'lineTotal':
          return formatCurrency(lineTotal(item), currency, locale)
        default:
          return ''
      }
    }),
  )

  const columnStyles: Record<number, { cellWidth: number; halign: 'left' | 'right' }> = {}
  columns.forEach((col, i) => {
    columnStyles[i] = { cellWidth: col.width * PDF_CONTENT_WIDTH, halign: col.align }
  })

  if (template === 'minimal') {
    doc.setDrawColor(...PDF_THEME.colors.hairline)
    doc.setLineWidth(0.2)
    doc.line(PDF_PAGE.marginX, cursor.y, PDF_PAGE.marginX + PDF_CONTENT_WIDTH, cursor.y)
    cursor.advance(2)
  }

  // jspdf-autotable only ever draws a single plain-text run per cell, so
  // bold/italic marks in a description would otherwise be silently dropped.
  // willDrawCell fires after row heights are already locked in, so blanking
  // the cell's text here is safe — it can't retroactively shrink the row —
  // and didDrawCell then paints the real bold/italic runs on top.
  const richLinesByRow = new Map<number, RichLine[]>()

  autoTable(doc, {
    head,
    body,
    startY: cursor.y,
    margin: { left: PDF_PAGE.marginX, right: PDF_PAGE.marginX, bottom: PDF_PAGE.marginBottom },
    styles: {
      font: PDF_THEME.font.body,
      fontSize: PDF_THEME.font.sizeSmall,
      textColor: PDF_THEME.colors.inkSoft,
      lineColor: PDF_THEME.colors.hairline,
      lineWidth: template === 'minimal' ? 0 : 0.15,
      cellPadding: template === 'bold' ? { top: 2.5, bottom: 2.5, left: 2, right: 2 } : { top: 2.5, bottom: 2.5, left: 0, right: 0 },
    },
    headStyles:
      template === 'bold'
        ? {
            fillColor: lighten(hexToRgb(invoice.themeColor), 0.82),
            textColor: PDF_THEME.colors.ink,
            fontStyle: 'bold',
            fontSize: PDF_THEME.font.sizeSectionLabel,
          }
        : {
            fillColor: false,
            textColor: PDF_THEME.colors.muted,
            fontStyle: 'bold',
            fontSize: PDF_THEME.font.sizeSectionLabel,
            lineWidth: template === 'minimal' ? 0 : { bottom: 0.3 },
            lineColor: PDF_THEME.colors.hairlineStrong,
          },
    bodyStyles: {
      lineWidth: template === 'minimal' ? 0 : { bottom: 0.15 },
    },
    columnStyles,
    theme: template === 'bold' ? 'grid' : 'plain',
    willDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== descriptionColumnIndex) return
      const item = invoice.items[data.row.index]
      if (!item) return
      const maxWidth = data.cell.width - data.cell.padding('horizontal')
      const wrapped = htmlToWrappedRichLines(doc, item.description, maxWidth, PDF_THEME.font.sizeSmall)
      if (!hasRichFormatting(wrapped)) return
      richLinesByRow.set(data.row.index, wrapped)
      data.cell.text = ['']
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== descriptionColumnIndex) return
      const wrapped = richLinesByRow.get(data.row.index)
      if (!wrapped) return
      doc.setTextColor(...PDF_THEME.colors.inkSoft)
      const pos = data.cell.getTextPos()
      drawRichLines(doc, wrapped, pos.x, pos.y, PDF_THEME.font.body, PDF_THEME.font.sizeSmall)
      richLinesByRow.delete(data.row.index)
    },
  })

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  cursor.y = finalY + PDF_THEME.spacing.afterTable
}
