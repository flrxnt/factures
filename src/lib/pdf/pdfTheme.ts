/** Mirrors the web design tokens (src/style.css @theme: paper/ink/accent,
 * Fraunces display serif + Instrument Sans body) so the PDF reads as the same
 * document as the on-screen preview. jsPDF only ships helvetica/times/courier
 * built-in, so `times` stands in for the Fraunces display serif on headings
 * and `helvetica` for body text — exact font parity isn't the goal since
 * HTML/CSS and jsPDF's vector drawing are different rendering engines. */
export const PDF_THEME = {
  colors: {
    ink: [28, 26, 20] as [number, number, number],
    inkSoft: [88, 84, 74] as [number, number, number],
    muted: [146, 141, 124] as [number, number, number],
    faint: [180, 174, 156] as [number, number, number],
    hairline: [221, 214, 195] as [number, number, number],
    hairlineStrong: [199, 190, 164] as [number, number, number],
    accent: [162, 74, 44] as [number, number, number],
  },
  font: {
    display: 'times',
    body: 'helvetica',
    sizeTitle: 26,
    sizeSectionLabel: 7.5,
    sizeBody: 10,
    sizeSmall: 8.5,
    sizeTotal: 15,
  },
  spacing: {
    afterHeader: 12,
    afterMeta: 9,
    afterClient: 9,
    afterTable: 6,
    afterTotals: 10,
    betweenBlocks: 8,
  },
}

const HEX_COLOR_PATTERN = /^#([0-9a-f]{6})$/i

/** Parses a "#rrggbb" hex color (the format stored on Invoice.themeColor)
 * into the [r,g,b] tuple jsPDF's setTextColor/setDrawColor/setFillColor
 * expect, falling back to the default accent for anything malformed. */
export function hexToRgb(hex: string): [number, number, number] {
  const match = HEX_COLOR_PATTERN.exec(hex)
  if (!match) return PDF_THEME.colors.accent
  const value = match[1]
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}
