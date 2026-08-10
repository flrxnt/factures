import type { Invoice, SectionKey } from '../types/invoice'
import { SECTION_ORDER } from '../config/sections'

export function useSectionToggles(invoice: Invoice) {
  function isVisible(key: SectionKey): boolean {
    return invoice.visibleSections[key]
  }

  function toggle(key: SectionKey) {
    invoice.visibleSections[key] = !invoice.visibleSections[key]
  }

  return { SECTIONS: SECTION_ORDER, isVisible, toggle }
}
