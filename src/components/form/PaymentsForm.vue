<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Download, Trash2 } from '@lucide/vue'
import type { Invoice } from '../../types/invoice'
import { usePaymentCollection } from '../../composables/usePaymentCollection'
import { useAppDialog } from '../../composables/useAppDialog'
import { computeInvoiceTotals } from '../../lib/calculations'
import { formatCurrency } from '../../composables/useCurrencyFormat'
import { generatePaymentReceiptPdf } from '../../lib/pdf/generatePaymentReceiptPdf'
import { saveFile } from '../../lib/saveFile'
import { sanitizeFilename } from '../../lib/filename'
import { PAYMENT_METHOD_PRESETS } from '../../config/finance'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const { forDocument, paidTotal, save, remove, create, ensureLoaded } = usePaymentCollection()
const { alert, confirm: confirmDialog } = useAppDialog()

onMounted(ensureLoaded)

const totals = computed(() => computeInvoiceTotals(props.invoice))
const documentPayments = computed(() => forDocument(props.invoice.id))
const totalPaid = computed(() => paidTotal(props.invoice.id))
const balance = computed(() => totals.value.netPayable - totalPaid.value)

const amount = ref(0)
const method = ref('')
const paidAt = ref(new Date().toISOString().slice(0, 10))
const reference = ref('')
const saving = ref(false)

function syncStatus() {
  if (totalPaid.value <= 0) return
  props.invoice.status = totalPaid.value >= totals.value.netPayable ? 'paid' : 'partially_paid'
}

async function handleAddPayment() {
  if (amount.value <= 0) return
  saving.value = true
  try {
    const payment = create('in', props.invoice.id)
    payment.amount = amount.value
    payment.method = method.value
    payment.paidAt = paidAt.value
    payment.reference = reference.value
    await save(payment)
    syncStatus()
    amount.value = 0
    method.value = ''
    reference.value = ''
  } catch (error) {
    await alert(`Impossible d'enregistrer le paiement : ${error}`, { title: 'Erreur' })
  } finally {
    saving.value = false
  }
}

async function handleRemovePayment(id: string) {
  const confirmed = await confirmDialog('Supprimer ce paiement ? Cette action est irréversible.', {
    title: 'Supprimer le paiement',
    confirmLabel: 'Supprimer',
    danger: true,
  })
  if (!confirmed) return
  try {
    await remove(id)
    syncStatus()
  } catch (error) {
    await alert(String(error), { title: 'Suppression impossible' })
  }
}

async function handleDownloadReceipt(payment: (typeof documentPayments.value)[number]) {
  const doc = generatePaymentReceiptPdf(props.invoice, payment)
  const bytes = new Uint8Array(doc.output('arraybuffer'))
  const filename = `${sanitizeFilename(`recu-${props.invoice.name || props.invoice.meta.invoiceNumber || 'facture'}-${payment.paidAt}`, 'recu')}.pdf`
  await saveFile(bytes, filename, 'application/pdf')
}
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Paiements</legend>

    <div class="flex items-center justify-between rounded-xl border border-hairline bg-paper-dim/40 px-4 py-3 text-sm">
      <span class="text-muted">Solde restant</span>
      <span class="font-medium text-ink tabular-nums">{{ formatCurrency(Math.max(balance, 0), invoice.meta.currency, invoice.meta.locale) }}</span>
    </div>

    <ul v-if="documentPayments.length > 0" class="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
      <li v-for="payment in documentPayments" :key="payment.id" class="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
        <div class="min-w-0">
          <p class="text-ink">{{ formatCurrency(payment.amount, invoice.meta.currency, invoice.meta.locale) }}</p>
          <p class="truncate text-xs text-muted">{{ payment.method || 'Moyen non précisé' }} · {{ payment.paidAt }}</p>
        </div>
        <div class="flex shrink-0 gap-1">
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-ink"
            title="Télécharger le reçu"
            @click="handleDownloadReceipt(payment)"
          >
            <Download class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-paper-dim hover:text-accent-dark"
            title="Supprimer"
            @click="handleRemovePayment(payment.id)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </li>
    </ul>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <BaseInput v-model.number="amount" type="number" label="Montant" />
      <label class="block">
        <span class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">Moyen</span>
        <input
          v-model="method"
          list="payment-method-options"
          class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent"
        />
        <datalist id="payment-method-options">
          <option v-for="m in PAYMENT_METHOD_PRESETS" :key="m" :value="m" />
        </datalist>
      </label>
      <BaseInput v-model="paidAt" type="date" label="Date" />
      <BaseInput v-model="reference" label="Référence" />
    </div>
    <BaseButton variant="secondary" :disabled="saving || amount <= 0" @click="handleAddPayment">
      {{ saving ? 'Enregistrement…' : '+ Enregistrer un paiement' }}
    </BaseButton>
  </fieldset>
</template>
