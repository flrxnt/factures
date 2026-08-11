<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number
    label?: string
  }>(),
  { rows: 4 },
)
</script>

<template>
  <div class="space-y-3 py-2" role="status" :aria-label="label ?? 'Chargement…'">
    <div v-for="i in rows" :key="i" class="h-10 animate-pulse rounded-lg bg-paper-dim" :style="{ opacity: 1 - (i - 1) * 0.12 }" />
  </div>
</template>
