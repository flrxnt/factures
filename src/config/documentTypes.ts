import type { DocumentType } from '../types/invoice'

export interface DocumentTypeDescriptor {
  value: DocumentType
  labelFr: string
  /** The title drawn on the document itself (PDF header, on-screen preview) —
   * distinct from labelFr in case a future type needs a different phrasing
   * for its list-label vs. its printed title (none do yet, but keeping them
   * separate avoids a breaking rename later). */
  pdfTitleFr: string
}

export const DOCUMENT_TYPE_ORDER: DocumentTypeDescriptor[] = [
  { value: 'invoice', labelFr: 'Facture', pdfTitleFr: 'Facture' },
  { value: 'quote', labelFr: 'Devis', pdfTitleFr: 'Devis' },
]

const DOCUMENT_TYPE_MAP = new Map(DOCUMENT_TYPE_ORDER.map((d) => [d.value, d]))

export function getDocumentTypeDescriptor(type: DocumentType): DocumentTypeDescriptor {
  return DOCUMENT_TYPE_MAP.get(type) ?? DOCUMENT_TYPE_ORDER[0]
}
