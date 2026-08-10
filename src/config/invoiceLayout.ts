export interface ItemsColumnDef {
  key: 'description' | 'quantity' | 'unitPrice' | 'taxRate' | 'lineTotal'
  labelFr: string
  /** Fraction of the total table width, used both as CSS grid-template-columns
   *  weights (preview) and converted to mm widths for jspdf-autotable (PDF). */
  width: number
  align: 'left' | 'right'
}

/** Columns always present, in order. The `taxRate` column is inserted
 * conditionally by consumers based on visibleSections.taxColumn. */
export const BASE_ITEMS_COLUMNS: ItemsColumnDef[] = [
  { key: 'description', labelFr: 'Description', width: 0.42, align: 'left' },
  { key: 'quantity', labelFr: 'Qté', width: 0.12, align: 'right' },
  { key: 'unitPrice', labelFr: 'Prix unitaire', width: 0.18, align: 'right' },
  { key: 'lineTotal', labelFr: 'Total', width: 0.18, align: 'right' },
]

export const TAX_RATE_COLUMN: ItemsColumnDef = {
  key: 'taxRate',
  labelFr: 'TVA',
  width: 0.1,
  align: 'right',
}

/** Builds the active column list (with widths re-normalized to sum to 1),
 * inserted before the lineTotal column so tax stays a preview-of-total step. */
export function buildItemsColumns(showTaxColumn: boolean): ItemsColumnDef[] {
  const columns = showTaxColumn
    ? [...BASE_ITEMS_COLUMNS.slice(0, 3), TAX_RATE_COLUMN, BASE_ITEMS_COLUMNS[3]]
    : [...BASE_ITEMS_COLUMNS]
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
