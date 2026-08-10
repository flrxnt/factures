<script setup lang="ts">
defineProps<{
  signatureLabel: string
}>()
</script>

<template>
  <div class="flex justify-end pt-6">
    <div class="w-56 text-center text-sm text-ink-soft">
      <div class="h-16 border-b border-hairline-strong"></div>
      <p class="mt-1">{{ signatureLabel || 'Signature' }}</p>
    </div>
  </div>
</template>
