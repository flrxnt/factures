<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
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
      class="w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-accent"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </label>
</template>
