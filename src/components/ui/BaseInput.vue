<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">{{ label }}</span>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="!!error"
      class="w-full border-0 border-b bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition placeholder:text-muted/70"
      :class="error ? 'border-[#7d2e3b] focus:border-[#7d2e3b]' : 'border-hairline-strong focus:border-accent'"
      @input="$emit('update:modelValue', type === 'number' ? ($event.target as HTMLInputElement).valueAsNumber : ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-1 block text-xs text-[#7d2e3b]">{{ error }}</span>
  </label>
</template>
