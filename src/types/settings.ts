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

export interface AppSettings {
  schemaVersion: number
  theme: AppTheme
  smtp: SmtpConfig
  invoiceDefaults: InvoiceDefaults
}
