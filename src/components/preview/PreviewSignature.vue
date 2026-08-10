<script setup lang="ts">
defineProps<{
  signatureLabel: string
  signatureImageDataUrl: string
}>()
</script>

<template>
  <div class="flex justify-end pt-6">
    <div class="w-56 text-center text-sm text-ink-soft">
      <div class="flex h-16 items-end justify-center border-b border-hairline-strong">
        <img v-if="signatureImageDataUrl" :src="signatureImageDataUrl" alt="Signature" class="max-h-16 max-w-full object-contain" />
      </div>
      <p class="mt-1">{{ signatureLabel || 'Signature' }}</p>
    </div>
  </div>
</template>
