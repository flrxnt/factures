<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppSettings } from '../../composables/useAppSettings'
import { useAppDialog } from '../../composables/useAppDialog'
import { hasPaymentSecret, savePaymentSecret, deletePaymentSecret } from '../../lib/paymentProviders'
import type { PaymentProviderKind } from '../../types/settings'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseButton from '../ui/BaseButton.vue'

const { settings } = useAppSettings()
const payments = settings.payments
const { alert } = useAppDialog()

const ACTIVE_PROVIDER_OPTIONS = [
  { value: '', label: 'Aucun' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'paydunya', label: 'PayDunya' },
  { value: 'paypal', label: 'PayPal' },
]

function setActiveProvider(value: string) {
  payments.activeProvider = (value || null) as PaymentProviderKind | null
}

const MODE_OPTIONS = [
  { value: 'test', label: 'Test' },
  { value: 'live', label: 'Production' },
]

const PAYPAL_MODE_OPTIONS = [
  { value: 'sandbox', label: 'Sandbox' },
  { value: 'live', label: 'Production' },
]

// Stripe — a single secret (the API secret key).
const stripeKeyDraft = ref('')
const hasStripeKey = ref(false)
const savingStripeKey = ref(false)

// PayDunya — two secrets (private key + token) alongside the two non-secret
// config fields (master key, public key) which live directly in settings.
const paydunyaPrivateKeyDraft = ref('')
const hasPaydunyaPrivateKey = ref(false)
const savingPaydunyaPrivateKey = ref(false)
const paydunyaTokenDraft = ref('')
const hasPaydunyaToken = ref(false)
const savingPaydunyaToken = ref(false)

// PayPal — a single secret (the client secret) alongside the non-secret
// client ID and mode, which live directly in settings.
const paypalSecretDraft = ref('')
const hasPaypalSecret = ref(false)
const savingPaypalSecret = ref(false)

onMounted(async () => {
  hasStripeKey.value = await hasPaymentSecret('stripe', 'secret_key')
  hasPaydunyaPrivateKey.value = await hasPaymentSecret('paydunya', 'private_key')
  hasPaydunyaToken.value = await hasPaymentSecret('paydunya', 'token')
  hasPaypalSecret.value = await hasPaymentSecret('paypal', 'client_secret')
})

async function handleSaveStripeKey() {
  if (!stripeKeyDraft.value) return
  savingStripeKey.value = true
  try {
    await savePaymentSecret('stripe', 'secret_key', stripeKeyDraft.value)
    stripeKeyDraft.value = ''
    hasStripeKey.value = true
  } catch (error) {
    await alert(`Impossible d'enregistrer la clé : ${error}`, { title: 'Erreur' })
  } finally {
    savingStripeKey.value = false
  }
}

async function handleDeleteStripeKey() {
  try {
    await deletePaymentSecret('stripe', 'secret_key')
    hasStripeKey.value = false
  } catch (error) {
    await alert(`Impossible de supprimer la clé : ${error}`, { title: 'Erreur' })
  }
}

async function handleSavePaydunyaPrivateKey() {
  if (!paydunyaPrivateKeyDraft.value) return
  savingPaydunyaPrivateKey.value = true
  try {
    await savePaymentSecret('paydunya', 'private_key', paydunyaPrivateKeyDraft.value)
    paydunyaPrivateKeyDraft.value = ''
    hasPaydunyaPrivateKey.value = true
  } catch (error) {
    await alert(`Impossible d'enregistrer la clé : ${error}`, { title: 'Erreur' })
  } finally {
    savingPaydunyaPrivateKey.value = false
  }
}

async function handleDeletePaydunyaPrivateKey() {
  try {
    await deletePaymentSecret('paydunya', 'private_key')
    hasPaydunyaPrivateKey.value = false
  } catch (error) {
    await alert(`Impossible de supprimer la clé : ${error}`, { title: 'Erreur' })
  }
}

async function handleSavePaypalSecret() {
  if (!paypalSecretDraft.value) return
  savingPaypalSecret.value = true
  try {
    await savePaymentSecret('paypal', 'client_secret', paypalSecretDraft.value)
    paypalSecretDraft.value = ''
    hasPaypalSecret.value = true
  } catch (error) {
    await alert(`Impossible d'enregistrer le secret : ${error}`, { title: 'Erreur' })
  } finally {
    savingPaypalSecret.value = false
  }
}

async function handleDeletePaypalSecret() {
  try {
    await deletePaymentSecret('paypal', 'client_secret')
    hasPaypalSecret.value = false
  } catch (error) {
    await alert(`Impossible de supprimer le secret : ${error}`, { title: 'Erreur' })
  }
}

async function handleSavePaydunyaToken() {
  if (!paydunyaTokenDraft.value) return
  savingPaydunyaToken.value = true
  try {
    await savePaymentSecret('paydunya', 'token', paydunyaTokenDraft.value)
    paydunyaTokenDraft.value = ''
    hasPaydunyaToken.value = true
  } catch (error) {
    await alert(`Impossible d'enregistrer le jeton : ${error}`, { title: 'Erreur' })
  } finally {
    savingPaydunyaToken.value = false
  }
}

async function handleDeletePaydunyaToken() {
  try {
    await deletePaymentSecret('paydunya', 'token')
    hasPaydunyaToken.value = false
  } catch (error) {
    await alert(`Impossible de supprimer le jeton : ${error}`, { title: 'Erreur' })
  }
}
</script>

<template>
  <div class="space-y-8">
    <BaseSelect
      :model-value="payments.activeProvider ?? ''"
      label="Fournisseur actif"
      :options="ACTIVE_PROVIDER_OPTIONS"
      @update:model-value="setActiveProvider"
    />

    <div class="space-y-4 border-t border-hairline pt-6">
      <BaseToggle v-model="payments.stripe.enabled" label="Activer Stripe" />
      <div class="space-y-2">
        <BaseInput v-model="stripeKeyDraft" type="password" label="Clé secrète API" placeholder="sk_live_…" />
        <div class="flex items-center gap-3">
          <BaseButton variant="secondary" :disabled="!stripeKeyDraft || savingStripeKey" @click="handleSaveStripeKey">
            {{ savingStripeKey ? 'Enregistrement…' : 'Enregistrer la clé' }}
          </BaseButton>
          <button v-if="hasStripeKey" type="button" class="text-xs font-medium text-muted hover:text-accent-dark" @click="handleDeleteStripeKey">
            Supprimer
          </button>
          <p class="text-xs text-muted">{{ hasStripeKey ? 'Clé enregistrée ✓' : 'Aucune clé enregistrée' }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-4 border-t border-hairline pt-6">
      <BaseToggle v-model="payments.paydunya.enabled" label="Activer PayDunya" />
      <div class="grid gap-4 sm:grid-cols-2">
        <BaseInput v-model="payments.paydunya.masterKey" label="Clé maître (master key)" />
        <BaseInput v-model="payments.paydunya.publicKey" label="Clé publique" />
      </div>
      <BaseSelect v-model="payments.paydunya.mode" label="Mode" :options="MODE_OPTIONS" />

      <div class="space-y-2">
        <BaseInput v-model="paydunyaPrivateKeyDraft" type="password" label="Clé privée" />
        <div class="flex items-center gap-3">
          <BaseButton variant="secondary" :disabled="!paydunyaPrivateKeyDraft || savingPaydunyaPrivateKey" @click="handleSavePaydunyaPrivateKey">
            {{ savingPaydunyaPrivateKey ? 'Enregistrement…' : 'Enregistrer la clé privée' }}
          </BaseButton>
          <button
            v-if="hasPaydunyaPrivateKey"
            type="button"
            class="text-xs font-medium text-muted hover:text-accent-dark"
            @click="handleDeletePaydunyaPrivateKey"
          >
            Supprimer
          </button>
          <p class="text-xs text-muted">{{ hasPaydunyaPrivateKey ? 'Clé enregistrée ✓' : 'Aucune clé enregistrée' }}</p>
        </div>
      </div>

      <div class="space-y-2">
        <BaseInput v-model="paydunyaTokenDraft" type="password" label="Jeton (token)" />
        <div class="flex items-center gap-3">
          <BaseButton variant="secondary" :disabled="!paydunyaTokenDraft || savingPaydunyaToken" @click="handleSavePaydunyaToken">
            {{ savingPaydunyaToken ? 'Enregistrement…' : 'Enregistrer le jeton' }}
          </BaseButton>
          <button v-if="hasPaydunyaToken" type="button" class="text-xs font-medium text-muted hover:text-accent-dark" @click="handleDeletePaydunyaToken">
            Supprimer
          </button>
          <p class="text-xs text-muted">{{ hasPaydunyaToken ? 'Jeton enregistré ✓' : 'Aucun jeton enregistré' }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-4 border-t border-hairline pt-6">
      <BaseToggle v-model="payments.paypal.enabled" label="Activer PayPal" />
      <BaseInput v-model="payments.paypal.clientId" label="Client ID" />
      <BaseSelect v-model="payments.paypal.mode" label="Mode" :options="PAYPAL_MODE_OPTIONS" />

      <div class="space-y-2">
        <BaseInput v-model="paypalSecretDraft" type="password" label="Client Secret" />
        <div class="flex items-center gap-3">
          <BaseButton variant="secondary" :disabled="!paypalSecretDraft || savingPaypalSecret" @click="handleSavePaypalSecret">
            {{ savingPaypalSecret ? 'Enregistrement…' : 'Enregistrer le secret' }}
          </BaseButton>
          <button v-if="hasPaypalSecret" type="button" class="text-xs font-medium text-muted hover:text-accent-dark" @click="handleDeletePaypalSecret">
            Supprimer
          </button>
          <p class="text-xs text-muted">{{ hasPaypalSecret ? 'Secret enregistré ✓' : 'Aucun secret enregistré' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
