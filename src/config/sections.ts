import type { SectionKey } from '../types/invoice'

export interface SectionDescriptor {
  key: SectionKey
  labelFr: string
}

/**
 * Canonical order + French label for every toggleable option, used to render
 * the SectionToggles.vue checkbox list.
 */
export const SECTION_ORDER: SectionDescriptor[] = [
  { key: 'logo', labelFr: 'Logo' },
  { key: 'sellerInfo', labelFr: "Coordonnées de l'émetteur" },
  { key: 'clientInfo', labelFr: 'Coordonnées du client' },
  { key: 'invoiceMeta', labelFr: 'Informations de facture' },
  { key: 'dueDate', labelFr: "Date d'échéance" },
  { key: 'quantityColumn', labelFr: 'Colonne quantité' },
  { key: 'unitPriceColumn', labelFr: 'Colonne prix unitaire' },
  { key: 'taxColumn', labelFr: 'Colonne taxe' },
  { key: 'lineTotalColumn', labelFr: 'Colonne montant' },
  { key: 'discount', labelFr: 'Remise' },
  { key: 'notes', labelFr: 'Notes et conditions' },
  { key: 'paymentDetails', labelFr: 'Coordonnées bancaires' },
  { key: 'signature', labelFr: 'Signature' },
]

/**
 * Subset of SectionKey that each map to one whole preview component AND one
 * whole jsPDF drawer function (an all-or-nothing block), in rendering order.
 * generateInvoicePdf.ts splits this at the items table (everything up to and
 * including `clientInfo` is drawn before it, the rest after) — see
 * BEFORE_ITEMS_TABLE / AFTER_ITEMS_TABLE below.
 *
 * The remaining keys (logo, dueDate, quantityColumn, unitPriceColumn,
 * taxColumn, discount) are sub-toggles consulted directly by the block that
 * contains them (sellerInfo reads `logo`, invoiceMeta reads `dueDate`, the
 * items table reads the column toggles, the totals block reads `discount`)
 * rather than being their own block.
 */
export const BLOCK_SECTION_ORDER: SectionKey[] = ['sellerInfo', 'invoiceMeta', 'clientInfo', 'notes', 'paymentDetails', 'signature']

const ITEMS_TABLE_SPLIT_INDEX = BLOCK_SECTION_ORDER.indexOf('notes')
export const BEFORE_ITEMS_TABLE = BLOCK_SECTION_ORDER.slice(0, ITEMS_TABLE_SPLIT_INDEX)
export const AFTER_ITEMS_TABLE = BLOCK_SECTION_ORDER.slice(ITEMS_TABLE_SPLIT_INDEX)
