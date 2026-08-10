import type { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Invoice } from '../../../types/invoice'
import type { PdfCursor } from '../pdfCursor'
import { PDF_PAGE, PDF_CONTENT_WIDTH, buildItemsColumns } from '../../../config/invoiceLayout'
import { lineTotal } from '../../../lib/calculations'
import { formatCurrency } from '../../../composables/useCurrencyFormat'
import { PDF_THEME } from '../pdfTheme'

export function drawItemsTable(doc: jsPDF, invoice: Invoice, cursor: PdfCursor): void {
  const columns = buildItemsColumns({
    showQuantity: invoice.visibleSections.quantityColumn,
    showUnitPrice: invoice.visibleSections.unitPriceColumn,
    showTax: invoice.visibleSections.taxColumn,
    showLineTotal: invoice.visibleSections.lineTotalColumn,
  })
  const { currency, locale } = invoice.meta

  const head = [columns.map((c) => c.labelFr.toUpperCase())]
  const body = invoice.items.map((item) =>
    columns.map((col) => {
      switch (col.key) {
        case 'description':
          return item.description || '—'
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
      lineWidth: 0.15,
      cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 0 },
    },
    headStyles: {
      fillColor: false,
      textColor: PDF_THEME.colors.muted,
      fontStyle: 'bold',
      fontSize: PDF_THEME.font.sizeSectionLabel,
      lineWidth: { bottom: 0.3 },
      lineColor: PDF_THEME.colors.hairlineStrong,
    },
    bodyStyles: {
      lineWidth: { bottom: 0.15 },
    },
    columnStyles,
    theme: 'plain',
  })

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  cursor.y = finalY + PDF_THEME.spacing.afterTable
}
