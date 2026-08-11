import { isTauri } from '@tauri-apps/api/core'
import type { PayDunyaProviderSettings, PaymentProviderKind } from '../types/settings'

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

export async function createStripePaymentLink(params: CreatePaymentLinkParams): Promise<string> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('create_stripe_payment_link', { request: params })
}

export async function createPayDunyaPaymentLink(
  config: Pick<PayDunyaProviderSettings, 'masterKey' | 'publicKey'>,
  params: CreatePaymentLinkParams,
): Promise<string> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<string>('create_paydunya_payment_link', { config, request: params })
}
