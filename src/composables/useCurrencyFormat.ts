/** Wraps Intl.NumberFormat with a graceful fallback for currency codes the
 * runtime doesn't recognize (custom/regional codes not in ISO 4217 data). */
export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
  } catch {
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100
    return `${rounded.toLocaleString(locale)} ${currency}`
  }
}

export function useCurrencyFormat(getCurrency: () => string, getLocale: () => string) {
  function format(amount: number): string {
    return formatCurrency(amount, getCurrency(), getLocale())
  }
  return { format }
}
