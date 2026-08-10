<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import BaseTextarea from '../ui/BaseTextarea.vue'

defineProps<{
  invoice: Invoice
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="text-base font-semibold text-slate-900">Notes et conditions</legend>
    <BaseTextarea v-model="invoice.notes" label="Notes" placeholder="Merci pour votre confiance." />
    <BaseTextarea
      v-model="invoice.termsAndConditions"
      label="Conditions générales"
      placeholder="Paiement à réception, pénalités de retard..."
    />
  </fieldset>
</template>
