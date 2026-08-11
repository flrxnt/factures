<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="rounded-2xl border border-hairline bg-surface p-6 sm:p-7">
    <h2 class="font-display text-lg text-ink">{{ title }}</h2>
    <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </section>
</template>
