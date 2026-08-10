/** Tiptap's empty-document HTML is "<p></p>" — not an empty string — so a
 * plain falsy check on the raw HTML doesn't detect "nothing typed yet". */
export function isEmptyHtml(html: string): boolean {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped.length === 0
}

/**
 * Converts the constrained HTML subset our RichTextEditor (Tiptap
 * StarterKit: paragraphs, bold/italic marks, bullet/ordered lists) can
 * produce into structured plain text — block breaks preserved as newlines,
 * list items prefixed with "• " / "1. " — but bold/italic styling dropped.
 *
 * Used for the PDF and CSV exports, which need a plain string. The PDF
 * specifically favors this over rendering real bold/italic runs: jsPDF/
 * jspdf-autotable size table rows from plain text, and reliably reproducing
 * that layout for arbitrarily-styled rich text would risk clipped or
 * overlapping cells — not an acceptable tradeoff for an invoice document.
 * Structure (paragraphs, lists) is preserved; only inline emphasis is lost.
 */
export function htmlToPlainText(html: string): string {
  if (isEmptyHtml(html)) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const lines: string[] = []

  function walkList(list: Element, ordered: boolean) {
    let index = 1
    for (const item of Array.from(list.children)) {
      if (item.tagName !== 'LI') continue
      const prefix = ordered ? `${index}. ` : '• '
      lines.push(prefix + (item.textContent ?? '').trim())
      index += 1
    }
  }

  for (const node of Array.from(doc.body.children)) {
    if (node.tagName === 'UL') walkList(node, false)
    else if (node.tagName === 'OL') walkList(node, true)
    else {
      const text = (node.textContent ?? '').trim()
      if (text) lines.push(text)
    }
  }

  return lines.join('\n')
}
