import type { DocumentType, Invoice } from '../types/invoice'

export interface DocumentTypeDescriptor {
  value: DocumentType
  labelFr: string
  /** The title drawn on the document itself (PDF header, on-screen preview) —
   * distinct from labelFr in case a future type needs a different phrasing
   * for its list-label vs. its printed title. For 'custom' this is a
   * fallback only — the real title comes from `Invoice.customTypeLabel`,
   * see getDocumentLabel/getDocumentPdfTitle below. */
  pdfTitleFr: string
}

export const DOCUMENT_TYPE_ORDER: DocumentTypeDescriptor[] = [
  { value: 'invoice', labelFr: 'Facture', pdfTitleFr: 'Facture' },
  { value: 'quote', labelFr: 'Devis', pdfTitleFr: 'Devis' },
  { value: 'purchase_order', labelFr: 'Bon de commande fournisseur', pdfTitleFr: 'Bon de commande' },
  { value: 'work_order', labelFr: "Bon d'intervention", pdfTitleFr: "Bon d'intervention" },
  { value: 'delivery_note', labelFr: 'Bon de livraison', pdfTitleFr: 'Bon de livraison' },
  { value: 'goods_receipt', labelFr: "Bon d'entrée", pdfTitleFr: "Bon d'entrée" },
  { value: 'reservation', labelFr: 'Réservation', pdfTitleFr: 'Réservation' },
  { value: 'receipt', labelFr: 'Reçu', pdfTitleFr: 'Reçu' },
  { value: 'custom', labelFr: 'Document personnalisé', pdfTitleFr: 'Document' },
]

const DOCUMENT_TYPE_MAP = new Map(DOCUMENT_TYPE_ORDER.map((d) => [d.value, d]))

export function getDocumentTypeDescriptor(type: DocumentType): DocumentTypeDescriptor {
  return DOCUMENT_TYPE_MAP.get(type) ?? DOCUMENT_TYPE_ORDER[0]
}

/** List-label/badge text for a specific invoice — for 'custom' this is the
 * user's own label (falling back to the generic one while it's still empty)
 * rather than the fixed "Document personnalisé" descriptor text. */
export function getDocumentLabel(invoice: Pick<Invoice, 'docType' | 'customTypeLabel'>): string {
  if (invoice.docType === 'custom') return (invoice.customTypeLabel ?? '').trim() || getDocumentTypeDescriptor('custom').labelFr
  return getDocumentTypeDescriptor(invoice.docType).labelFr
}

/** Same as getDocumentLabel but for the title drawn on the document itself
 * (PDF header / on-screen preview) — kept separate since a future type could
 * want the two to diverge. */
export function getDocumentPdfTitle(invoice: Pick<Invoice, 'docType' | 'customTypeLabel'>): string {
  if (invoice.docType === 'custom') return (invoice.customTypeLabel ?? '').trim() || getDocumentTypeDescriptor('custom').pdfTitleFr
  return getDocumentTypeDescriptor(invoice.docType).pdfTitleFr
}
