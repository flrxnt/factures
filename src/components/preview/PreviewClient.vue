<script setup lang="ts">
import type { ClientInfo } from '../../types/invoice'

defineProps<{
  client: ClientInfo
}>()
</script>

<template>
  <div class="text-sm text-ink-soft">
    <p class="text-xs font-medium tracking-wide text-muted uppercase">Facturé à</p>
    <p class="font-display text-lg text-ink">{{ client.name || 'Nom du client' }}</p>
    <p v-if="client.addressLine1">{{ client.addressLine1 }}</p>
    <p v-if="client.addressLine2">{{ client.addressLine2 }}</p>
    <p v-if="client.postalCode || client.city">{{ client.postalCode }} {{ client.city }}</p>
    <p v-if="client.country">{{ client.country }}</p>
    <p v-if="client.taxId">N° fiscal : {{ client.taxId }}</p>
    <p v-if="client.email">{{ client.email }}</p>
    <p v-if="client.phone">{{ client.phone }}</p>
  </div>
</template>
