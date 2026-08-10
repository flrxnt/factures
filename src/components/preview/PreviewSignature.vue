<script setup lang="ts">
defineProps<{
  signatureLabel: string
}>()
</script>

<template>
  <div class="flex justify-end pt-6">
    <div class="w-56 text-center text-sm text-slate-600">
      <div class="h-16 border-b border-slate-300"></div>
      <p class="mt-1">{{ signatureLabel || 'Signature' }}</p>
    </div>
  </div>
</template>
