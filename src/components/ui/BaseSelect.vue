<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  options: { value: string; label: string }[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-xs font-medium tracking-wide text-muted uppercase">{{ label }}</span>
    <select
      :value="modelValue"
      class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
  </label>
</template>
