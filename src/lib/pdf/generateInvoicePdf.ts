import { jsPDF } from 'jspdf'
import type { Invoice, SectionKey } from '../../types/invoice'
import { BEFORE_ITEMS_TABLE, AFTER_ITEMS_TABLE } from '../../config/sections'
import { computeInvoiceTotals } from '../calculations'
import { PdfCursor } from './pdfCursor'
import { drawHeader } from './sections/drawHeader'
import { drawMeta } from './sections/drawMeta'
import { drawClient } from './sections/drawClient'
import { drawItemsTable } from './sections/drawItemsTable'
import { drawTotals } from './sections/drawTotals'
import { drawNotes } from './sections/drawNotes'
import { drawPayment } from './sections/drawPayment'
import { drawSignature } from './sections/drawSignature'
import { drawFooter } from './sections/drawFooter'

type BlockDrawer = (doc: jsPDF, invoice: Invoice, cursor: PdfCursor) => void

/**
 * Maps each whole-block SectionKey (see config/sections.ts BLOCK_SECTION_ORDER)
 * to its jsPDF drawer. sellerInfo's drawer also renders the `logo` sub-toggle;
 * invoiceMeta's drawer also renders the `dueDate` sub-toggle.
 */
const BLOCK_DRAWERS: Partial<Record<SectionKey, BlockDrawer>> = {
  sellerInfo: drawHeader,
  invoiceMeta: drawMeta,
  clientInfo: drawClient,
  notes: drawNotes,
  paymentDetails: drawPayment,
  signature: drawSignature,
}

export function generateInvoicePdf(invoice: Invoice): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cursor = new PdfCursor(doc)

  for (const key of BEFORE_ITEMS_TABLE) {
    if (!invoice.visibleSections[key]) continue
    BLOCK_DRAWERS[key]?.(doc, invoice, cursor)
  }

  drawItemsTable(doc, invoice, cursor)

  const totals = computeInvoiceTotals(invoice)
  drawTotals(doc, invoice, cursor, totals)

  for (const key of AFTER_ITEMS_TABLE) {
    if (!invoice.visibleSections[key]) continue
    BLOCK_DRAWERS[key]?.(doc, invoice, cursor)
  }

  drawFooter(doc, invoice)

  return doc
}
