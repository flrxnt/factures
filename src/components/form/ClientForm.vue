<script setup lang="ts">
import type { ClientInfo } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'

defineProps<{
  client: ClientInfo
}>()
</script>

<template>
  <fieldset class="space-y-3">
    <legend class="text-base font-semibold text-slate-900">Client</legend>
    <BaseInput v-model="client.name" label="Nom du client" placeholder="Client SARL" required />
    <div class="grid grid-cols-2 gap-3">
      <BaseInput v-model="client.addressLine1" label="Adresse" />
      <BaseInput v-model="client.addressLine2" label="Complément d'adresse" />
    </div>
    <div class="grid grid-cols-3 gap-3">
      <BaseInput v-model="client.postalCode" label="Code postal" />
      <BaseInput v-model="client.city" label="Ville" />
      <BaseInput v-model="client.country" label="Pays" />
    </div>
    <div class="grid grid-cols-3 gap-3">
      <BaseInput v-model="client.taxId" label="N° fiscal / IFU" />
      <BaseInput v-model="client.email" type="email" label="E-mail" />
      <BaseInput v-model="client.phone" type="tel" label="Téléphone" />
    </div>
  </fieldset>
</template>
