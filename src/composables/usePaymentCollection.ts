import { ref } from 'vue'
import type { Payment } from '../types/finance'
import { createEmptyPayment } from '../config/finance'
import * as financeApi from '../lib/financeApi'

// Module-level singleton holding the full ledger (invoice payments AND
// standalone expenses) — lazily hydrated, same pattern as products/stock.
const payments = ref<Payment[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)
let hydrated = false

async function ensureLoaded(): Promise<void> {
  if (hydrated) return
  isLoading.value = true
  loadError.value = null
  try {
    payments.value = await financeApi.listPayments()
    hydrated = true
  } catch (error) {
    console.error('Failed to load payments', error)
    loadError.value = String(error)
  } finally {
    isLoading.value = false
  }
}

function forDocument(documentId: string): Payment[] {
  return payments.value.filter((p) => p.documentId === documentId)
}

function paidTotal(documentId: string): number {
  return forDocument(documentId).reduce((sum, p) => sum + p.amount, 0)
}

async function save(payment: Payment): Promise<void> {
  await financeApi.savePayment(payment)
  const index = payments.value.findIndex((p) => p.id === payment.id)
  if (index !== -1) payments.value[index] = payment
  else payments.value.unshift(payment)
}

async function remove(id: string): Promise<void> {
  await financeApi.removePayment(id)
  payments.value = payments.value.filter((p) => p.id !== id)
}

export function usePaymentCollection() {
  return {
    payments,
    isLoading,
    loadError,
    ensureLoaded,
    forDocument,
    paidTotal,
    save,
    remove,
    create: createEmptyPayment,
  }
}
