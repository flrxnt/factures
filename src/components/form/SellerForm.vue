<script setup lang="ts">
import type { CompanyInfo } from '../../types/invoice'
import BaseInput from '../ui/BaseInput.vue'
import FileDropLogo from './FileDropLogo.vue'

defineProps<{
  seller: CompanyInfo
  showLogo: boolean
}>()
</script>

<template>
  <fieldset class="space-y-4">
    <legend class="font-display text-lg text-ink">Émetteur</legend>
    <FileDropLogo v-if="showLogo" v-model="seller.logoDataUrl" />
    <BaseInput v-model="seller.name" label="Nom de l'entreprise" placeholder="Ma Société SARL" required />
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="seller.addressLine1" label="Adresse" placeholder="123 rue du Commerce" />
      <BaseInput v-model="seller.addressLine2" label="Complément" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="seller.postalCode" label="Code postal" />
      <BaseInput v-model="seller.city" label="Ville" />
    </div>
    <BaseInput v-model="seller.country" label="Pays" />
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="seller.taxId" label="N° fiscal" />
      <BaseInput v-model="seller.email" type="email" label="E-mail" />
    </div>
    <BaseInput v-model="seller.phone" type="tel" label="Téléphone" />
  </fieldset>
</template>
