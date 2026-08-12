import type { InvoiceTemplate } from './invoice'

export type AppTheme = 'light' | 'dark' | 'system'
export type SmtpSecurity = 'ssl' | 'starttls' | 'none'

export interface SmtpConfig {
  enabled: boolean
  host: string
  port: number
  security: SmtpSecurity
  username: string
  fromName: string
  fromEmail: string
  emailSubjectTemplate: string
  emailBodyTemplate: string
}

export interface InvoiceDefaults {
  currency: string
  locale: string
  taxRatePercent: number
  template: InvoiceTemplate
  themeColor: string
}

export type PaymentProviderKind = 'stripe' | 'paydunya' | 'paypal'
export type PaymentMode = 'test' | 'live'
export type PayPalMode = 'sandbox' | 'live'

export interface StripeProviderSettings {
  enabled: boolean
}

export interface PayDunyaProviderSettings {
  enabled: boolean
  masterKey: string
  publicKey: string
  mode: PaymentMode
}

export interface PayPalProviderSettings {
  enabled: boolean
  clientId: string
  mode: PayPalMode
}

export interface PaymentSettings {
  activeProvider: PaymentProviderKind | null
  stripe: StripeProviderSettings
  paydunya: PayDunyaProviderSettings
  paypal: PayPalProviderSettings
}

export interface AppSettings {
  schemaVersion: number
  theme: AppTheme
  smtp: SmtpConfig
  invoiceDefaults: InvoiceDefaults
  payments: PaymentSettings
}
