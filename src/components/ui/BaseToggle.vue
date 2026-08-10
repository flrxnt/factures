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
  <label class="flex cursor-pointer items-center gap-2 select-none">
    <input
      type="checkbox"
      :checked="modelValue"
      class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="text-sm text-slate-700">{{ label }}</span>
  </label>
</template>
