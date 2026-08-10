<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label
    class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium tracking-wide transition select-none"
    :class="modelValue ? 'border-ink bg-ink text-paper' : 'border-hairline-strong bg-transparent text-ink-soft hover:border-ink/40'"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      class="sr-only"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span>{{ label }}</span>
  </label>
</template>
