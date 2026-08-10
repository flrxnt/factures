<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex aspect-[210/297] w-[200px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hairline-strong text-muted transition hover:border-accent hover:text-accent"
    @click="$emit('click')"
  >
    <span class="font-display text-4xl leading-none">+</span>
    <span class="text-sm">Nouvelle facture</span>
  </button>
</template>
