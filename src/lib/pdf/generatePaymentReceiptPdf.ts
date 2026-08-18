import { jsPDF } from 'jspdf'
import type { Invoice } from '../../types/invoice'
import type { Payment } from '../../types/finance'
import { PDF_PAGE, PDF_CONTENT_WIDTH } from '../../config/invoiceLayout'
import { PDF_THEME, hexToRgb, trackedUpper } from './pdfTheme'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { PdfCursor } from './pdfCursor'

/** A standalone, single-page receipt for one payment — deliberately simple
 * (not built through the multi-template invoice pipeline, since a receipt
 * has none of an invoice's layout variation) but shares the same page
 * geometry/theme tokens so it reads as the same document family. */
export function generatePaymentReceiptPdf(invoice: Invoice, payment: Payment): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cursor = new PdfCursor(doc)
  const left = PDF_PAGE.marginX
  const right = left + PDF_CONTENT_WIDTH
  const accent = hexToRgb(invoice.themeColor)

  doc.setFont(PDF_THEME.font.body, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  doc.setTextColor(...PDF_THEME.colors.muted)
  doc.text(trackedUpper('Reçu de paiement'), left, cursor.y)
  cursor.advance(10)

  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeTitle - 6)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text(invoice.seller.name || "Nom de l'entreprise", left, cursor.y)
  cursor.advance(12)

  doc.setDrawColor(...PDF_THEME.colors.hairlineStrong)
  doc.setLineWidth(0.3)
  doc.line(left, cursor.y, right, cursor.y)
  cursor.advance(10)

  const rows: [string, string][] = [
    ['Facture', invoice.meta.invoiceNumber || invoice.name || '—'],
    ['Client', invoice.client.name || '—'],
    ['Date du paiement', payment.paidAt],
    ['Moyen de paiement', payment.method || '—'],
  ]
  if (payment.reference) rows.push(['Référence', payment.reference])

  doc.setFont(PDF_THEME.font.body, 'normal')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  for (const [label, value] of rows) {
    doc.setTextColor(...PDF_THEME.colors.muted)
    doc.text(label, left, cursor.y)
    doc.setTextColor(...PDF_THEME.colors.ink)
    doc.text(value, right, cursor.y, { align: 'right' })
    cursor.advance(7)
  }

  cursor.advance(6)
  doc.setDrawColor(...PDF_THEME.colors.hairlineStrong)
  doc.line(left, cursor.y, right, cursor.y)
  cursor.advance(10)

  doc.setFont(PDF_THEME.font.body, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeBody)
  doc.setTextColor(...PDF_THEME.colors.ink)
  doc.text('Montant reçu', left, cursor.y)
  doc.setFont(PDF_THEME.font.display, 'bold')
  doc.setFontSize(PDF_THEME.font.sizeTotal)
  doc.setTextColor(...accent)
  doc.text(formatCurrency(payment.amount, invoice.meta.currency, invoice.meta.locale), right, cursor.y, { align: 'right' })
  cursor.advance(14)

  if (payment.note) {
    doc.setFont(PDF_THEME.font.body, 'normal')
    doc.setFontSize(PDF_THEME.font.sizeSmall)
    doc.setTextColor(...PDF_THEME.colors.inkSoft)
    const wrapped = doc.splitTextToSize(payment.note, PDF_CONTENT_WIDTH)
    doc.text(wrapped, left, cursor.y)
  }

  return doc
}
