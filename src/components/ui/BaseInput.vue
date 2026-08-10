<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
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
      class="w-full border-0 border-b border-hairline-strong bg-transparent px-0.5 py-1.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-accent"
      @input="$emit('update:modelValue', type === 'number' ? ($event.target as HTMLInputElement).valueAsNumber : ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
