<script setup lang="ts">
import type { CompanyInfo } from '../../types/invoice'

defineProps<{
  seller: CompanyInfo
  showLogo: boolean
}>()
</script>

<template>
  <div class="flex items-start justify-between gap-6">
    <div class="flex items-start gap-4">
      <img
        v-if="showLogo && seller.logoDataUrl"
        :src="seller.logoDataUrl"
        alt="Logo"
        class="h-14 w-14 shrink-0 rounded object-contain ring-1 ring-hairline"
      />
      <div class="text-sm text-ink-soft">
        <p class="font-display text-lg text-ink">{{ seller.name || "Nom de l'entreprise" }}</p>
        <p v-if="seller.addressLine1">{{ seller.addressLine1 }}</p>
        <p v-if="seller.addressLine2">{{ seller.addressLine2 }}</p>
        <p v-if="seller.postalCode || seller.city">{{ seller.postalCode }} {{ seller.city }}</p>
        <p v-if="seller.country">{{ seller.country }}</p>
        <p v-if="seller.taxId">N° fiscal : {{ seller.taxId }}</p>
        <p v-if="seller.email">{{ seller.email }}</p>
        <p v-if="seller.phone">{{ seller.phone }}</p>
      </div>
    </div>
    <p class="font-display text-4xl text-accent italic">Facture</p>
  </div>
</template>
