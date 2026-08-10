<script setup lang="ts">
import type { ClientInfo } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'

defineProps<{
  client: ClientInfo
}>()
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Client</legend>
    <BaseInput v-model="client.name" label="Nom du client" placeholder="Client SARL" required />
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="client.addressLine1" label="Adresse" />
      <BaseInput v-model="client.addressLine2" label="Complément" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="client.postalCode" label="Code postal" />
      <BaseInput v-model="client.city" label="Ville" />
    </div>
    <BaseInput v-model="client.country" label="Pays" />
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="client.taxId" label="N° fiscal" />
      <BaseInput v-model="client.email" type="email" label="E-mail" />
    </div>
    <BaseInput v-model="client.phone" type="tel" label="Téléphone" />
  </fieldset>
</template>
