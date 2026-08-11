<script setup lang="ts">
import type { CompanyInfo, InvoiceTemplate } from '../../types/invoice'

defineProps<{
  seller: CompanyInfo
  showLogo: boolean
  template: InvoiceTemplate
}>()
</script>

<template>
  <!-- Editorial: logo+seller left, italic serif title right -->
  <div v-if="template === 'editorial'" class="flex items-start justify-between gap-6">
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

  <!-- Minimal: everything left-aligned and stacked, quiet uppercase sans title -->
  <div v-else-if="template === 'minimal'" class="space-y-5">
    <div class="flex items-center gap-2">
      <span class="h-2 w-2 shrink-0 bg-accent"></span>
      <p class="font-sans text-base font-semibold tracking-[0.2em] text-ink uppercase">Facture</p>
    </div>
    <div class="flex items-start gap-4">
      <img
        v-if="showLogo && seller.logoDataUrl"
        :src="seller.logoDataUrl"
        alt="Logo"
        class="h-10 w-10 shrink-0 rounded object-contain ring-1 ring-hairline"
      />
      <div class="text-sm text-ink-soft">
        <p class="font-medium text-ink">{{ seller.name || "Nom de l'entreprise" }}</p>
        <p v-if="seller.addressLine1">{{ seller.addressLine1 }}</p>
        <p v-if="seller.addressLine2">{{ seller.addressLine2 }}</p>
        <p v-if="seller.postalCode || seller.city">{{ seller.postalCode }} {{ seller.city }}</p>
        <p v-if="seller.country">{{ seller.country }}</p>
        <p v-if="seller.taxId">N° fiscal : {{ seller.taxId }}</p>
        <p v-if="seller.email">{{ seller.email }}</p>
        <p v-if="seller.phone">{{ seller.phone }}</p>
      </div>
    </div>
  </div>

  <!-- Bold: solid accent band with the title, seller info below -->
  <div v-else class="space-y-5">
    <div class="flex items-center justify-between rounded-lg bg-accent px-5 py-4">
      <p class="font-sans text-3xl font-extrabold tracking-tight text-paper uppercase">Facture</p>
      <img v-if="showLogo && seller.logoDataUrl" :src="seller.logoDataUrl" alt="Logo" class="h-12 w-12 shrink-0 rounded bg-paper object-contain p-1" />
    </div>
    <div class="text-sm text-ink-soft">
      <p class="font-display text-lg text-ink">{{ seller.name || "Nom de l'entreprise" }}</p>
      <div class="flex flex-wrap gap-x-4">
        <p v-if="seller.addressLine1">{{ seller.addressLine1 }}</p>
        <p v-if="seller.addressLine2">{{ seller.addressLine2 }}</p>
        <p v-if="seller.postalCode || seller.city">{{ seller.postalCode }} {{ seller.city }}</p>
        <p v-if="seller.country">{{ seller.country }}</p>
      </div>
      <div class="flex flex-wrap gap-x-4">
        <p v-if="seller.taxId">N° fiscal : {{ seller.taxId }}</p>
        <p v-if="seller.email">{{ seller.email }}</p>
        <p v-if="seller.phone">{{ seller.phone }}</p>
      </div>
    </div>
  </div>
</template>
