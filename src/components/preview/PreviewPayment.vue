<script setup lang="ts">
import type { PaymentDetails } from '../../types/invoice'

defineProps<{
  payment: PaymentDetails
}>()
</script>

<template>
  <div class="border-t border-hairline pt-6 text-sm text-ink-soft">
    <p class="mb-1 text-xs font-medium tracking-wide text-muted uppercase">Coordonnées bancaires</p>
    <p v-if="payment.bankName">Banque : {{ payment.bankName }}</p>
    <p v-if="payment.accountHolder">Titulaire : {{ payment.accountHolder }}</p>
    <p v-if="payment.iban">IBAN : {{ payment.iban }}</p>
    <p v-if="payment.bic">BIC : {{ payment.bic }}</p>
    <p v-if="payment.otherInstructions" class="whitespace-pre-wrap">{{ payment.otherInstructions }}</p>
  </div>
</template>
