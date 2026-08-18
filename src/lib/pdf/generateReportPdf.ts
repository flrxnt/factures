import { jsPDF } from 'jspdf'
import type { RevenueReport, MarginReport, StockValuationReport, ReportPeriod } from '../reports'
import { REPORT_PERIOD_ORDER } from '../reports'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../config/invoiceLayout'
import { PDF_THEME, trackedUpper } from './pdfTheme'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '../../config/defaults'
import { PdfCursor } from './pdfCursor'

const fmt = (amount: number) => formatCurrency(amount, DEFAULT_CURRENCY, DEFAULT_LOCALE)

export interface ReportPdfData {
  period: ReportPeriod
  revenue: RevenueReport
  margin: MarginReport
  stockValuation: StockValuationReport
  expensesTotal: number
}

function drawKeyValueRow(doc: jsPDF, cursor: PdfCursor, left: number, right: number, label: string, value: string): void {
  cursor.ensureSpace(7)
  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text(label, left, cursor.y)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(value, right, cursor.y, { align: 'right' })
  cursor.advance(7)
}

function drawSectionTitle(doc: jsPDF, cursor: PdfCursor, left: number, title: string): void {
  cursor.ensureSpace(10)
  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody + 2)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(title, left, cursor.y)
  cursor.advance(8)
}

/** A single-page-friendly (paginates if needed) summary of the report screen
 * — deliberately its own standalone jsPDF drawer, same reasoning as the
 * payment receipt: a report has no per-invoice layout variation to share
 * with the multi-template invoice pipeline. */
export function generateReportPdf(data: ReportPdfData): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cursor = new PdfCursor(doc)
  const left = PDF_PAGE.marginX
  const right = left + PDF_CONTENT_WIDTH
  const periodLabel = REPORT_PERIOD_ORDER.find((p) => p.value === data.period)?.labelFr ?? data.period

  doc.setFont(PDF_THEME.font.body, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text(trackedUpper('Rapport'), left, cursor.y)
  cursor.advance(10)

  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeTitle - 6)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(periodLabel, left, cursor.y)
  cursor.advance(6)

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeSmall)
  doc.setTextColor(...PDF_THEME.colors.inkSoft)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, left, cursor.y)
  cursor.advance(8)

  doc.setDrawColor(...PDF_THEME.colors.hairlineStrong)
  doc.setLineWidth(0.3)
  doc.line(left, cursor.y, right, cursor.y)
  cursor.advance(10)

  drawKeyValueRow(doc, cursor, left, right, 'CA (HT)', fmt(data.revenue.revenueHt))
  drawKeyValueRow(doc, cursor, left, right, 'TVA collectée', fmt(data.revenue.vatCollected))
  drawKeyValueRow(doc, cursor, left, right, 'Encaissé', fmt(data.revenue.collected))
  drawKeyValueRow(doc, cursor, left, right, 'Impayés', fmt(data.revenue.unpaid))
  drawKeyValueRow(doc, cursor, left, right, 'Marge brute', fmt(data.margin.margin))
  drawKeyValueRow(doc, cursor, left, right, 'Dépenses', fmt(data.expensesTotal))
  drawKeyValueRow(doc, cursor, left, right, 'Valorisation du stock', fmt(data.stockValuation.totalValue))
  cursor.advance(4)

  if (data.margin.byProduct.length > 0) {
    drawSectionTitle(doc, cursor, left, 'Marge par produit')
    for (const row of data.margin.byProduct.slice(0, 20)) {
      drawKeyValueRow(doc, cursor, left, right, `${row.productName} (×${row.quantitySold})`, fmt(row.margin))
    }
    cursor.advance(4)
  }

  if (data.stockValuation.lines.length > 0) {
    drawSectionTitle(doc, cursor, left, 'Valorisation du stock par produit')
    for (const row of data.stockValuation.lines.slice(0, 20)) {
      drawKeyValueRow(doc, cursor, left, right, `${row.productName} (×${row.quantity})`, fmt(row.value))
    }
  }

  return doc
}
