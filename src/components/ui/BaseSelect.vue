<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  options: { value: string; label: string }[]
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">{{ label }}</span>
    <span class="relative block">
      <select
        :value="modelValue"
        :aria-invalid="!!error"
        class="w-full appearance-none border-0 border-b bg-transparent px-0.5 py-1.5 pr-5 text-sm text-ink outline-none transition"
        :class="error ? 'border-[#7d2e3b] focus:border-[#7d2e3b]' : 'border-hairline-strong focus:border-accent'"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
      <svg class="pointer-events-none absolute top-1/2 right-0.5 h-3 w-3 -translate-y-1/2 text-muted" viewBox="0 0 12 12" fill="none">
        <path d="M3 5l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span v-if="error" class="mt-1 block text-xs text-[#7d2e3b]">{{ error }}</span>
  </label>
</template>
