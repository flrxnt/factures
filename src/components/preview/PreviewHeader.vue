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
        class="h-16 w-16 shrink-0 rounded object-contain ring-1 ring-slate-100"
      />
      <div class="text-sm text-slate-600">
        <p class="text-base font-semibold text-slate-900">{{ seller.name || 'Nom de l\'entreprise' }}</p>
        <p v-if="seller.addressLine1">{{ seller.addressLine1 }}</p>
        <p v-if="seller.addressLine2">{{ seller.addressLine2 }}</p>
        <p v-if="seller.postalCode || seller.city">{{ seller.postalCode }} {{ seller.city }}</p>
        <p v-if="seller.country">{{ seller.country }}</p>
        <p v-if="seller.taxId">N° fiscal : {{ seller.taxId }}</p>
        <p v-if="seller.email">{{ seller.email }}</p>
        <p v-if="seller.phone">{{ seller.phone }}</p>
      </div>
    </div>
    <div class="text-right">
      <p class="text-2xl font-bold tracking-tight text-indigo-700">FACTURE</p>
    </div>
  </div>
</template>
