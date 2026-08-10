<script setup lang="ts">
import type { Invoice } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'

defineProps<{
  invoice: Invoice
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="text-base font-semibold text-slate-900">Signature</legend>
    <BaseInput v-model="invoice.signatureLabel" label="Mention" placeholder="Bon pour accord" />
  </fieldset>
</template>
