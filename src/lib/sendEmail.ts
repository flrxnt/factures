import { isTauri } from '@tauri-apps/api/core'
import type { SmtpConfig } from '../types/settings'

interface SmtpCredentialRef {
  host: string
  port: number
  username: string
}

function credRef(smtp: SmtpConfig): SmtpCredentialRef {
  return { host: smtp.host, port: smtp.port, username: smtp.username }
}

function connectionConfig(smtp: SmtpConfig) {
  return { host: smtp.host, port: smtp.port, security: smtp.security, username: smtp.username }
}

export async function hasSmtpPassword(smtp: SmtpConfig): Promise<boolean> {
  if (!isTauri()) return false
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<boolean>('has_smtp_password', { cred: credRef(smtp) })
}

export async function saveSmtpPassword(smtp: SmtpConfig, password: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('save_smtp_password', { cred: credRef(smtp), password })
}

export async function deleteSmtpPassword(smtp: SmtpConfig): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('delete_smtp_password', { cred: credRef(smtp) })
}

export async function testSmtpConnection(smtp: SmtpConfig): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('test_smtp_connection', { smtp: connectionConfig(smtp) })
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export async function sendInvoiceEmail(params: {
  smtp: SmtpConfig
  toEmail: string
  subject: string
  body: string
  pdfBytes: Uint8Array
  pdfFilename: string
}): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('send_invoice_email', {
    request: {
      smtp: connectionConfig(params.smtp),
      fromName: params.smtp.fromName,
      fromEmail: params.smtp.fromEmail,
      toEmail: params.toEmail,
      subject: params.subject,
      body: params.body,
      attachment: {
        filename: params.pdfFilename,
        contentBase64: uint8ArrayToBase64(params.pdfBytes),
        mimeType: 'application/pdf',
      },
    },
  })
}
