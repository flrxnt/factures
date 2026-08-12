import { isTauri } from '@tauri-apps/api/core'
import type { PayDunyaProviderSettings, PayPalProviderSettings, PaymentProviderKind } from '../types/settings'

interface PaymentSecretRef {
  provider: PaymentProviderKind
  field: string
}

export async function hasPaymentSecret(provider: PaymentProviderKind, field: string): Promise<boolean> {
  if (!isTauri()) return false
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<boolean>('has_payment_secret', { cred: { provider, field } satisfies PaymentSecretRef })
}

export async function savePaymentSecret(provider: PaymentProviderKind, field: string, value: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('save_payment_secret', { cred: { provider, field } satisfies PaymentSecretRef, value })
}

export async function deletePaymentSecret(provider: PaymentProviderKind, field: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('delete_payment_secret', { cred: { provider, field } satisfies PaymentSecretRef })
}

export interface CreatePaymentLinkParams {
  amount: number
  currency: string
  description: string
  storeName: string
}

export interface PaymentLinkResult {
  url: string
  reference: string
}

export async function createStripePaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResult> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<PaymentLinkResult>('create_stripe_payment_link', { request: params })
}

export async function createPayDunyaPaymentLink(
  config: Pick<PayDunyaProviderSettings, 'masterKey' | 'publicKey'>,
  params: CreatePaymentLinkParams,
): Promise<PaymentLinkResult> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<PaymentLinkResult>('create_paydunya_payment_link', { config, request: params })
}

/** Looks up a Stripe Checkout Session by the id captured when the link was
 * created, and reports whether it was paid. */
export async function checkStripePaymentStatus(reference: string): Promise<boolean> {
  const { invoke } = await import('@tauri-apps/api/core')
  const result = await invoke<{ paid: boolean }>('check_stripe_payment_status', { reference })
  return result.paid
}

/** Confirms a PayDunya checkout invoice by the token captured when the link
 * was created, and reports whether it was completed. */
export async function checkPayDunyaPaymentStatus(
  config: Pick<PayDunyaProviderSettings, 'masterKey' | 'publicKey'>,
  reference: string,
): Promise<boolean> {
  const { invoke } = await import('@tauri-apps/api/core')
  const result = await invoke<{ paid: boolean }>('check_paydunya_payment_status', { config, reference })
  return result.paid
}

export async function createPayPalPaymentLink(
  config: Pick<PayPalProviderSettings, 'clientId' | 'mode'>,
  params: CreatePaymentLinkParams,
): Promise<PaymentLinkResult> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<PaymentLinkResult>('create_paypal_payment_link', { config: { clientId: config.clientId }, mode: config.mode, request: params })
}

/** Looks up a PayPal order by the id captured when the link was created —
 * capturing it on the spot if the payer has approved it but it hasn't been
 * captured yet — and reports whether it's paid. */
export async function checkPayPalPaymentStatus(
  config: Pick<PayPalProviderSettings, 'clientId' | 'mode'>,
  reference: string,
): Promise<boolean> {
  const { invoke } = await import('@tauri-apps/api/core')
  const result = await invoke<{ paid: boolean }>('check_paypal_payment_status', { config: { clientId: config.clientId }, mode: config.mode, reference })
  return result.paid
}
