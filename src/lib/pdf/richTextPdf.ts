import type { jsPDF } from 'jspdf'
import type { RichLine, TextRun } from '../richText'
import { htmlToRichLines } from '../richText'

const MM_PER_PT = 25.4 / 72
// Matches jspdf-autotable's own autoTableText() PHYSICAL_LINE_HEIGHT constant
// (fixed, independent of doc.getLineHeightFactor()) — needed to land our
// first line's baseline where the default cell text draw would have.
const TOP_ALIGN_FACTOR = 1.15

function sliceRuns(runs: TextRun[], start: number, end: number): TextRun[] {
  const result: TextRun[] = []
  let pos = 0
  for (const run of runs) {
    const runStart = pos
    const runEnd = pos + run.text.length
    pos = runEnd
    if (runEnd <= start || runStart >= end) continue
    const text = run.text.slice(Math.max(start, runStart) - runStart, Math.min(end, runEnd) - runStart)
    if (text) result.push({ text, bold: run.bold, italic: run.italic })
  }
  return result
}

/** Wraps one paragraph/list-item's runs to `maxWidth`, using doc.splitTextToSize
 * on its concatenated plain text — the same algorithm jspdf-autotable itself
 * uses to size a cell — so the resulting line count matches the row height
 * that's already been locked in by the time this runs (see drawItemsTable.ts). */
function wrapRichLine(doc: jsPDF, runs: RichLine, maxWidth: number, fontSizePt: number): RichLine[] {
  const plainText = runs.map((r) => r.text).join('')
  if (!plainText) return [[]]
  const wrapped: string[] = doc.splitTextToSize(plainText, maxWidth, { fontSize: fontSizePt })
  const result: RichLine[] = []
  let sourceIndex = 0
  for (const wrappedLine of wrapped) {
    result.push(sliceRuns(runs, sourceIndex, sourceIndex + wrappedLine.length))
    sourceIndex += wrappedLine.length
    // splitTextToSize joins words with a single space and drops the
    // separator at each wrap point — skip it here to stay in sync.
    if (plainText[sourceIndex] === ' ') sourceIndex += 1
  }
  return result
}

export function hasRichFormatting(lines: RichLine[]): boolean {
  return lines.some((line) => line.some((run) => run.bold || run.italic))
}

/** Parses `html` and wraps it to `maxWidth`, ready for drawRichLines() — the
 * flat line count matches what jspdf-autotable's own cell.text wrapping
 * produces for the plain-text equivalent at the same font/size/width. */
export function htmlToWrappedRichLines(doc: jsPDF, html: string, maxWidth: number, fontSizePt: number): RichLine[] {
  const paragraphs = htmlToRichLines(html)
  const wrapped: RichLine[] = []
  for (const paragraph of paragraphs) {
    wrapped.push(...wrapRichLine(doc, paragraph, maxWidth, fontSizePt))
  }
  return wrapped
}

/** Draws pre-wrapped rich lines starting at a cell's text position (from
 * Cell.getTextPos()), switching font style per run so bold/italic marks
 * actually render instead of being dropped. */
export function drawRichLines(doc: jsPDF, lines: RichLine[], x: number, topY: number, fontFamily: string, fontSizePt: number): void {
  doc.setFontSize(fontSizePt)
  const fontSizeMm = fontSizePt * MM_PER_PT
  const lineHeight = fontSizeMm * doc.getLineHeightFactor()
  let cursorY = topY + fontSizeMm * (2 - TOP_ALIGN_FACTOR)

  for (const line of lines) {
    let cursorX = x
    for (const run of line) {
      const style = run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal'
      doc.setFont(fontFamily, style)
      doc.text(run.text, cursorX, cursorY)
      cursorX += doc.getTextWidth(run.text)
    }
    cursorY += lineHeight
  }
}
