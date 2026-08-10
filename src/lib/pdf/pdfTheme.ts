/** Mirrors the Tailwind tokens used on-screen (indigo-700 accent, slate grays)
 * so the PDF rhymes visually with the live preview. Values are in mm/pt as
 * jsPDF expects; exact pixel parity with the DOM isn't the goal since HTML/CSS
 * and jsPDF's vector drawing are different rendering engines. */
export const PDF_THEME = {
  colors: {
    accent: [67, 56, 202] as [number, number, number], // indigo-700
    heading: [15, 23, 42] as [number, number, number], // slate-900
    body: [51, 65, 85] as [number, number, number], // slate-700
    muted: [100, 116, 139] as [number, number, number], // slate-500
    faint: [148, 163, 184] as [number, number, number], // slate-400
    border: [226, 232, 240] as [number, number, number], // slate-200
    tableHead: [241, 245, 249] as [number, number, number], // slate-100
  },
  font: {
    family: 'helvetica',
    sizeTitle: 20,
    sizeSectionLabel: 8,
    sizeBody: 10,
    sizeSmall: 8.5,
    sizeTotal: 13,
  },
  spacing: {
    afterHeader: 10,
    afterMeta: 8,
    afterClient: 8,
    afterTable: 6,
    afterTotals: 10,
    betweenBlocks: 8,
  },
}
