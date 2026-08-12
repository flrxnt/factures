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
 * Used for the CSV export (needs a plain string) and as the row-height
 * reference for the PDF's items table (see lib/pdf/richTextPdf.ts, which
 * renders the actual bold/italic runs — this plain version must stay in
 * sync with htmlToRichLines()'s text content for that to line up).
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

export interface TextRun {
  text: string
  bold: boolean
  italic: boolean
}

/** One paragraph or list item, as an ordered sequence of styled runs. */
export type RichLine = TextRun[]

/**
 * Same structural walk as htmlToPlainText (paragraphs → lines, list items
 * prefixed) but preserving bold/italic marks as runs instead of dropping
 * them. Concatenating a line's run texts always reproduces the exact string
 * htmlToPlainText would have produced for that line — the PDF relies on
 * that to reuse jspdf-autotable's own row-height/wrapping (see
 * lib/pdf/richTextPdf.ts).
 */
export function htmlToRichLines(html: string): RichLine[] {
  if (isEmptyHtml(html)) return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const lines: RichLine[] = []

  function collectRuns(node: Node, bold: boolean, italic: boolean, runs: TextRun[]) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? ''
        if (text) runs.push({ text, bold, italic })
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element
        const nextBold = bold || el.tagName === 'STRONG' || el.tagName === 'B'
        const nextItalic = italic || el.tagName === 'EM' || el.tagName === 'I'
        collectRuns(el, nextBold, nextItalic, runs)
      }
    }
  }

  function pushLine(el: Element, prefix = '') {
    const runs: TextRun[] = []
    if (prefix) runs.push({ text: prefix, bold: false, italic: false })
    collectRuns(el, false, false, runs)
    if (runs.length) lines.push(runs)
  }

  function walkList(list: Element, ordered: boolean) {
    let index = 1
    for (const item of Array.from(list.children)) {
      if (item.tagName !== 'LI') continue
      pushLine(item, ordered ? `${index}. ` : '• ')
      index += 1
    }
  }

  for (const node of Array.from(doc.body.children)) {
    if (node.tagName === 'UL') walkList(node, false)
    else if (node.tagName === 'OL') walkList(node, true)
    else pushLine(node)
  }

  return lines
}
