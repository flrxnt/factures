<script setup lang="ts">
defineProps<{
  notes: string
  termsAndConditions: string
}>()
</script>

<template>
  <div v-if="notes || termsAndConditions" class="space-y-2 border-t border-hairline pt-6 text-sm text-ink-soft">
    <p v-if="notes" class="whitespace-pre-wrap">{{ notes }}</p>
    <p v-if="termsAndConditions" class="whitespace-pre-wrap text-xs text-muted">{{ termsAndConditions }}</p>
  </div>
</template>
