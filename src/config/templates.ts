import type { InvoiceTemplate } from '../types/invoice'

export interface TemplateDescriptor {
  value: InvoiceTemplate
  labelFr: string
  description: string
}

/**
 * Each template changes real layout — title typography/placement, whether
 * there's a colored header band, table header treatment — not just the
 * accent color (that's the separate, always-available color picker in
 * ThemeForm.vue; every template can still be recolored).
 */
export const TEMPLATE_ORDER: TemplateDescriptor[] = [
  { value: 'editorial', labelFr: 'Éditorial', description: 'Serif italique, tons papier, hairlines discrètes.' },
  { value: 'minimal', labelFr: 'Minimal', description: 'Sans-serif épuré, presque monochrome, beaucoup de blanc.' },
  { value: 'bold', labelFr: 'Affirmé', description: 'Bandeau coloré, fort contraste, tableau structuré.' },
]

const TEMPLATE_MAP = new Map(TEMPLATE_ORDER.map((t) => [t.value, t]))

export function getTemplateDescriptor(template: InvoiceTemplate): TemplateDescriptor {
  return TEMPLATE_MAP.get(template) ?? TEMPLATE_ORDER[0]
}
