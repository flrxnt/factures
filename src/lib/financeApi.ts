import type { Payment } from '../types/finance'

/** Desktop-only, same as products/stock. */

export async function listPayments(documentId?: string): Promise<Payment[]> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<Payment[]>('list_payments', { documentId: documentId ?? null })
}

export async function savePayment(payment: Payment): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('save_payment', { payment })
}

export async function removePayment(id: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('remove_payment', { id })
}
