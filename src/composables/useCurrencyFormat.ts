/** Custom display symbols for currencies whose Intl default (e.g. "F CFA" for
 * XOF, spaced oddly on narrow layouts) doesn't match common usage. Falls back
 * to the raw ISO code for anything not listed here. */
const CURRENCY_SYMBOLS: Record<string, string> = {
  XOF: 'FCFA',
  XAF: 'FCFA',
  EUR: '€',
  USD: '$',
  GBP: '£',
  CAD: '$',
  NGN: '₦',
}

/** Formats an amount using Intl.NumberFormat purely for its correct
 * locale/per-currency numeric precision (e.g. 0 decimals for XOF, 2 for EUR),
 * then swaps in our own currency label instead of Intl's built-in symbol —
 * sidesteps inconsistent/oddly-spaced symbol rendering across environments.
 * Falls back to a plain "<amount> <code>" for currency codes Intl doesn't
 * recognize (custom/regional codes not in ISO 4217 data). */
/** Intl's fr-FR (and others) grouping separator is a narrow no-break space
 * (U+202F) — jsPDF's built-in fonts (helvetica/times, WinAnsi-encoded) have
 * no glyph for it and fall back to a garbage character (rendered as "/" in
 * the generated PDF). Normalized to a plain space everywhere, which is
 * visually near-identical on screen and safe in the PDF. */
function normalizeSpaces(text: string): string {
  return text.replace(/[  ]/g, ' ')
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  const code = (currency || 'XOF').trim().toUpperCase()
  try {
    const numberPart = normalizeSpaces(
      new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'code' }).format(amount).replace(code, '').trim(),
    )
    const symbol = CURRENCY_SYMBOLS[code] ?? code
    return `${numberPart} ${symbol}`
  } catch {
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100
    return `${normalizeSpaces(rounded.toLocaleString(locale))} ${code}`
  }
}

export function useCurrencyFormat(getCurrency: () => string, getLocale: () => string) {
  function format(amount: number): string {
    return formatCurrency(amount, getCurrency(), getLocale())
  }
  return { format }
}
