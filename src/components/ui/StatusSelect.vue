<script setup lang="ts">
import { computed } from 'vue'
import type { InvoiceStatus } from '../../types/invoice'
import { STATUS_ORDER, getStatusDescriptor } from '../../config/statuses'

const props = defineProps<{
  modelValue: InvoiceStatus
}>()

const emit = defineEmits<{
  'update:modelValue': [value: InvoiceStatus]
}>()

const descriptor = computed(() => getStatusDescriptor(props.modelValue))
</script>

<template>
  <label
    class="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
    :style="{ borderColor: descriptor.color + '55', color: descriptor.color }"
    @click.stop
  >
    <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ backgroundColor: descriptor.color }"></span>
    <select
      class="cursor-pointer appearance-none bg-transparent pr-0.5 outline-none"
      :style="{ color: descriptor.color }"
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as InvoiceStatus)"
    >
      <option v-for="status in STATUS_ORDER" :key="status.value" :value="status.value">{{ status.labelFr }}</option>
    </select>
  </label>
</template>
