<script setup lang="ts">
import type { PaymentDetails } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'
import BaseTextarea from '../ui/BaseTextarea.vue'

defineProps<{
  payment: PaymentDetails
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="text-base font-semibold text-slate-900">Coordonnées bancaires</legend>
    <div class="grid grid-cols-2 gap-3">
      <BaseInput v-model="payment.bankName" label="Banque" />
      <BaseInput v-model="payment.accountHolder" label="Titulaire du compte" />
    </div>
    <div class="grid grid-cols-2 gap-3">
      <BaseInput v-model="payment.iban" label="IBAN / N° de compte" />
      <BaseInput v-model="payment.bic" label="BIC / SWIFT" />
    </div>
    <BaseTextarea v-model="payment.otherInstructions" label="Autres instructions" :rows="2" />
  </fieldset>
</template>
