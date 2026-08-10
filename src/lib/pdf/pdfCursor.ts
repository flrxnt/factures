import type { jsPDF } from 'jspdf'
import { PDF_PAGE } from '../../config/invoiceLayout'

/** Tracks the current vertical drawing position and inserts page breaks when
 * a block wouldn't fit, so section drawers don't each hand-roll pagination. */
export class PdfCursor {
  doc: jsPDF
  y: number

  constructor(doc: jsPDF) {
    this.doc = doc
    this.y = PDF_PAGE.marginTop
  }

  /** Adds a new page and resets y to the top margin if `heightNeeded` mm
   * wouldn't fit before the bottom margin. */
  ensureSpace(heightNeeded: number): void {
    const bottomLimit = PDF_PAGE.height - PDF_PAGE.marginBottom
    if (this.y + heightNeeded > bottomLimit) {
      this.doc.addPage()
      this.y = PDF_PAGE.marginTop
    }
  }

  advance(amount: number): void {
    this.y += amount
  }
}
