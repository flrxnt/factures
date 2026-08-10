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
const LINE_TOTAL_COLUMN: ItemsColumnDef = { key: 'lineTotal', labelFr: 'Montant', width: 0.18, align: 'right' }

export interface ItemsColumnVisibility {
  showQuantity: boolean
  showUnitPrice: boolean
  showTax: boolean
  showLineTotal: boolean
}

/** Builds the active column list (with widths re-normalized to sum to 1).
 * `description` is always present; every other column is optional, each
 * independently toggleable (visibleSections.quantityColumn/unitPriceColumn/taxColumn/lineTotalColumn). */
export function buildItemsColumns({ showQuantity, showUnitPrice, showTax, showLineTotal }: ItemsColumnVisibility): ItemsColumnDef[] {
  const columns = [
    DESCRIPTION_COLUMN,
    ...(showQuantity ? [QUANTITY_COLUMN] : []),
    ...(showUnitPrice ? [UNIT_PRICE_COLUMN] : []),
    ...(showTax ? [TAX_RATE_COLUMN] : []),
    ...(showLineTotal ? [LINE_TOTAL_COLUMN] : []),
  ]
  const totalWidth = columns.reduce((sum, c) => sum + c.width, 0)
  return columns.map((c) => ({ ...c, width: c.width / totalWidth }))
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
