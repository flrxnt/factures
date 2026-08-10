<script setup lang="ts">
defineProps<{
  notes: string
  termsAndConditions: string
}>()
</script>

<template>
  <div v-if="notes || termsAndConditions" class="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
    <p v-if="notes" class="whitespace-pre-wrap">{{ notes }}</p>
    <p v-if="termsAndConditions" class="whitespace-pre-wrap text-xs text-slate-500">{{ termsAndConditions }}</p>
  </div>
</template>
