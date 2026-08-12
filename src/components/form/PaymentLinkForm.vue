<script setup lang="ts">
import { ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import type { Invoice } from '../../types/invoice'
import { useAppSettings } from '../../composables/useAppSettings'
import { useAppDialog } from '../../composables/useAppDialog'
import { useAppNavigation } from '../../composables/useAppNavigation'
import { computeInvoiceTotals } from '../../lib/calculations'
import { createStripePaymentLink, createPayDunyaPaymentLink, createPayPalPaymentLink } from '../../lib/paymentProviders'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps<{
  invoice: Invoice
}>()

const isTauriEnv = isTauri()
const { settings } = useAppSettings()
const { alert } = useAppDialog()
const { openSettings } = useAppNavigation()

const generating = ref(false)

const PROVIDER_LABELS: Record<string, string> = { stripe: 'Stripe', paydunya: 'PayDunya', paypal: 'PayPal' }

// Editing the URL by hand invalidates the stored provider reference — it
// would otherwise keep pointing at a stale transaction that no longer
// matches what's displayed, and "Vérifier le paiement" would check the
// wrong thing.
function handleManualEdit(value: string) {
  props.invoice.paymentLink = value
  if (props.invoice.paymentProvider) {
    props.invoice.paymentProvider = null
    props.invoice.paymentReference = ''
  }
}

async function handleGenerate() {
  const provider = settings.payments.activeProvider
  if (!provider) return

  generating.value = true
  try {
    const totals = computeInvoiceTotals(props.invoice)
    const params = {
      amount: totals.netPayable,
      currency: props.invoice.meta.currency,
      description: props.invoice.meta.invoiceNumber ? `Facture ${props.invoice.meta.invoiceNumber}` : props.invoice.name || 'Facture',
      storeName: props.invoice.seller.name,
    }

    const result =
      provider === 'stripe'
        ? await createStripePaymentLink(params)
        : provider === 'paydunya'
          ? await createPayDunyaPaymentLink({ masterKey: settings.payments.paydunya.masterKey, publicKey: settings.payments.paydunya.publicKey }, params)
          : await createPayPalPaymentLink({ clientId: settings.payments.paypal.clientId, mode: settings.payments.paypal.mode }, params)

    props.invoice.paymentLink = result.url
    props.invoice.paymentProvider = provider
    props.invoice.paymentReference = result.reference
  } catch (error) {
    await alert(`Impossible de générer le lien de paiement : ${error}`, { title: 'Erreur' })
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Lien de paiement</legend>
    <BaseInput :model-value="invoice.paymentLink" label="URL de paiement" placeholder="https://…" @update:model-value="(v) => handleManualEdit(String(v))" />

    <div v-if="isTauriEnv">
      <BaseButton v-if="settings.payments.activeProvider" variant="secondary" :disabled="generating" @click="handleGenerate">
        {{ generating ? 'Génération…' : `Générer via ${PROVIDER_LABELS[settings.payments.activeProvider]}` }}
      </BaseButton>
      <button v-else type="button" class="text-xs font-medium text-accent hover:text-accent-dark" @click="openSettings">
        Configurer un fournisseur de paiement dans les Paramètres →
      </button>
    </div>
  </fieldset>
</template>
