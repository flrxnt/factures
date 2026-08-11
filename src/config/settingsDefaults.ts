import type { AppSettings, AppTheme, SmtpSecurity } from '../types/settings'
import { DEFAULT_CURRENCY, DEFAULT_LOCALE, DEFAULT_TAX_RATE_PERCENT, DEFAULT_TEMPLATE, DEFAULT_THEME_COLOR } from './defaults'

export const DEFAULT_APP_THEME: AppTheme = 'system'
export const DEFAULT_SMTP_PORT = 587
export const DEFAULT_SMTP_SECURITY: SmtpSecurity = 'starttls'

export const LOCALE_OPTIONS = [
  { value: 'fr-FR', label: 'Français (France)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
]

export const DEFAULT_EMAIL_SUBJECT_TEMPLATE = 'Facture {{invoiceNumber}} — {{sellerName}}'
export const DEFAULT_EMAIL_BODY_TEMPLATE = `Bonjour {{clientName}},

Veuillez trouver ci-joint la facture {{invoiceNumber}} d'un montant de {{total}}.

Cordialement,
{{sellerName}}`

/** Placeholder tokens available in the SMTP subject/body templates —
 * rendered as a legend under the textareas in SmtpSettingsForm.vue. */
export const EMAIL_TEMPLATE_TOKENS = [
  { token: '{{clientName}}', description: 'Nom du client' },
  { token: '{{invoiceNumber}}', description: 'Numéro de facture' },
  { token: '{{total}}', description: 'Montant net à payer' },
  { token: '{{sellerName}}', description: 'Nom du vendeur' },
  { token: '{{paymentLink}}', description: 'Lien de paiement en ligne' },
]

export function createDefaultAppSettings(): AppSettings {
  return {
    schemaVersion: 1,
    theme: DEFAULT_APP_THEME,
    smtp: {
      enabled: false,
      host: '',
      port: DEFAULT_SMTP_PORT,
      security: DEFAULT_SMTP_SECURITY,
      username: '',
      fromName: '',
      fromEmail: '',
      emailSubjectTemplate: DEFAULT_EMAIL_SUBJECT_TEMPLATE,
      emailBodyTemplate: DEFAULT_EMAIL_BODY_TEMPLATE,
    },
    invoiceDefaults: {
      currency: DEFAULT_CURRENCY,
      locale: DEFAULT_LOCALE,
      taxRatePercent: DEFAULT_TAX_RATE_PERCENT,
      template: DEFAULT_TEMPLATE,
      themeColor: DEFAULT_THEME_COLOR,
    },
    payments: {
      activeProvider: null,
      stripe: { enabled: false },
      paydunya: { enabled: false, masterKey: '', publicKey: '', mode: 'test' },
    },
  }
}
