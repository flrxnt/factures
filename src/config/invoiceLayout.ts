export interface ItemsColumnDef {
  key: 'description' | 'quantity' | 'unitPrice' | 'taxRate' | 'lineTotal'
  labelFr: string
  /** Fraction of the total table width, used both as CSS grid-template-columns
   *  weights (preview) and converted to mm widths for jspdf-autotable (PDF). */
  width: number
  align: 'left' | 'right'
}

const DESCRIPTION_COLUMN: ItemsColumnDef = { key: 'description', labelFr: 'Description', width: 0.42, align: 'left' }
const QUANTITY_COLUMN: ItemsColumnDef = { key: 'quantity', labelFr: 'Qté', width: 0.12, align: 'right' }
const UNIT_PRICE_COLUMN: ItemsColumnDef = { key: 'unitPrice', labelFr: 'Prix unitaire', width: 0.18, align: 'right' }
const TAX_RATE_COLUMN: ItemsColumnDef = { key: 'taxRate', labelFr: 'TVA', width: 0.1, align: 'right' }
const LINE_TOTAL_COLUMN: ItemsColumnDef = { key: 'lineTotal', labelFr: 'Total', width: 0.18, align: 'right' }

export interface ItemsColumnVisibility {
  showQuantity: boolean
  showUnitPrice: boolean
  showTax: boolean
}

/** Builds the active column list (with widths re-normalized to sum to 1).
 * `description` and `lineTotal` are always present; the rest are optional,
 * each independently toggleable (visibleSections.quantityColumn/unitPriceColumn/taxColumn). */
export function buildItemsColumns({ showQuantity, showUnitPrice, showTax }: ItemsColumnVisibility): ItemsColumnDef[] {
  const columns = [
    DESCRIPTION_COLUMN,
    ...(showQuantity ? [QUANTITY_COLUMN] : []),
    ...(showUnitPrice ? [UNIT_PRICE_COLUMN] : []),
    ...(showTax ? [TAX_RATE_COLUMN] : []),
    LINE_TOTAL_COLUMN,
  ]
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0)
  return columns.map((c) => ({ ...c, width: c.width / totalWidth }))
}

/** Fixed-width CSS grid-template-columns for the editable line-items FORM row
 * (as opposed to the fluid `fr`-based preview/PDF table): a `1fr` description
 * column plus a fixed-width column per visible toggle, and a remove-button
 * column. Shared by LineItemsForm.vue's header row and LineItemRow.vue so
 * they always stay aligned. */
export function buildFormRowGridTemplate({ showQuantity, showUnitPrice, showTax }: ItemsColumnVisibility): string {
  const columns = ['1fr']
  if (showQuantity) columns.push('4.5rem')
  if (showUnitPrice) columns.push('7rem')
  if (showTax) columns.push('4.5rem')
  columns.push('7rem', '2rem')
  return columns.join(' ')
}

/** PDF page geometry (mm, A4). */
export const PDF_PAGE = {
  width: 210,
  height: 297,
  marginX: 16,
  marginTop: 18,
  marginBottom: 18,
}

export const PDF_CONTENT_WIDTH = PDF_PAGE.width - PDF_PAGE.marginX * 2
