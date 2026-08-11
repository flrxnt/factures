<script setup lang="ts">
defineProps<{
  modelValue: 'grid' | 'list'
}>()

defineEmits<{
  'update:modelValue': ['grid' | 'list']
}>()
</script>

<template>
  <div class="inline-flex items-center gap-1 rounded-full border border-hairline-strong p-1">
    <button
      type="button"
      title="Vue grille"
      class="flex h-7 w-7 items-center justify-center rounded-full transition active:scale-90"
      :class="modelValue === 'grid' ? 'bg-ink text-paper' : 'text-muted hover:bg-paper-dim hover:text-ink'"
      @click="$emit('update:modelValue', 'grid')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <rect x="0" y="0" width="6" height="6" rx="1" />
        <rect x="8" y="0" width="6" height="6" rx="1" />
        <rect x="0" y="8" width="6" height="6" rx="1" />
        <rect x="8" y="8" width="6" height="6" rx="1" />
      </svg>
    </button>
    <button
      type="button"
      title="Vue liste"
      class="flex h-7 w-7 items-center justify-center rounded-full transition active:scale-90"
      :class="modelValue === 'list' ? 'bg-ink text-paper' : 'text-muted hover:bg-paper-dim hover:text-ink'"
      @click="$emit('update:modelValue', 'list')"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <rect x="0" y="0.5" width="14" height="3" rx="1" />
        <rect x="0" y="5.5" width="14" height="3" rx="1" />
        <rect x="0" y="10.5" width="14" height="3" rx="1" />
      </svg>
    </button>
  </div>
</template>
