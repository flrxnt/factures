<script setup lang="ts">
defineProps<{
  paymentLink: string
}>()
</script>

<template>
  <div v-if="paymentLink" class="border-t border-hairline pt-6 text-sm">
    <p class="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Paiement en ligne</p>
    <a
      :href="paymentLink"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-paper transition hover:opacity-90"
    >
      Payer cette facture en ligne →
    </a>
  </div>
</template>
