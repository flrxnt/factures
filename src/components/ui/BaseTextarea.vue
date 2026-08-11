<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">{{ label }}</span>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows ?? 3"
      :aria-invalid="!!error"
      class="w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70"
      :class="error ? 'border-[#7d2e3b] focus:border-[#7d2e3b]' : 'border-hairline focus:border-accent'"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="error" class="mt-1 block text-xs text-[#7d2e3b]">{{ error }}</span>
  </label>
</template>
